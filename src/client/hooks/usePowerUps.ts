import { useState, useEffect, useCallback, useRef } from 'react';
import type { PowerUp, PowerUpType, Obstacle, Achievement, DifficultyMode, AudioSettings, SoundEffect, BallPhysics, GameData, GameAction } from '../types/game';
import {
  createPowerUp,
  spawnRandomPowerUp,
  createObstacle,
  spawnLevelObstacles,
  createAchievements,
  checkAchievements,
  getDifficultyConfig,
  createAudioSettings,
  createSoundEffects,
  createMultiBall,
  splitBall,
  calculateMagneticForce,
} from '../utils/powerUps';
import { AudioManager, triggerVibration, getVibrationPattern } from '../utils/audioManager';

export const usePowerUps = (gameData: GameData, dispatch: (action: GameAction) => void) => {
  const [audioManager] = useState(() => new AudioManager(gameData.audioSettings));
  const powerUpSpawnTimer = useRef<NodeJS.Timeout>();
  const usedPowerUps = useRef<Set<string>>(new Set());

  // Spawn power-ups randomly
  useEffect(() => {
    if (gameData.gameState === 'PLAYING') {
      const spawnInterval = 15000 + Math.random() * 10000; // 15-25 seconds
      
      powerUpSpawnTimer.current = setTimeout(() => {
        const powerUp = spawnRandomPowerUp(gameData.config);
        dispatch({ type: 'SPAWN_POWERUP', payload: powerUp });
      }, spawnInterval);
    } else {
      if (powerUpSpawnTimer.current) {
        clearTimeout(powerUpSpawnTimer.current);
      }
    }

    return () => {
      if (powerUpSpawnTimer.current) {
        clearTimeout(powerUpSpawnTimer.current);
      }
    };
  }, [gameData.gameState, dispatch, gameData.config]);

  // Handle power-up collection
  const collectPowerUp = useCallback((powerUpId: string) => {
    const powerUp = gameData.powerUps.find(p => p.id === powerUpId);
    if (!powerUp || powerUp.collected) return;

    dispatch({ type: 'COLLECT_POWERUP', payload: powerUpId });
    dispatch({ type: 'ACTIVATE_POWERUP', payload: powerUp });
    
    // Track used power-ups for achievements
    usedPowerUps.current.add(powerUp.type);
    
    // Play sound effect
    audioManager.playSound('powerup_collect');
    triggerVibration(getVibrationPattern('powerup_collect'));
    
    // Update achievement progress
    dispatch({
      type: 'UPDATE_ACHIEVEMENT_PROGRESS',
      payload: { id: 'power_up_collector', progress: usedPowerUps.current.size }
    });
  }, [gameData.powerUps, dispatch, audioManager]);

  // Handle power-up effects
  const applyPowerUpEffect = useCallback((powerUp: PowerUp) => {
    switch (powerUp.type) {
      case 'multi-ball':
        const newBalls = splitBall(gameData.ballPhysics);
        newBalls.forEach(ball => {
          dispatch({ type: 'ADD_MULTI_BALL', payload: ball });
        });
        break;
        
      case 'larger-paddle':
        // Platform width increase is handled in the game state
        break;
        
      case 'slow-mo':
        // Ball speed reduction is handled in the game state
        break;
        
      case 'shield':
        dispatch({ type: 'UPDATE_SHIELD_BOUNCES', payload: 5 });
        break;
        
      case 'score-multiplier':
        // Score multiplier is handled in the game state
        break;
        
      case 'magnetic-paddle':
        dispatch({ type: 'SET_MAGNETIC_RANGE', payload: 100 });
        break;
    }
  }, [gameData.ballPhysics, dispatch]);

  // Deactivate expired power-ups
  const deactivateExpiredPowerUps = useCallback(() => {
    const now = Date.now();
    gameData.activePowerUps.forEach(powerUp => {
      if (now - powerUp.startTime >= powerUp.duration) {
        dispatch({ type: 'DEACTIVATE_POWERUP', payload: powerUp.id });
      }
    });
  }, [gameData.activePowerUps, dispatch]);

  // Check power-up collisions
  const checkPowerUpCollisions = useCallback((ball: BallPhysics) => {
    gameData.powerUps.forEach(powerUp => {
      if (powerUp.collected) return;
      
      const dx = ball.position.x - powerUp.x;
      const dy = ball.position.y - powerUp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < ball.radius + 15) {
        collectPowerUp(powerUp.id);
        applyPowerUpEffect(powerUp);
      }
    });
  }, [gameData.powerUps, collectPowerUp, applyPowerUpEffect]);

  // Update power-ups
  useEffect(() => {
    if (gameData.gameState === 'PLAYING') {
      deactivateExpiredPowerUps();
      checkPowerUpCollisions(gameData.ballPhysics);
      
      // Check multi-ball collisions
      gameData.multiBalls.forEach(ball => {
        checkPowerUpCollisions(ball);
      });
    }
  }, [gameData.gameState, gameData.ballPhysics, gameData.multiBalls, deactivateExpiredPowerUps, checkPowerUpCollisions]);

  return {
    collectPowerUp,
    applyPowerUpEffect,
    audioManager,
    usedPowerUps: usedPowerUps.current,
  };
};

