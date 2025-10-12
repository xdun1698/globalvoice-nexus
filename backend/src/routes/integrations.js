const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');

// Get all integrations
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const integrations = await db('integrations')
      .where('user_id', req.user.id);

    res.json({ integrations });
  } catch (error) {
    logger.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Connect integration
router.post('/connect', async (req, res) => {
  try {
    const db = getDatabase();
    const { provider, credentials } = req.body;

    const [integration] = await db('integrations').insert({
      user_id: req.user.id,
      provider,
      credentials: JSON.stringify(credentials),
      status: 'active',
      created_at: new Date()
    }).returning('*');

    res.status(201).json({ integration });
  } catch (error) {
    logger.error('Error connecting integration:', error);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

module.exports = router;
