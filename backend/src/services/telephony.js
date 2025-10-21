const twilio = require('twilio');
const logger = require('../utils/logger');
const { getDatabase } = require('../config/database');
const VoiceService = require('./voice');
const NLPService = require('./nlp');
const ElevenLabsService = require('./elevenlabs');
const StorageService = require('./storage');
const axios = require('axios');

class TelephonyService {
  constructor() {
    // Initialize Twilio client only if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      logger.info('Twilio client initialized');
    } else {
      this.client = null;
      logger.warn('Twilio credentials not provided - telephony features disabled');
    }
    
    this.voiceService = new VoiceService();
    this.nlpService = new NLPService();
    this.elevenLabsService = new ElevenLabsService();
    this.storageService = new StorageService();
    
    // Log storage status for debugging
    logger.info(`Storage service status: enabled=${this.storageService.isEnabled()}`);
    logger.info(`ElevenLabs service status: enabled=${this.elevenLabsService.isEnabled()}`);
    
    // Use ElevenLabs if both API key and S3 storage are configured
    this.useElevenLabs = this.elevenLabsService.isEnabled() && this.storageService.isEnabled();
    
    if (this.elevenLabsService.isEnabled() && !this.storageService.isEnabled()) {
      logger.warn('ElevenLabs API key found but S3 storage not configured - falling back to Polly');
      logger.warn('Set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY to enable ElevenLabs');
    }
    
