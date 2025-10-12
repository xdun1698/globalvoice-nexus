const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const db = getDatabase();
    const { startDate, endDate } = req.query;

    let query = db('calls').where('user_id', req.user.id);

    if (startDate) query = query.where('created_at', '>=', startDate);
    if (endDate) query = query.where('created_at', '<=', endDate);

    const stats = await query.select(
      db.raw('COUNT(*) as total_calls'),
      db.raw('SUM(CASE WHEN direction = \'inbound\' THEN 1 ELSE 0 END) as inbound_calls'),
      db.raw('SUM(CASE WHEN direction = \'outbound\' THEN 1 ELSE 0 END) as outbound_calls'),
      db.raw('AVG(duration) as avg_duration'),
      db.raw('AVG(csat_score) as avg_csat')
    ).first();

    res.json({ stats });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get language distribution
router.get('/languages', async (req, res) => {
  try {
    const db = getDatabase();
    
    const languages = await db('calls')
      .where('user_id', req.user.id)
      .select('detected_language')
      .count('* as count')
      .groupBy('detected_language')
      .orderBy('count', 'desc')
      .limit(10);

    res.json({ languages });
  } catch (error) {
    logger.error('Error fetching language analytics:', error);
    res.status(500).json({ error: 'Failed to fetch language analytics' });
  }
});

module.exports = router;
