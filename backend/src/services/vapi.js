const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Vapi Service - Abstraction layer for Vapi.ai API
 * Makes it easy to swap Vapi for another provider later
 */
class VapiService {
  constructor() {
    this.apiKey = process.env.VAPI_PRIVATE_KEY;
    this.publicKey = process.env.VAPI_PUBLIC_KEY;
    this.baseUrl = 'https://api.vapi.ai';
    
    if (!this.apiKey) {
      logger.warn('VAPI_PRIVATE_KEY not set - Vapi features disabled');
    }
  }

  /**
   * Create or update an assistant in Vapi
   */
  async syncAssistant(agent) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const payload = {
        name: agent.name,
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo',
          temperature: 0.8,
          maxTokens: 200,
          systemPrompt: this.buildSystemPrompt(agent)
        },
        voice: {
          provider: '11labs',
          voiceId: agent.elevenlabs_voice || 'ErXwobaYiN019PkySvjV', // Antoni default
          stability: 0.35,
          similarityBoost: 0.75,
          style: 0.3
        },
        firstMessage: agent.greeting || 'Hello! How can I help you today?',
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: agent.language || 'en'
        },
        recordingEnabled: true,
        endCallFunctionEnabled: true,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: 'off'
      };

      // Check if assistant already exists in Vapi
      let response;
      if (agent.vapi_assistant_id) {
        // Update existing
        response = await axios.patch(
          `${this.baseUrl}/assistant/${agent.vapi_assistant_id}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        logger.info(`Updated Vapi assistant: ${agent.vapi_assistant_id}`);
      } else {
        // Create new
        response = await axios.post(
          `${this.baseUrl}/assistant`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        logger.info(`Created Vapi assistant: ${response.data.id}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error syncing assistant to Vapi:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete an assistant from Vapi
   */
  async deleteAssistant(vapiAssistantId) {
    if (!this.apiKey) return;

    try {
      await axios.delete(
        `${this.baseUrl}/assistant/${vapiAssistantId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      logger.info(`Deleted Vapi assistant: ${vapiAssistantId}`);
    } catch (error) {
      logger.error('Error deleting Vapi assistant:', error.response?.data || error.message);
    }
  }

  /**
   * Get phone numbers from Vapi
   */
  async getPhoneNumbers() {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get(
        `${this.baseUrl}/phone-number`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching Vapi phone numbers:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Buy a phone number in Vapi
   */
  async buyPhoneNumber(areaCode, assistantId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/phone-number`,
        {
          areaCode: areaCode,
          assistantId: assistantId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      logger.info(`Purchased Vapi phone number: ${response.data.number}`);
      return response.data;
    } catch (error) {
      logger.error('Error buying Vapi phone number:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update phone number assignment
   */
  async updatePhoneNumber(phoneNumberId, assistantId) {
    if (!this.apiKey) return;

    try {
      const response = await axios.patch(
        `${this.baseUrl}/phone-number/${phoneNumberId}`,
        {
          assistantId: assistantId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      logger.info(`Updated Vapi phone number: ${phoneNumberId}`);
      return response.data;
    } catch (error) {
      logger.error('Error updating Vapi phone number:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete phone number from Vapi
   */
  async deletePhoneNumber(phoneNumberId) {
    if (!this.apiKey) return;

    try {
      await axios.delete(
        `${this.baseUrl}/phone-number/${phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      logger.info(`Deleted Vapi phone number: ${phoneNumberId}`);
    } catch (error) {
      logger.error('Error deleting Vapi phone number:', error.response?.data || error.message);
    }
  }

  /**
   * Make an outbound call via Vapi
   */
  async makeCall(assistantId, phoneNumber, customerData = {}) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/call`,
        {
          assistantId: assistantId,
          customer: {
            number: phoneNumber,
            ...customerData
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      logger.info(`Initiated Vapi call: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Error making Vapi call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Make an outbound call via Vapi (alias for makeCall)
   */
  async makeOutboundCall({ assistantId, phoneNumber, name, customerData = {} }) {
    return this.makeCall(assistantId, phoneNumber, { name, ...customerData });
  }

  /**
   * Build system prompt from agent configuration
   */
  buildSystemPrompt(agent) {
    let prompt = '';

    // Add personality
    if (agent.personality) {
      prompt += `${agent.personality}\n\n`;
    }

    // Add description/role
    if (agent.description) {
      prompt += `Role: ${agent.description}\n\n`;
    }

    // Add system prompt if exists
    if (agent.system_prompt) {
      prompt += agent.system_prompt;
    }

    return prompt || 'You are a helpful AI assistant.';
  }
}

module.exports = new VapiService();
