import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, Room, Player, TriviaState, TriviaQuestion, PlayerScore, SubmitAnswerRequest } from '../types/game';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import type { Room as BackendRoom, Player as BackendPlayer } from '../services/apiService';

interface GameContextType {
  state: AppState;
  joinRoom: (code: string, playerName: string, isSpectator?: boolean, isTV?: boolean) => Promise<void>;
  createRoom: (settings: any) => Promise<void>;
  leaveRoom: () => void;
  startGame: () => void;
  startTrivia: () => void;
  submitAnswer: (answer: string, timeUsed: number) => void;
  nextQuestion: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
  getRoomByCode: (code: string) => Room | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ROOM'; payload: Room | null }
  | { type: 'SET_PLAYER'; payload: Player | null }
  | { type: 'SET_LANGUAGE'; payload: 'es' | 'en' }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'PLAYER_JOINED'; payload: Player }
  | { type: 'PLAYER_LEFT'; payload: string }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_TRIVIA_STATE'; payload: TriviaState }
  | { type: 'UPDATE_TRIVIA_STATE'; payload: Partial<TriviaState> }
  | { type: 'SET_CURRENT_QUESTION'; payload: TriviaQuestion | null }
  | { type: 'SET_SCORES'; payload: PlayerScore[] }
  | { type: 'UPDATE_SCORE'; payload: PlayerScore }
  | { type: 'SET_PLAYER_ANSWER'; payload: { playerId: string; answer: string; timeUsed: number } }
  | { type: 'CLEAR_TRIVIA_STATE' };

const initialState: AppState = {
  currentRoom: null,
  currentPlayer: null,
  isLoading: false,
  error: null,
  language: 'es',
  rooms: [],
  triviaState: null,
};

// Funciones de conversión entre tipos frontend y backend
const convertBackendRoomToFrontend = (backendRoom: BackendRoom): Room => {
  return {
    ...backendRoom,
    createdAt: new Date(backendRoom.createdAt),
    players: backendRoom.players.map(convertBackendPlayerToFrontend),
    host: convertBackendPlayerToFrontend(backendRoom.host),
  };
};

const convertBackendPlayerToFrontend = (backendPlayer: BackendPlayer): Player => {
  return {
    ...backendPlayer,
    joinedAt: new Date(backendPlayer.joinedAt),
  };
};

