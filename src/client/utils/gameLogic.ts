import type {
  BallPosition,
  BallVelocity,
  GameConfig,
  BallPhysics,
  Platform,
  CollisionState,
  LevelConfig,
  ScoreData,
  GameState,
  AimData,
  ControlState,
  VisualEffect,
  PowerUp,
  Obstacle,
  Achievement,
  DifficultyMode,
  AudioSettings,
  SoundEffect
} from '../types/game';

export const createLevelConfigs = (): LevelConfig[] => [
  {
    level: 1,
    ballSpeed: 8,
    platformWidth: 100,
    platformSpeed: 8,
    gravity: 9.8,
    bounceCoefficient: 0.75,
    targetBounces: 10,
    timeLimit: 60,
  },
  {
    level: 2,
    ballSpeed: 10,
    platformWidth: 90,
    platformSpeed: 9,
    gravity: 10,
    bounceCoefficient: 0.78,
    targetBounces: 12,
    timeLimit: 55,
  },
  {
    level: 3,
    ballSpeed: 12,
    platformWidth: 80,
    platformSpeed: 10,
    gravity: 10.2,
    bounceCoefficient: 0.8,
    targetBounces: 15,
    timeLimit: 50,
  },
  {
    level: 4,
    ballSpeed: 14,
    platformWidth: 70,
    platformSpeed: 11,
    gravity: 10.5,
    bounceCoefficient: 0.82,
    targetBounces: 18,
    timeLimit: 45,
  },
  {
    level: 5,
    ballSpeed: 16,
    platformWidth: 60,
    platformSpeed: 12,
    gravity: 10.8,
    bounceCoefficient: 0.85,
    targetBounces: 20,
    timeLimit: 40,
  },
];

export const createDefaultGameConfig = (): GameConfig => ({
  canvasWidth: 800,
  canvasHeight: 600,
  ballRadius: 20,
  platformHeight: 15,
  platformY: 50, // Distance from bottom
  maxVelocity: 20, // Increased for higher levels
  initialBallY: 0, // Will be set to bottom center
  levels: createLevelConfigs(),
});

export const createInitialBallPhysics = (config: GameConfig, levelConfig: LevelConfig): BallPhysics => {
  const initialY = config.canvasHeight - config.platformY - config.platformHeight - config.ballRadius - 10;
  return {
    position: {
      x: config.canvasWidth / 2,
      y: initialY,
    },
    velocity: {
      vx: 0,
      vy: 0,
    },
    radius: config.ballRadius,
    gravity: levelConfig.gravity,
    bounceCoefficient: levelConfig.bounceCoefficient,
    maxVelocity: config.maxVelocity,
  };
};

export const createInitialPlatform = (config: GameConfig, levelConfig: LevelConfig): Platform => ({
  x: config.canvasWidth / 2,
  y: config.canvasHeight - config.platformY,
  width: levelConfig.platformWidth,
  height: config.platformHeight,
  speed: levelConfig.platformSpeed,
});

export const createInitialCollisionState = (): CollisionState => ({
  wall: false,
  ceiling: false,
  platform: false,
  floor: false,
  hitPosition: 0,
});

export const createInitialScoreData = (): ScoreData => ({
  score: 0,
  lives: 3,
  level: 1,
  highScore: 0,
  bounceCount: 0,
  timeElapsed: 0,
  multiplier: 1,
  consecutiveBounces: 0,
  comboCount: 0,
});

export const createInitialAimData = (config: GameConfig): AimData => ({
  angle: 45,
  power: 8,
  startX: config.canvasWidth / 2,
  startY: config.canvasHeight - config.platformY - config.platformHeight - config.ballRadius,
  endX: config.canvasWidth / 2,
  endY: config.canvasHeight - config.platformY - config.platformHeight - config.ballRadius,
});

export const createInitialControlState = (): ControlState => ({
  inputType: 'mouse',
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  currentX: 0,
  currentY: 0,
  platformTargetX: 0,
  keyboardLeft: false,
  keyboardRight: false,
});

export const createInitialVisualEffects = (): VisualEffect[] => [];

export const createInitialBallTrail = (): BallPosition[] => [];

export const createInitialScreenShake = () => ({
  intensity: 0,
  duration: 0,
  startTime: 0,
});

export const createInitialPowerUps = (): PowerUp[] => [];

export const createInitialActivePowerUps = (): PowerUp[] => [];

export const createInitialObstacles = (): Obstacle[] => [];

export const createInitialAchievements = (): Achievement[] => [];

export const createInitialDifficultyMode = (): DifficultyMode => 'normal';

export const createInitialAudioSettings = (): AudioSettings => ({
  enabled: true,
  volume: 0.7,
  mute: false,
});

