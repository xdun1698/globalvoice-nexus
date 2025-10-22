const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const vapiService = require('../services/vapi');
const { authenticate } = require('../middleware/authenticate');

/**
 * Vapi.ai Webhook Handler
 * Receives call events from Vapi and logs them to the database
 */

// Initiate outbound call via Vapi
router.post('/call/outbound', authenticate, async (req, res) => {
  try {
    const { phoneNumber, agentId, customerData = {} } = req.body;

    if (!phoneNumber || !agentId) {
      return res.status(400).json({ 
        error: 'Phone number and agent ID are required' 
      });
    }

    // Get agent details to find Vapi assistant ID
    const db = getDatabase();
    const agent = await db('agents')
      .where({ id: agentId, user_id: req.user.id })
      .first();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (!agent.vapi_assistant_id) {
      return res.status(400).json({ 
        error: 'Agent not synced with Vapi. Please sync the agent first.' 
      });
    }

    // Check if user has any Vapi phone numbers
    const phoneNumbers = await db('phone_numbers')
      .where({ user_id: req.user.id, vapi_phone_id: 'not null' })
      .whereNotNull('vapi_phone_id');

    if (phoneNumbers.length === 0) {
      return res.status(400).json({ 
        error: 'No Vapi phone numbers available. Please sync phone numbers from Vapi first.' 
      });
    }

    logger.info(`Initiating Vapi outbound call: ${phoneNumber} using agent ${agent.name}`);

    // Make the call via Vapi
    const callResult = await vapiService.makeCall(
      agent.vapi_assistant_id,
      phoneNumber,
      customerData
    );

    // Create local call record
    await db('calls').insert({
      id: callResult.id,
      agent_id: agentId,
      user_id: req.user.id,
      phone_number: phoneNumber,
      direction: 'outbound',
      status: callResult.status || 'initiated',
      twilio_sid: `vapi_${callResult.id}`,
      context: JSON.stringify(customerData),
      created_at: new Date()
    });

    logger.info(`Vapi outbound call initiated: ${callResult.id}`);

    res.status(201).json({
      callId: callResult.id,
      status: callResult.status || 'initiated',
      message: 'Call initiated successfully via Vapi'
    });

  } catch (error) {
    logger.error('Error initiating Vapi outbound call:', error);
    
    // Return user-friendly error message
    let errorMessage = 'Failed to initiate call';
    if (error.message.includes('daily outbound call limit')) {
      errorMessage = 'Daily outbound call limit reached. Please try again tomorrow or upgrade your Vapi plan.';
    } else if (error.message.includes('No phone numbers available')) {
      errorMessage = 'No phone numbers available in Vapi. Please add a phone number in Vapi dashboard.';
    } else if (error.message.includes('Vapi API error')) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Vapi webhook for call events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const message = event.message || event;
    
    logger.info('Vapi webhook received:', { 
      type: message.type, 
      callId: message.call?.id,
      assistantId: message.call?.assistantId 
    });

    const db = getDatabase();

    // Handle different event types
    switch (message.type) {
      case 'assistant-request':
      case 'call.started':
        await handleCallStart(db, message);
        break;
      
      case 'transcript':
      case 'speech-update':
        await handleTranscript(db, message);
        break;
      
      case 'call.ended':
      case 'call-end':
      case 'end-of-call-report':
        await handleCallEnd(db, message);
        break;
      
      case 'status-update':
        await handleStatusUpdate(db, message);
        break;
      
      case 'function-call':
        // Handle custom function calls if needed
        logger.info('Function call received:', message.functionCall);
        break;
      
      default:
        logger.info(`Unhandled Vapi event type: ${message.type}`);
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling Vapi webhook:', error);
    res.sendStatus(500);
  }
});

// Handle call start event
async function handleCallStart(db, message) {
  const call = message.call || message;
  
  try {
    // Find agent by vapi_assistant_id
    let agent = await db('agents')
      .where({ vapi_assistant_id: call.assistantId })
      .first();

    if (!agent) {
      // Fallback: find any agent or use first user's first agent
      agent = await db('agents').first();
      if (!agent) {
        logger.warn('No agent found for Vapi call');
        return;
      }
    }

    // Check if call already exists
    const existingCall = await db('calls').where({ id: call.id }).first();
    if (existingCall) {
      logger.info(`Call ${call.id} already exists, skipping creation`);
      return;
    }

    // Create call record
    await db('calls').insert({
      id: call.id,
      agent_id: agent.id,
      user_id: agent.user_id,
      phone_number: call.customer?.number || call.phoneNumber || 'unknown',
      direction: call.type === 'inboundPhoneCall' || call.type === 'inbound' ? 'inbound' : 'outbound',
      status: 'in-progress',
      twilio_sid: `vapi_${call.id}`,
      context: JSON.stringify({}),
      created_at: new Date(call.startedAt || call.createdAt || Date.now())
    });

    logger.info(`Vapi call started: ${call.id} for agent ${agent.name}`);
  } catch (error) {
    logger.error('Error handling call start:', error);
  }
}

// Handle transcript event
async function handleTranscript(db, message) {
  const call = message.call || message;
  const transcript = message.transcript || message;
  
  try {
    // Ensure call exists
    const callExists = await db('calls').where({ id: call.id }).first();
    if (!callExists) {
      logger.warn(`Call ${call.id} not found for transcript`);
      return;
    }

    // Log transcript
    await db('call_transcripts').insert({
      call_id: call.id,
      speaker: transcript.role === 'assistant' || transcript.role === 'agent' ? 'agent' : 'caller',
      text: transcript.text || transcript.transcriptText || '',
      language: transcript.language || 'en',
      confidence: transcript.confidence || 1.0,
      timestamp: new Date(transcript.timestamp || Date.now())
    });

    logger.info(`Transcript logged for call ${call.id}: "${(transcript.text || '').substring(0, 50)}..."`);
  } catch (error) {
    logger.error('Error handling transcript:', error);
  }
}

// Handle call end event
async function handleCallEnd(db, message) {
  const call = message.call || message;
  const endedReason = message.endedReason || call.endedReason || 'unknown';
  
  try {
    // Update call record
    const updated = await db('calls')
      .where({ id: call.id })
      .update({
        status: 'completed',
        duration: call.duration || call.durationSeconds || 0,
        recording_url: call.recordingUrl || call.recording || null,
        ended_reason: endedReason,
        cost: call.cost || null,
        updated_at: new Date()
      });

    if (updated) {
      logger.info(`Vapi call ended: ${call.id}, duration: ${call.duration || 0}s, reason: ${endedReason}`);
    } else {
      logger.warn(`Call ${call.id} not found for end event`);
    }
  } catch (error) {
    logger.error('Error handling call end:', error);
  }
}

// Handle status update event
async function handleStatusUpdate(db, message) {
  const call = message.call || message;
  const status = message.status || call.status;
  
  try {
    await db('calls')
      .where({ id: call.id })
      .update({
        status: status,
        updated_at: new Date()
      });

    logger.info(`Call ${call.id} status updated: ${status}`);
  } catch (error) {
    logger.error('Error handling status update:', error);
  }
}

// Get Vapi call statistics
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();
    
    const stats = await db('calls')
      .where('twilio_sid', 'like', 'vapi_%')
      .select(
        db.raw('COUNT(*) as total_calls'),
        db.raw('AVG(duration) as avg_duration'),
        db.raw('SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) as completed_calls')
      )
      .first();

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching Vapi stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
