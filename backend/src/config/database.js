const knex = require('knex');
const logger = require('../utils/logger');

let db = null;

const knexConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'globalvoice'
  },
  pool: {
    min: 2,
    max: parseInt(process.env.DATABASE_POOL_SIZE) || 10
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

async function initializeDatabase() {
  try {
    db = knex(knexConfig);
    
    // Test connection
    await db.raw('SELECT 1');
    logger.info('Database connection established');
    
    return db;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase,
  knexConfig
};
