import type { PowerUp, PowerUpType, Obstacle, ObstacleType, Achievement, DifficultyMode, AudioSettings, SoundEffect, BallPhysics, GameConfig } from '../types/game';

// Power-up utilities
export const createPowerUp = (
  type: PowerUpType,
  x: number,
  y: number,
  duration: number = 10000
): PowerUp => ({
  id: `${type}_${Date.now()}_${Math.random()}`,
  type,
  x,
  y,
  duration,
  startTime: Date.now(),
  active: false,
  collected: false,
});

export const getPowerUpIcon = (type: PowerUpType): string => {
  const icons: Record<PowerUpType, string> = {
    'multi-ball': '⚽⚽',
    'larger-paddle': '📏',
    'slow-mo': '🐌',
    'shield': '🛡️',
    'score-multiplier': '✨',
    'magnetic-paddle': '🧲',
  };
  return icons[type];
};

export const getPowerUpColor = (type: PowerUpType): string => {
  const colors: Record<PowerUpType, string> = {
    'multi-ball': '#ff6b6b',
    'larger-paddle': '#4ecdc4',
    'slow-mo': '#45b7d1',
    'shield': '#96ceb4',
    'score-multiplier': '#feca57',
    'magnetic-paddle': '#ff9ff3',
  };
  return colors[type];
};

export const getPowerUpDescription = (type: PowerUpType): string => {
  const descriptions: Record<PowerUpType, string> = {
    'multi-ball': 'Split ball into multiple balls',
    'larger-paddle': 'Increase platform width by 50%',
    'slow-mo': 'Reduce ball speed by 40%',
    'shield': 'Extra life protection for 5 bounces',
    'score-multiplier': '2x points for 15 seconds',
    'magnetic-paddle': 'Ball auto-attracts to paddle',
  };
  return descriptions[type];
};

