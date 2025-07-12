import { Server as SocketIOServer, Socket } from 'socket.io';
import RoomManager from '../services/RoomManager';
import { JoinRoomRequest, SocketEvents, SubmitAnswerRequest, GameState } from '../types/game';

export function setupSocketHandlers(io: SocketIOServer, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Evento: Unirse a una sala
    socket.on('join-room', (data: JoinRoomRequest) => {
      try {
        const { roomCode, playerName, isSpectator = false, isTV = false } = data;
        
        console.log(`👤 ${playerName} intentando unirse a sala ${roomCode}`);

        // Verificar si la sala existe
        const room = roomManager.getRoomByCode(roomCode);
        if (!room) {
          socket.emit('room-not-found');
          return;
        }

        // Verificar si la sala está llena
        if (room.currentPlayers >= room.maxPlayers) {
          socket.emit('room-full');
          return;
        }

        // Añadir jugador a la sala
        const result = roomManager.addPlayerToRoom(roomCode, playerName, socket.id, isSpectator, isTV);
        if (!result) {
          socket.emit('error', 'No se pudo unir a la sala');
          return;
        }

        const { room: updatedRoom, player } = result;

        // Unir el socket a la sala
        socket.join(roomCode);

        // Confirmar al jugador que se unió
        socket.emit('room-joined', updatedRoom, player);

        // Notificar a otros jugadores en la sala
        socket.to(roomCode).emit('player-joined', player);
        socket.to(roomCode).emit('room-updated', updatedRoom);

        console.log(`✅ ${playerName} se unió a sala ${roomCode}`);
      } catch (error) {
        console.error('Error al unirse a sala:', error);
        socket.emit('error', 'Error al unirse a la sala');
      }
    });

    // Evento: Salir de una sala
    socket.on('leave-room', () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;
        const roomCode = room.code;

        // Remover jugador de la sala
        const result = roomManager.removePlayerFromRoom(player.id);
        
        // Salir del socket room
        socket.leave(roomCode);

        // Confirmar al jugador que salió
        socket.emit('room-left');

        // Si la sala sigue existiendo, notificar a otros jugadores
        if (result.room) {
          socket.to(roomCode).emit('player-left', player.id);
          socket.to(roomCode).emit('room-updated', result.room);
        }

        console.log(`👋 ${player.name} salió de sala ${roomCode}`);
      } catch (error) {
        console.error('Error al salir de sala:', error);
        socket.emit('error', 'Error al salir de la sala');
      }
    });

    // Evento: Iniciar juego
    socket.on('start-game', () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;

        // Solo el host puede iniciar el juego
        if (!player.isHost) {
          socket.emit('error', 'Solo el host puede iniciar el juego');
          return;
        }

        // Verificar que hay al menos 2 jugadores
        if (room.currentPlayers < 2) {
          socket.emit('error', 'Se necesitan al menos 2 jugadores para iniciar');
          return;
        }

        // Iniciar el juego
        const success = roomManager.startGame(room.id);
        if (!success) {
          socket.emit('error', 'No se pudo iniciar el juego');
          return;
        }

        // Notificar a todos los jugadores en la sala
        io.to(room.code).emit('game-started', room);

        console.log(`🎮 Juego iniciado en sala ${room.code}`);
      } catch (error) {
        console.error('Error al iniciar juego:', error);
        socket.emit('error', 'Error al iniciar el juego');
      }
    });

    // Evento: Jugador listo
    socket.on('player-ready-status', () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;

        // Aquí podrías implementar lógica de "ready state"
        // Por ahora solo notificamos a otros jugadores
        socket.to(room.code).emit('player-ready', player.id);

        console.log(`✅ ${player.name} está listo en sala ${room.code}`);
      } catch (error) {
        console.error('Error al marcar jugador como listo:', error);
      }
    });

    // Evento: Jugador no listo
    socket.on('player-not-ready-status', () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;

        // Notificar a otros jugadores
        socket.to(room.code).emit('player-not-ready', player.id);

        console.log(`❌ ${player.name} no está listo en sala ${room.code}`);
      } catch (error) {
        console.error('Error al marcar jugador como no listo:', error);
      }
    });

    // Evento: Desconexión
    socket.on('disconnect', () => {
      try {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);

        // Marcar jugador como offline
        const result = roomManager.setPlayerOffline(socket.id);
        if (result.room && result.player) {
          // Notificar a otros jugadores en la sala
          socket.to(result.room.code).emit('player-left', result.player.id);
          socket.to(result.room.code).emit('room-updated', result.room);
          
          console.log(`👋 ${result.player.name} se desconectó de sala ${result.room.code}`);
        }
      } catch (error) {
        console.error('Error al manejar desconexión:', error);
      }
    });

    // Evento: Ping/Pong para mantener conexión
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // ===== EVENTOS DE TRIVIA =====

    // Evento: Iniciar trivia
    socket.on('start-trivia', async () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;

        // Solo el host puede iniciar la trivia
        if (!player.isHost) {
          socket.emit('error', 'Solo el host puede iniciar la trivia');
          return;
        }

        // Verificar que hay jugadores activos
        const activePlayers = room.players.filter(p => p.isOnline && !p.isSpectator && !p.isTV);
        if (activePlayers.length < 1) {
          socket.emit('error', 'Se necesita al menos 1 jugador para iniciar la trivia');
          return;
        }

        // Iniciar la trivia
        const result = await roomManager.startTrivia(room.id);
        if (!result) {
          socket.emit('error', 'No se pudo iniciar la trivia');
          return;
        }

        const { room: updatedRoom, firstQuestion } = result;

        // Notificar a todos los jugadores que la trivia comenzó
        io.to(room.code).emit('trivia-started', updatedRoom);

        // Enviar la primera pregunta
        io.to(room.code).emit('question-sent', firstQuestion, firstQuestion.timeLimit);

        console.log(`🎯 Trivia iniciada en sala ${room.code} por ${player.name}`);
      } catch (error) {
        console.error('Error al iniciar trivia:', error);
        socket.emit('error', 'Error al iniciar la trivia');
      }
    });

    // Evento: Enviar respuesta
    socket.on('submit-answer', (data: SubmitAnswerRequest) => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;

        // Verificar que el jugador puede responder
        if (player.isSpectator || player.isTV) {
          return;
        }

        // Procesar la respuesta
        const result = roomManager.submitAnswer(room.id, player.id, data);
        if (!result) {
          socket.emit('error', 'No se pudo procesar la respuesta');
          return;
        }

        const { room: updatedRoom, isCorrect, score } = result;

        // Notificar al jugador sobre su respuesta
        socket.emit('answer-received', player.id, isCorrect, data.timeUsed);

        // Notificar a otros jugadores que este jugador ya respondió
        socket.to(room.code).emit('player-answered', player.id);

        // Verificar si todos los jugadores han respondido
        if (roomManager.allPlayersAnswered(room.id)) {
          // Esperar un poco antes de mostrar resultados
          setTimeout(() => {
            handleQuestionEnd(room.code, room.id);
          }, 1000);
        }

        console.log(`📝 ${player.name} respondió en sala ${room.code}: ${isCorrect ? 'Correcto' : 'Incorrecto'} (+${score} puntos)`);
      } catch (error) {
        console.error('Error al procesar respuesta:', error);
        socket.emit('error', 'Error al procesar la respuesta');
      }
    });

    // Evento: Siguiente pregunta (solo host)
    socket.on('next-question', () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room, player } = playerData;

        // Solo el host puede avanzar manualmente
        if (!player.isHost) {
          socket.emit('error', 'Solo el host puede avanzar a la siguiente pregunta');
          return;
        }

        handleQuestionEnd(room.code, room.id);
      } catch (error) {
        console.error('Error al avanzar pregunta:', error);
        socket.emit('error', 'Error al avanzar a la siguiente pregunta');
      }
    });

    // Función auxiliar para manejar el final de una pregunta
    function handleQuestionEnd(roomCode: string, roomId: string) {
      try {
        const room = roomManager.getRoomById(roomId);
        if (!room || !room.currentQuestion) return;

        const correctAnswer = room.currentQuestion.correctAnswer;
        const currentRanking = roomManager.getRanking(roomId);

        // Notificar el final de la pregunta con respuesta correcta y ranking
        io.to(roomCode).emit('question-ended', correctAnswer, currentRanking || []);

        // Avanzar a la siguiente pregunta después de mostrar resultados
        setTimeout(() => {
          const nextResult = roomManager.nextQuestion(roomId);
          if (!nextResult) return;

          const { room: updatedRoom, nextQuestion, triviaEnded } = nextResult;

          if (triviaEnded) {
            // Trivia terminada
            const winnerData = roomManager.getTriviaWinner(roomId);
            if (winnerData) {
              io.to(roomCode).emit('trivia-ended', winnerData.finalScores, winnerData.winner);
            }
            console.log(`🏁 Trivia terminada en sala ${roomCode}`);
          } else if (nextQuestion) {
            // Siguiente pregunta
            io.to(roomCode).emit('question-sent', nextQuestion, nextQuestion.timeLimit);
            console.log(`➡️ Siguiente pregunta enviada en sala ${roomCode}`);
          }
        }, 3000); // 3 segundos para mostrar resultados
      } catch (error) {
        console.error('Error al manejar final de pregunta:', error);
      }
    }

    // Auto-avanzar pregunta por tiempo límite
    socket.on('question-timeout', () => {
      try {
        const playerData = roomManager.getPlayerBySocketId(socket.id);
        if (!playerData) return;

        const { room } = playerData;

        // Solo procesar si es el host quien reporta el timeout
        if (room.gameState === GameState.QUESTION_ACTIVE) {
          handleQuestionEnd(room.code, room.id);
        }
      } catch (error) {
        console.error('Error al manejar timeout de pregunta:', error);
      }
    });
  });

  // Cada 30 segundos, limpiar salas inactivas
  setInterval(() => {
    roomManager.cleanInactiveRooms();
  }, 30000);
} 