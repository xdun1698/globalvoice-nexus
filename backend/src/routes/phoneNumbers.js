const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const phoneService = require('../services/phone');
const vapiService = require('../services/vapi');

// Get all phone numbers for user
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const phoneNumbers = await db('phone_numbers')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    res.json({ phoneNumbers });
  } catch (error) {
    logger.error('Error fetching phone numbers:', error);
    res.status(500).json({ error: 'Failed to fetch phone numbers' });
  }
});

// Get single phone number
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const phoneNumber = await db('phone_numbers')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Phone number not found' });
    }

    res.json({ phoneNumber });
  } catch (error) {
    logger.error('Error fetching phone number:', error);
    res.status(500).json({ error: 'Failed to fetch phone number' });
  }
});

// Search available phone numbers
router.get('/search', async (req, res) => {
  try {
    const { areaCode, contains, country } = req.query;
    
    const numbers = await phoneService.searchNumbers({
      areaCode,
      contains,
      country: country || 'US',
      limit: 20
    });

    res.json({ numbers });
  } catch (error) {
    logger.error('Error searching phone numbers:', error);
    res.status(500).json({ error: 'Failed to search phone numbers' });
  }
});

// Buy a phone number
router.post('/buy', async (req, res) => {
  try {
    const db = getDatabase();
    const { phoneNumber, agentId } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if number already exists
    const existing = await db('phone_numbers')
      .where({ number: phoneNumber })
      .first();

    if (existing) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    // Get agent if provided
    let agent = null;
    let vapiAssistantId = null;
    if (agentId) {
      agent = await db('agents')
        .where({ id: agentId, user_id: req.user.id })
        .first();
      vapiAssistantId = agent?.vapi_assistant_id;
    }

    // Buy from Twilio (and optionally Vapi)
    const purchased = await phoneService.buyNumber(
      phoneNumber,
      agentId,
      vapiAssistantId
    );

    // Save to database
    const [dbNumber] = await db('phone_numbers').insert({
      user_id: req.user.id,
      number: purchased.phoneNumber,
      country_code: purchased.phoneNumber.substring(0, 2),
      twilio_sid: purchased.sid,
      agent_id: agentId || null,
      capabilities: JSON.stringify(purchased.capabilities),
      status: 'active',
      created_at: new Date()
    }).returning('*');

    logger.info(`Phone number purchased: ${phoneNumber} by user ${req.user.id}`);
    res.status(201).json({ phoneNumber: dbNumber });
  } catch (error) {
    logger.error('Error buying phone number:', error);
    res.status(500).json({ error: error.message || 'Failed to buy phone number' });
  }
});

// Add new phone number (manual)
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { number, country_code, twilio_sid, capabilities } = req.body;

    if (!number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if number already exists
    const existing = await db('phone_numbers')
      .where({ number })
      .first();

    if (existing) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    const [phoneNumber] = await db('phone_numbers').insert({
      user_id: req.user.id,
      number,
      country_code: country_code || number.substring(0, 2),
      twilio_sid,
      capabilities,
      created_at: new Date()
    }).returning('*');

    logger.info(`Phone number added: ${number}`);
    res.status(201).json({ phoneNumber });
  } catch (error) {
    logger.error('Error adding phone number:', error);
    res.status(500).json({ error: 'Failed to add phone number' });
  }
});

// Update phone number
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { country_code, twilio_sid, capabilities } = req.body;

    const phoneNumber = await db('phone_numbers')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Phone number not found' });
    }

    const [updated] = await db('phone_numbers')
      .where({ id: req.params.id })
      .update({
        country_code,
        twilio_sid,
        capabilities
      })
      .returning('*');

    res.json({ phoneNumber: updated });
  } catch (error) {
    logger.error('Error updating phone number:', error);
    res.status(500).json({ error: 'Failed to update phone number' });
  }
});

// Delete phone number
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    
    const phoneNumber = await db('phone_numbers')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Phone number not found' });
    }

    await db('phone_numbers').where({ id: req.params.id }).del();

    logger.info(`Phone number deleted: ${phoneNumber.number}`);
    res.json({ message: 'Phone number deleted successfully' });
  } catch (error) {
    logger.error('Error deleting phone number:', error);
    res.status(500).json({ error: 'Failed to delete phone number' });
  }
});

// Assign phone number to agent
router.put('/:id/agent', async (req, res) => {
  try {
    const db = getDatabase();
    const { agent_id } = req.body;
    
    const phoneNumber = await db('phone_numbers')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Phone number not found' });
    }

    await db('phone_numbers')
      .where({ id: req.params.id })
      .update({ agent_id });

    logger.info(`Phone number ${phoneNumber.number} assigned to agent: ${agent_id}`);
    res.json({ message: 'Phone number assigned successfully' });
  } catch (error) {
    logger.error('Error assigning phone number:', error);
    res.status(500).json({ error: 'Failed to assign phone number' });
  }
});

// Unassign phone number from agent
router.delete('/:id/agent', async (req, res) => {
  try {
    const db = getDatabase();
    
    const phoneNumber = await db('phone_numbers')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!phoneNumber) {
      return res.status(404).json({ error: 'Phone number not found' });
    }

    await db('phone_numbers')
      .where({ id: req.params.id })
      .update({ agent_id: null });

    logger.info(`Phone number unassigned: ${phoneNumber.number}`);
    res.json({ message: 'Phone number unassigned successfully' });
  } catch (error) {
    logger.error('Error unassigning phone number:', error);
    res.status(500).json({ error: 'Failed to unassign phone number' });
  }
});

module.exports = router;
