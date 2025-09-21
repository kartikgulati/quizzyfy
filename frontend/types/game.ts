export interface Player {
  id: string;
  name: string;
  score: number;
  currentAnswerTime?: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  pin: string;
}

export interface GameState {
  quiz: Quiz | null;
  players: Player[];
  currentQuestionIndex: number;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  showResults: boolean;
  gameEnded: boolean;
}

export interface GameEvents {
  'player-joined': { player: Player; totalPlayers: number };
  'player-left': { playerId: string; totalPlayers: number };
  'game-started': GameState;
  'host-joined': { quiz: Quiz; gameState: Partial<GameState> };
  'question-started': { question: Question; questionIndex: number; timeLimit: number };
  'question-ended': { correctAnswer: number; results: PlayerResult[] };
  'game-ended': { finalLeaderboard: Player[] };
  'game-paused': { isPaused: boolean };
  'leaderboard-updated': { leaderboard: Player[] };
  'player-kicked': { playerId: string };
  error: { message: string };
}

export interface PlayerResult {
  playerId: string;
  playerName: string;
  isCorrect: boolean;
  timeToAnswer: number;
  pointsEarned: number;
}