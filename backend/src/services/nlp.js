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
   * Generate response using GPT-4o with full context
   */
  async generateResponse(userMessage, fullContext = {}, agentConfig = {}) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized - API key required');
      }

      const language = agentConfig.language || 'en';
      
      // Build comprehensive system prompt
      const systemPrompt = this.buildSystemPrompt(fullContext, agentConfig, language);

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('GPT-4o generation error:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive system prompt with context
   */
  buildSystemPrompt(context, agentConfig, language) {
    let prompt = agentConfig.system_prompt || `You are a professional AI voice agent. Respond naturally and helpfully in ${language}.`;
    prompt += '\nKeep responses concise and conversational, suitable for voice interaction (1-2 sentences).\n\n';

    // Add customer context
    if (context.customer) {
      prompt += `## Customer Information\n`;
      prompt += `Name: ${context.customer.name || 'Unknown'}\n`;
      prompt += `Phone: ${context.customer.phone}\n`;
      if (context.customer.total_calls > 0) {
        prompt += `Previous Calls: ${context.customer.total_calls}\n`;
      }
      if (context.customer.communication_style) {
        prompt += `Communication Style: ${context.customer.communication_style}\n`;
      }
      if (context.customer.sentiment_trend) {
        prompt += `Sentiment Trend: ${context.customer.sentiment_trend}\n`;
      }
      prompt += '\n';
    }

    // Add conversation history
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      prompt += `## Conversation So Far\n`;
      context.conversationHistory.slice(-5).forEach(turn => {
        prompt += `${turn.speaker}: ${turn.message}\n`;
      });
      prompt += '\n';
    }

    // Add session context
    if (context.currentSession) {
      prompt += `## Current State\n`;
      prompt += `Conversation State: ${context.currentSession.conversation_state}\n`;
      if (context.currentSession.collected_info && Object.keys(context.currentSession.collected_info).length > 0) {
        prompt += `Collected Information: ${JSON.stringify(context.currentSession.collected_info)}\n`;
      }
      if (context.currentSession.pending_actions && context.currentSession.pending_actions.length > 0) {
        prompt += `Pending Actions: ${context.currentSession.pending_actions.join(', ')}\n`;
      }
      prompt += '\n';
    }

    // Add knowledge base
    if (context.knowledge && context.knowledge.length > 0) {
      prompt += `## Relevant Knowledge\n`;
      context.knowledge.forEach(k => {
        prompt += `- ${k.title}: ${k.content}\n`;
      });
      prompt += '\n';
    }

    // Add business rules
    if (agentConfig.business_rules && agentConfig.business_rules.length > 0) {
      prompt += `## Business Rules\n`;
      agentConfig.business_rules.forEach(rule => {
        prompt += `- ${rule}\n`;
      });
      prompt += '\n';
    }

    // Add special instructions
    if (agentConfig.special_instructions) {
      prompt += `## Special Instructions\n${agentConfig.special_instructions}\n\n`;
    }

    // Add guidelines
    prompt += `## Response Guidelines\n`;
    prompt += `1. Be ${agentConfig.conversation_style || 'professional'} and ${agentConfig.personality || 'helpful'}\n`;
    prompt += `2. Reference previous conversation if relevant\n`;
    prompt += `3. Use customer's name if known\n`;
    prompt += `4. Match their communication style\n`;
    prompt += `5. Be concise (1-2 sentences for voice)\n`;
    prompt += `6. If you don't know something, say so and offer to find out\n`;
    prompt += `7. Always be empathetic and solution-oriented\n`;

    return prompt;
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
