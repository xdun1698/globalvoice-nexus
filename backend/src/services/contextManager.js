/**
 * Context Manager Service
 * Manages conversation context, customer profiles, and knowledge retrieval
 */

const logger = require('../utils/logger');
const { getDatabase } = require('../config/database');
const { cacheGet, cacheSet } = require('../config/redis');

class ContextManager {
  constructor() {
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      this.db = getDatabase();
    }
    return this.db;
  }

  /**
   * Get comprehensive context for a call
   */
  async getCallContext(callId, customerPhone, agentId) {
    try {
      const db = this.getDb();

      // Check cache first
      const cacheKey = `context:${callId}`;
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.info(`Context cache hit for call ${callId}`);
        return cached;
      }

      logger.info(`Building context for call ${callId}, customer ${customerPhone}`);

      // Build comprehensive context
      const context = {
        customer: await this.getCustomerProfile(customerPhone),
        recentCalls: await this.getRecentCalls(customerPhone, 3),
        currentSession: await this.getCurrentSession(callId),
        conversationHistory: await this.getConversationHistory(callId),
        agent: await this.getAgentConfig(agentId),
        knowledge: [], // Will be populated based on query
        timestamp: new Date().toISOString()
      };

      // Cache for 5 minutes
      await cacheSet(cacheKey, context, 300);

      return context;
    } catch (error) {
      logger.error('Error getting call context:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Get or create customer profile
   */
  async getCustomerProfile(customerPhone) {
    try {
      const db = this.getDb();
      
      let profile = await db('customer_profiles')
        .where({ phone: customerPhone })
        .first();

      if (!profile) {
        // Create new profile
        [profile] = await db('customer_profiles')
          .insert({
            phone: customerPhone,
            total_calls: 0,
            created_at: new Date()
          })
          .returning('*');
        
        logger.info(`Created new customer profile for ${customerPhone}`);
      }

      return profile;
    } catch (error) {
      logger.error('Error getting customer profile:', error);
      return {
        phone: customerPhone,
        total_calls: 0,
        name: null
      };
    }
  }

  /**
   * Get recent calls for customer
   */
  async getRecentCalls(customerPhone, limit = 3) {
    try {
      const db = this.getDb();
      
      const calls = await db('calls')
        .where({ phone_number: customerPhone })
        .whereNot({ status: 'failed' })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .select('id', 'direction', 'status', 'duration', 'detected_language', 'csat_score', 'created_at');

      return calls;
    } catch (error) {
      logger.error('Error getting recent calls:', error);
      return [];
    }
  }

  /**
   * Get current call session
   */
  async getCurrentSession(callId) {
    try {
      const db = this.getDb();
      
      let session = await db('call_sessions')
        .where({ call_id: callId })
        .first();

      if (!session) {
        // Create new session
        [session] = await db('call_sessions')
          .insert({
            call_id: callId,
            conversation_state: 'greeting',
            context: {},
            collected_info: {},
            pending_actions: [],
            created_at: new Date()
          })
          .returning('*');
      }

      return session;
    } catch (error) {
      logger.error('Error getting current session:', error);
      return {
        conversation_state: 'greeting',
        collected_info: {},
        pending_actions: []
      };
    }
  }

  /**
   * Get conversation history for call
   */
  async getConversationHistory(callId, limit = 10) {
    try {
      const db = this.getDb();
      
      const history = await db('conversation_history')
        .where({ call_id: callId })
        .orderBy('turn_number', 'asc')
        .limit(limit)
        .select('speaker', 'message', 'intent', 'sentiment', 'timestamp');

      return history;
    } catch (error) {
      logger.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Get agent configuration
   */
  async getAgentConfig(agentId) {
    try {
      const db = this.getDb();
      
      const agent = await db('agents')
        .where({ id: agentId })
        .first();

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      return agent;
    } catch (error) {
      logger.error('Error getting agent config:', error);
      return {
        name: 'AI Agent',
        personality: 'professional',
        language: 'en'
      };
    }
  }

  /**
   * Update conversation history
   */
  async addConversationTurn(callId, agentId, customerPhone, speaker, message, intent = null, entities = null, sentiment = null) {
    try {
      const db = this.getDb();
      
      // Get current turn number
      const lastTurn = await db('conversation_history')
        .where({ call_id: callId })
        .orderBy('turn_number', 'desc')
        .first();

      const turnNumber = lastTurn ? lastTurn.turn_number + 1 : 1;

      // Insert new turn
      await db('conversation_history').insert({
        call_id: callId,
        agent_id: agentId,
        customer_phone: customerPhone,
        turn_number: turnNumber,
        speaker,
        message,
        intent,
        entities,
        sentiment,
        timestamp: new Date()
      });

      // Invalidate cache
      await this.invalidateCache(callId);

      logger.info(`Added conversation turn ${turnNumber} for call ${callId}`);
    } catch (error) {
      logger.error('Error adding conversation turn:', error);
      throw error;
    }
  }

  /**
   * Update session context
   */
  async updateSessionContext(callId, updates) {
    try {
      const db = this.getDb();
      
      await db('call_sessions')
        .where({ call_id: callId })
        .update({
          ...updates,
          updated_at: new Date()
        });

      // Invalidate cache
      await this.invalidateCache(callId);

      logger.info(`Updated session context for call ${callId}`);
    } catch (error) {
      logger.error('Error updating session context:', error);
      throw error;
    }
  }

  /**
   * Update customer profile
   */
  async updateCustomerProfile(customerPhone, updates) {
    try {
      const db = this.getDb();
      
      await db('customer_profiles')
        .where({ phone: customerPhone })
        .update({
          ...updates,
          updated_at: new Date()
        });

      logger.info(`Updated customer profile for ${customerPhone}`);
    } catch (error) {
      logger.error('Error updating customer profile:', error);
      throw error;
    }
  }

  /**
   * Get relevant knowledge for query
   */
  async getRelevantKnowledge(query, agentId, limit = 5) {
    try {
      const db = this.getDb();
      
      // Simple keyword search for now
      // TODO: Implement vector similarity search
      const knowledge = await db('knowledge_base')
        .where({ agent_id: agentId, status: 'active' })
        .where(function() {
          this.where('content', 'ilike', `%${query}%`)
            .orWhere('title', 'ilike', `%${query}%`);
        })
        .orderBy('priority', 'desc')
        .limit(limit)
        .select('id', 'title', 'content', 'category', 'tags');

      return knowledge;
    } catch (error) {
      logger.error('Error getting relevant knowledge:', error);
      return [];
    }
  }

  /**
   * Format context for LLM
   */
  formatContextForLLM(context, currentMessage = '') {
    const { customer, recentCalls, currentSession, conversationHistory, agent, knowledge } = context;

    let prompt = `## Customer Profile\n`;
    prompt += `Name: ${customer.name || 'Unknown'}\n`;
    prompt += `Phone: ${customer.phone}\n`;
    prompt += `Language: ${customer.language_preference || agent.language || 'en'}\n`;
    prompt += `Previous Calls: ${customer.total_calls || 0}\n`;
    if (customer.last_call_date) {
      prompt += `Last Contact: ${new Date(customer.last_call_date).toLocaleDateString()}\n`;
    }
    if (customer.communication_style) {
      prompt += `Communication Style: ${customer.communication_style}\n`;
    }
    if (customer.sentiment_trend) {
      prompt += `Sentiment Trend: ${customer.sentiment_trend}\n`;
    }

    if (recentCalls && recentCalls.length > 0) {
      prompt += `\n## Recent Interaction History\n`;
      recentCalls.forEach((call, i) => {
        prompt += `${i + 1}. ${call.direction} call on ${new Date(call.created_at).toLocaleDateString()}`;
        if (call.duration) prompt += ` (${Math.round(call.duration / 60)} min)`;
        if (call.csat_score) prompt += ` - CSAT: ${call.csat_score}/5`;
        prompt += `\n`;
      });
    }

    if (currentSession) {
      prompt += `\n## Current Conversation\n`;
      prompt += `State: ${currentSession.conversation_state}\n`;
      if (currentSession.collected_info && Object.keys(currentSession.collected_info).length > 0) {
        prompt += `Collected Info: ${JSON.stringify(currentSession.collected_info)}\n`;
      }
      if (currentSession.pending_actions && currentSession.pending_actions.length > 0) {
        prompt += `Pending Actions: ${currentSession.pending_actions.join(', ')}\n`;
      }
    }

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `\n## Conversation History (last ${conversationHistory.length} turns)\n`;
      conversationHistory.forEach(turn => {
        prompt += `${turn.speaker}: ${turn.message}\n`;
      });
    }

    if (knowledge && knowledge.length > 0) {
      prompt += `\n## Relevant Knowledge Base\n`;
      knowledge.forEach(k => {
        prompt += `- ${k.title}: ${k.content.substring(0, 200)}...\n`;
      });
    }

    if (agent.business_rules && agent.business_rules.length > 0) {
      prompt += `\n## Business Rules\n`;
      agent.business_rules.forEach(rule => {
        prompt += `- ${rule}\n`;
      });
    }

    prompt += `\n## Agent Guidelines\n`;
    prompt += `Personality: ${agent.personality || 'professional'}\n`;
    prompt += `Voice: ${agent.voice || 'default'}\n`;
    prompt += `Language: ${agent.language || 'en'}\n`;
    if (agent.special_instructions) {
      prompt += `Special Instructions: ${agent.special_instructions}\n`;
    }

    if (currentMessage) {
      prompt += `\n## Current Customer Message\n"${currentMessage}"\n`;
    }

    return prompt;
  }

  /**
   * Get default context when errors occur
   */
  getDefaultContext() {
    return {
      customer: { phone: 'unknown', total_calls: 0 },
      recentCalls: [],
      currentSession: { conversation_state: 'greeting', collected_info: {}, pending_actions: [] },
      conversationHistory: [],
      agent: { name: 'AI Agent', personality: 'professional', language: 'en' },
      knowledge: []
    };
  }

  /**
   * Invalidate context cache
   */
  async invalidateCache(callId) {
    try {
      const cacheKey = `context:${callId}`;
      // Note: cacheDelete not implemented in redis.js yet
      // await cacheDelete(cacheKey);
      logger.info(`Invalidated cache for call ${callId}`);
    } catch (error) {
      logger.error('Error invalidating cache:', error);
    }
  }

  /**
   * Save call insights after call ends
   */
  async saveCallInsights(callId, insights) {
    try {
      const db = this.getDb();
      
      await db('call_insights').insert({
        call_id: callId,
        customer_phone: insights.customerPhone,
        key_topics: insights.keyTopics || [],
        mentioned_products: insights.mentionedProducts || [],
        pain_points: insights.painPoints || [],
        questions_asked: insights.questionsAsked || [],
        objections: insights.objections || [],
        overall_sentiment: insights.overallSentiment,
        sentiment_by_topic: insights.sentimentByTopic || {},
        emotional_journey: insights.emotionalJourney || {},
        primary_intent: insights.primaryIntent,
        secondary_intents: insights.secondaryIntents || [],
        intent_confidence: insights.intentConfidence,
        resolution_status: insights.resolutionStatus,
        next_steps: insights.nextSteps || [],
        follow_up_required: insights.followUpRequired || false,
        follow_up_date: insights.followUpDate,
        summary: insights.summary,
        recommendations: insights.recommendations || [],
        created_at: new Date()
      });

      logger.info(`Saved call insights for call ${callId}`);
    } catch (error) {
      logger.error('Error saving call insights:', error);
      throw error;
    }
  }
}

module.exports = ContextManager;
