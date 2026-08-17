const { Server } = require('socket.io');
const { verifyToken } = require('../utils/token');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(); // allow anonymous viewers of the public map
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      socket.stationId = decoded.stationId;
    } catch (err) {
      // invalid token -> treat as anonymous rather than hard failing
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      if (socket.role === 'authority' && socket.stationId) {
        socket.join(`station:${socket.stationId}`);
      }
    }
    socket.join('public-map'); // everyone gets live verified-alert pins

    socket.on('location:update', (coords) => {
      if (!socket.userId || !coords) return;
      // Broadcast to authorities monitoring the map (not persisted here for
      // simplicity - persisted separately via REST heartbeat if needed).
      socket.to('public-map').emit('citizen:location', {
        userId: socket.userId,
        ...coords,
      });
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized yet.');
  return io;
}

// Helper emitters used across controllers
function notifyUser(userId, payload) {
  getIo().to(`user:${userId}`).emit('notification', payload);
}

function notifyStation(stationId, event, payload) {
  getIo().to(`station:${stationId}`).emit(event, payload);
}

function broadcastAlert(alert) {
  getIo().to('public-map').emit('alert:new', alert);
}

module.exports = { initSocket, getIo, notifyUser, notifyStation, broadcastAlert };
