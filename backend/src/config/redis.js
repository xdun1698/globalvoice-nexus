const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

async function initializeRedis() {
  // Skip Redis if not configured (optional for deployment)
  if (!process.env.REDIS_URL || process.env.REDIS_URL === 'redis://localhost:6379') {
    logger.warn('Redis URL not configured - running without cache');
    return null;
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries - continuing without cache');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      connectTimeout: 5000
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (error) => {
      logger.warn('Redis client error (non-fatal):', error.message);
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    // Test connection with timeout
    await Promise.race([
      redisClient.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 5000))
    ]);
    
    return redisClient;
  } catch (error) {
    logger.warn('Redis initialization failed - continuing without cache:', error.message);
    redisClient = null;
    return null;
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
  if (!redisClient) {
    return; // No-op if Redis not available
  }
  try {
    await redisClient.setex(key, expirySeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn('Cache set error (non-fatal):', error.message);
  }
}

async function cacheGet(key) {
  if (!redisClient) {
    return null; // Return null if Redis not available
  }
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.warn('Cache get error (non-fatal):', error.message);
    return null;
  }
}

async function cacheDelete(key) {
  if (!redisClient) {
    return; // No-op if Redis not available
  }
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.warn('Cache delete error (non-fatal):', error.message);
  }
}

async function cacheFlush() {
  if (!redisClient) {
    return; // No-op if Redis not available
  }
  try {
    await redisClient.flushall();
  } catch (error) {
    logger.warn('Cache flush error (non-fatal):', error.message);
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
