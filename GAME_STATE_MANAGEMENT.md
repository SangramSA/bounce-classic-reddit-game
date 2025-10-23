# Game State Management System

## Overview

This document describes the comprehensive game state management system implemented for Bounce Original, including game states, score calculation, level progression, and KV store integration.

## Game States (Enum)

The game uses a comprehensive state system with the following states:

```typescript
enum GameState {
  MENU = 'MENU',           // Initial screen
  AIMING = 'AIMING',       // Player setting launch angle/power
  PLAYING = 'PLAYING',     // Ball in motion
  PAUSED = 'PAUSED',       // Game paused
  GAME_OVER = 'GAME_OVER', // Game ended
  LEVEL_COMPLETE = 'LEVEL_COMPLETE', // Level finished successfully
}
```

## Game State Interface

### ScoreData Interface
```typescript
type ScoreData = {
  score: number;              // Current score
  lives: number;              // Lives remaining (start with 3)
  level: number;              // Current level
  highScore: number;          // High score (persisted in KV store)
  bounceCount: number;        // Total bounces in current level
  timeElapsed: number;        // Time elapsed in current level
  multiplier: number;         // Combo multiplier
  consecutiveBounces: number; // Consecutive platform bounces
  comboCount: number;         // Total combos achieved
};
```

### GameData Interface
```typescript
type GameData = {
  gameState: GameState;       // Current game state
  scoreData: ScoreData;       // All score-related data
  ballPhysics: BallPhysics;   // Ball position, velocity, physics
  platform: Platform;        // Platform position and properties
  config: GameConfig;         // Game configuration
  collisionState: CollisionState; // Current collision states
  currentLevel: LevelConfig;  // Current level configuration
  levelStartTime: number;     // When current level started
  lastBounceTime: number;     // Last bounce timestamp
};
```

## Level Progression System

### Level Configuration
Each level has specific difficulty parameters:

```typescript
type LevelConfig = {
  level: number;              // Level number (1-5)
  ballSpeed: number;          // Initial ball speed
  platformWidth: number;     // Platform width (decreases with level)
  platformSpeed: number;     // Platform movement speed
  gravity: number;            // Gravity strength
  bounceCoefficient: number;  // Energy retention on bounce
  targetBounces: number;     // Bounces needed to complete level
  timeLimit: number;          // Time limit in seconds
};
```

### Level Difficulty Progression
- **Level 1**: 100px platform, 10 target bounces, 60s time limit
- **Level 2**: 90px platform, 15 target bounces, 55s time limit
- **Level 3**: 80px platform, 20 target bounces, 50s time limit
- **Level 4**: 70px platform, 25 target bounces, 45s time limit
- **Level 5**: 60px platform, 30 target bounces, 40s time limit

## Score Calculation System

### Base Scoring
- **Base points per bounce**: 10 points
- **Center platform hit bonus**: Up to 5 additional points based on hit position
- **Combo multiplier**: Increases with consecutive platform bounces

### Combo System
```typescript
const calculateComboMultiplier = (consecutiveBounces: number): number => {
  if (consecutiveBounces <= 1) return 1;
  if (consecutiveBounces <= 3) return 1.5;
  if (consecutiveBounces <= 5) return 2;
  if (consecutiveBounces <= 10) return 2.5;
  return 3; // Maximum 3x multiplier
};
```

### Bonus Scoring
- **Level completion bonus**: 100 points for reaching target bounces
- **Time bonus**: 2 points per second remaining when level completes
- **Combo reset**: Consecutive bounces reset on wall/ceiling hits

## useGameState Hook

### Purpose
Centralized state management for the entire game with comprehensive action handling.

### Key Features
- **State Management**: Complete game state with all game data
- **Action Dispatch**: Handles all game actions and state transitions
- **Game Loop**: 60fps physics loop with collision detection
- **Level Progression**: Automatic level advancement and difficulty scaling
- **Life Management**: Tracks lives and handles game over conditions

### Available Methods
```typescript
const {
  gameData,
  dispatch,
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
  enterAiming,
  launchBall,
  updateScore,
  loseLife,
  nextLevel,
} = useGameState();
```

### Action Types
- `START_GAME`: Initialize game and enter aiming state
- `ENTER_AIMING`: Return to aiming state
- `LAUNCH_BALL`: Launch ball with specified angle and power
- `PAUSE_GAME` / `RESUME_GAME`: Control game flow
- `RESET_GAME`: Reset to initial state
- `BALL_BOUNCE`: Handle collision events and score updates
- `LOSE_LIFE`: Decrement lives and handle game over
- `NEXT_LEVEL`: Advance to next level
- `UPDATE_TIME`: Update elapsed time

## KV Store Integration

### High Score Persistence
The game uses Devvit's Redis KV store to persist high scores across sessions.

### API Endpoints
- `GET /api/game/highscore`: Retrieve current high score
- `POST /api/game/highscore`: Update high score if new score is higher

### useKVStore Hook
```typescript
const { getHighScore, updateHighScore, loading, error } = useKVStore();
```

## State Transitions

### Game Flow
1. **MENU** → **AIMING**: User clicks "Start Game"
2. **AIMING** → **PLAYING**: User launches ball
3. **PLAYING** → **PAUSED**: User clicks pause
4. **PAUSED** → **PLAYING**: User clicks resume
5. **PLAYING** → **LEVEL_COMPLETE**: Target bounces reached
6. **LEVEL_COMPLETE** → **AIMING**: User clicks "Next Level"
7. **PLAYING** → **GAME_OVER**: Lives exhausted or time limit reached
8. **GAME_OVER** → **MENU**: User clicks "Main Menu"

### Life Management
- Start with 3 lives
- Lose 1 life when ball hits floor
- Game over when all lives are lost
- Lives reset on game restart

## Performance Optimizations

### State Updates
- Immutable state updates using spread operator
- Efficient re-rendering with React optimization
- Proper cleanup of animation frames

### Memory Management
- Single source of truth for game state
- Efficient collision detection
- Optimized rendering with canvas context reuse

## Visual Enhancements

### Level-Specific Effects
- **Level 1-2**: Basic visual effects
- **Level 3+**: Particle effects and enhanced visuals
- **Combo indicators**: Visual feedback for consecutive bounces
- **Progress bars**: Real-time level completion progress

### UI Improvements
- **Comprehensive stats display**: Score, lives, level, combo, time
- **Level progress bar**: Visual progress toward target bounces
- **Time countdown**: Real-time time remaining display
- **Combo multiplier display**: Current combo multiplier

## Error Handling

### State Validation
- Type safety with TypeScript
- Bounds checking for all calculations
- Validation of user inputs

### Error Recovery
- Graceful handling of API failures
- Fallback values for missing data
- Proper error logging and user feedback

This comprehensive state management system provides a robust foundation for the Bounce Original game with proper separation of concerns, type safety, and scalable architecture.
