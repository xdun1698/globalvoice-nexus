const express = require('express');
const router = express.Router();
const TelephonyService = require('../services/telephony');
const logger = require('../utils/logger');

const telephonyService = new TelephonyService();

// Twilio voice webhook
router.post('/twilio/voice', async (req, res) => {
  await telephonyService.handleIncomingCall(req, res);
});

// Twilio speech input webhook
router.post('/twilio/speech', async (req, res) => {
  await telephonyService.handleSpeechInput(req, res);
});

// Twilio call status webhook
router.post('/twilio/status', async (req, res) => {
  await telephonyService.handleCallStatus(req, res);
});

// Twilio recording webhook
router.post('/twilio/recording', async (req, res) => {
  await telephonyService.handleRecording(req, res);
});

// Generic webhook endpoint for integrations
router.post('/integration/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    logger.info(`Webhook received from ${provider}:`, req.body);

    // Handle different providers
    switch (provider) {
      case 'salesforce':
        // Handle Salesforce webhook
        break;
      case 'hubspot':
        // Handle HubSpot webhook
        break;
      case 'zoho':
        // Handle Zoho webhook
        break;
      default:
        logger.warn(`Unknown provider: ${provider}`);
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
