export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isSpectator: boolean;
  isTV?: boolean; // Nuevo campo para identificar dispositivos TV
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
  // Nuevos campos para trivia
  gameState?: GameState;
  currentQuestion?: TriviaQuestion;
  questionStartTime?: Date;
  scores?: PlayerScore[];
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
  isTV?: boolean; // Nuevo campo para unirse como TV
}

export interface SocketEvents {
  // Cliente -> Servidor
  'join-room': (data: JoinRoomRequest) => void;
  'leave-room': () => void;
  'start-game': () => void;
  'player-ready': () => void;
  'player-not-ready': () => void;
  // Nuevos eventos para trivia
  'start-trivia': () => void;
  'submit-answer': (data: SubmitAnswerRequest) => void;
  'next-question': () => void;
  
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
  // Nuevos eventos para trivia
  'trivia-started': (room: Room) => void;
  'question-sent': (question: TriviaQuestion, timeLimit: number) => void;
  'answer-received': (playerId: string, correct: boolean, timeUsed: number) => void;
  'question-ended': (correctAnswer: string, scores: PlayerScore[]) => void;
  'trivia-ended': (finalScores: PlayerScore[], winner: Player) => void;
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

// Nuevos tipos para el sistema de trivia
export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // en segundos
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number; // tiempo promedio de respuesta en segundos
  lastAnswerTime?: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedAnswer: string;
  timeUsed: number; // tiempo usado para responder en segundos
}

export interface OpenTriviaResponse {
  response_code: number;
  results: OpenTriviaQuestion[];
}

export interface OpenTriviaQuestion {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export enum GameState {
  WAITING = 'waiting',
  STARTING = 'starting',
  TRIVIA_ACTIVE = 'trivia_active',
  QUESTION_ACTIVE = 'question_active',
  QUESTION_ENDED = 'question_ended',
  TRIVIA_ENDED = 'trivia_ended'
} 