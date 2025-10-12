const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');

// Get all agents for user
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const agents = await db('agents')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

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
        personality,
        intents: JSON.stringify(intents || []),
        workflows: JSON.stringify(workflows || []),
        enable_voice_cloning: enableVoiceCloning,
        status,
        updated_at: new Date()
      })
      .returning('*');

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
    const deleted = await db('agents')
      .where({ id: req.params.id, user_id: req.user.id })
      .delete();

    if (!deleted) {
      return res.status(404).json({ error: 'Agent not found' });
    }

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

module.exports = router;
