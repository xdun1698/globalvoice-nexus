const twilio = require('twilio');
const logger = require('../utils/logger');
const vapiService = require('./vapi');

/**
 * Phone Service - Manages phone numbers from Twilio and routes to Vapi
 * Makes it easy to switch providers later
 */
class PhoneService {
  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioClient = null;
    
    if (this.twilioAccountSid && this.twilioAuthToken) {
      this.twilioClient = twilio(this.twilioAccountSid, this.twilioAuthToken);
      logger.info('Twilio client initialized');
    } else {
      logger.warn('Twilio credentials not set - phone number features disabled');
    }
  }

  /**
   * Search available phone numbers
   */
  async searchNumbers(options = {}) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      const {
        areaCode,
        country = 'US',
        contains,
        smsEnabled = true,
        voiceEnabled = true,
        limit = 10
      } = options;

      const searchParams = {
        limit,
        smsEnabled,
        voiceEnabled
      };

      if (areaCode) {
        searchParams.areaCode = areaCode;
      }

      if (contains) {
        searchParams.contains = contains;
      }

      const numbers = await this.twilioClient
        .availablePhoneNumbers(country)
        .local
        .list(searchParams);

      return numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        capabilities: num.capabilities,
        monthlyPrice: num.monthlyPrice
      }));
    } catch (error) {
      logger.error('Error searching phone numbers:', error);
      throw error;
    }
  }

  /**
   * Buy a phone number and configure it for Vapi
   */
  async buyNumber(phoneNumber, agentId, vapiAssistantId) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      // Purchase the number from Twilio
      const purchasedNumber = await this.twilioClient
        .incomingPhoneNumbers
        .create({
          phoneNumber: phoneNumber,
          voiceUrl: `${process.env.BACKEND_URL}/api/webhooks/twilio/voice`,
          voiceMethod: 'POST',
          statusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio/status`,
          statusCallbackMethod: 'POST',
          smsUrl: `${process.env.BACKEND_URL}/api/webhooks/twilio/sms`,
          smsMethod: 'POST'
        });

      logger.info(`Purchased Twilio number: ${phoneNumber}`);

      // If using Vapi, buy number there too and assign to assistant
      if (vapiAssistantId && process.env.VAPI_PRIVATE_KEY) {
        try {
          const vapiNumber = await vapiService.buyPhoneNumber(
            phoneNumber.replace('+1', '').substring(0, 3), // area code
            vapiAssistantId
          );
          logger.info(`Number also provisioned in Vapi: ${vapiNumber.number}`);
        } catch (error) {
          logger.warn('Failed to provision in Vapi:', error.message);
        }
      }

      return {
        sid: purchasedNumber.sid,
        phoneNumber: purchasedNumber.phoneNumber,
        friendlyName: purchasedNumber.friendlyName,
        capabilities: purchasedNumber.capabilities
      };
    } catch (error) {
      logger.error('Error buying phone number:', error);
      throw error;
    }
  }

  /**
   * Update phone number configuration
   */
  async updateNumber(twilioSid, config) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      const updated = await this.twilioClient
        .incomingPhoneNumbers(twilioSid)
        .update(config);

      logger.info(`Updated Twilio number: ${twilioSid}`);
      return updated;
    } catch (error) {
      logger.error('Error updating phone number:', error);
      throw error;
    }
  }

  /**
   * Release a phone number
   */
  async releaseNumber(twilioSid, vapiPhoneNumberId) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      // Release from Twilio
      await this.twilioClient
        .incomingPhoneNumbers(twilioSid)
        .remove();

      logger.info(`Released Twilio number: ${twilioSid}`);

      // Release from Vapi if exists
      if (vapiPhoneNumberId && process.env.VAPI_PRIVATE_KEY) {
        try {
          await vapiService.deletePhoneNumber(vapiPhoneNumberId);
          logger.info(`Released Vapi number: ${vapiPhoneNumberId}`);
        } catch (error) {
          logger.warn('Failed to release from Vapi:', error.message);
        }
      }

      return true;
    } catch (error) {
      logger.error('Error releasing phone number:', error);
      throw error;
    }
  }

  /**
   * Get all purchased numbers
   */
  async getNumbers() {
    if (!this.twilioClient) {
      return [];
    }

    try {
      const numbers = await this.twilioClient
        .incomingPhoneNumbers
        .list({ limit: 100 });

      return numbers.map(num => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        capabilities: num.capabilities,
        voiceUrl: num.voiceUrl,
        smsUrl: num.smsUrl
      }));
    } catch (error) {
      logger.error('Error fetching phone numbers:', error);
      return [];
    }
  }

  /**
   * Configure number to route through Vapi
   */
  async routeToVapi(twilioSid, vapiAssistantId) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      // Update Twilio to forward to Vapi's webhook
      // This would require Vapi to provide a webhook URL for Twilio
      // For now, we keep using our backend as the intermediary
      
      await this.updateNumber(twilioSid, {
        voiceUrl: `${process.env.BACKEND_URL}/api/webhooks/twilio/voice`,
        voiceMethod: 'POST'
      });

      logger.info(`Number ${twilioSid} configured to route through backend to Vapi`);
      return true;
    } catch (error) {
      logger.error('Error routing to Vapi:', error);
      throw error;
    }
  }
}

module.exports = new PhoneService();