function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'UPDATE_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'PLAYER_JOINED':
      if (!state.currentRoom) return state;
      const updatedRoom = {
        ...state.currentRoom,
        players: [...state.currentRoom.players, action.payload],
        currentPlayers: state.currentRoom.currentPlayers + 1,
      };
      return { ...state, currentRoom: updatedRoom };
    case 'PLAYER_LEFT':
      if (!state.currentRoom) return state;
      const roomAfterLeave = {
        ...state.currentRoom,
        players: state.currentRoom.players.filter(p => p.id !== action.payload),
        currentPlayers: state.currentRoom.currentPlayers - 1,
      };
      return { ...state, currentRoom: roomAfterLeave };
    case 'SET_CONNECTED':
      return state; // Podríamos añadir un campo isConnected al estado si es necesario
    case 'SET_TRIVIA_STATE':
      return { ...state, triviaState: action.payload };
    case 'UPDATE_TRIVIA_STATE':
      return { 
        ...state, 
        triviaState: state.triviaState ? { ...state.triviaState, ...action.payload } : null 
      };
    case 'SET_CURRENT_QUESTION':
      return { 
        ...state, 
        triviaState: state.triviaState ? { ...state.triviaState, currentQuestion: action.payload } : null 
      };
    case 'SET_SCORES':
      return { 
        ...state, 
        triviaState: state.triviaState ? { ...state.triviaState, scores: action.payload } : null 
      };
    case 'UPDATE_SCORE':
      if (!state.triviaState) return state;
      const updatedScores = state.triviaState.scores.map(score => 
        score.playerId === action.payload.playerId ? action.payload : score
      );
      return { 
        ...state, 
        triviaState: { ...state.triviaState, scores: updatedScores } 
      };
    case 'SET_PLAYER_ANSWER':
      if (!state.triviaState) return state;
      const updatedAnswers = { ...state.triviaState.playerAnswers };
      updatedAnswers[action.payload.playerId] = {
        answer: action.payload.answer,
        timeUsed: action.payload.timeUsed,
        timestamp: Date.now()
      };
      return { 
        ...state, 
        triviaState: { ...state.triviaState, playerAnswers: updatedAnswers } 
      };
    case 'CLEAR_TRIVIA_STATE':
      return { ...state, triviaState: null };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Inicializar conexión WebSocket
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        console.log('✅ WebSocket conectado');
        
        // Configurar listeners de eventos
        setupSocketListeners();
      } catch (error) {
        console.error('❌ Error conectando WebSocket:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Error de conexión al servidor' });
      }
    };

    initializeSocket();

    // Cleanup al desmontar
    return () => {
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    // Eventos de sala
    socketService.on('room-joined', (room: BackendRoom, player: BackendPlayer) => {
      const frontendRoom = convertBackendRoomToFrontend(room);
      const frontendPlayer = convertBackendPlayerToFrontend(player);
      
      dispatch({ type: 'SET_ROOM', payload: frontendRoom });
      dispatch({ type: 'SET_PLAYER', payload: frontendPlayer });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('✅ Unido a la sala:', frontendRoom.code);
      console.log('🎯 DEBUG - Datos del jugador:', {
        name: frontendPlayer.name,
        isHost: frontendPlayer.isHost,
        isTV: frontendPlayer.isTV,
        id: frontendPlayer.id
      });
      console.log('🎯 DEBUG - Datos de la sala:', {
        code: frontendRoom.code,
        host: frontendRoom.host.name,
        hostIsTV: frontendRoom.host.isTV,
        hostId: frontendRoom.host.id
      });
    });

    socketService.on('room-left', () => {
      dispatch({ type: 'SET_ROOM', payload: null });
      dispatch({ type: 'SET_PLAYER', payload: null });
      dispatch({ type: 'CLEAR_TRIVIA_STATE' });
      console.log('👋 Saliste de la sala');
    });

    socketService.on('player-joined', (player: BackendPlayer) => {
      const frontendPlayer = convertBackendPlayerToFrontend(player);
      dispatch({ type: 'PLAYER_JOINED', payload: frontendPlayer });
      console.log('👤 Jugador se unió:', frontendPlayer.name);
    });

    socketService.on('player-left', (playerId: string) => {
      dispatch({ type: 'PLAYER_LEFT', payload: playerId });
      console.log('👋 Jugador salió:', playerId);
    });

    socketService.on('room-updated', (room: BackendRoom) => {
      const frontendRoom = convertBackendRoomToFrontend(room);
      dispatch({ type: 'UPDATE_ROOM', payload: frontendRoom });
    });

    socketService.on('game-started', (room: BackendRoom) => {
      const frontendRoom = convertBackendRoomToFrontend(room);
      dispatch({ type: 'UPDATE_ROOM', payload: frontendRoom });
      console.log('🎮 ¡Juego iniciado!');
    });

    // Eventos de trivia
    socketService.on('trivia-started', (data: { questions: TriviaQuestion[], scores: PlayerScore[] }) => {
      console.log('🎯 ¡Trivia iniciada!', data);
      const triviaState: TriviaState = {
        isActive: true,
        questions: data.questions,
        currentQuestionIndex: 0,
        currentQuestion: data.questions[0] || null,
        scores: data.scores,
        playerAnswers: {},
        questionStartTime: Date.now(),
        timeLimit: 30000, // 30 segundos por defecto
      };
      dispatch({ type: 'SET_TRIVIA_STATE', payload: triviaState });
    });

    socketService.on('question-sent', (data: { question: TriviaQuestion, questionIndex: number, timeLimit: number }) => {
      console.log('❓ Nueva pregunta:', data.question.question);
      dispatch({ type: 'UPDATE_TRIVIA_STATE', payload: {
        currentQuestion: data.question,
        currentQuestionIndex: data.questionIndex,
        questionStartTime: Date.now(),
        timeLimit: data.timeLimit,
        playerAnswers: {} // Limpiar respuestas anteriores
      }});
    });

    socketService.on('answer-received', (data: { playerId: string, playerName: string, isCorrect: boolean, timeUsed: number }) => {
      console.log(`📝 Respuesta recibida de ${data.playerName}:`, data.isCorrect ? '✅' : '❌');
      // Actualizar que el jugador ya respondió
      dispatch({ type: 'SET_PLAYER_ANSWER', payload: {
        playerId: data.playerId,
        answer: data.isCorrect ? 'correct' : 'incorrect',
        timeUsed: data.timeUsed
      }});
    });

    socketService.on('question-ended', (data: { correctAnswer: string, scores: PlayerScore[], nextQuestionIn?: number }) => {
      console.log('⏰ Pregunta terminada. Respuesta correcta:', data.correctAnswer);
      dispatch({ type: 'SET_SCORES', payload: data.scores });
      
      // Si hay siguiente pregunta, mostrar countdown
      if (data.nextQuestionIn) {
        dispatch({ type: 'UPDATE_TRIVIA_STATE', payload: {
          showResults: true,
          nextQuestionCountdown: data.nextQuestionIn
        }});
      }
    });

    socketService.on('trivia-ended', (data: { finalScores: PlayerScore[], winner: PlayerScore }) => {
      console.log('🏆 ¡Trivia terminada! Ganador:', data.winner.playerName);
      dispatch({ type: 'UPDATE_TRIVIA_STATE', payload: {
        isActive: false,
        isCompleted: true,
        finalScores: data.finalScores,
        winner: data.winner,
        showResults: true
      }});
    });

    // Eventos de error
    socketService.on('error', (message: string) => {
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    socketService.on('room-not-found', () => {
      dispatch({ type: 'SET_ERROR', payload: 'Sala no encontrada' });
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    socketService.on('room-full', () => {
      dispatch({ type: 'SET_ERROR', payload: 'La sala está llena' });
      dispatch({ type: 'SET_LOADING', payload: false });
    });
  };

  const getRoomByCode = (code: string): Room | null => {
    // En la nueva implementación, no mantenemos un cache local
    // Se podría implementar si es necesario
    return null;
  };

  const joinRoom = async (code: string, playerName: string, isSpectator = false, isTV = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Primero verificar que la sala existe
      const roomResponse = await apiService.getRoomByCode(code);
      if (!roomResponse.success) {
        dispatch({ type: 'SET_ERROR', payload: 'Sala no encontrada' });
        return;
      }

      // Unirse via WebSocket
      socketService.joinRoom({
        roomCode: code.toUpperCase(),
        playerName,
        isSpectator,
        isTV
      });

      // El estado se actualizará cuando llegue el evento 'room-joined'
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al unirse a la sala' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createRoom = async (settings: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Crear sala via API
      const response = await apiService.createRoom({
        name: settings.name,
        hostName: settings.hostName || 'Host',
        maxPlayers: settings.maxPlayers,
        minigameCount: settings.minigameCount,
        isRandomGames: settings.isRandomGames,
        selectedGames: settings.selectedGames
      });

      if (!response.success || !response.data) {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Error al crear la sala' });
        return;
      }

      // Unirse a la sala recién creada via WebSocket
      socketService.joinRoom({
        roomCode: response.data.code,
        playerName: settings.hostName || 'Host',
        isSpectator: false,
        isTV: settings.isTV || false
      });

      console.log('🏠 Sala creada:', response.data.code);
    } catch (error) {
      console.error('Error al crear sala:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear la sala' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const leaveRoom = () => {
    if (state.currentRoom) {
      socketService.leaveRoom();
      dispatch({ type: 'CLEAR_TRIVIA_STATE' });
    }
  };

  const startGame = () => {
    if (state.currentPlayer?.isHost) {
      socketService.startGame();
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Solo el host puede iniciar el juego' });
    }
  };

  const startTrivia = () => {
    if (state.currentPlayer?.isHost) {
      console.log('🎯 Iniciando trivia...');
      socketService.startTrivia();
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Solo el host puede iniciar la trivia' });
    }
  };

  const submitAnswer = (answer: string, timeUsed: number) => {
    if (!state.currentPlayer || !state.triviaState?.currentQuestion) {
      dispatch({ type: 'SET_ERROR', payload: 'No hay pregunta activa' });
      return;
    }

    console.log('📝 Enviando respuesta:', answer, 'Tiempo usado:', timeUsed);
    
    const answerData: SubmitAnswerRequest = {
      playerId: state.currentPlayer.id,
      questionIndex: state.triviaState.currentQuestionIndex,
      selectedAnswer: answer,
      timeUsed
    };

    socketService.submitAnswer(answerData);

    // Marcar localmente que el jugador ya respondió
    dispatch({ type: 'SET_PLAYER_ANSWER', payload: {
      playerId: state.currentPlayer.id,
      answer,
      timeUsed
    }});
  };

  const nextQuestion = () => {
    if (state.currentPlayer?.isHost) {
      console.log('⏭️ Avanzando a siguiente pregunta...');
      socketService.nextQuestion();
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Solo el host puede avanzar preguntas' });
    }
  };

  const setLanguage = (lang: 'es' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  return (
    <GameContext.Provider value={{
      state,
      joinRoom,
      createRoom,
      leaveRoom,
      startGame,
      startTrivia,
      submitAnswer,
      nextQuestion,
      setLanguage,
      getRoomByCode,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};  