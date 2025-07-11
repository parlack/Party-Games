export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isSpectator: boolean;
  avatar?: string;
  joinedAt: Date;
  socketId: string;
  isOnline: boolean;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  maxPlayers: number;
  currentPlayers: number;
  minigameCount: number;
  isRandomGames: boolean;
  isActive: boolean;
  players: Player[];
  host: Player;
  createdAt: Date;
  lastActivity: Date;
}

export interface GameSettings {
  name: string;
  maxPlayers: number;
  minigameCount: number;
  isRandomGames: boolean;
  selectedGames?: string[];
  hostName: string;
}

export interface CreateRoomRequest {
  settings: GameSettings;
}

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
  isSpectator?: boolean;
}

export interface SocketEvents {
  // Cliente -> Servidor
  'join-room': (data: JoinRoomRequest) => void;
  'leave-room': () => void;
  'start-game': () => void;
  'player-ready': () => void;
  'player-not-ready': () => void;
  
  // Servidor -> Cliente
  'room-joined': (room: Room, player: Player) => void;
  'room-left': () => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'room-updated': (room: Room) => void;
  'game-started': (room: Room) => void;
  'error': (message: string) => void;
  'room-not-found': () => void;
  'room-full': () => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
} 