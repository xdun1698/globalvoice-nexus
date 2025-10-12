const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function initializeWebSocket(io) {
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id} (user: ${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle call events
    socket.on('call:start', (data) => {
      logger.info(`Call started: ${data.callId}`);
      io.to(`user:${socket.userId}`).emit('call:started', data);
    });

    socket.on('call:end', (data) => {
      logger.info(`Call ended: ${data.callId}`);
      io.to(`user:${socket.userId}`).emit('call:ended', data);
    });

    socket.on('call:update', (data) => {
      io.to(`user:${socket.userId}`).emit('call:updated', data);
    });

    // Handle agent events
    socket.on('agent:status', (data) => {
      io.to(`user:${socket.userId}`).emit('agent:status:changed', data);
    });

    // Handle real-time transcript
    socket.on('transcript:update', (data) => {
      io.to(`user:${socket.userId}`).emit('transcript:new', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  return io;
}

module.exports = { initializeWebSocket };