export const spawnRandomPowerUp = (config: GameConfig): PowerUp => {
  const types: PowerUpType[] = ['multi-ball', 'larger-paddle', 'slow-mo', 'shield', 'score-multiplier', 'magnetic-paddle'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const x = Math.random() * (config.canvasWidth - 40) + 20;
  const y = Math.random() * (config.canvasHeight - 200) + 100;
  
  return createPowerUp(type, x, y);
};

// Obstacle utilities
export const createObstacle = (
  type: ObstacleType,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<Obstacle> = {}
): Obstacle => ({
  id: `${type}_${Date.now()}_${Math.random()}`,
  type,
  x,
  y,
  width,
  height,
  ...options,
});

export const getObstacleColor = (type: ObstacleType): string => {
  const colors: Record<ObstacleType, string> = {
    'static-block': '#8b4513',
    'moving-barrier': '#ff6b6b',
    'breakable-brick': '#ffa500',
    'speed-boost': '#00ff00',
  };
  return colors[type];
};

export const spawnLevelObstacles = (level: number, config: GameConfig): Obstacle[] => {
  const obstacles: Obstacle[] = [];
  
  if (level >= 2) {
    // Static blocks
    for (let i = 0; i < Math.min(level - 1, 3); i++) {
      obstacles.push(createObstacle(
        'static-block',
        (config.canvasWidth / 4) * (i + 1),
        config.canvasHeight / 2,
        60,
        20
      ));
    }
  }
  
  if (level >= 3) {
    // Moving barriers
    obstacles.push(createObstacle(
      'moving-barrier',
      config.canvasWidth / 2,
      config.canvasHeight / 3,
      80,
      15,
      { vx: 2, vy: 0 }
    ));
  }
  
  if (level >= 4) {
    // Breakable bricks
    for (let i = 0; i < 2; i++) {
      obstacles.push(createObstacle(
        'breakable-brick',
        config.canvasWidth * 0.2 + (i * config.canvasWidth * 0.6),
        config.canvasHeight * 0.3,
        40,
        20,
        { health: 2, maxHealth: 2, points: 50 }
      ));
    }
  }
  
  if (level >= 5) {
    // Speed boost zones
    obstacles.push(createObstacle(
      'speed-boost',
      config.canvasWidth / 2,
      config.canvasHeight * 0.7,
      100,
      30
    ));
  }
  
  return obstacles;
};

// Achievement utilities
export const createAchievements = (): Achievement[] => [
  {
    id: 'first_bounce',
    name: 'First Bounce',
    description: 'Complete your first bounce',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve 50 consecutive bounces',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: 'level_5_complete',
    name: 'Level 5 Complete',
    description: 'Complete level 5',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Score 10,000 points',
    icon: '💯',
    unlocked: false,
    progress: 0,
    target: 10000,
  },
  {
    id: 'power_up_collector',
    name: 'Power-up Collector',
    description: 'Use all power-up types',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    target: 6,
  },
  {
    id: 'bounce_king',
    name: 'Bounce King',
    description: 'Achieve 100 total bounces',
    icon: '👑',
    unlocked: false,
    progress: 0,
    target: 100,
  },
];

export const checkAchievements = (
  achievements: Achievement[],
  gameData: { scoreData: any; bounceCount: number; level: number; usedPowerUps: Set<string> }
): Achievement[] => {
  return achievements.map(achievement => {
    let progress = achievement.progress;
    
    switch (achievement.id) {
      case 'first_bounce':
        progress = Math.max(progress, gameData.bounceCount);
        break;
      case 'combo_master':
        progress = Math.max(progress, gameData.scoreData.consecutiveBounces);
        break;
      case 'level_5_complete':
        progress = Math.max(progress, gameData.level);
        break;
      case 'high_scorer':
        progress = Math.max(progress, gameData.scoreData.score);
        break;
      case 'power_up_collector':
        progress = Math.max(progress, gameData.usedPowerUps.size);
        break;
      case 'bounce_king':
        progress = Math.max(progress, gameData.bounceCount);
        break;
    }
    
    return {
      ...achievement,
      progress,
      unlocked: achievement.unlocked || progress >= achievement.target,
      unlockedAt: !achievement.unlocked && progress >= achievement.target ? Date.now() : achievement.unlockedAt,
    };
  });
};

// Difficulty utilities
export const getDifficultyConfig = (mode: DifficultyMode) => {
  const configs = {
    easy: {
      platformWidthMultiplier: 1.5,
      ballSpeedMultiplier: 0.8,
      lives: 5,
      obstacleCount: 0.5,
    },
    normal: {
      platformWidthMultiplier: 1.0,
      ballSpeedMultiplier: 1.0,
      lives: 3,
      obstacleCount: 1.0,
    },
    hard: {
      platformWidthMultiplier: 0.7,
      ballSpeedMultiplier: 1.3,
      lives: 2,
      obstacleCount: 1.5,
    },
  };
  return configs[mode];
};

// Audio utilities
export const createAudioSettings = (): AudioSettings => ({
  enabled: true,
  volume: 0.7,
  mute: false,
});

export const createSoundEffects = (): SoundEffect[] => [
  { id: 'bounce_paddle', name: 'Paddle Bounce', volume: 0.8, loop: false },
  { id: 'bounce_wall', name: 'Wall Bounce', volume: 0.6, loop: false },
  { id: 'bounce_floor', name: 'Floor Hit', volume: 0.9, loop: false },
  { id: 'powerup_collect', name: 'Power-up Collect', volume: 0.7, loop: false },
  { id: 'level_complete', name: 'Level Complete', volume: 0.8, loop: false },
  { id: 'game_over', name: 'Game Over', volume: 0.9, loop: false },
  { id: 'high_score', name: 'High Score', volume: 0.8, loop: false },
  { id: 'achievement', name: 'Achievement', volume: 0.7, loop: false },
];

// Multi-ball utilities
export const createMultiBall = (originalBall: BallPhysics, angleOffset: number): BallPhysics => {
  const angle = Math.atan2(originalBall.velocity.vy, originalBall.velocity.vx) + angleOffset;
  const speed = Math.sqrt(originalBall.velocity.vx ** 2 + originalBall.velocity.vy ** 2);
  
  return {
    ...originalBall,
    velocity: {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    },
  };
};

export const splitBall = (ball: BallPhysics): BallPhysics[] => {
  const balls: BallPhysics[] = [];
  
  // Create 2 additional balls with different angles
  balls.push(createMultiBall(ball, Math.PI / 6)); // 30 degrees
  balls.push(createMultiBall(ball, -Math.PI / 6)); // -30 degrees
  
  return balls;
};

// Magnetic paddle utilities
export const calculateMagneticForce = (
  ball: BallPhysics,
  platform: { x: number; y: number },
  range: number
): { vx: number; vy: number } => {
  const dx = platform.x - ball.position.x;
  const dy = platform.y - ball.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > range) {
    return { vx: 0, vy: 0 };
  }
  
  const force = (range - distance) / range * 0.5; // Max force of 0.5
  return {
    vx: (dx / distance) * force,
    vy: (dy / distance) * force,
  };
};
