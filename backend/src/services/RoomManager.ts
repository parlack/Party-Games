import { Room, Player, GameSettings, GameState, TriviaQuestion, PlayerScore, SubmitAnswerRequest } from '../types/game';
import { TriviaService } from './TriviaService';

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomId
  private roomCodes: Map<string, string> = new Map(); // roomCode -> roomId
  private triviaQuestions: Map<string, TriviaQuestion[]> = new Map(); // roomId -> questions
  private playerAnswers: Map<string, Map<string, SubmitAnswerRequest>> = new Map(); // roomId -> playerId -> answer

  /**
   * Crea una nueva sala
   */
  createRoom(settings: GameSettings): Room {
    const roomId = this.generateId();
    const roomCode = this.generateRoomCode();
    
    // Crear el jugador host
    const hostPlayer: Player = {
      id: this.generateId(),
      name: settings.hostName,
      isHost: true,
      isSpectator: false,
      joinedAt: new Date(),
      socketId: '', // Se asignará cuando se conecte
      isOnline: false
    };

    const room: Room = {
      id: roomId,
      name: settings.name,
      code: roomCode,
      maxPlayers: settings.maxPlayers,
      currentPlayers: 0, // Host no está online hasta que se conecte
      minigameCount: settings.minigameCount,
      isRandomGames: settings.isRandomGames,
      isActive: false,
      players: [hostPlayer],
      host: hostPlayer,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomId, room);
    this.roomCodes.set(roomCode, roomId);
    this.playerRooms.set(hostPlayer.id, roomId);

    return room;
  }

  /**
   * Obtiene una sala por su código
   */
  getRoomByCode(roomCode: string): Room | null {
    const roomId = this.roomCodes.get(roomCode);
    if (!roomId) return null;
    
    return this.rooms.get(roomId) || null;
  }

  /**
   * Obtiene una sala por su ID
   */
  getRoomById(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Obtiene todas las salas
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Obtiene salas activas (con al menos un jugador online)
   */
  getActiveRooms(): Room[] {
    return this.getAllRooms().filter(room => 
      room.players.some(player => player.isOnline)
    );
  }

  /**
   * Añade un jugador a una sala
   */
  addPlayerToRoom(roomCode: string, playerName: string, socketId: string, isSpectator: boolean = false, isTV: boolean = false): { room: Room; player: Player } | null {
    const room = this.getRoomByCode(roomCode);
    if (!room) return null;

    // Verificar si ya existe un host offline con el mismo nombre (caso de creador de sala)
    const existingHost = room.players.find(p => 
      p.isHost && 
      p.name === playerName && 
      !p.isOnline && 
      !p.socketId
    );

    if (existingHost) {
      // Actualizar el host existente con el socketId
      existingHost.socketId = socketId;
      existingHost.isOnline = true;
      existingHost.joinedAt = new Date();
      existingHost.isTV = isTV; // Actualizar el campo isTV también
      room.lastActivity = new Date();

      // Actualizar el currentPlayers basado en jugadores online
      room.currentPlayers = room.players.filter(p => p.isOnline).length;

      // Asegurarse de que el host en la sala sea el mismo objeto
      room.host = existingHost;

      this.playerRooms.set(existingHost.id, room.id);

      console.log(`🔄 Host ${playerName} se conectó a su sala ${roomCode} (isTV: ${isTV})`);
      return { room, player: existingHost };
    }

    // Verificar si la sala está llena (no contar jugadores offline)
    const onlinePlayers = room.players.filter(p => p.isOnline).length;
    if (onlinePlayers >= room.maxPlayers) {
      return null;
    }

    const player: Player = {
      id: this.generateId(),
      name: playerName,
      isHost: false,
      isSpectator,
      isTV,
      joinedAt: new Date(),
      socketId,
      isOnline: true
    };

    room.players.push(player);
    // Solo incrementar currentPlayers si es un jugador realmente nuevo
    room.currentPlayers = room.players.filter(p => p.isOnline).length;
    room.lastActivity = new Date();

    this.playerRooms.set(player.id, room.id);

    return { room, player };
  }

  /**
   * Remueve un jugador de una sala
   */
  removePlayerFromRoom(playerId: string): { room: Room | null; wasHost: boolean } {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return { room: null, wasHost: false };

    const room = this.rooms.get(roomId);
    if (!room) return { room: null, wasHost: false };

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return { room: null, wasHost: false };

    const player = room.players[playerIndex];
    const wasHost = player.isHost;

    room.players.splice(playerIndex, 1);
    // Actualizar currentPlayers basado en jugadores online
    room.currentPlayers = room.players.filter(p => p.isOnline).length;
    room.lastActivity = new Date();

    this.playerRooms.delete(playerId);

    // Si el host se va y hay otros jugadores, asignar nuevo host
    if (wasHost && room.players.length > 0) {
      const newHost = room.players[0];
      newHost.isHost = true;
      room.host = newHost;
    }

    // Si no quedan jugadores, eliminar la sala
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      this.roomCodes.delete(room.code);
      return { room: null, wasHost };
    }

    return { room, wasHost };
  }

  /**
   * Actualiza el socketId de un jugador
   */
  updatePlayerSocket(playerId: string, socketId: string): void {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.socketId = socketId;
      player.isOnline = true;
      room.lastActivity = new Date();
    }
  }

  /**
   * Marca un jugador como desconectado
   */
  setPlayerOffline(socketId: string): { room: Room | null; player: Player | null } {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isOnline = false;
        room.lastActivity = new Date();
        return { room, player };
      }
    }
    return { room: null, player: null };
  }

  /**
   * Obtiene un jugador por su socketId
   */
  getPlayerBySocketId(socketId: string): { room: Room; player: Player } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  /**
   * Inicia un juego en una sala
   */
  startGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.isActive = true;
    room.lastActivity = new Date();
    return true;
  }

  /**
   * Limpia salas inactivas (sin jugadores online por más de 1 hora)
   */
  cleanInactiveRooms(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [roomId, room] of this.rooms.entries()) {
      const hasOnlinePlayers = room.players.some(p => p.isOnline);
      
      if (!hasOnlinePlayers && room.lastActivity < oneHourAgo) {
        // Limpiar referencias
        this.roomCodes.delete(room.code);
        for (const player of room.players) {
          this.playerRooms.delete(player.id);
        }
        this.rooms.delete(roomId);
      }
    }
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Genera un código de sala único
   */
  private generateRoomCode(): string {
    let code: string;
    do {
      code = Math.random().toString(36).substr(2, 6).toUpperCase();
    } while (this.roomCodes.has(code));
    
    return code;
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getStats() {
    const totalRooms = this.rooms.size;
    const activeRooms = this.getActiveRooms().length;
    const totalPlayers = Array.from(this.rooms.values()).reduce((sum, room) => sum + room.players.length, 0);
    const onlinePlayers = Array.from(this.rooms.values()).reduce((sum, room) => 
      sum + room.players.filter(p => p.isOnline).length, 0
    );

    return {
      totalRooms,
      activeRooms,
      totalPlayers,
      onlinePlayers
    };
  }

  // ===== MÉTODOS DE TRIVIA =====

  /**
   * Inicia una trivia en una sala
   */
  async startTrivia(roomId: string): Promise<{ room: Room; firstQuestion: TriviaQuestion } | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Verificar que la sala no esté ya en modo trivia
    if (room.gameState === GameState.TRIVIA_ACTIVE || room.gameState === GameState.QUESTION_ACTIVE) {
      return null;
    }

    try {
      // Obtener preguntas de trivia
      const questions = await TriviaService.getQuestions(room.minigameCount);
      this.triviaQuestions.set(roomId, questions);

      // Inicializar scores de jugadores
      const playerScores: PlayerScore[] = room.players
        .filter(p => p.isOnline && !p.isSpectator && !p.isTV)
        .map(p => ({
          playerId: p.id,
          playerName: p.name,
          score: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          averageTime: 0
        }));

      // Actualizar estado de la sala
      room.gameState = GameState.TRIVIA_ACTIVE;
      room.scores = playerScores;
      room.lastActivity = new Date();

      // Inicializar el mapa de respuestas para esta sala
      this.playerAnswers.set(roomId, new Map());

      // Enviar la primera pregunta
      const firstQuestion = questions[0];
      room.currentQuestion = firstQuestion;
      room.questionStartTime = new Date();
      room.gameState = GameState.QUESTION_ACTIVE;

      console.log(`🎯 Trivia iniciada en sala ${room.code} con ${questions.length} preguntas`);
      return { room, firstQuestion };
    } catch (error) {
      console.error('❌ Error iniciando trivia:', error);
      return null;
    }
  }

  /**
   * Procesa la respuesta de un jugador
   */
  submitAnswer(roomId: string, playerId: string, answer: SubmitAnswerRequest): { room: Room; isCorrect: boolean; score: number } | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentQuestion || room.gameState !== GameState.QUESTION_ACTIVE) {
      return null;
    }

    // Verificar que la pregunta coincida
    if (answer.questionId !== room.currentQuestion.id) {
      return null;
    }

    // Verificar que el jugador no haya respondido ya
    const roomAnswers = this.playerAnswers.get(roomId);
    if (!roomAnswers || roomAnswers.has(playerId)) {
      return null;
    }

    // Registrar la respuesta
    roomAnswers.set(playerId, answer);

    // Verificar si la respuesta es correcta
    const isCorrect = answer.selectedAnswer === room.currentQuestion.correctAnswer;
    
    // Calcular puntaje
    const score = TriviaService.calculateScore(isCorrect, answer.timeUsed, room.currentQuestion.timeLimit);

    // Actualizar score del jugador
    const playerScore = room.scores?.find(s => s.playerId === playerId);
    if (playerScore) {
      playerScore.score += score;
      playerScore.totalAnswers++;
      if (isCorrect) {
        playerScore.correctAnswers++;
      }
      playerScore.lastAnswerTime = answer.timeUsed;
      
      // Actualizar tiempo promedio
      const totalTime = (playerScore.averageTime * (playerScore.totalAnswers - 1)) + answer.timeUsed;
      playerScore.averageTime = totalTime / playerScore.totalAnswers;
    }

    room.lastActivity = new Date();

    console.log(`📝 ${playerId} respondió ${isCorrect ? 'correctamente' : 'incorrectamente'} - Puntaje: ${score}`);
    return { room, isCorrect, score };
  }

  /**
   * Finaliza la pregunta actual y pasa a la siguiente
   */
  nextQuestion(roomId: string): { room: Room; nextQuestion: TriviaQuestion | null; triviaEnded: boolean } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== GameState.QUESTION_ACTIVE) {
      return null;
    }

    const questions = this.triviaQuestions.get(roomId);
    if (!questions || !room.currentQuestion) {
      return null;
    }

    // Marcar pregunta como terminada
    room.gameState = GameState.QUESTION_ENDED;

    // Encontrar el índice de la pregunta actual
    const currentQuestionIndex = questions.findIndex(q => q.id === room.currentQuestion!.id);
    const nextQuestionIndex = currentQuestionIndex + 1;

    // Verificar si hay más preguntas
    if (nextQuestionIndex >= questions.length) {
      // Trivia terminada
      room.gameState = GameState.TRIVIA_ENDED;
      room.currentQuestion = undefined;
      room.questionStartTime = undefined;
      
      // Limpiar datos de trivia
      this.triviaQuestions.delete(roomId);
      this.playerAnswers.delete(roomId);

      console.log(`🏁 Trivia terminada en sala ${room.code}`);
      return { room, nextQuestion: null, triviaEnded: true };
    }

    // Preparar siguiente pregunta
    const nextQuestion = questions[nextQuestionIndex];
    room.currentQuestion = nextQuestion;
    room.questionStartTime = new Date();
    room.gameState = GameState.QUESTION_ACTIVE;

    // Limpiar respuestas de la pregunta anterior
    this.playerAnswers.set(roomId, new Map());

    console.log(`➡️ Siguiente pregunta en sala ${room.code}: ${nextQuestionIndex + 1}/${questions.length}`);
    return { room, nextQuestion, triviaEnded: false };
  }

  /**
   * Obtiene el ranking actual de una sala
   */
  getRanking(roomId: string): PlayerScore[] | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.scores) return null;

    // Ordenar por puntaje descendente, luego por tiempo promedio ascendente
    return [...room.scores].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.averageTime - b.averageTime;
    });
  }

  /**
   * Obtiene las respuestas de todos los jugadores para la pregunta actual
   */
  getCurrentQuestionAnswers(roomId: string): Map<string, SubmitAnswerRequest> | null {
    return this.playerAnswers.get(roomId) || null;
  }

  /**
   * Verifica si todos los jugadores han respondido la pregunta actual
   */
  allPlayersAnswered(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !room.scores) return false;

    const roomAnswers = this.playerAnswers.get(roomId);
    if (!roomAnswers) return false;

    const activePlayers = room.scores.length;
    const answeredPlayers = roomAnswers.size;

    return answeredPlayers >= activePlayers;
  }

  /**
   * Obtiene el ganador de la trivia
   */
  getTriviaWinner(roomId: string): { winner: Player; finalScores: PlayerScore[] } | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.scores) return null;

    const finalScores = this.getRanking(roomId);
    if (!finalScores || finalScores.length === 0) return null;

    const winnerScore = finalScores[0];
    const winner = room.players.find(p => p.id === winnerScore.playerId);
    
    if (!winner) return null;

    return { winner, finalScores };
  }

  /**
   * Reinicia el estado de trivia de una sala
   */
  resetTriviaState(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = GameState.WAITING;
    room.currentQuestion = undefined;
    room.questionStartTime = undefined;
    room.scores = undefined;
    
    this.triviaQuestions.delete(roomId);
    this.playerAnswers.delete(roomId);

    console.log(`🔄 Estado de trivia reiniciado en sala ${room.code}`);
  }
}

export default RoomManager; 