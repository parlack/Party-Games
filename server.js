import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { createRequestHandler } from '@react-router/express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del entorno
const config = {
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  socketIoCorsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
  cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '300000'), // 5 minutos
};

const app = express();
const server = createServer(app);

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

// Gestor de salas mejorado
class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    // Generar código de 6 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(settings) {
    let roomCode = this.generateRoomCode();
    
    // Asegurar que el código sea único
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const hostPlayer = {
      id: `host_${Date.now()}`,
      name: settings.hostName || 'Host',
      isHost: true,
      isSpectator: false,
      joinedAt: new Date().toISOString(),
      socketId: null,
      isOnline: false
    };

    const room = {
      id: roomCode,
      code: roomCode,
      name: settings.name,
      maxPlayers: settings.maxPlayers || 8,
      currentPlayers: 1,
      minigameCount: settings.minigameCount || 5,
      isRandomGames: settings.isRandomGames || true,
      isActive: true,
      players: [hostPlayer],
      host: hostPlayer,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      playersMap: new Map([[hostPlayer.id, hostPlayer]])
    };

    this.rooms.set(roomCode, room);
    console.log(`🏠 Sala creada: ${roomCode} por ${hostPlayer.name}`);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId.toUpperCase());
  }

  addPlayerToRoom(roomId, playerId, playerData) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    if (room.currentPlayers >= room.maxPlayers) {
      return false;
    }

    const player = {
      id: playerId,
      name: playerData.name,
      isHost: false,
      isSpectator: playerData.isSpectator || false,
      joinedAt: new Date().toISOString(),
      socketId: playerData.socketId,
      isOnline: true
    };

    room.playersMap.set(playerId, player);
    room.players = Array.from(room.playersMap.values());
    room.currentPlayers = room.players.length;
    room.lastActivity = new Date().toISOString();

    console.log(`👤 Jugador ${player.name} se unió a la sala ${roomId}`);
    return true;
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    if (room.playersMap.has(playerId)) {
      room.playersMap.delete(playerId);
      room.players = Array.from(room.playersMap.values());
      room.currentPlayers = room.players.length;
      room.lastActivity = new Date().toISOString();

      // Si era el host y quedan jugadores, asignar nuevo host
      if (room.host.id === playerId && room.players.length > 0) {
        room.host = room.players[0];
        room.host.isHost = true;
      }

      console.log(`👋 Jugador ${playerId} salió de la sala ${roomId}`);
      return true;
    }
    return false;
  }

  updatePlayerSocket(roomId, playerId, socketId) {
    const room = this.getRoom(roomId);
    if (room && room.playersMap.has(playerId)) {
      const player = room.playersMap.get(playerId);
      player.socketId = socketId;
      player.isOnline = true;
      room.lastActivity = new Date().toISOString();
      return true;
    }
    return false;
  }

  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: Array.from(this.rooms.values()).reduce((total, room) => total + room.currentPlayers, 0)
    };
  }

  cleanInactiveRooms() {
    const now = Date.now();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutos
    
    for (const [roomId, room] of this.rooms) {
      const lastActivity = new Date(room.lastActivity).getTime();
      if (now - lastActivity > maxInactiveTime) {
        this.rooms.delete(roomId);
        console.log(`🗑️ Sala ${roomId} eliminada por inactividad`);
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
  const { settings } = req.body;
  try {
    if (!settings || !settings.name) {
      return res.status(400).json({
        success: false,
        error: 'Configuración de sala requerida'
      });
    }

    const room = roomManager.createRoom(settings);
    
    // Crear una copia sin el Map para enviar al cliente
    const roomResponse = {
      ...room,
      players: room.players
    };
    delete roomResponse.playersMap;

    res.json({
      success: true,
      data: roomResponse
    });
  } catch (error) {
    console.error('Error creando sala:', error);
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
    // Crear una copia sin el Map para enviar al cliente
    const roomResponse = {
      ...room,
      players: room.players
    };
    delete roomResponse.playersMap;

    res.json({
      success: true,
      data: roomResponse
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
  console.log('🔌 Usuario conectado:', socket.id);

  socket.on('join-room', (data) => {
    const { roomCode, playerName, isSpectator } = data;
    
    if (!roomCode || !playerName) {
      socket.emit('error', 'Código de sala y nombre de jugador requeridos');
      return;
    }

    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('room-not-found');
      return;
    }

    if (room.currentPlayers >= room.maxPlayers && !isSpectator) {
      socket.emit('room-full');
      return;
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const playerData = {
      name: playerName,
      isSpectator: isSpectator || false,
      socketId: socket.id
    };

    const success = roomManager.addPlayerToRoom(roomCode, playerId, playerData);
    
    if (success) {
      socket.join(roomCode);
      socket.playerId = playerId;
      socket.roomCode = roomCode;

      const updatedRoom = roomManager.getRoom(roomCode);
      const player = updatedRoom.playersMap.get(playerId);

      // Crear respuesta sin Map
      const roomResponse = {
        ...updatedRoom,
        players: updatedRoom.players
      };
      delete roomResponse.playersMap;

      // Confirmar al jugador que se unió
      socket.emit('room-joined', roomResponse, player);
      
      // Notificar a otros jugadores
      socket.to(roomCode).emit('player-joined', player);
      socket.to(roomCode).emit('room-updated', roomResponse);
      
      console.log(`✅ Jugador ${playerName} se unió a la sala ${roomCode}`);
    } else {
      socket.emit('error', 'No se pudo unir a la sala');
    }
  });

  socket.on('leave-room', () => {
    if (socket.roomCode && socket.playerId) {
      const success = roomManager.removePlayerFromRoom(socket.roomCode, socket.playerId);
      
      if (success) {
        socket.leave(socket.roomCode);
        socket.to(socket.roomCode).emit('player-left', socket.playerId);
        
        const updatedRoom = roomManager.getRoom(socket.roomCode);
        if (updatedRoom) {
          const roomResponse = {
            ...updatedRoom,
            players: updatedRoom.players
          };
          delete roomResponse.playersMap;
          socket.to(socket.roomCode).emit('room-updated', roomResponse);
        }
        
        console.log(`👋 Jugador ${socket.playerId} salió de la sala ${socket.roomCode}`);
      }
      
      socket.emit('room-left');
      socket.playerId = null;
      socket.roomCode = null;
    }
  });

  socket.on('start-game', () => {
    if (socket.roomCode && socket.playerId) {
      const room = roomManager.getRoom(socket.roomCode);
      if (room && room.host.id === socket.playerId) {
        const roomResponse = {
          ...room,
          players: room.players
        };
        delete roomResponse.playersMap;
        
        io.to(socket.roomCode).emit('game-started', roomResponse);
        console.log(`🎮 Juego iniciado en sala ${socket.roomCode}`);
      } else {
        socket.emit('error', 'Solo el host puede iniciar el juego');
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Usuario desconectado:', socket.id);
    
    // Limpiar automáticamente si el jugador se desconecta
    if (socket.roomCode && socket.playerId) {
      roomManager.removePlayerFromRoom(socket.roomCode, socket.playerId);
      socket.to(socket.roomCode).emit('player-left', socket.playerId);
    }
  });
});

// Servir archivos estáticos del build de React Router
app.use(express.static(path.join(__dirname, 'build/client')));

// Configurar React Router para manejar todas las demás rutas
app.all('*', createRequestHandler({
  build: async () => {
    return await import('./build/server/index.js');
  },
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

export default app; 