export const createInitialSoundEffects = (): SoundEffect[] => [];

export const createInitialMultiBalls = (): BallPhysics[] => [];

export const createInitialShieldBounces = (): number => 0;

export const createInitialMagneticRange = (): number => 0;

export const updateBallPhysics = (ball: BallPhysics, deltaTime: number): BallPhysics => {
  let { position, velocity, gravity, bounceCoefficient, maxVelocity } = ball;

  // Apply gravity
  velocity.vy += gravity * deltaTime * 0.1; // Scale gravity effect

  // Update position
  position.x += velocity.vx * deltaTime;
  position.y += velocity.vy * deltaTime;

  // Clamp velocity to maxVelocity
  velocity.vx = clamp(velocity.vx, -maxVelocity, maxVelocity);
  velocity.vy = clamp(velocity.vy, -maxVelocity, maxVelocity);

  return { ...ball, position, velocity };
};

export const launchBall = (ball: BallPhysics, angle: number, power: number, config: GameConfig): BallPhysics => {
  const launchSpeed = power * (config.maxVelocity / 100); // Scale power to maxVelocity
  const angleRad = (angle * Math.PI) / 180;

  return {
    ...ball,
    velocity: {
      vx: launchSpeed * Math.cos(angleRad),
      vy: -launchSpeed * Math.sin(angleRad), // Negative because Y-axis is inverted
    },
  };
};

export const checkWallCollision = (ball: BallPhysics, config: GameConfig) => {
  let newVelocity = { ...ball.velocity };
  let hit = false;

  if (ball.position.x - ball.radius < 0) {
    ball.position.x = ball.radius;
    newVelocity.vx *= -ball.bounceCoefficient;
    hit = true;
  } else if (ball.position.x + ball.radius > config.canvasWidth) {
    ball.position.x = config.canvasWidth - ball.radius;
    newVelocity.vx *= -ball.bounceCoefficient;
    hit = true;
  }
  return { hit, newVelocity };
};

export const checkCeilingCollision = (ball: BallPhysics) => {
  let newVelocity = { ...ball.velocity };
  let hit = false;

  if (ball.position.y - ball.radius < 0) {
    ball.position.y = ball.radius;
    newVelocity.vy *= -ball.bounceCoefficient;
    hit = true;
  }
  return { hit, newVelocity };
};

export const checkPlatformCollision = (ball: BallPhysics, platform: Platform) => {
  let hit = false;
  let newVelocity = { ...ball.velocity };
  let hitPosition = 0; // -1 (left edge) to 1 (right edge)

  // Check if ball is within platform's X range
  if (
    ball.position.x + ball.radius > platform.x - platform.width / 2 &&
    ball.position.x - ball.radius < platform.x + platform.width / 2
  ) {
    // Check if ball is hitting the top of the platform
    if (
      ball.position.y + ball.radius > platform.y - platform.height / 2 &&
      ball.position.y - ball.radius < platform.y + platform.height / 2 &&
      ball.velocity.vy > 0 // Only bounce if moving downwards
    ) {
      // Adjust ball position to be on top of the platform
      ball.position.y = platform.y - platform.height / 2 - ball.radius;
      newVelocity.vy *= -ball.bounceCoefficient; // Reverse and reduce vertical velocity

      // Adjust horizontal velocity based on hit position on platform
      const hitPoint = ball.position.x - platform.x; // Distance from platform center
      hitPosition = hitPoint / (platform.width / 2); // Normalize to -1 to 1
      newVelocity.vx += hitPosition * 2; // Angle adjustment

      hit = true;
    }
  }
  return { hit, newVelocity, hitPosition };
};

export const checkFloorCollision = (ball: BallPhysics, config: GameConfig) => {
  return ball.position.y + ball.radius > config.canvasHeight;
};

