const axios = require('axios');
const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { cacheGet, cacheSet } = require('../config/redis');

class NLPService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.nlpEngineUrl = process.env.NLP_ENGINE_URL || 'http://localhost:8001';
  }

  /**
   * Detect language from text or phone number
   */
  async detectLanguage(input) {
    try {
      // Check cache first
      const cacheKey = `lang:${input}`;
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;

      // Call NLP engine for detection
      const response = await axios.post(`${this.nlpEngineUrl}/detect-language`, {
        text: input
      });

      const language = response.data.language || 'en';
      
      // Cache for 24 hours
      await cacheSet(cacheKey, language, 86400);
      
      return language;
    } catch (error) {
      logger.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }

  /**
   * Translate text between languages
   */
  async translate(text, fromLang, toLang) {
    try {
      if (fromLang === toLang) return text;

      const cacheKey = `trans:${fromLang}:${toLang}:${text}`;
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;

      const response = await axios.post(`${this.nlpEngineUrl}/translate`, {
        text,
        from_language: fromLang,
        to_language: toLang
      });

      const translated = response.data.translated_text;
      await cacheSet(cacheKey, translated, 3600);
      
      return translated;
    } catch (error) {
      logger.error('Translation error:', error);
      return text;
    }
  }

  /**
   * Process user input with NLP engine
   */
  async processInput({ text, language, agentId, callId, context }) {
    try {
      const response = await axios.post(`${this.nlpEngineUrl}/process`, {
        text,
        language,
        agent_id: agentId,
        call_id: callId,
        context
      });

      return {
        response: response.data.response,
        intent: response.data.intent,
        entities: response.data.entities,
        sentiment: response.data.sentiment,
        confidence: response.data.confidence,
        context: response.data.context,
        shouldEndCall: response.data.should_end_call || false
      };
    } catch (error) {
      logger.error('NLP processing error:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text, language = 'en') {
    try {
      const response = await axios.post(`${this.nlpEngineUrl}/sentiment`, {
        text,
        language
      });

      return {
        sentiment: response.data.sentiment, // positive, negative, neutral
        score: response.data.score, // -1 to 1
        emotions: response.data.emotions // array of detected emotions
      };
    } catch (error) {
      logger.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', score: 0, emotions: [] };
    }
  }

  /**
   * Extract intent from user input
   */
  async extractIntent(text, language = 'en', possibleIntents = []) {
    try {
      const response = await axios.post(`${this.nlpEngineUrl}/intent`, {
        text,
        language,
        possible_intents: possibleIntents
      });

      return {
        intent: response.data.intent,
        confidence: response.data.confidence,
        parameters: response.data.parameters
      };
    } catch (error) {
      logger.error('Intent extraction error:', error);
      return { intent: 'unknown', confidence: 0, parameters: {} };
    }
  }

  /**
   * Extract entities from text (names, dates, locations, etc.)
   */
  async extractEntities(text, language = 'en') {
    try {
      const response = await axios.post(`${this.nlpEngineUrl}/entities`, {
        text,
        language
      });

      return response.data.entities || [];
    } catch (error) {
      logger.error('Entity extraction error:', error);
      return [];
    }
  }

  /**
   * Generate response using GPT-4o
   */
  async generateResponse(prompt, context = {}, language = 'en') {
    try {
      const systemPrompt = `You are an AI call agent assistant. Respond naturally and helpfully in ${language}. 
Keep responses concise and conversational, suitable for voice interaction.
Context: ${JSON.stringify(context)}`;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('GPT-4o generation error:', error);
      throw error;
    }
  }

  /**
   * Generate response using Claude (for complex sentiment analysis)
   */
  async generateResponseClaude(prompt, context = {}, language = 'en') {
    try {
      const systemPrompt = `You are an empathetic AI call agent. Respond with emotional intelligence in ${language}.
Context: ${JSON.stringify(context)}`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      logger.error('Claude generation error:', error);
      throw error;
    }
  }

  /**
   * Summarize conversation
   */
  async summarizeConversation(transcript, language = 'en') {
    try {
      const response = await axios.post(`${this.nlpEngineUrl}/summarize`, {
        transcript,
        language
      });

      return {
        summary: response.data.summary,
        keyPoints: response.data.key_points,
        actionItems: response.data.action_items,
        sentiment: response.data.overall_sentiment
      };
    } catch (error) {
      logger.error('Summarization error:', error);
      throw error;
    }
  }

  /**
   * Calculate CSAT score from conversation
   */
  async calculateCSAT(transcript, sentiment) {
    try {
      const response = await axios.post(`${this.nlpEngineUrl}/csat`, {
        transcript,
        sentiment
      });

      return {
        score: response.data.score, // 1-5
        confidence: response.data.confidence,
        factors: response.data.factors
      };
    } catch (error) {
      logger.error('CSAT calculation error:', error);
      return { score: 3, confidence: 0, factors: [] };
    }
  }

  /**
   * Check for interruption intent
   */
  async detectInterruption(text, language = 'en') {
    try {
      const interruptionPhrases = {
        en: ['wait', 'hold on', 'stop', 'excuse me', 'sorry'],
        es: ['espera', 'alto', 'perdón', 'disculpa'],
        fr: ['attendez', 'arrêtez', 'excusez-moi', 'pardon'],
        de: ['warten', 'halt', 'entschuldigung'],
        // Add more languages as needed
      };

      const phrases = interruptionPhrases[language] || interruptionPhrases.en;
      const lowerText = text.toLowerCase();

      return phrases.some(phrase => lowerText.includes(phrase));
    } catch (error) {
      logger.error('Interruption detection error:', error);
      return false;
    }
  }
}

module.exports = NLPService;
