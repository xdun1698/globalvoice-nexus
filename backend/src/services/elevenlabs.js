const axios = require('axios');
const logger = require('../utils/logger');

/**
 * ElevenLabs Text-to-Speech Service
 * Provides high-quality, natural-sounding voice synthesis
 */
class ElevenLabsService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    if (!this.apiKey) {
      logger.warn('ElevenLabs API key not provided - premium voices disabled');
      this.enabled = false;
    } else {
      this.enabled = true;
      logger.info('ElevenLabs service initialized');
    }

    // Popular voice IDs from ElevenLabs
    // You can get more from: https://api.elevenlabs.io/v1/voices
    this.voices = {
      // English voices
      'rachel': '21m00Tcm4TlvDq8ikWAM', // American female, calm
      'domi': 'AZnzlk1XvdvUeBnXmlld', // American female, strong
      'bella': 'EXAVITQu4vr4xnSDxMaL', // American female, soft
      'antoni': 'ErXwobaYiN019PkySvjV', // American male, well-rounded
      'elli': 'MF3mGyEYCl7XYWbV9V6O', // American female, emotional
      'josh': 'TxGEqnHWrfWFTfGW9XjX', // American male, deep
      'arnold': 'VR6AewLTigWG4xSOukaG', // American male, crisp
      'adam': 'pNInz6obpgDQGcFmaJgB', // American male, deep
      'sam': 'yoZ06aMxZJJ28mfd3POQ', // American male, raspy
      
      // Multilingual voices (support multiple languages)
      'charlotte': 'XB0fDUnXU5powFXDhCwa', // English Swedish
      'matilda': 'XrExE9yKIg1WjnnlVkGX', // American female
      'james': 'ZQe5CZNOzWyzPSCn5a3c', // Australian male
      'joseph': 'Zlb1dXrM653N07WRdFW3', // British male
      'jeremy': 'bVMeCyTHy58xNoL34h3p', // American male, Irish
      'michael': 'flq6f7yk4E4fJM5XTYuZ', // American male
      'ethan': 'g5CIjZEefAph4nQFvHAz', // American male
      'gigi': 'jBpfuIE2acCO8z3wKNLl', // American female, childlike
      'freya': 'jsCqWAovK2LkecY7zXl4', // American female
      'grace': 'oWAxZDx7w5VEj9dCyTzz', // American female, Southern
      'daniel': 'onwK4e9ZLuTAKqWW03F9', // British male
      'lily': 'pFZP5JQG7iQjIQuC4Bku', // British female
      'serena': 'pMsXgVXv3BLzUgSXRplE', // American female, pleasant
      'adam_multilingual': 'pNInz6obpgDQGcFmaJgB', // Multilingual male
      'nicole': 'piTKgcLEGmPE4e6mEKli', // American female, whisper
      'callum': 't0jbNlBVZ17f02VDIeMI', // American male, hoarse
      'charlie': 'IKne3meq5aSn9XLyUdCD', // Australian male, casual
      'george': 'JBFqnCBsd6RMkjVDRZzb', // British male, raspy
      'emily': 'LcfcDJNUP1GQjkzn1xUU', // American female, calm
      'thomas': 'GBv7mTt0atIp3Br8iCZE', // American male, calm
      'alice': 'Xb7hH8MSUJpSbSDYk0k2', // British female, confident
      'tom': 'N2lVS1w4EtoT3dr4eOWO', // American male, professional (collections)
      'will': 'ErXwobaYiN019PkySvjV', // American male, conversational (Antoni - pure American)
    };

    // Voice settings for optimal quality - more conversational
    this.defaultSettings = {
      stability: 0.35, // Lower = more expressive and conversational
      similarity_boost: 0.75, // 0-1, how closely to match original voice
      style: 0.3, // Add style for more natural delivery
      use_speaker_boost: true // Boost clarity and similarity
    };
    
    // Development mode - uses turbo-v2.5 model for half-cost tokens
    this.developmentMode = process.env.ELEVENLABS_DEV_MODE === 'true' || process.env.NODE_ENV === 'development';
    this.model = this.developmentMode ? 'eleven_turbo_v2_5' : 'eleven_multilingual_v2';
    
    if (this.developmentMode) {
      logger.info('ElevenLabs running in DEVELOPMENT MODE - using turbo model (half-cost tokens)');
    }
  }

  /**
   * Check if ElevenLabs is available
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get list of available voices from ElevenLabs API
   */
  async getAvailableVoices() {
    if (!this.enabled) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return response.data.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        labels: voice.labels,
        description: voice.description || '',
        preview_url: voice.preview_url
      }));
    } catch (error) {
      logger.error('Error fetching ElevenLabs voices:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   * @param {string} text - Text to convert
   * @param {string} voiceId - Voice ID to use
   * @param {object} options - Additional options (stability, similarity_boost, etc.)
   * @returns {Promise<Buffer>} Audio buffer (MP3)
   */
  async textToSpeech(text, voiceId = 'rachel', options = {}) {
    if (!this.enabled) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      // Get voice ID from name if a name was provided
      const actualVoiceId = this.voices[voiceId] || voiceId;

      const settings = {
        ...this.defaultSettings,
        ...options
      };

      logger.info(`ElevenLabs TTS: voice=${voiceId}, length=${text.length} chars`);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${actualVoiceId}`,
        {
          text,
          model_id: this.model, // turbo_v2_5 (dev/half-cost) or multilingual_v2 (prod)
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            style: settings.style,
            use_speaker_boost: settings.use_speaker_boost
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      logger.info(`ElevenLabs TTS successful: ${response.data.byteLength} bytes`);
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('ElevenLabs TTS error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Stream text to speech (for real-time applications)
   * @param {string} text - Text to convert
   * @param {string} voiceId - Voice ID to use
   * @param {object} options - Additional options
   * @returns {Promise<Stream>} Audio stream
   */
  async textToSpeechStream(text, voiceId = 'rachel', options = {}) {
    if (!this.enabled) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const actualVoiceId = this.voices[voiceId] || voiceId;
      const settings = {
        ...this.defaultSettings,
        ...options
      };

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${actualVoiceId}/stream`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            style: settings.style,
            use_speaker_boost: settings.use_speaker_boost
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'stream'
        }
      );

      return response.data;
    } catch (error) {
      logger.error('ElevenLabs streaming error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get recommended voice for a language/region
   */
  getVoiceForLanguage(language, gender = 'female', region = 'us') {
    const voiceMap = {
      'en-us-female': 'rachel',
      'en-us-male': 'antoni',
      'en-gb-female': 'lily',
      'en-gb-male': 'daniel',
      'en-au-male': 'james',
      'es-female': 'domi', // Multilingual
      'es-male': 'adam_multilingual',
      'fr-female': 'charlotte',
      'fr-male': 'adam_multilingual',
      'de-female': 'charlotte',
      'de-male': 'adam_multilingual',
      'it-female': 'bella',
      'it-male': 'adam_multilingual',
      'pt-female': 'bella',
      'pt-male': 'adam_multilingual',
      'zh-female': 'bella',
      'zh-male': 'adam_multilingual',
      'ja-female': 'bella',
      'ja-male': 'adam_multilingual',
      'ko-female': 'bella',
      'ko-male': 'adam_multilingual',
      'ar-female': 'bella',
      'ar-male': 'adam_multilingual',
      'hi-female': 'bella',
      'hi-male': 'adam_multilingual',
      'ru-female': 'bella',
      'ru-male': 'adam_multilingual'
    };

    const key = `${language}-${region}-${gender}`.toLowerCase();
    return voiceMap[key] || voiceMap[`${language}-${gender}`] || 'rachel';
  }

  /**
   * Get voice categories for UI selection
   */
  getVoiceCategories() {
    return {
      'American Female': ['rachel', 'domi', 'bella', 'elli', 'matilda', 'gigi', 'freya', 'grace', 'serena', 'nicole', 'emily'],
      'American Male': ['antoni', 'josh', 'arnold', 'adam', 'sam', 'jeremy', 'michael', 'ethan', 'thomas', 'callum'],
      'British': ['lily', 'daniel', 'joseph', 'alice', 'george'],
      'Australian': ['james', 'charlie'],
      'Multilingual': ['adam_multilingual', 'charlotte']
    };
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    if (!this.enabled) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return {
        character_count: response.data.subscription.character_count,
        character_limit: response.data.subscription.character_limit,
        can_use_instant_voice_cloning: response.data.subscription.can_use_instant_voice_cloning,
        tier: response.data.subscription.tier
      };
    } catch (error) {
      logger.error('Error fetching ElevenLabs usage:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ElevenLabsService;
