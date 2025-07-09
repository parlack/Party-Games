const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configuración más flexible para producción
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ["https://games.xn--venamifiestitade20aosporfaplis-w4c.space", process.env.FRONTEND_URL]
  : ["http://localhost:5173", "http://localhost:5174"];

const io = socketIo(server, {
  cors: {
    origin: corsOrigins.filter(Boolean),
    methods: ["GET", "POST"]
  },
  // Configuración optimizada para GoDaddy - Solo polling en producción
  transports: process.env.NODE_ENV === 'production' 
    ? ['polling']                // En producción solo polling (sin WebSocket)
    : ['websocket', 'polling'],  // En desarrollo usar WebSocket
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors({
  origin: corsOrigins.filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Estado del juego
let gameState = {
  players: new Map(),
  rankings: [],
  currentGame: null,
  adminId: null,
  gameHistory: []
};

// Servir archivos estáticos del cliente compilado en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
} else {
  app.use(express.static('public'));
}

// Rutas API
app.get('/api/rankings', (req, res) => {
  res.json(gameState.rankings);
});

app.get('/api/players', (req, res) => {
  res.json(Array.from(gameState.players.values()));
});

// Ruta catch-all para React Router en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Función para actualizar rankings
function updateRankings() {
  gameState.rankings = Array.from(gameState.players.values())
    .filter(p => p.isOnline) // Solo jugadores online
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  io.emit('rankings-updated', gameState.rankings);
}

function updateUsersList() {
  const usersList = Array.from(gameState.players.values())
    .filter(p => p.isOnline);
  
  console.log(`📡 Enviando lista de usuarios (${usersList.length} conectados):`, usersList.map(u => u.name));
  io.emit('users-list-updated', usersList);
}

// Función para crear un nuevo juego
function createGame(type, adminId) {
  const gameId = uuidv4();
  gameState.currentGame = {
    id: gameId,
    type,
    adminId,
    players: [],
    status: 'waiting',
    createdAt: new Date(),
    config: getGameConfig(type)
  };
  
  io.emit('game-created', gameState.currentGame);
  return gameState.currentGame;
}

// Configuración de juegos
function getGameConfig(type) {
  const configs = {
    'quiz': {
      name: 'Quiz Rápido',
      duration: 60,
      maxPoints: 100,
      questions: [
        {
          question: "¿Cuál es la capital de Francia?",
          options: ["Madrid", "París", "Roma", "Londres"],
          correct: 1
        },
        {
          question: "¿Cuántos planetas hay en nuestro sistema solar?",
          options: ["7", "8", "9", "10"],
          correct: 1
        },
        {
          question: "¿Quién pintó la Mona Lisa?",
          options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Monet"],
          correct: 2
        }
      ]
    },
    'reflex': {
      name: 'Reflejos',
      duration: 30,
      maxPoints: 50,
      rounds: 5
    },
    'memory': {
      name: 'Memoria',
      duration: 45,
      maxPoints: 75,
      sequence: []
    }
  };
  
  return configs[type] || configs.quiz;
}

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);
  
  // Registro de jugador
  socket.on('register-player', (data) => {
    const { name, isAdmin } = data;
    
    if (isAdmin) {
      gameState.adminId = socket.id;
    }
    
    const player = {
      id: socket.id,
      name,
      score: 0,
      isAdmin,
      isOnline: true,
      gamesPlayed: 0,
      joinedAt: new Date()
    };
    
    gameState.players.set(socket.id, player);
    
    socket.emit('player-registered', player);
    io.emit('player-joined', player);
    
    updateRankings();
    updateUsersList();
    
    console.log(`Jugador registrado: ${name} (Admin: ${isAdmin})`);
  });
  
  // Crear juego (solo admin)
  socket.on('create-game', (data) => {
    const player = gameState.players.get(socket.id);
    
    if (!player || !player.isAdmin) {
      socket.emit('error', 'Solo el administrador puede crear juegos');
      return;
    }
    
    const game = createGame(data.type, socket.id);
    console.log(`Juego creado: ${game.type} por ${player.name}`);
  });
  
  // Unirse a juego
  socket.on('join-game', () => {
    const player = gameState.players.get(socket.id);
    
    if (!player || !gameState.currentGame) {
      socket.emit('error', 'No hay juego disponible');
      return;
    }
    
    if (gameState.currentGame.status !== 'waiting') {
      socket.emit('error', 'El juego ya comenzó');
      return;
    }
    
    if (!gameState.currentGame.players.includes(socket.id)) {
      gameState.currentGame.players.push(socket.id);
      socket.emit('game-joined', gameState.currentGame);
      io.emit('player-joined-game', { playerId: socket.id, playerName: player.name });
    }
  });
  
  // Iniciar juego (solo admin)
  socket.on('start-game', () => {
    const player = gameState.players.get(socket.id);
    
    if (!player || !player.isAdmin || !gameState.currentGame) {
      socket.emit('error', 'No se puede iniciar el juego');
      return;
    }
    
    gameState.currentGame.status = 'playing';
    gameState.currentGame.startedAt = new Date();
    
    io.emit('game-started', gameState.currentGame);
    console.log(`Juego iniciado: ${gameState.currentGame.type}`);
  });
  
  // Respuesta de juego
  socket.on('game-answer', (data) => {
    const player = gameState.players.get(socket.id);
    
    if (!player || !gameState.currentGame || gameState.currentGame.status !== 'playing') {
      return;
    }
    
    // Procesar respuesta según el tipo de juego
    let points = 0;
    
    if (data.type === 'quiz_final') {
      const { correctAnswers, totalQuestions } = data;
      points = correctAnswers * 25; // 25 puntos por respuesta correcta
    } else if (data.type === 'reflex') {
      const { reactionTime } = data;
      if (reactionTime < 200) points = 100;
      else if (reactionTime < 300) points = 75;
      else if (reactionTime < 400) points = 50;
      else points = 25;
    } else if (data.type === 'memory') {
      const { level, correct } = data;
      points = correct ? (level * 15) : 0; // 15 puntos por nivel
    }
    
    // Actualizar puntaje del jugador
    player.score += points;
    player.gamesPlayed++;
    
    socket.emit('points-awarded', { points, totalScore: player.score });
    
    updateRankings();
    
    console.log(`${player.name} ganó ${points} puntos. Total: ${player.score}`);
  });
  
  // Finalizar juego (solo admin)
  socket.on('end-game', () => {
    const player = gameState.players.get(socket.id);
    
    if (!player || !player.isAdmin || !gameState.currentGame) {
      return;
    }
    
    gameState.currentGame.status = 'finished';
    gameState.currentGame.endedAt = new Date();
    
    // Guardar en historial
    gameState.gameHistory.push({
      ...gameState.currentGame,
      finalRankings: [...gameState.rankings]
    });
    
    io.emit('game-ended', gameState.currentGame);
    
    // Limpiar juego actual después de 5 segundos
    setTimeout(() => {
      gameState.currentGame = null;
      io.emit('game-cleared');
    }, 5000);
    
    console.log(`Juego finalizado: ${gameState.currentGame.type}`);
  });
  
  // Mostrar ranking en TV (solo admin)
  socket.on('show-tv-ranking', () => {
    const player = gameState.players.get(socket.id);
    
    if (!player || !player.isAdmin) {
      socket.emit('error', 'Solo el administrador puede mostrar el ranking en TV');
      return;
    }
    
    io.emit('tv-ranking-show', gameState.rankings);
    console.log(`Ranking mostrado en TV por ${player.name}`);
  });

  // Solicitar lista de usuarios (para debugging)
  socket.on('request-users-list', () => {
    console.log(`📋 Usuario ${socket.id} solicita lista de usuarios`);
    const onlineUsers = Array.from(gameState.players.values()).filter(p => p.isOnline);
    socket.emit('users-list-updated', onlineUsers);
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);
    
    if (player) {
      player.isOnline = false;
      io.emit('player-disconnected', player);
      
      // Limpiar jugador del juego actual si estaba participando
      if (gameState.currentGame && gameState.currentGame.players.includes(socket.id)) {
        gameState.currentGame.players = gameState.currentGame.players.filter(id => id !== socket.id);
      }
      
      // Si era admin, limpiar estado
      if (player.isAdmin) {
        gameState.adminId = null;
        if (gameState.currentGame) {
          gameState.currentGame.status = 'cancelled';
          io.emit('game-cancelled');
        }
      }
      
      // Actualizar listas
      updateRankings();
      updateUsersList();
      
      // Eliminar completamente el jugador después de un tiempo más largo (GoDaddy)
      setTimeout(() => {
        if (gameState.players.has(socket.id) && !gameState.players.get(socket.id).isOnline) {
          gameState.players.delete(socket.id);
          console.log(`Jugador ${player.name} eliminado definitivamente`);
          updateRankings();
          updateUsersList();
        }
      }, 60000); // 60 segundos - dar más tiempo para reconexión
      
      console.log(`Usuario desconectado: ${player.name}`);
    }
  });
  
  // Enviar estado actual al conectarse
  const onlineUsers = Array.from(gameState.players.values()).filter(p => p.isOnline);
  socket.emit('current-state', {
    rankings: gameState.rankings,
    currentGame: gameState.currentGame,
    playersOnline: onlineUsers.length
  });
  
  console.log(`🔌 Nueva conexión ${socket.id}, enviando estado actual`);
  
  // Enviar lista actual de usuarios específicamente a este socket
  socket.emit('users-list-updated', onlineUsers);
  
  // También enviar la lista general actualizada
  updateUsersList();
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`WebSocket servidor listo para conexiones`);
}); 