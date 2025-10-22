const axios = require('axios');
const logger = require('../utils/logger');

// Map test voice IDs to real ElevenLabs voice IDs
const VOICE_ID_MAP = {
  // 🇺🇸 North America
  'test_antoni': 'ErXwobaYiN019PkySvjV',
  'test_rachel': '21m00Tcm4TlvDq8ikWAM',
  'test_adam': 'pNInz6obpgDQGcFmaJgB',
  'test_bella': 'EXAVITQu4vr4xnSDxMaL',
  'test_josh': 'TxGEqnHWrfWFTfGW9XjX',
  'test_domi': 'AZnzlk1XvdvUeBnXmlld',
  'test_grace': 'oWAxZDx7w5VEj9dCyTzz',
  
  // 🇬🇧 United Kingdom
  'test_lily': 'pFZP5JQG7iQjIQuC4Bku',
  'test_daniel': 'onwK4e9ZLuTAKqWW03F9',
  'test_charlotte': 'XB0fDUnXU5powFXDhCwa',
  'test_george': 'JBFqnCBsd6RMkjVDRZzb',
  'test_alice': 'Xb7hH8MSUJpSbSDYk0k2',
  
  // 🇦🇺 Australia
  'test_james': 'ZQe5CZNOzWyzPSCn5a3c',
  'test_nicole': 'piTKgcLEGmPE4e6mEKli',
  'test_jack': 'CwhRBWXzGAHq8TQ4Fs17',
  'test_emma': 'ThT5KcBeYPX3keUQqHPh',
  
  // 🇮🇳 India
  'test_priya': 'yoZ06aMxZJJ28mfd3POQ',
  'test_raj': 'VR6AewLTigWG4xSOukaG',
  'test_ananya': 'MF3mGyEYCl7XYWbV9V6O',
  'test_arjun': 'N2lVS1w4EtoT3dr4eOWO',
  
  // Default fallback
  'default': 'ErXwobaYiN019PkySvjV'
};

/**
 * Convert test voice ID to real ElevenLabs voice ID
 */
function getRealVoiceId(voiceId) {
  if (!voiceId) return VOICE_ID_MAP.default;
  
  // If it's already a real ID (doesn't start with 'test_'), return as-is
  if (!voiceId.startsWith('test_')) {
    return voiceId;
  }
  
  // Map test ID to real ID
  const realId = VOICE_ID_MAP[voiceId];
  
  if (!realId) {
    logger.warn(`No mapping found for voice ID: ${voiceId}, using default`);
    return VOICE_ID_MAP.default;
  }
  
  logger.info(`Mapped voice ID: ${voiceId} → ${realId}`);
  return realId;
}

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
          voiceId: getRealVoiceId(agent.elevenlabs_voice),
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
      // Get a phone number to call from (first available Vapi phone number)
      logger.info('Fetching available Vapi phone numbers...');
      const phoneNumbers = await this.getPhoneNumbers();
      
      if (phoneNumbers.length === 0) {
        logger.error('No phone numbers available in Vapi');
        throw new Error('No phone numbers available in Vapi. Please add a phone number in the Vapi dashboard first.');
      }
      
      const fromPhoneNumber = phoneNumbers[0];
      logger.info(`Using phone number: ${fromPhoneNumber.number} (ID: ${fromPhoneNumber.id})`);
      
      const payload = {
        assistantId: assistantId,
        phoneNumberId: fromPhoneNumber.id,
        customer: {
          number: phoneNumber,
          ...customerData
        }
      };
      
      logger.info('Making Vapi call with payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `${this.baseUrl}/call`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info(`✅ Vapi call initiated successfully:`, {
        callId: response.data.id,
        from: fromPhoneNumber.number,
        to: phoneNumber,
        status: response.data.status
      });
      
      return response.data;
    } catch (error) {
      logger.error('❌ Vapi call failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Throw user-friendly error
      if (error.response?.data?.message) {
        throw new Error(`Vapi API error: ${error.response.data.message}`);
      } else if (error.response?.status === 401) {
        throw new Error('Vapi authentication failed. Please check API keys.');
      } else if (error.response?.status === 404) {
        throw new Error('Vapi resource not found. Please check assistant ID and phone number ID.');
      } else {
        throw new Error(`Failed to initiate call: ${error.message}`);
      }
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
