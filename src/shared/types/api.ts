export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// Game API Types
export type GameInitResponse = {
  type: 'gameInit';
  postId: string;
  gameData: {
    gameState: 'initial' | 'playing' | 'paused' | 'gameOver';
    score: number;
    highScore: number;
    level: number;
  };
  username: string;
};

export type GameUpdateResponse = {
  type: 'gameUpdate';
  postId: string;
  gameData: {
    gameState: 'initial' | 'playing' | 'paused' | 'gameOver';
    score: number;
    highScore: number;
    level: number;
  };
};

export type GameActionRequest = {
  action: 'start' | 'pause' | 'resume' | 'reset' | 'updateScore';
  score?: number;
  highScore?: number;
  level?: number;
  lives?: number;
  bounceCount?: number;
  timeElapsed?: number;
  multiplier?: number;
  consecutiveBounces?: number;
  comboCount?: number;
};

export type HighScoreResponse = {
  highScore: number;
};

export type HighScoreUpdateRequest = {
  score: number;
};

export type HighScoreUpdateResponse = {
  success: boolean;
};
