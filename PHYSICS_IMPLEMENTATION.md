# Bounce Game Physics Implementation

## Overview

This document describes the physics implementation for the Bounce Original game, including ball physics, collision detection, and the game loop.

## Physics Specifications

### Ball Physics
- **Starting Position**: Bottom center of screen (above platform)
- **Initial Velocity**: User-controlled angle (15°-75°) and power (3-12)
- **Gravity**: 9.8 m/s² (scaled for pixels)
- **Bounce Coefficient**: 0.75 (energy loss on bounce)
- **Ball Radius**: 20px
- **Maximum Velocity**: 15 pixels/frame (prevents unrealistic speeds)

### Platform/Paddle
- **Dimensions**: 100px width × 15px height
- **Position**: Bottom of screen, 50px from floor
- **Movement**: User-controlled horizontal movement
- **Speed**: 8px per frame
- **Collision**: Precise collision detection with ball

## Game Loop Implementation

### Frame Rate
- Uses `requestAnimationFrame` for smooth 60fps
- Delta time normalization for consistent physics
- Skips very small time steps (< 0.1ms)

### Physics Update Order
1. **Ball Physics Update**: Apply gravity and update position
2. **Collision Detection**: Check all collision types
3. **Collision Response**: Apply bounce physics
4. **State Updates**: Update game state and scores

## Collision System

### Collision Types

#### 1. Ball-to-Wall Collisions
- **Detection**: Ball radius touches left/right walls
- **Response**: Reverse X velocity with bounce coefficient
- **Energy Loss**: Applied through bounce coefficient

#### 2. Ball-to-Ceiling Collision
- **Detection**: Ball radius touches top of screen
- **Response**: Reverse Y velocity with bounce coefficient
- **Energy Loss**: Applied through bounce coefficient

#### 3. Ball-to-Platform Collision
- **Detection**: Ball overlaps with platform bounds
- **Response**: Angle-based bounce based on hit position
- **Hit Position**: Relative position on platform (-1 to 1)
- **Bounce Angle**: Maximum 45° based on hit position
- **Energy Loss**: Applied through bounce coefficient

#### 4. Ball-to-Floor Collision
- **Detection**: Ball touches bottom of screen
- **Response**: Game over (if platform missed)

## Physics Calculations

### Ball Launch
```typescript
const angleRad = (angle * Math.PI) / 180;
const initialVelocity = {
  vx: Math.sin(angleRad) * power,
  vy: -Math.cos(angleRad) * power, // Negative for upward
};
```

### Gravity Application
```typescript
const newVelocityY = ballPhysics.velocity.vy + ballPhysics.gravity * deltaTime;
```

### Velocity Clamping
```typescript
const clampedVelocity = {
  vx: Math.max(-maxVelocity, Math.min(maxVelocity, velocity.vx)),
  vy: Math.max(-maxVelocity, Math.min(maxVelocity, velocity.y)),
};
```

### Platform Bounce Calculation
```typescript
const hitPosition = (ballX - platformX) / (platformWidth / 2);
const bounceAngle = hitPosition * Math.PI / 4; // Max 45°
const bounceSpeed = Math.sqrt(vx² + vy²) * bounceCoefficient;
const newVelocity = {
  vx: Math.sin(bounceAngle) * bounceSpeed,
  vy: -Math.abs(Math.cos(bounceAngle) * bounceSpeed),
};
```

## useGamePhysics Hook

### Purpose
Manages all physics calculations and game state updates.

### Key Features
- **State Management**: Complete game state with physics data
- **Game Loop**: 60fps physics loop with collision detection
- **Action Dispatch**: Handles all game actions and state updates
- **Performance**: Optimized with proper cleanup and frame limiting

### State Structure
```typescript
type GameData = {
  gameState: 'initial' | 'playing' | 'paused' | 'gameOver';
  score: { current: number; highScore: number; level: number; bounces: number };
  ballPhysics: BallPhysics;
  platform: Platform;
  config: GameConfig;
  collisionState: CollisionState;
};
```

### Actions Supported
- `START_GAME`: Initialize game state
- `PAUSE_GAME` / `RESUME_GAME`: Control game flow
- `RESET_GAME`: Reset to initial state
- `LAUNCH_BALL`: Launch ball with angle and power
- `UPDATE_PLATFORM_POSITION`: Move platform
- `BALL_BOUNCE`: Handle collision events

## Performance Optimizations

### Frame Rate Control
- Delta time normalization for consistent physics
- Skip small time steps to prevent jitter
- Proper cleanup of animation frames

### Collision Detection
- Efficient AABB (Axis-Aligned Bounding Box) collision detection
- Collision priority system (platform > walls > ceiling > floor)
- Single collision check per frame per surface

### Memory Management
- Immutable state updates
- Proper cleanup of event listeners
- Efficient re-rendering with React optimization

## Visual Effects

### Ball Trail
- Velocity-based trail length
- Opacity based on speed
- Smooth visual feedback

### Collision Indicators
- Platform highlight on collision
- Velocity vector visualization (debug mode)
- Glow effects for visual appeal

## Configuration

### Adjustable Parameters
- Ball radius: 20px
- Platform dimensions: 100×15px
- Gravity: 9.8 m/s²
- Bounce coefficient: 0.75
- Maximum velocity: 15 px/frame
- Platform speed: 8 px/frame

### Game Balance
- Score calculation: `level × bounces × 10`
- Level progression: Every 100 points
- Difficulty scaling through level progression

## TypeScript Integration

### Type Safety
- Complete type definitions for all physics objects
- Action type safety with discriminated unions
- Collision state tracking with optional properties

### Error Prevention
- Bounds checking for all calculations
- Clamping of user inputs
- Validation of physics parameters

This physics implementation provides a realistic and engaging ball bouncing experience with proper collision detection, energy conservation, and smooth 60fps gameplay.