export const updatePlatformPosition = (platform: Platform, targetX: number, config: GameConfig): Platform => {
  const halfWidth = platform.width / 2;
  const minX = halfWidth;
  const maxX = config.canvasWidth - halfWidth;

  let newX = targetX;

  // Clamp platform to screen boundaries with a buffer
  newX = clamp(newX, minX + 10, maxX - 10); // 10px buffer

  return { ...platform, x: newX };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

export const calculateBounceScore = (
  surface: 'platform' | 'wall' | 'ceiling' | 'floor',
  hitPosition: number = 0,
  multiplier: number = 1
): number => {
  const baseScore = 10;
  let bonus = 0;

  if (surface === 'platform') {
    const centerBonus = Math.max(0, 1 - Math.abs(hitPosition)) * 5; // Closer to center, higher bonus
    bonus += centerBonus;
  }
  return Math.floor((baseScore + bonus) * multiplier);
};

export const calculateComboMultiplier = (consecutiveBounces: number): number => {
  if (consecutiveBounces <= 1) return 1;
  if (consecutiveBounces <= 3) return 1.5;
  if (consecutiveBounces <= 5) return 2;
  if (consecutiveBounces <= 10) return 2.5;
  return 3;
};

export const calculateTimeBonus = (
  timeElapsed: number,
  timeLimit: number
): number => {
  const remainingTime = Math.max(0, timeLimit - timeElapsed);
  return Math.floor(remainingTime * 2); // 2 points per second remaining
};

export const calculateLevelScore = (
  bounceCount: number,
  targetBounces: number,
  timeElapsed: number,
  timeLimit: number
): number => {
  const completionBonus = bounceCount >= targetBounces ? 100 : 0;
  const timeBonus = calculateTimeBonus(timeElapsed, timeLimit);
  return completionBonus + timeBonus;
};

export const updateScoreData = (
  currentScore: ScoreData,
  bounceScore: number,
  surface: 'platform' | 'wall' | 'ceiling' | 'floor',
  hitPosition: number = 0
): ScoreData => {
  const newConsecutiveBounces = surface === 'platform' ? currentScore.consecutiveBounces + 1 : 0;
  const newMultiplier = calculateComboMultiplier(newConsecutiveBounces);
  const newComboCount = newConsecutiveBounces > currentScore.consecutiveBounces ? currentScore.comboCount + 1 : currentScore.comboCount;

  return {
    ...currentScore,
    score: currentScore.score + bounceScore,
    bounceCount: currentScore.bounceCount + 1,
    consecutiveBounces: newConsecutiveBounces,
    multiplier: newMultiplier,
    comboCount: newComboCount,
  };
};

export const resetCombo = (scoreData: ScoreData): ScoreData => ({
  ...scoreData,
  consecutiveBounces: 0,
  multiplier: 1,
});

export const loseLife = (scoreData: ScoreData): ScoreData => ({
  ...scoreData,
  lives: Math.max(0, scoreData.lives - 1),
});

export const nextLevel = (scoreData: ScoreData): ScoreData => ({
  ...scoreData,
  level: scoreData.level + 1,
  bounceCount: 0,
  timeElapsed: 0,
  consecutiveBounces: 0,
  multiplier: 1,
});

export const updateHighScore = (scoreData: ScoreData): ScoreData => ({
  ...scoreData,
  highScore: Math.max(scoreData.highScore, scoreData.score),
});

export const calculateAimAngle = (startX: number, startY: number, endX: number, endY: number): number => {
  const dx = endX - startX;
  const dy = endY - startY;
  let angle = Math.atan2(-dy, dx) * 180 / Math.PI; // Negative dy because canvas Y is inverted

  // Clamp angle to 0-180 degrees (upwards arc)
  if (angle < 0) angle += 360;
  if (angle > 180 && angle <= 360) angle = 360 - angle; // Reflect angles > 180 to be within 0-180
  if (angle > 180) angle = 180; // Ensure it doesn't go below 0 or above 180 after reflection
  if (angle < 0) angle = 0;

  return angle;
};

export const calculateAimPower = (startX: number, startY: number, endX: number, endY: number): number => {
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Scale distance to a power between 0 and 100
  // Max drag distance for 100% power, e.g., 150px
  const maxDragDistance = 150;
  return clamp(Math.floor((distance / maxDragDistance) * 100), 0, 100);
};

export const calculateTrajectoryPoints = (
  startX: number,
  startY: number,
  angle: number,
  power: number,
  config: GameConfig,
  numPoints: number = 50,
  timeStep: number = 0.1
): BallPosition[] => {
  const points: BallPosition[] = [];
  let tempBall: BallPhysics = {
    position: { x: startX, y: startY },
    velocity: { vx: 0, vy: 0 },
    radius: config.ballRadius,
    gravity: config.levels[0].gravity, // Use level 1 gravity for preview
    bounceCoefficient: config.levels[0].bounceCoefficient,
    maxVelocity: config.maxVelocity,
  };

  tempBall = launchBall(tempBall, angle, power, config);

  for (let i = 0; i < numPoints; i++) {
    tempBall = updateBallPhysics(tempBall, timeStep);
    points.push({ x: tempBall.position.x, y: tempBall.position.y });

    // Stop if ball goes out of bounds (roughly)
    if (
      tempBall.position.y > config.canvasHeight + 50 ||
      tempBall.position.x < -50 ||
      tempBall.position.x > config.canvasWidth + 50
    ) {
      break;
    }
  }
  return points;
};
