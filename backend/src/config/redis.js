const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

async function initializeRedis() {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    // Test connection
    await redisClient.ping();
    
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    throw error;
  }
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

// Cache helper functions
async function cacheSet(key, value, expirySeconds = 3600) {
  try {
    const client = getRedisClient();
    await client.setex(key, expirySeconds, JSON.stringify(value));
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

async function cacheGet(key) {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

async function cacheDelete(key) {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

async function cacheFlush() {
  try {
    const client = getRedisClient();
    await client.flushall();
  } catch (error) {
    logger.error('Cache flush error:', error);
  }
}

module.exports = {
  initializeRedis,
  getRedisClient,
  cacheSet,
  cacheGet,
  cacheDelete,
  cacheFlush
};
