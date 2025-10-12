const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const TelephonyService = require('../services/telephony');
const logger = require('../utils/logger');

const telephonyService = new TelephonyService();

// Get all calls for user
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, status, direction } = req.query;
    const offset = (page - 1) * limit;

    let query = db('calls')
      .join('agents', 'calls.agent_id', 'agents.id')
      .where('calls.user_id', req.user.id)
      .select('calls.*', 'agents.name as agent_name');

    if (status) {
      query = query.where('calls.status', status);
    }

    if (direction) {
      query = query.where('calls.direction', direction);
    }

    const calls = await query
      .orderBy('calls.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('calls')
      .where('user_id', req.user.id)
      .count('* as count');

    res.json({
      calls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Get single call details
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const call = await db('calls')
      .join('agents', 'calls.agent_id', 'agents.id')
      .where('calls.id', req.params.id)
      .where('calls.user_id', req.user.id)
      .select('calls.*', 'agents.name as agent_name')
      .first();

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Get transcript
    const transcript = await db('call_transcripts')
      .where('call_id', req.params.id)
      .orderBy('timestamp', 'asc');

    res.json({ call, transcript });
  } catch (error) {
    logger.error('Error fetching call:', error);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

// Initiate outbound call
router.post('/outbound', async (req, res) => {
  try {
    const { phoneNumber, agentId } = req.body;

    if (!phoneNumber || !agentId) {
      return res.status(400).json({ error: 'Phone number and agent ID required' });
    }

    const result = await telephonyService.makeCall(
      phoneNumber,
      agentId,
      req.user.id
    );

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error initiating call:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// Get call analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const db = getDatabase();
    const { startDate, endDate } = req.query;

    let query = db('calls')
      .where('user_id', req.user.id);

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const summary = await query
      .select(
        db.raw('COUNT(*) as total_calls'),
        db.raw('SUM(CASE WHEN direction = \'inbound\' THEN 1 ELSE 0 END) as inbound_calls'),
        db.raw('SUM(CASE WHEN direction = \'outbound\' THEN 1 ELSE 0 END) as outbound_calls'),
        db.raw('AVG(duration) as avg_duration'),
        db.raw('AVG(csat_score) as avg_csat'),
        db.raw('SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) as completed_calls')
      )
      .first();

    res.json({ summary });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