export const useObstacles = (gameData: GameData, dispatch: (action: GameAction) => void) => {
  // Spawn obstacles for current level
  useEffect(() => {
    if (gameData.gameState === 'PLAYING' && gameData.obstacles.length === 0) {
      const obstacles = spawnLevelObstacles(gameData.scoreData.level, gameData.config);
      obstacles.forEach(obstacle => {
        dispatch({ type: 'SPAWN_OBSTACLE', payload: obstacle });
      });
    }
  }, [gameData.gameState, gameData.scoreData.level, gameData.config, gameData.obstacles.length, dispatch]);

  // Check obstacle collisions
  const checkObstacleCollisions = useCallback((ball: BallPhysics) => {
    gameData.obstacles.forEach(obstacle => {
      const ballLeft = ball.position.x - ball.radius;
      const ballRight = ball.position.x + ball.radius;
      const ballTop = ball.position.y - ball.radius;
      const ballBottom = ball.position.y + ball.radius;
      
      const obstacleLeft = obstacle.x - obstacle.width / 2;
      const obstacleRight = obstacle.x + obstacle.width / 2;
      const obstacleTop = obstacle.y - obstacle.height / 2;
      const obstacleBottom = obstacle.y + obstacle.height / 2;
      
      // Check collision
      if (ballLeft < obstacleRight && ballRight > obstacleLeft &&
          ballTop < obstacleBottom && ballBottom > obstacleTop) {
        
        if (obstacle.type === 'breakable-brick') {
          // Breakable brick
          const newHealth = (obstacle.health || 1) - 1;
          if (newHealth <= 0) {
            dispatch({ type: 'REMOVE_OBSTACLE', payload: obstacle.id });
            dispatch({ type: 'UPDATE_SCORE', payload: { score: gameData.scoreData.score + (obstacle.points || 50) } });
          } else {
            dispatch({ type: 'UPDATE_OBSTACLE', payload: { ...obstacle, health: newHealth } });
          }
        } else if (obstacle.type === 'speed-boost') {
          // Speed boost zone
          const speedMultiplier = 1.5;
          const newVelocity = {
            vx: ball.velocity.vx * speedMultiplier,
            vy: ball.velocity.vy * speedMultiplier,
          };
          dispatch({ type: 'UPDATE_BALL_PHYSICS', payload: { ...ball, velocity: newVelocity } });
        } else {
          // Regular obstacle bounce
          // Simple bounce logic - reverse velocity
          const newVelocity = {
            vx: -ball.velocity.vx * ball.bounceCoefficient,
            vy: -ball.velocity.vy * ball.bounceCoefficient,
          };
          dispatch({ type: 'UPDATE_BALL_PHYSICS', payload: { ...ball, velocity: newVelocity } });
        }
      }
    });
  }, [gameData.obstacles, gameData.scoreData.score, dispatch]);

  // Update obstacles
  useEffect(() => {
    if (gameData.gameState === 'PLAYING') {
      checkObstacleCollisions(gameData.ballPhysics);
      
      // Check multi-ball collisions
      gameData.multiBalls.forEach(ball => {
        checkObstacleCollisions(ball);
      });
    }
  }, [gameData.gameState, gameData.ballPhysics, gameData.multiBalls, checkObstacleCollisions]);

  return {
    checkObstacleCollisions,
  };
};

export const useAchievements = (gameData: GameData, dispatch: (action: GameAction) => void) => {
  const [achievements, setAchievements] = useState<Achievement[]>(createAchievements());

  // Check achievements
  useEffect(() => {
    const updatedAchievements = checkAchievements(achievements, {
      scoreData: gameData.scoreData,
      bounceCount: gameData.scoreData.bounceCount,
      level: gameData.scoreData.level,
      usedPowerUps: new Set(), // This would be passed from usePowerUps
    });

    // Check for newly unlocked achievements
    updatedAchievements.forEach(achievement => {
      if (achievement.unlocked && !achievements.find(a => a.id === achievement.id)?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement.id });
        // Play achievement sound
        const audioManager = new AudioManager(gameData.audioSettings);
        audioManager.playSound('achievement');
        triggerVibration(getVibrationPattern('achievement'));
      }
    });

    setAchievements(updatedAchievements);
  }, [gameData.scoreData, achievements, dispatch, gameData.audioSettings]);

  return {
    achievements,
  };
};

export const useAudio = (gameData: GameData, dispatch: (action: GameAction) => void) => {
  const [audioManager] = useState(() => new AudioManager(gameData.audioSettings));

  const playSound = useCallback((soundId: string) => {
    audioManager.playSound(soundId);
    triggerVibration(getVibrationPattern(soundId));
  }, [audioManager]);

  const updateAudioSettings = useCallback((settings: Partial<AudioSettings>) => {
    audioManager.updateSettings(settings);
    dispatch({ type: 'UPDATE_AUDIO_SETTINGS', payload: settings });
  }, [audioManager, dispatch]);

  return {
    playSound,
    updateAudioSettings,
    audioManager,
  };
};