    logger.info(`Voice engine: ${this.useElevenLabs ? 'ElevenLabs + S3 Storage' : 'Amazon Polly'}`);
  }

  /**
   * Normalize Polly voice to Neural variant when possible.
   * Example: Polly.Joanna -> Polly.Joanna-Neural
   */
  normalizeVoiceToNeural(voice, isoCode = 'en') {
    // Twilio may not accept the "-Neural" suffix in voice names in all regions/accounts.
    // Use plain Polly voice names for compatibility. Neural quality is often selected implicitly by Twilio/Polly.
    const baseVoice = voice || this.getTwilioVoice(isoCode);
    return baseVoice;
  }

  /**
   * Escape text content for inclusion in SSML
   */
  escapeForSSML(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Wrap plain text with Amazon Polly SSML for conversational, natural delivery
   */
  buildSSML(message) {
    const safe = this.escapeForSSML(message);
    return `<speak><amazon:domain name="conversational"><prosody rate="medium" pitch="+2%">${safe}</prosody></amazon:domain></speak>`;
  }

  /**
   * Initiate an outbound call
   */
  async makeCall(to, agentId, userId) {
    try {
      const db = getDatabase();
      
      // Get agent configuration
      const agent = await db('agents').where({ id: agentId, user_id: userId }).first();
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Create call record
      const [callRecord] = await db('calls').insert({
        agent_id: agentId,
        user_id: userId,
        phone_number: to,
        direction: 'outbound',
        status: 'initiated',
        created_at: new Date()
      }).returning('*');

      // Make Twilio call
      const call = await this.client.calls.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: `${process.env.BACKEND_URL}/api/webhooks/twilio/voice?callId=${callRecord.id}`,
        statusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
        recordingStatusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio/recording`
      });

      // Update call record with Twilio SID
      await db('calls').where({ id: callRecord.id }).update({
        twilio_sid: call.sid,
        status: 'ringing'
      });

      logger.info(`Outbound call initiated: ${call.sid} to ${to}`);
      
      return {
        callId: callRecord.id,
        twilioSid: call.sid,
        status: 'initiated'
      };
    } catch (error) {
      logger.error('Error making call:', error);
      throw error;
    }
  }

  /**
   * Handle incoming call webhook
   */
  async handleIncomingCall(req, res) {
    try {
      const { From, To, CallSid } = req.body;
      const db = getDatabase();

      logger.info(`Incoming call from ${From} to ${To}, SID: ${CallSid}`);

      // Find agent assigned to this number
      const phoneNumber = await db('phone_numbers')
        .where({ number: To })
        .first();

      if (!phoneNumber) {
        logger.error(`No agent found for number ${To}`);
        const twiml = await this.generateTwiML('Sorry, this number is not configured.');
        res.type('text/xml');
        return res.send(twiml);
      }

      const agent = await db('agents')
        .where({ id: phoneNumber.agent_id })
        .first();

      // Create call record
      const [callRecord] = await db('calls').insert({
        agent_id: agent.id,
        user_id: agent.user_id,
        phone_number: From,
        direction: 'inbound',
        status: 'answered',
        twilio_sid: CallSid,
        created_at: new Date()
      }).returning('*');

      // Detect caller's language
      const detectedLanguage = await this.nlpService.detectLanguage(From);

      // Generate greeting in detected language
      const greeting = agent.greeting || 'Hello! How can I help you today?';
      const translatedGreeting = await this.nlpService.translate(
        greeting,
        'en',
        detectedLanguage
      );

      // Generate TwiML response with gather for speech
      const twiml = await this.generateInteractiveTwiML(
        translatedGreeting,
        callRecord.id,
        detectedLanguage,
        agent
      );

      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      logger.error('Error handling incoming call:', error);
      const errorTwiml = await this.generateTwiML('An error occurred. Please try again later.');
      res.type('text/xml');
      res.send(errorTwiml);
    }
  }

  /**
   * Handle speech input from caller
   */
  async handleSpeechInput(req, res) {
    try {
      const { SpeechResult, CallSid, Confidence } = req.body;
      const { callId, language } = req.query;
      const db = getDatabase();

      logger.info(`Speech input: "${SpeechResult}" (confidence: ${Confidence})`);

      // Get call and agent details
      const call = await db('calls').where({ id: callId }).first();
      const agent = await db('agents').where({ id: call.agent_id }).first();

      // Normalize stored context to an object
      let ctx = {};
      try {
        if (call && call.context) {
          ctx = typeof call.context === 'string' ? JSON.parse(call.context) : call.context;
        }
      } catch (e) {
        logger.warn('Failed to parse call context, resetting to empty object');
        ctx = {};
      }

      // If no speech was detected, re-prompt the caller
      if (!SpeechResult || String(SpeechResult).trim().length === 0) {
        const reprompt = await this.generateInteractiveTwiML(
          "Sorry, I didn't catch that. Could you say that again?",
          callId,
          language,
          agent
        );
        res.type('text/xml');
        return res.send(reprompt);
      }

      // Process with NLP engine (with agent data for OpenAI fallback)
      const nlpResponse = await this.nlpService.processInput({
        text: SpeechResult,
        language,
        agentId: agent.id,
        callId,
        context: ctx,
        agent: agent // Pass full agent data for personality/fallback
      });

      // Update call context
      await db('calls').where({ id: callId }).update({
        context: JSON.stringify(nlpResponse.context || {}),
        updated_at: new Date()
      });

      // Log conversation turn
      await db('call_transcripts').insert({
        call_id: callId,
        speaker: 'caller',
        text: SpeechResult,
        language,
        confidence: parseFloat(Confidence),
        timestamp: new Date()
      });

      await db('call_transcripts').insert({
        call_id: callId,
        speaker: 'agent',
        text: nlpResponse.response,
        language,
        timestamp: new Date()
      });

      // Check if call should end
      if (nlpResponse.shouldEndCall) {
        const twiml = await this.generateTwiML(nlpResponse.response, true, agent);
        res.type('text/xml');
        res.send(twiml);
        return;
      }

      // Continue conversation
      const twiml = await this.generateInteractiveTwiML(
        nlpResponse.response,
        callId,
        language,
        agent
      );

      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      logger.error('Error handling speech input:', error);
      const errorTwiml = await this.generateTwiML('I apologize, but I encountered an error. Please try again.');
      res.type('text/xml');
      res.send(errorTwiml);
    }
  }

  /**
   * Generate TwiML for simple response
   */
  async generateTwiML(message, hangup = false, agent = null) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    
    // Use ElevenLabs if available, otherwise fall back to Polly
    if (this.useElevenLabs) {
      try {
        const audioUrl = await this.generateElevenLabsAudio(message, agent);
        twiml.play(audioUrl);
      } catch (error) {
        logger.error('ElevenLabs TTS failed, falling back to Polly:', error.message);
        // Fall back to Polly
        const voice = this.normalizeVoiceToNeural(agent?.voice, 'en');
        const ssml = this.buildSSML(message);
        twiml.say({ voice: voice, language: 'en-US' }, ssml);
      }
    } else {
      // Use Polly
      const voice = this.normalizeVoiceToNeural(agent?.voice, 'en');
      logger.info(`TTS generateTwiML using voice=${voice}`);
      const ssml = this.buildSSML(message);
      twiml.say({ voice: voice, language: 'en-US' }, ssml);
    }

    if (hangup) {
      twiml.hangup();
    }

    return twiml.toString();
  }

  /**
   * Generate interactive TwiML with speech recognition
   */
  async generateInteractiveTwiML(message, callId, language = 'en', agent = null) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    const gather = twiml.gather({
      input: 'speech',
      action: `${process.env.BACKEND_URL}/api/webhooks/twilio/speech?callId=${callId}&language=${language}`,
      language: this.getTwilioLanguageCode(language),
      timeout: 5,
      speechTimeout: 3,
      speechModel: 'phone_call',
      enhanced: true,
      profanityFilter: false,
      actionOnEmptyResult: true,
      hints: 'payment, pay, money, dollar, account, balance, yes, no'
    });

    // Use ElevenLabs if available, otherwise fall back to Polly
    if (this.useElevenLabs) {
      try {
        const audioUrl = await this.generateElevenLabsAudio(message, agent, language);
        gather.play(audioUrl);
      } catch (error) {
        logger.error('ElevenLabs TTS failed, falling back to Polly:', error.message);
        // Fall back to Polly
        const voice = this.normalizeVoiceToNeural(agent?.voice || this.getTwilioVoice(language), language);
        const ssml = this.buildSSML(message);
        gather.say({ voice: voice, language: this.getTwilioLanguageCode(language) }, ssml);
      }
    } else {
      // Use Polly
      const voice = this.normalizeVoiceToNeural(agent?.voice || this.getTwilioVoice(language), language);
      logger.info(`TTS generateInteractiveTwiML using voice=${voice}, language=${language}`);
      const ssml = this.buildSSML(message);
      gather.say({ voice: voice, language: this.getTwilioLanguageCode(language) }, ssml);
    }
    
    // Twilio will POST to the action URL above, even if no input (actionOnEmptyResult)
    // No explicit redirect needed here.
    return twiml.toString();
  }

  /**
   * Get Twilio language code from ISO code
   */
  getTwilioLanguageCode(isoCode) {
    const languageMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-AE',
      'hi': 'hi-IN',
      'ru': 'ru-RU'
    };
    return languageMap[isoCode] || 'en-US';
  }

  /**
   * Get Twilio voice for language
   */
  getTwilioVoice(isoCode) {
    const voiceMap = {
      'en': 'Polly.Joanna',
      'es': 'Polly.Conchita',
      'fr': 'Polly.Celine',
      'de': 'Polly.Marlene',
      'it': 'Polly.Carla',
      'pt': 'Polly.Vitoria',
      'zh': 'Polly.Zhiyu',
      'ja': 'Polly.Mizuki',
      'ko': 'Polly.Seoyeon',
      'ar': 'Polly.Zeina',
      'hi': 'Polly.Aditi',
      'ru': 'Polly.Tatyana'
    };
    return voiceMap[isoCode] || 'Polly.Joanna';
  }

  /**
   * Generate audio using ElevenLabs and upload to S3 storage
   * Returns a publicly accessible URL for Twilio to play
   * @param {string} message - Text to convert to speech
   * @param {object} agent - Agent configuration
   * @param {string} language - Language code
   * @returns {Promise<string>} Public URL to audio file
   */
  async generateElevenLabsAudio(message, agent = null, language = 'en') {
    try {
      // Get voice from agent config or use default for language
      const voiceId = agent?.elevenlabs_voice || 
                     this.elevenLabsService.getVoiceForLanguage(language, agent?.gender || 'female', 'us');
      
      logger.info(`Generating ElevenLabs audio: voice=${voiceId}, length=${message.length} chars`);
      
      // Generate audio with ElevenLabs
      const audioBuffer = await this.elevenLabsService.textToSpeech(message, voiceId);
      logger.info(`ElevenLabs audio generated: ${audioBuffer.length} bytes`);
      
      // Upload to S3 and get public URL
      const audioUrl = await this.storageService.uploadAudio(audioBuffer, 'audio/mpeg', 3600);
      logger.info(`Audio uploaded to S3: ${audioUrl}`);
      
      return audioUrl;
      
    } catch (error) {
      logger.error('Error generating/uploading ElevenLabs audio:', error);
      throw error;
    }
  }

  /**
   * Handle call status updates
   */
  async handleCallStatus(req, res) {
    try {
      const { CallSid, CallStatus, CallDuration } = req.body;
      const db = getDatabase();

      await db('calls')
        .where({ twilio_sid: CallSid })
        .update({
          status: CallStatus,
          duration: CallDuration ? parseInt(CallDuration) : null,
          updated_at: new Date()
        });

      logger.info(`Call ${CallSid} status updated: ${CallStatus}`);
      res.sendStatus(200);
    } catch (error) {
      logger.error('Error handling call status:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Handle recording callback
   */
  async handleRecording(req, res) {
    try {
      const { CallSid, RecordingUrl, RecordingSid, RecordingDuration } = req.body;
      const db = getDatabase();

      await db('calls')
        .where({ twilio_sid: CallSid })
        .update({
          recording_url: RecordingUrl,
          recording_sid: RecordingSid,
          recording_duration: parseInt(RecordingDuration),
          updated_at: new Date()
        });

      logger.info(`Recording saved for call ${CallSid}: ${RecordingUrl}`);
      res.sendStatus(200);
    } catch (error) {
      logger.error('Error handling recording:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Get available phone numbers
   */
  async getAvailableNumbers(countryCode = 'US', areaCode = null) {
    try {
      const searchParams = {
        limit: 20,
        capabilities: { voice: true, sms: true }
      };

      if (areaCode) {
        searchParams.areaCode = areaCode;
      }

      const numbers = await this.client
        .availablePhoneNumbers(countryCode)
        .local
        .list(searchParams);

      return numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        capabilities: num.capabilities
      }));
    } catch (error) {
      logger.error('Error fetching available numbers:', error);
      throw error;
    }
  }

  /**
   * Purchase phone number
   */
  async purchaseNumber(phoneNumber, userId) {
    try {
      const db = getDatabase();

      const incomingNumber = await this.client.incomingPhoneNumbers.create({
        phoneNumber,
        voiceUrl: `${process.env.BACKEND_URL}/api/webhooks/twilio/voice`,
        voiceMethod: 'POST',
        statusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio/status`,
        statusCallbackMethod: 'POST'
      });

      // Save to database
      await db('phone_numbers').insert({
        user_id: userId,
        number: phoneNumber,
        twilio_sid: incomingNumber.sid,
        country_code: incomingNumber.phoneNumber.substring(0, 2),
        capabilities: JSON.stringify(incomingNumber.capabilities),
        created_at: new Date()
      });

      logger.info(`Phone number purchased: ${phoneNumber}`);
      
      return {
        phoneNumber,
        sid: incomingNumber.sid
      };
    } catch (error) {
      logger.error('Error purchasing number:', error);
      throw error;
    }
  }
}

module.exports = TelephonyService;
