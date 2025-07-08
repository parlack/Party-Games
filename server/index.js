const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Estado del juego
let gameState = {
  players: new Map(),
  rankings: [],
  currentGame: null,
  adminId: null,
  gameHistory: []
};

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Rutas API
app.get('/api/rankings', (req, res) => {
  res.json(gameState.rankings);
});

app.get('/api/players', (req, res) => {
  res.json(Array.from(gameState.players.values()));
});

// Función para actualizar rankings
function updateRankings() {
  gameState.rankings = Array.from(gameState.players.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  io.emit('rankings-updated', gameState.rankings);
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
  
  // Desconexión
  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);
    
    if (player) {
      player.isOnline = false;
      io.emit('player-disconnected', player);
      
      // Si era admin, limpiar estado
      if (player.isAdmin) {
        gameState.adminId = null;
        if (gameState.currentGame) {
          gameState.currentGame.status = 'cancelled';
          io.emit('game-cancelled');
        }
      }
      
      console.log(`Usuario desconectado: ${player.name}`);
    }
  });
  
  // Enviar estado actual al conectarse
  socket.emit('current-state', {
    rankings: gameState.rankings,
    currentGame: gameState.currentGame,
    playersOnline: Array.from(gameState.players.values()).filter(p => p.isOnline).length
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`WebSocket servidor listo para conexiones`);
}); 