// Minimal test to see what's failing

console.log('1. Starting minimal test...');

try {
  console.log('2. Loading dotenv...');
  require('dotenv').config();
  console.log('3. Dotenv loaded');
  
  console.log('4. Loading express...');
  const express = require('express');
  console.log('5. Express loaded');
  
  console.log('6. Loading logger...');
  const logger = require('./src/utils/logger');
  console.log('7. Logger loaded');
  
  console.log('8. Loading database config...');
  const { initializeDatabase } = require('./src/config/database');
  console.log('9. Database config loaded');
  
  console.log('10. Initializing database...');
  initializeDatabase()
    .then(() => {
      console.log('11. Database initialized successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('12. Database initialization failed:', error);
      process.exit(1);
    });
    
} catch (error) {
  console.error('ERROR:', error);
  process.exit(1);
}
