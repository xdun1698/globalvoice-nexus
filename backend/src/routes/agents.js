const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const ElevenLabsService = require('../services/elevenlabs');
const vapiService = require('../services/vapi');

// Get all agents for user
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const agents = await db('agents')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    // Get phone numbers for each agent
    for (const agent of agents) {
      const phoneNumbers = await db('phone_numbers')
        .where({ agent_id: agent.id })
        .select('id', 'number', 'country_code', 'capabilities');
      
      agent.phone_numbers = phoneNumbers;
    }

    res.json({ agents });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const agent = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get phone numbers for this agent
    const phoneNumbers = await db('phone_numbers')
      .where({ agent_id: agent.id })
      .select('id', 'number', 'country_code', 'capabilities');
    
    agent.phone_numbers = phoneNumbers;

    res.json({ agent });
  } catch (error) {
    logger.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create agent
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const {
      name,
      description,
      greeting,
      language,
      voice,
      personality,
      intents,
      workflows,
      enableVoiceCloning
    } = req.body;

    const [agent] = await db('agents').insert({
      user_id: req.user.id,
      name,
      description,
      greeting,
      language,
      voice,
      personality,
      intents: JSON.stringify(intents || []),
      workflows: JSON.stringify(workflows || []),
      enable_voice_cloning: enableVoiceCloning || false,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    // Sync to Vapi
    try {
      const vapiAssistant = await vapiService.syncAssistant(agent);
      await db('agents')
        .where({ id: agent.id })
        .update({ vapi_assistant_id: vapiAssistant.id });
      agent.vapi_assistant_id = vapiAssistant.id;
      logger.info(`Agent synced to Vapi: ${vapiAssistant.id}`);
    } catch (error) {
      logger.warn('Failed to sync agent to Vapi:', error.message);
    }

    logger.info(`Agent created: ${agent.id} by user ${req.user.id}`);
    res.status(201).json({ agent });
  } catch (error) {
    logger.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update agent
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const {
      name,
      description,
      greeting,
      language,
      voice,
      elevenlabs_voice,
      system_prompt,
      personality,
      intents,
      workflows,
      enableVoiceCloning,
      status
    } = req.body;

    const [agent] = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .update({
        name,
        description,
        greeting,
        language,
        voice,
        elevenlabs_voice,
        system_prompt,
        personality,
        intents: JSON.stringify(intents || []),
        workflows: JSON.stringify(workflows || []),
        enable_voice_cloning: enableVoiceCloning,
        status,
        updated_at: new Date()
      })
      .returning('*');

    // Sync to Vapi
    try {
      const vapiAssistant = await vapiService.syncAssistant(agent);
      if (!agent.vapi_assistant_id) {
        await db('agents')
          .where({ id: agent.id })
          .update({ vapi_assistant_id: vapiAssistant.id });
        agent.vapi_assistant_id = vapiAssistant.id;
      }
      logger.info(`Agent synced to Vapi: ${vapiAssistant.id}`);
    } catch (error) {
      logger.warn('Failed to sync agent to Vapi:', error.message);
    }

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    logger.info(`Agent updated: ${agent.id}`);
    res.json({ agent });
  } catch (error) {
    logger.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get agent first to get vapi_assistant_id
    const agent = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Delete from Vapi if exists
    if (agent.vapi_assistant_id) {
      try {
        await vapiService.deleteAssistant(agent.vapi_assistant_id);
      } catch (error) {
        logger.warn('Failed to delete from Vapi:', error.message);
      }
    }

    // Delete from database
    await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .delete();

    logger.info(`Agent deleted: ${req.params.id}`);
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    logger.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Get agent statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const db = getDatabase();
    
    const stats = await db('calls')
      .where({ agent_id: req.params.id })
      .select(
        db.raw('COUNT(*) as total_calls'),
        db.raw('AVG(duration) as avg_duration'),
        db.raw('SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) as completed_calls'),
        db.raw('AVG(csat_score) as avg_csat')
      )
      .first();

    res.json({ stats });
  } catch (error) {
    logger.error('Error fetching agent stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Assign phone number to agent
router.post('/:id/phone-number', async (req, res) => {
  try {
    const db = getDatabase();
    const { phoneNumber } = req.body;

    // Verify agent belongs to user
    const agent = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check if phone number exists or create it
    let phoneRecord = await db('phone_numbers')
      .where({ number: phoneNumber })
      .first();

    if (!phoneRecord) {
      // Create phone number record
      [phoneRecord] = await db('phone_numbers').insert({
        user_id: req.user.id,
        number: phoneNumber,
        agent_id: req.params.id,
        country_code: phoneNumber.substring(0, 2),
        created_at: new Date()
      }).returning('*');
    } else {
      // Update existing phone number
      await db('phone_numbers')
        .where({ number: phoneNumber })
        .update({
          agent_id: req.params.id
        });
    }

    logger.info(`Phone number ${phoneNumber} assigned to agent ${req.params.id}`);
    res.json({ message: 'Phone number assigned successfully', phoneNumber: phoneRecord });
  } catch (error) {
    logger.error('Error assigning phone number:', error);
    res.status(500).json({ error: 'Failed to assign phone number' });
  }
});

// Get agent's assigned phone numbers
router.get('/:id/phone-numbers', async (req, res) => {
  try {
    const db = getDatabase();
    
    const phoneNumbers = await db('phone_numbers')
      .where({ agent_id: req.params.id })
      .select('*');

    res.json({ phoneNumbers });
  } catch (error) {
    logger.error('Error fetching phone numbers:', error);
    res.status(500).json({ error: 'Failed to fetch phone numbers' });
  }
});

// Get available ElevenLabs voices
router.get('/voices/elevenlabs', async (req, res) => {
  try {
    const voiceLibrary = require('../data/elevenlabs-voices');
    
    // Get voices based on query parameters
    const { rating, useCase, category } = req.query;
    
    let voices;
    if (rating) {
      voices = voiceLibrary.getByRating(parseInt(rating));
    } else if (useCase) {
      voices = voiceLibrary.getByUseCase(useCase);
    } else if (category === 'collections') {
      voices = voiceLibrary.getCollectionsVoices();
    } else {
      voices = voiceLibrary.getAllVoices();
    }

    res.json({ 
      voices,
      total: voices.length,
      enabled: true
    });
  } catch (error) {
    logger.error('Error fetching ElevenLabs voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// Helper function to format phone number to E.164 format
function formatPhoneNumber(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 if not present (US numbers)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  } else if (phone.startsWith('+')) {
    return phone.replace(/\D/g, '').replace(/^/, '+');
  }
  
  return `+${digits}`; // Default: add + prefix
}

// Helper function to validate phone number
function isValidPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  // US/Canada: 10 digits or 11 digits starting with 1
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

// Test call endpoint - Make a test call to verify agent
router.post('/:id/test-call', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format',
        message: 'Please enter a valid US/Canada phone number (10 or 11 digits)'
      });
    }

    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    logger.info(`Formatted phone number: ${phoneNumber} → ${formattedPhone}`);

    const db = getDatabase();
    const agent = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check if agent has vapi_assistant_id
    if (!agent.vapi_assistant_id) {
      return res.status(400).json({ 
        error: 'Agent not synced with Vapi. Please wait a moment and try again.' 
      });
    }

    // Make outbound call via Vapi
    logger.info(`Making test call for agent ${agent.id} (${agent.name}) to ${formattedPhone}`);
    logger.info(`Using Vapi assistant ID: ${agent.vapi_assistant_id}`);
    
    const callResult = await vapiService.makeOutboundCall({
      assistantId: agent.vapi_assistant_id,
      phoneNumber: formattedPhone,
      name: `Test call for ${agent.name}`
    });

    logger.info('Test call initiated successfully:', {
      callId: callResult.id,
      status: callResult.status,
      to: formattedPhone
    });

    res.json({ 
      success: true,
      message: 'Test call initiated successfully',
      callId: callResult.id,
      phoneNumber: formattedPhone
    });
  } catch (error) {
    logger.error('Error making test call:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'Failed to initiate test call',
      message: error.message,
      details: error.response?.data?.message || 'Please check backend logs for details'
    });
  }
});

module.exports = router;
