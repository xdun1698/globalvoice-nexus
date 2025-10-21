const express = require('express');
const router = express.Router();
const vapiSyncService = require('../services/vapiSync');
const logger = require('../utils/logger');

/**
 * Vapi Sync Routes - Bidirectional sync between Vapi and Application
 */

/**
 * GET /api/vapi-sync/status
 * Get current sync status - compare Vapi and Database counts
 */
router.get('/status', async (req, res) => {
  try {
    const status = await vapiSyncService.getSyncStatus(req.user.id);
    res.json(status);
  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({ 
      error: 'Failed to get sync status',
      message: error.message 
    });
  }
});

/**
 * POST /api/vapi-sync/phone-numbers/from-vapi
 * Import phone numbers FROM Vapi TO Database
 */
router.post('/phone-numbers/from-vapi', async (req, res) => {
  try {
    logger.info(`User ${req.user.id} initiated phone number sync from Vapi`);
    const results = await vapiSyncService.syncPhoneNumbersFromVapi(req.user.id);
    
    res.json({
      success: true,
      message: 'Phone numbers synced from Vapi successfully',
      results
    });
  } catch (error) {
    logger.error('Error syncing phone numbers from Vapi:', error);
    res.status(500).json({ 
      error: 'Failed to sync phone numbers from Vapi',
      message: error.message 
    });
  }
});

/**
 * POST /api/vapi-sync/phone-numbers/to-vapi
 * Sync phone numbers FROM Database TO Vapi
 */
router.post('/phone-numbers/to-vapi', async (req, res) => {
  try {
    logger.info(`User ${req.user.id} initiated phone number sync to Vapi`);
    const results = await vapiSyncService.syncPhoneNumbersToVapi(req.user.id);
    
    res.json({
      success: true,
      message: 'Phone numbers synced to Vapi successfully',
      results
    });
  } catch (error) {
    logger.error('Error syncing phone numbers to Vapi:', error);
    res.status(500).json({ 
      error: 'Failed to sync phone numbers to Vapi',
      message: error.message 
    });
  }
});

/**
 * POST /api/vapi-sync/assistants/from-vapi
 * Import assistants FROM Vapi TO Database (as agents)
 */
router.post('/assistants/from-vapi', async (req, res) => {
  try {
    logger.info(`User ${req.user.id} initiated assistant sync from Vapi`);
    const results = await vapiSyncService.syncAssistantsFromVapi(req.user.id);
    
    res.json({
      success: true,
      message: 'Assistants synced from Vapi successfully',
      results
    });
  } catch (error) {
    logger.error('Error syncing assistants from Vapi:', error);
    res.status(500).json({ 
      error: 'Failed to sync assistants from Vapi',
      message: error.message 
    });
  }
});

/**
 * POST /api/vapi-sync/agents/to-vapi
 * Sync agents FROM Database TO Vapi (as assistants)
 */
router.post('/agents/to-vapi', async (req, res) => {
  try {
    logger.info(`User ${req.user.id} initiated agent sync to Vapi`);
    const results = await vapiSyncService.syncAgentsToVapi(req.user.id);
    
    res.json({
      success: true,
      message: 'Agents synced to Vapi successfully',
      results
    });
  } catch (error) {
    logger.error('Error syncing agents to Vapi:', error);
    res.status(500).json({ 
      error: 'Failed to sync agents to Vapi',
      message: error.message 
    });
  }
});

/**
 * POST /api/vapi-sync/full
 * Perform complete bidirectional sync
 * Syncs everything: phone numbers and assistants/agents in both directions
 */
router.post('/full', async (req, res) => {
  try {
    logger.info(`User ${req.user.id} initiated full bidirectional sync`);
    const results = await vapiSyncService.performFullSync(req.user.id);
    
    res.json({
      success: results.success,
      message: results.success 
        ? 'Full sync completed successfully' 
        : 'Full sync completed with errors',
      results
    });
  } catch (error) {
    logger.error('Error performing full sync:', error);
    res.status(500).json({ 
      error: 'Failed to perform full sync',
      message: error.message 
    });
  }
});

/**
 * GET /api/vapi-sync/health
 * Health check for Vapi sync service
 */
router.get('/health', async (req, res) => {
  try {
    const vapiConfigured = !!process.env.VAPI_PRIVATE_KEY;
    
    res.json({
      status: 'healthy',
      vapiConfigured,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

module.exports = router;
