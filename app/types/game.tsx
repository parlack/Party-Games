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
}

export interface AppState {
  currentRoom: Room | null;
  currentPlayer: Player | null;
  isLoading: boolean;
  error: string | null;
  language: 'es' | 'en';
  rooms: Room[]; // Array de salas para persistencia
  // Nuevos campos para trivia
  triviaState: TriviaState | null;
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
  playerId: string;
  questionIndex: number;
  selectedAnswer: string;
  timeUsed: number; // tiempo usado para responder en milisegundos
}

export interface PlayerAnswer {
  answer: string;
  timeUsed: number;
  timestamp: number;
}

export interface TriviaState {
  isActive: boolean;
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  currentQuestion: TriviaQuestion | null;
  scores: PlayerScore[];
  playerAnswers: { [playerId: string]: PlayerAnswer };
  questionStartTime: number;
  timeLimit: number; // en milisegundos
  
  // Estados opcionales para UI
  showResults?: boolean;
  nextQuestionCountdown?: number;
  isCompleted?: boolean;
  finalScores?: PlayerScore[];
  winner?: PlayerScore;
}

export enum GameState {
  WAITING = 'waiting',
  STARTING = 'starting',
  TRIVIA_ACTIVE = 'trivia_active',
  QUESTION_ACTIVE = 'question_active',
  QUESTION_ENDED = 'question_ended',
  TRIVIA_ENDED = 'trivia_ended'
}