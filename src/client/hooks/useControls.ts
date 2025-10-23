import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  GameData, 
  GameAction, 
  BallPhysics, 
  Platform, 
  CollisionState, 
  GameConfig,
  LevelConfig,
  ScoreData,
  AimData,
  ControlState
} from '../types/game';
import { GameState } from '../types/game';
import {
  createDefaultGameConfig,
  createInitialBallPhysics,
  createInitialPlatform,
  createInitialCollisionState,
  createInitialScoreData,
  createInitialAimData,
  createInitialControlState,
  updateBallPhysics,
  launchBall,
  checkWallCollision,
  checkCeilingCollision,
  checkPlatformCollision,
  checkFloorCollision,
  updatePlatformPosition,
  calculateBounceScore,
  updateScoreData,
  resetCombo,
  loseLife,
  nextLevel,
  updateHighScore,
  calculateAimAngle,
  calculateAimPower,
  calculateTrajectoryPoints,
} from '../utils/gameLogic';

const createInitialGameData = (): GameData => {
  const config = createDefaultGameConfig();
  const levelConfig = config.levels[0];
  
  return {
    gameState: 'MENU' as GameState,
    scoreData: createInitialScoreData(),
    ballPhysics: createInitialBallPhysics(config, levelConfig),
    platform: createInitialPlatform(config, levelConfig),
    config,
    collisionState: createInitialCollisionState(),
    currentLevel: levelConfig,
    levelStartTime: 0,
    lastBounceTime: 0,
    aimData: createInitialAimData(config),
    controlState: createInitialControlState(),
  };
};

