export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isSpectator: boolean;
  isTV?: boolean; // Nuevo campo para identificar dispositivos TV
  avatar?: string;
  joinedAt: Date;
  isOnline?: boolean; // Campo para estado de conexión
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
}

export interface GameSettings {
  name: string;
  maxPlayers: number;
  minigameCount: number;
  isRandomGames: boolean;
  selectedGames?: string[];
}

export interface GameState {
  currentRoom: Room | null;
  currentPlayer: Player | null;
  isLoading: boolean;
  error: string | null;
  language: 'es' | 'en';
  rooms: Room[]; // Array de salas para persistencia
}