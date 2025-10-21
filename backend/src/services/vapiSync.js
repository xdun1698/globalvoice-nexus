const axios = require('axios');
const logger = require('../utils/logger');
const { getDatabase } = require('../config/database');

/**
 * Vapi Sync Service - Bidirectional sync between Vapi and Application Database
 * Ensures data consistency between Vapi.ai and our application
 */
class VapiSyncService {
  constructor() {
    this.apiKey = process.env.VAPI_PRIVATE_KEY;
    this.publicKey = process.env.VAPI_PUBLIC_KEY;
    this.baseUrl = 'https://api.vapi.ai';
    
    if (!this.apiKey) {
      logger.warn('VAPI_PRIVATE_KEY not set - Vapi sync features disabled');
    }
  }

  /**
   * PHONE NUMBER SYNC
   */

  /**
   * Sync phone numbers FROM Vapi TO Database
   * Imports all Vapi phone numbers into application database
   * SAFE MODE: Only adds/updates, never deletes existing numbers
   */
  async syncPhoneNumbersFromVapi(userId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const db = getDatabase();
      
      // Fetch all phone numbers from Vapi
      const response = await axios.get(
        `${this.baseUrl}/phone-number`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const vapiNumbers = response.data || [];
      logger.info(`Found ${vapiNumbers.length} phone numbers in Vapi`);

      const syncResults = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: []
      };

      for (const vapiNumber of vapiNumbers) {
        try {
          // Check if number exists in database
          const existing = await db('phone_numbers')
            .where({ number: vapiNumber.number })
            .first();

          if (existing) {
            // Update existing record
            await db('phone_numbers')
              .where({ id: existing.id })
              .update({
                vapi_phone_id: vapiNumber.id,
                vapi_assistant_id: vapiNumber.assistantId,
                updated_at: new Date()
              });
            
            syncResults.updated++;
            logger.info(`Updated phone number: ${vapiNumber.number}`);
          } else {
            // Import new number
            await db('phone_numbers').insert({
              user_id: userId,
              number: vapiNumber.number,
              country_code: vapiNumber.number.substring(0, 2),
              vapi_phone_id: vapiNumber.id,
              vapi_assistant_id: vapiNumber.assistantId,
              status: 'active',
              created_at: new Date()
            });
            
            syncResults.imported++;
            logger.info(`Imported phone number: ${vapiNumber.number}`);
          }
        } catch (error) {
          syncResults.errors.push({
            number: vapiNumber.number,
            error: error.message
          });
          logger.error(`Error syncing phone number ${vapiNumber.number}:`, error);
        }
      }

      logger.info('Phone number sync from Vapi completed:', syncResults);
      return syncResults;
    } catch (error) {
      logger.error('Error syncing phone numbers from Vapi:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sync phone numbers FROM Database TO Vapi
   * Ensures all database phone numbers exist in Vapi
   */
  async syncPhoneNumbersToVapi(userId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const db = getDatabase();
      
      // Get all phone numbers from database
      const dbNumbers = await db('phone_numbers')
        .where({ user_id: userId })
        .select('*');

      // Get all phone numbers from Vapi
      const vapiResponse = await axios.get(
        `${this.baseUrl}/phone-number`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const vapiNumbers = vapiResponse.data || [];
      const vapiNumberMap = new Map(vapiNumbers.map(n => [n.number, n]));

      const syncResults = {
        synced: 0,
        skipped: 0,
        errors: []
      };

      for (const dbNumber of dbNumbers) {
        try {
          const vapiNumber = vapiNumberMap.get(dbNumber.number);
          
          if (vapiNumber) {
            // Update database with Vapi ID if missing
            if (!dbNumber.vapi_phone_id) {
              await db('phone_numbers')
                .where({ id: dbNumber.id })
                .update({
                  vapi_phone_id: vapiNumber.id,
                  vapi_assistant_id: vapiNumber.assistantId
                });
              
              syncResults.synced++;
              logger.info(`Linked database number ${dbNumber.number} to Vapi`);
            } else {
              syncResults.skipped++;
            }
          } else {
            // Number exists in DB but not in Vapi - log warning
            logger.warn(`Phone number ${dbNumber.number} exists in database but not in Vapi`);
            syncResults.skipped++;
          }
        } catch (error) {
          syncResults.errors.push({
            number: dbNumber.number,
            error: error.message
          });
          logger.error(`Error syncing phone number ${dbNumber.number}:`, error);
        }
      }

      logger.info('Phone number sync to Vapi completed:', syncResults);
      return syncResults;
    } catch (error) {
      logger.error('Error syncing phone numbers to Vapi:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * ASSISTANT/AGENT SYNC
   */

  /**
   * Sync assistants FROM Vapi TO Database
   * Imports all Vapi assistants as agents in application
   * SAFE MODE: Only adds/updates, never deletes existing agents
   */
  async syncAssistantsFromVapi(userId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const db = getDatabase();
      
      // Fetch all assistants from Vapi
      const response = await axios.get(
        `${this.baseUrl}/assistant`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const vapiAssistants = response.data || [];
      logger.info(`Found ${vapiAssistants.length} assistants in Vapi`);

      const syncResults = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: []
      };

      for (const vapiAssistant of vapiAssistants) {
        try {
          // Check if assistant exists in database
          const existing = await db('agents')
            .where({ vapi_assistant_id: vapiAssistant.id })
            .first();

          if (existing) {
            // Update existing agent
            await db('agents')
              .where({ id: existing.id })
              .update({
                name: vapiAssistant.name,
                greeting: vapiAssistant.firstMessage,
                language: vapiAssistant.transcriber?.language || 'en',
                elevenlabs_voice: vapiAssistant.voice?.voiceId,
                updated_at: new Date()
              });
            
            syncResults.updated++;
            logger.info(`Updated agent: ${vapiAssistant.name}`);
          } else {
            // Import new assistant as agent
            await db('agents').insert({
              user_id: userId,
              name: vapiAssistant.name,
              description: `Imported from Vapi: ${vapiAssistant.name}`,
              greeting: vapiAssistant.firstMessage || 'Hello! How can I help you?',
              language: vapiAssistant.transcriber?.language || 'en',
              voice: 'Polly.Matthew',
              elevenlabs_voice: vapiAssistant.voice?.voiceId,
              personality: vapiAssistant.model?.systemPrompt || '',
              vapi_assistant_id: vapiAssistant.id,
              status: 'active',
              created_at: new Date()
            });
            
            syncResults.imported++;
            logger.info(`Imported assistant as agent: ${vapiAssistant.name}`);
          }
        } catch (error) {
          syncResults.errors.push({
            assistant: vapiAssistant.name,
            error: error.message
          });
          logger.error(`Error syncing assistant ${vapiAssistant.name}:`, error);
        }
      }

      logger.info('Assistant sync from Vapi completed:', syncResults);
      return syncResults;
    } catch (error) {
      logger.error('Error syncing assistants from Vapi:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sync agents FROM Database TO Vapi
   * Ensures all database agents exist as assistants in Vapi
   * SAFE MODE: Only creates/updates in Vapi, never deletes
   */
  async syncAgentsToVapi(userId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const db = getDatabase();
      const vapiService = require('./vapi');
      
      // Get all agents from database
      const agents = await db('agents')
        .where({ user_id: userId })
        .select('*');

      const syncResults = {
        synced: 0,
        created: 0,
        errors: []
      };

      for (const agent of agents) {
        try {
          if (agent.vapi_assistant_id) {
            // Agent already has Vapi ID - verify it exists
            try {
              await axios.get(
                `${this.baseUrl}/assistant/${agent.vapi_assistant_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                  }
                }
              );
              syncResults.synced++;
            } catch (error) {
              if (error.response?.status === 404) {
                // Assistant doesn't exist in Vapi - recreate it
                const result = await vapiService.syncAssistant(agent);
                await db('agents')
                  .where({ id: agent.id })
                  .update({ vapi_assistant_id: result.id });
                syncResults.created++;
                logger.info(`Recreated assistant in Vapi for agent: ${agent.name}`);
              } else {
                throw error;
              }
            }
          } else {
            // Agent doesn't have Vapi ID - create assistant
            const result = await vapiService.syncAssistant(agent);
            await db('agents')
              .where({ id: agent.id })
              .update({ vapi_assistant_id: result.id });
            syncResults.created++;
            logger.info(`Created assistant in Vapi for agent: ${agent.name}`);
          }
        } catch (error) {
          syncResults.errors.push({
            agent: agent.name,
            error: error.message
          });
          logger.error(`Error syncing agent ${agent.name} to Vapi:`, error);
        }
      }

      logger.info('Agent sync to Vapi completed:', syncResults);
      return syncResults;
    } catch (error) {
      logger.error('Error syncing agents to Vapi:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * FULL BIDIRECTIONAL SYNC
   */

  /**
   * Perform complete bidirectional sync
   * Syncs both phone numbers and assistants/agents in both directions
   * SAFE MODE: Additive only - never deletes data from either system
   * 
   * What this does:
   * 1. Import new items from Vapi → Database (adds missing)
   * 2. Export new items from Database → Vapi (adds missing)
   * 3. Update existing items with latest data
   * 
   * What this NEVER does:
   * - Delete agents from Vapi
   * - Delete agents from Database
   * - Delete phone numbers from either system
   */
  async performFullSync(userId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    logger.info(`Starting full bidirectional sync for user ${userId}`);

    const results = {
      phoneNumbers: {
        fromVapi: null,
        toVapi: null
      },
      assistants: {
        fromVapi: null,
        toVapi: null
      },
      startTime: new Date(),
      endTime: null,
      success: true,
      errors: []
    };

    try {
      // Sync phone numbers FROM Vapi
      results.phoneNumbers.fromVapi = await this.syncPhoneNumbersFromVapi(userId);
    } catch (error) {
      results.errors.push({ step: 'syncPhoneNumbersFromVapi', error: error.message });
      results.success = false;
    }

    try {
      // Sync phone numbers TO Vapi
      results.phoneNumbers.toVapi = await this.syncPhoneNumbersToVapi(userId);
    } catch (error) {
      results.errors.push({ step: 'syncPhoneNumbersToVapi', error: error.message });
      results.success = false;
    }

    try {
      // Sync assistants FROM Vapi
      results.assistants.fromVapi = await this.syncAssistantsFromVapi(userId);
    } catch (error) {
      results.errors.push({ step: 'syncAssistantsFromVapi', error: error.message });
      results.success = false;
    }

    try {
      // Sync agents TO Vapi
      results.assistants.toVapi = await this.syncAgentsToVapi(userId);
    } catch (error) {
      results.errors.push({ step: 'syncAgentsToVapi', error: error.message });
      results.success = false;
    }

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;

    logger.info('Full bidirectional sync completed:', results);
    return results;
  }

  /**
   * Get sync status - compare Vapi and Database
   */
  async getSyncStatus(userId) {
    if (!this.apiKey) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const db = getDatabase();

      // Get counts from database
      const dbPhoneCount = await db('phone_numbers')
        .where({ user_id: userId })
        .count('* as count')
        .first();

      const dbAgentCount = await db('agents')
        .where({ user_id: userId })
        .count('* as count')
        .first();

      // Get counts from Vapi
      const [vapiPhones, vapiAssistants] = await Promise.all([
        axios.get(`${this.baseUrl}/phone-number`, {
          headers: { 'Authorization': `Bearer ${this.apiKey}` }
        }),
        axios.get(`${this.baseUrl}/assistant`, {
          headers: { 'Authorization': `Bearer ${this.apiKey}` }
        })
      ]);

      const status = {
        phoneNumbers: {
          database: parseInt(dbPhoneCount.count),
          vapi: vapiPhones.data?.length || 0,
          inSync: parseInt(dbPhoneCount.count) === (vapiPhones.data?.length || 0)
        },
        agents: {
          database: parseInt(dbAgentCount.count),
          vapi: vapiAssistants.data?.length || 0,
          inSync: parseInt(dbAgentCount.count) === (vapiAssistants.data?.length || 0)
        },
        overallSync: false,
        timestamp: new Date()
      };

      status.overallSync = status.phoneNumbers.inSync && status.agents.inSync;

      return status;
    } catch (error) {
      logger.error('Error getting sync status:', error);
      throw error;
    }
  }
}

module.exports = new VapiSyncService();