export const useGameState = () => {
  const [gameData, setGameData] = useState<GameData>(createInitialGameData());
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const levelStartTimeRef = useRef<number>(0);

  const dispatch = useCallback((action: GameAction) => {
    setGameData(prev => {
      switch (action.type) {
        case 'START_GAME':
          const config = createDefaultGameConfig();
          const levelConfig = config.levels[0];
          levelStartTimeRef.current = Date.now();
          
          return {
            ...prev,
            gameState: 'AIMING' as GameState,
            scoreData: createInitialScoreData(),
            ballPhysics: createInitialBallPhysics(config, levelConfig),
            platform: createInitialPlatform(config, levelConfig),
            config,
            collisionState: createInitialCollisionState(),
            currentLevel: levelConfig,
            levelStartTime: levelStartTimeRef.current,
            lastBounceTime: 0,
            aimData: createInitialAimData(config),
            controlState: createInitialControlState(),
          };

        case 'ENTER_AIMING':
          return { ...prev, gameState: 'AIMING' as GameState };

        case 'LAUNCH_BALL':
          levelStartTimeRef.current = Date.now();
          return {
            ...prev,
            gameState: 'PLAYING' as GameState,
            ballPhysics: launchBall(prev.ballPhysics, action.payload.angle, action.payload.power, prev.config),
            levelStartTime: levelStartTimeRef.current,
          };

        case 'PAUSE_GAME':
          return { ...prev, gameState: 'PAUSED' as GameState };

        case 'RESUME_GAME':
          return { ...prev, gameState: 'PLAYING' as GameState };

        case 'RESET_GAME':
          const resetConfig = createDefaultGameConfig();
          const resetLevelConfig = resetConfig.levels[0];
          
          return {
            ...prev,
            gameState: 'MENU' as GameState,
            scoreData: createInitialScoreData(),
            ballPhysics: createInitialBallPhysics(resetConfig, resetLevelConfig),
            platform: createInitialPlatform(resetConfig, resetLevelConfig),
            config: resetConfig,
            collisionState: createInitialCollisionState(),
            currentLevel: resetLevelConfig,
            levelStartTime: 0,
            lastBounceTime: 0,
            aimData: createInitialAimData(resetConfig),
            controlState: createInitialControlState(),
          };

        case 'UPDATE_BALL_PHYSICS':
          return { ...prev, ballPhysics: action.payload };

        case 'UPDATE_PLATFORM_POSITION':
          return {
            ...prev,
            platform: updatePlatformPosition(prev.platform, action.payload, prev.config),
          };

        case 'UPDATE_SCORE':
          return {
            ...prev,
            scoreData: { ...prev.scoreData, ...action.payload },
          };

        case 'SET_GAME_STATE':
          return { ...prev, gameState: action.payload };

        case 'SET_COLLISION_STATE':
          return { ...prev, collisionState: action.payload };

        case 'BALL_BOUNCE':
          const bounceScore = calculateBounceScore(
            action.payload.surface,
            action.payload.hitPosition || 0,
            prev.scoreData.multiplier
          );
          
          const newScoreData = updateScoreData(
            prev.scoreData,
            bounceScore,
            action.payload.surface,
            action.payload.hitPosition || 0
          );
          
          return {
            ...prev,
            scoreData: newScoreData,
            lastBounceTime: Date.now(),
          };

        case 'LOSE_LIFE':
          const updatedScoreData = loseLife(prev.scoreData);
          const newGameState = updatedScoreData.lives <= 0 ? 'GAME_OVER' as GameState : 'AIMING' as GameState;
          
          return {
            ...prev,
            scoreData: updatedScoreData,
            gameState: newGameState,
            ballPhysics: createInitialBallPhysics(prev.config, prev.currentLevel),
          };

        case 'NEXT_LEVEL':
          const nextLevelConfig = prev.config.levels.find(level => level.level === prev.scoreData.level + 1);
          if (!nextLevelConfig) {
            return {
              ...prev,
              gameState: 'GAME_OVER' as GameState,
              scoreData: updateHighScore(prev.scoreData),
            };
          }
          
          const nextScoreData = nextLevel(prev.scoreData);
          levelStartTimeRef.current = Date.now();
          
          return {
            ...prev,
            gameState: 'AIMING' as GameState,
            scoreData: nextScoreData,
            ballPhysics: createInitialBallPhysics(prev.config, nextLevelConfig),
            platform: createInitialPlatform(prev.config, nextLevelConfig),
            currentLevel: nextLevelConfig,
            levelStartTime: levelStartTimeRef.current,
            lastBounceTime: 0,
            aimData: createInitialAimData(prev.config),
          };

        case 'GAME_OVER':
          return {
            ...prev,
            gameState: 'GAME_OVER' as GameState,
            scoreData: updateHighScore(prev.scoreData),
          };

        case 'UPDATE_TIME':
          const currentTime = Date.now();
          const timeElapsed = (currentTime - prev.levelStartTime) / 1000;
          
          return {
            ...prev,
            scoreData: { ...prev.scoreData, timeElapsed },
          };

        case 'RESET_COMBO':
          return {
            ...prev,
            scoreData: resetCombo(prev.scoreData),
          };

        case 'UPDATE_AIM_DATA':
          return {
            ...prev,
            aimData: { ...prev.aimData, ...action.payload },
          };

        case 'UPDATE_CONTROL_STATE':
          return {
            ...prev,
            controlState: { ...prev.controlState, ...action.payload },
          };

        default:
          return prev;
      }
    });
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    if (gameData.gameState !== 'PLAYING' as GameState) return;

    const deltaTime = (currentTime - lastTimeRef.current) / 16.67;
    lastTimeRef.current = currentTime;

    if (deltaTime < 0.1) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    setGameData(prev => {
      if (prev.gameState !== 'PLAYING' as GameState) return prev;

      const currentTime = Date.now();
      const timeElapsed = (currentTime - prev.levelStartTime) / 1000;
      
      if (timeElapsed >= prev.currentLevel.timeLimit) {
        dispatch({ type: 'LOSE_LIFE' });
        return prev;
      }

      let newBallPhysics = updateBallPhysics(prev.ballPhysics, deltaTime);
      let newCollisionState = { ...prev.collisionState };

      const platformCollision = checkPlatformCollision(newBallPhysics, prev.platform);
      if (platformCollision.hit) {
        newBallPhysics = {
          ...newBallPhysics,
          velocity: platformCollision.newVelocity,
        };
        newCollisionState.platform = true;
        newCollisionState.hitPosition = platformCollision.hitPosition;
        dispatch({ type: 'BALL_BOUNCE', payload: { surface: 'platform', hitPosition: platformCollision.hitPosition } });
      } else {
        newCollisionState.platform = false;
      }

      const wallCollision = checkWallCollision(newBallPhysics, prev.config);
      if (wallCollision.hit) {
        newBallPhysics = {
          ...newBallPhysics,
          velocity: wallCollision.newVelocity,
        };
        newCollisionState.wall = true;
        dispatch({ type: 'BALL_BOUNCE', payload: { surface: 'wall' } });
        dispatch({ type: 'RESET_COMBO' });
      } else {
        newCollisionState.wall = false;
      }

      const ceilingCollision = checkCeilingCollision(newBallPhysics);
      if (ceilingCollision.hit) {
        newBallPhysics = {
          ...newBallPhysics,
          velocity: ceilingCollision.newVelocity,
        };
        newCollisionState.ceiling = true;
        dispatch({ type: 'BALL_BOUNCE', payload: { surface: 'ceiling' } });
        dispatch({ type: 'RESET_COMBO' });
      } else {
        newCollisionState.ceiling = false;
      }

      if (checkFloorCollision(newBallPhysics, prev.config)) {
        dispatch({ type: 'LOSE_LIFE' });
        newCollisionState.floor = true;
        return prev;
      } else {
        newCollisionState.floor = false;
      }

      if (prev.scoreData.bounceCount >= prev.currentLevel.targetBounces) {
        dispatch({ type: 'NEXT_LEVEL' });
        return prev;
      }

      return {
        ...prev,
        ballPhysics: newBallPhysics,
        collisionState: newCollisionState,
        scoreData: { ...prev.scoreData, timeElapsed },
      };
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameData.gameState, dispatch]);

  useEffect(() => {
    if (gameData.gameState === 'PLAYING' as GameState) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameData.gameState, gameLoop]);

  return { gameData, dispatch };
};

export const useControls = (gameData: GameData, dispatch: (action: GameAction) => void) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchDeadzone, setTouchDeadzone] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyboardRef = useRef<{ left: boolean; right: boolean; space: boolean }>({
    left: false,
    right: false,
    space: false,
  });

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keyboardRef.current.left = true;
          dispatch({ type: 'UPDATE_CONTROL_STATE', payload: { inputType: 'keyboard', keyboardLeft: true } });
          break;
        case 'ArrowRight':
        case 'KeyD':
          keyboardRef.current.right = true;
          dispatch({ type: 'UPDATE_CONTROL_STATE', payload: { inputType: 'keyboard', keyboardRight: true } });
          break;
        case 'Space':
          event.preventDefault();
          if (gameData.gameState === 'PLAYING' as GameState) {
            dispatch({ type: 'PAUSE_GAME' });
          } else if (gameData.gameState === 'PAUSED' as GameState) {
            dispatch({ type: 'RESUME_GAME' });
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keyboardRef.current.left = false;
          dispatch({ type: 'UPDATE_CONTROL_STATE', payload: { keyboardLeft: false } });
          break;
        case 'ArrowRight':
        case 'KeyD':
          keyboardRef.current.right = false;
          dispatch({ type: 'UPDATE_CONTROL_STATE', payload: { keyboardRight: false } });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch, gameData.gameState]);

  // Handle keyboard platform movement
  useEffect(() => {
    if (gameData.gameState !== 'PLAYING' as GameState) return;

    const movePlatform = () => {
      let targetX = gameData.platform.x;
      
      if (keyboardRef.current.left) {
        targetX -= gameData.currentLevel.platformSpeed;
      }
      if (keyboardRef.current.right) {
        targetX += gameData.currentLevel.platformSpeed;
      }
      
      if (targetX !== gameData.platform.x) {
        dispatch({ type: 'UPDATE_PLATFORM_POSITION', payload: targetX });
      }
    };

    const interval = setInterval(movePlatform, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gameData.gameState, gameData.platform.x, gameData.currentLevel.platformSpeed, dispatch]);

  // Mouse controls for aiming
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameData.gameState !== 'AIMING' as GameState) return;
    
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    dispatch({ 
      type: 'UPDATE_CONTROL_STATE', 
      payload: { 
        inputType: 'mouse',
        isDragging: true,
        dragStartX: mouseX,
        dragStartY: mouseY,
        currentX: mouseX,
        currentY: mouseY,
      } 
    });
  }, [dispatch, gameData.gameState]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameData.gameState === 'AIMING' as GameState && gameData.controlState.isDragging) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const angle = calculateAimAngle(
        gameData.controlState.dragStartX,
        gameData.controlState.dragStartY,
        mouseX,
        mouseY
      );
      
      const power = calculateAimPower(
        gameData.controlState.dragStartX,
        gameData.controlState.dragStartY,
        mouseX,
        mouseY
      );
      
      dispatch({ 
        type: 'UPDATE_AIM_DATA', 
        payload: { 
          angle,
          power,
          endX: mouseX,
          endY: mouseY,
        } 
      });
      
      dispatch({ 
        type: 'UPDATE_CONTROL_STATE', 
        payload: { 
          currentX: mouseX,
          currentY: mouseY,
        } 
      });
    } else if (gameData.gameState === 'PLAYING' as GameState) {
      // Platform control during gameplay
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      
      dispatch({ type: 'UPDATE_PLATFORM_POSITION', payload: mouseX });
    }
  }, [dispatch, gameData]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameData.gameState === 'AIMING' as GameState && gameData.controlState.isDragging) {
      dispatch({ 
        type: 'LAUNCH_BALL', 
        payload: { 
          angle: gameData.aimData.angle, 
          power: gameData.aimData.power 
        } 
      });
      
      dispatch({ 
        type: 'UPDATE_CONTROL_STATE', 
        payload: { 
          isDragging: false,
        } 
      });
    }
  }, [dispatch, gameData]);

  // Touch controls
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (gameData.gameState === 'AIMING' as GameState) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      dispatch({ 
        type: 'UPDATE_CONTROL_STATE', 
        payload: { 
          inputType: 'touch',
          isDragging: true,
          dragStartX: touchX,
          dragStartY: touchY,
          currentX: touchX,
          currentY: touchY,
        } 
      });
    } else if (gameData.gameState === 'PLAYING' as GameState) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const touchX = touch.clientX - rect.left;
      
      // Check if touch is in left or right side of screen
      const screenWidth = rect.width;
      if (touchX < screenWidth / 3) {
        // Left side
        dispatch({ type: 'UPDATE_CONTROL_STATE', payload: { keyboardLeft: true } });
      } else if (touchX > (screenWidth * 2) / 3) {
        // Right side
        dispatch({ type: 'UPDATE_CONTROL_STATE', payload: { keyboardRight: true } });
      } else {
        // Center - direct platform control
        dispatch({ type: 'UPDATE_PLATFORM_POSITION', payload: touchX });
      }
    }
  }, [dispatch, gameData.gameState]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (gameData.gameState === 'AIMING' as GameState && gameData.controlState.isDragging) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      const angle = calculateAimAngle(
        gameData.controlState.dragStartX,
        gameData.controlState.dragStartY,
        touchX,
        touchY
      );
      
      const power = calculateAimPower(
        gameData.controlState.dragStartX,
        gameData.controlState.dragStartY,
        touchX,
        touchY
      );
      
      dispatch({ 
        type: 'UPDATE_AIM_DATA', 
        payload: { 
          angle,
          power,
          endX: touchX,
          endY: touchY,
        } 
      });
      
      dispatch({ 
        type: 'UPDATE_CONTROL_STATE', 
        payload: { 
          currentX: touchX,
          currentY: touchY,
        } 
      });
    } else if (gameData.gameState === 'PLAYING' as GameState) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const touchX = touch.clientX - rect.left;
      
      dispatch({ type: 'UPDATE_PLATFORM_POSITION', payload: touchX });
    }
  }, [dispatch, gameData]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (gameData.gameState === 'AIMING' as GameState && gameData.controlState.isDragging) {
      dispatch({ 
        type: 'LAUNCH_BALL', 
        payload: { 
          angle: gameData.aimData.angle, 
          power: gameData.aimData.power 
        } 
      });
      
      dispatch({ 
        type: 'UPDATE_CONTROL_STATE', 
        payload: { 
          isDragging: false,
        } 
      });
    } else if (gameData.gameState === 'PLAYING' as GameState) {
      dispatch({ 
        type: 'UPDATE_CONTROL_STATE', 
        payload: { 
          keyboardLeft: false,
          keyboardRight: false,
        } 
      });
    }
  }, [dispatch, gameData]);

  // Calculate trajectory points for preview
  const trajectoryPoints = calculateTrajectoryPoints(
    gameData.aimData.startX,
    gameData.aimData.startY,
    gameData.aimData.angle,
    gameData.aimData.power,
    gameData.config
  );

  return {
    canvasRef,
    isTouchDevice,
    touchDeadzone,
    trajectoryPoints,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
