export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isSpectator: boolean;
  avatar?: string;
  joinedAt: Date;
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