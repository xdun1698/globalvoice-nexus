console.log('🚀 Starting GlobalVoice Nexus Backend...');
require('dotenv').config();
console.log('✅ Dotenv loaded');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
console.log('✅ Dependencies loaded');

// Import routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const callRoutes = require('./routes/calls');
const contactRoutes = require('./routes/contacts');
const analyticsRoutes = require('./routes/analytics');
const integrationRoutes = require('./routes/integrations');
const webhookRoutes = require('./routes/webhooks');
const phoneNumberRoutes = require('./routes/phoneNumbers');
const vapiRoutes = require('./routes/vapi');
const vapiSyncRoutes = require('./routes/vapiSync');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/authenticate');

// Import services
const logger = require('./utils/logger');
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const { initializeWebSocket } = require('./services/websocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Trust proxy for Fly.io
app.set('trust proxy', true);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://globalvoice-nexus.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting - configured for Fly.io proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use X-Forwarded-For header from Fly.io proxy
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', authenticate, agentRoutes);
app.use('/api/calls', authenticate, callRoutes);
app.use('/api/contacts', authenticate, contactRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/phone-numbers', authenticate, phoneNumberRoutes);
app.use('/api/integrations', authenticate, integrationRoutes);
app.use('/api/webhooks', webhookRoutes); // No auth for webhooks
app.use('/api/vapi', vapiRoutes); // No auth for Vapi webhooks
app.use('/api/vapi-sync', authenticate, vapiSyncRoutes); // Vapi sync endpoints

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('✅ Database initialized');

    // Initialize Redis (optional)
    try {
      await initializeRedis();
      logger.info('✅ Redis initialized');
    } catch (error) {
      logger.warn('⚠️  Redis initialization failed - continuing without cache');
    }

    // Initialize WebSocket
    initializeWebSocket(io);
    logger.info('✅ WebSocket initialized');

    // Start server
    const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 GlobalVoice Nexus Backend running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = { app, server, io };
