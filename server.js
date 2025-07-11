const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const { createRequestHandler } = require('@react-router/express');
const path = require('path');

// Configuración del entorno
const config = {
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  socketIoCorsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
  cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '300000'), // 5 minutos
};

const app = express();
const server = http.createServer(app);

// Configurar CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Configurar Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.socketIoCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Gestor de salas simple
class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, hostId) {
    const room = {
      id: roomId,
      hostId: hostId,
      players: new Map(),
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addPlayerToRoom(roomId, playerId, playerData) {
    const room = this.getRoom(roomId);
    if (room) {
      room.players.set(playerId, playerData);
      room.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.players.delete(playerId);
      room.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: Array.from(this.rooms.values()).reduce((total, room) => total + room.players.size, 0)
    };
  }

  cleanInactiveRooms() {
    const now = Date.now();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutos
    
    for (const [roomId, room] of this.rooms) {
      if (now - room.lastActivity > maxInactiveTime) {
        this.rooms.delete(roomId);
        console.log(`Sala ${roomId} eliminada por inactividad`);
      }
    }
  }
}

const roomManager = new RoomManager();

// Rutas de la API
app.get('/health', (req, res) => {
  const stats = roomManager.getStats();
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats
    }
  });
});

app.post('/api/rooms', (req, res) => {
  const { roomId, hostId } = req.body;
  try {
    const room = roomManager.createRoom(roomId, hostId);
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId);
  
  if (room) {
    res.json({
      success: true,
      data: room
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Sala no encontrada'
    });
  }
});

// Configurar manejadores de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-room', (data) => {
    const { roomId, playerId, playerData } = data;
    
    socket.join(roomId);
    roomManager.addPlayerToRoom(roomId, playerId, playerData);
    
    socket.to(roomId).emit('player-joined', {
      playerId,
      playerData
    });
    
    console.log(`Jugador ${playerId} se unió a la sala ${roomId}`);
  });

  socket.on('leave-room', (data) => {
    const { roomId, playerId } = data;
    
    socket.leave(roomId);
    roomManager.removePlayerFromRoom(roomId, playerId);
    
    socket.to(roomId).emit('player-left', {
      playerId
    });
    
    console.log(`Jugador ${playerId} abandonó la sala ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Servir archivos estáticos del build de React Router
app.use(express.static(path.join(__dirname, 'build/client')));

// Configurar React Router para manejar todas las demás rutas
app.all('*', createRequestHandler({
  build: () => import('./build/server/index.js'),
  mode: process.env.NODE_ENV
}));

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Limpiar salas inactivas periódicamente
setInterval(() => {
  roomManager.cleanInactiveRooms();
  console.log('Limpieza de salas inactivas completada');
}, config.cleanupInterval);

// Iniciar servidor
server.listen(config.port, () => {
  console.log(`🚀 Servidor iniciado en puerto ${config.port}`);
  console.log(`🌐 CORS habilitado para: ${config.corsOrigin}`);
  console.log(`🔌 Socket.IO habilitado para: ${config.socketIoCorsOrigin}`);
  console.log(`🧹 Limpieza automática cada ${config.cleanupInterval / 1000} segundos`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = app; 