export enum GameState {
  MENU = 'MENU',
  AIMING = 'AIMING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
}

export type BallPosition = {
  x: number;
  y: number;
};

export type BallVelocity = {
  vx: number;
  vy: number;
};

export type BallPhysics = {
  position: BallPosition;
  velocity: BallVelocity;
  radius: number;
  gravity: number;
  bounceCoefficient: number;
  maxVelocity: number;
};

export type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

export type LevelConfig = {
  level: number;
  ballSpeed: number;
  platformWidth: number;
  platformSpeed: number;
  gravity: number;
  bounceCoefficient: number;
  targetBounces: number;
  timeLimit: number; // seconds
};

export type GameConfig = {
  canvasWidth: number;
  canvasHeight: number;
  ballRadius: number;
  platformHeight: number;
  platformY: number; // Distance from bottom
  maxVelocity: number;
  initialBallY: number; // Starting Y position
  levels: LevelConfig[];
};

export type CollisionState = {
  wall: boolean;
  ceiling: boolean;
  platform: boolean;
  floor: boolean;
  hitPosition?: number;
};

export type ScoreData = {
  score: number;
  lives: number;
  level: number;
  highScore: number;
  bounceCount: number;
  timeElapsed: number;
  multiplier: number;
  consecutiveBounces: number;
  comboCount: number;
};

export type AimData = {
  angle: number; // 0-180 degrees from horizontal
  power: number; // 0-100 percentage
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type ControlState = {
  inputType: 'mouse' | 'touch' | 'keyboard';
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  currentX: number;
  currentY: number;
  platformTargetX: number;
  keyboardLeft: boolean;
  keyboardRight: boolean;
};

export type PowerUpType = 
  | 'multi-ball' 
  | 'larger-paddle' 
  | 'slow-mo' 
  | 'shield' 
  | 'score-multiplier' 
  | 'magnetic-paddle';

export type PowerUp = {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  duration: number;
  startTime: number;
  active: boolean;
  collected: boolean;
};

export type ObstacleType = 'static-block' | 'moving-barrier' | 'breakable-brick' | 'speed-boost';

export type Obstacle = {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number;
  vy?: number;
  health?: number;
  maxHealth?: number;
  points?: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  target: number;
};

export type DifficultyMode = 'easy' | 'normal' | 'hard';

export type AudioSettings = {
  enabled: boolean;
  volume: number;
  mute: boolean;
};

export type SoundEffect = {
  id: string;
  name: string;
  volume: number;
  loop: boolean;
};

export type ParticleEffect = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export type GameData = {
  gameState: GameState;
  scoreData: ScoreData;
  ballPhysics: BallPhysics;
  platform: Platform;
  config: GameConfig;
  collisionState: CollisionState;
  currentLevel: LevelConfig;
  levelStartTime: number;
  lastBounceTime: number;
  aimData: AimData;
  controlState: ControlState;
  visualEffects: VisualEffect[];
  ballTrail: BallPosition[];
  screenShake: { intensity: number; duration: number; startTime: number };
  powerUps: PowerUp[];
  activePowerUps: PowerUp[];
  obstacles: Obstacle[];
  achievements: Achievement[];
  difficultyMode: DifficultyMode;
  audioSettings: AudioSettings;
  soundEffects: SoundEffect[];
  multiBalls: BallPhysics[];
  shieldBounces: number;
  magneticRange: number;
};

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'ENTER_AIMING' }
  | { type: 'LAUNCH_BALL'; payload: { angle: number; power: number } }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_BALL_PHYSICS'; payload: BallPhysics }
  | { type: 'UPDATE_PLATFORM_POSITION'; payload: number }
  | { type: 'UPDATE_SCORE'; payload: Partial<ScoreData> }
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_COLLISION_STATE'; payload: CollisionState }
  | { type: 'BALL_BOUNCE'; payload: { surface: 'platform' | 'wall' | 'ceiling' | 'floor'; hitPosition?: number } }
  | { type: 'LOSE_LIFE' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'GAME_OVER' }
  | { type: 'UPDATE_TIME' }
  | { type: 'RESET_COMBO' }
  | { type: 'UPDATE_AIM_DATA'; payload: Partial<AimData> }
  | { type: 'UPDATE_CONTROL_STATE'; payload: Partial<ControlState> }
  | { type: 'ADD_VISUAL_EFFECT'; payload: VisualEffect }
  | { type: 'REMOVE_VISUAL_EFFECT'; payload: string }
  | { type: 'UPDATE_BALL_TRAIL'; payload: BallPosition[] }
  | { type: 'SCREEN_SHAKE'; payload: { intensity: number; duration: number } }
  | { type: 'SPAWN_POWERUP'; payload: PowerUp }
  | { type: 'COLLECT_POWERUP'; payload: string }
  | { type: 'ACTIVATE_POWERUP'; payload: PowerUp }
  | { type: 'DEACTIVATE_POWERUP'; payload: string }
  | { type: 'SPAWN_OBSTACLE'; payload: Obstacle }
  | { type: 'REMOVE_OBSTACLE'; payload: string }
  | { type: 'UPDATE_OBSTACLE'; payload: Obstacle }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_ACHIEVEMENT_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'SET_DIFFICULTY_MODE'; payload: DifficultyMode }
  | { type: 'UPDATE_AUDIO_SETTINGS'; payload: Partial<AudioSettings> }
  | { type: 'PLAY_SOUND_EFFECT'; payload: string }
  | { type: 'ADD_MULTI_BALL'; payload: BallPhysics }
  | { type: 'REMOVE_MULTI_BALL'; payload: string }
  | { type: 'UPDATE_SHIELD_BOUNCES'; payload: number }
  | { type: 'SET_MAGNETIC_RANGE'; payload: number };
