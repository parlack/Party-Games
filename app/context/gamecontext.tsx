import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, Room, Player } from '../types/game';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import type { Room as BackendRoom, Player as BackendPlayer } from '../services/apiService';

interface GameContextType {
  state: GameState;
  joinRoom: (code: string, playerName: string, isSpectator?: boolean) => Promise<void>;
  createRoom: (settings: any) => Promise<void>;
  leaveRoom: () => void;
  startGame: () => void;
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
  | { type: 'SET_CONNECTED'; payload: boolean };

const initialState: GameState = {
  currentRoom: null,
  currentPlayer: null,
  isLoading: false,
  error: null,
  language: 'es',
  rooms: [],
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

function gameReducer(state: GameState, action: GameAction): GameState {
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
    });

    socketService.on('room-left', () => {
      dispatch({ type: 'SET_ROOM', payload: null });
      dispatch({ type: 'SET_PLAYER', payload: null });
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

  const joinRoom = async (code: string, playerName: string, isSpectator = false) => {
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
        isSpectator
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
        isSpectator: false
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
    }
  };

  const startGame = () => {
    if (state.currentPlayer?.isHost) {
      socketService.startGame();
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Solo el host puede iniciar el juego' });
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