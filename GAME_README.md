# Bounce Original - Reddit Devvit Game

A classic bounce ball game built as a Reddit Devvit app using React and TypeScript.

## Project Structure

```
src/
├── client/                 # Client-side React application
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── server/                # Server-side API
│   ├── index.ts           # Main server file
│   └── core/
│       └── post.ts        # Post creation logic
├── shared/                # Shared types and utilities
│   └── types/
│       └── api.ts         # API type definitions
├── components/            # React game components
│   ├── BounceGame.tsx    # Main game component
│   ├── GameCanvas.tsx    # Canvas rendering component
│   ├── GameUI.tsx        # Game UI and controls
│   └── index.ts          # Component exports
├── hooks/                # Custom React hooks
│   ├── useGame.ts        # Game state management
│   ├── useGameAPI.ts     # Server API integration
│   └── index.ts          # Hook exports
├── utils/                # Utility functions
│   ├── gameLogic.ts      # Game physics and logic
│   └── index.ts          # Utility exports
└── types/                # TypeScript type definitions
    ├── game.ts           # Game-specific types
    └── index.ts          # Type exports
```

## Features

- **Classic Bounce Game**: Control a paddle to keep a ball bouncing
- **Score System**: Track current score, high score, and level progression
- **Responsive Design**: Works on desktop and mobile devices
- **Game States**: Initial, playing, paused, and game over states
- **Smooth Animation**: 60fps game loop with smooth ball physics
- **Touch Support**: Mouse and touch controls for paddle movement

## Game Mechanics

- **Ball Physics**: Realistic gravity and bounce mechanics
- **Paddle Control**: Move mouse/touch to control paddle position
- **Collision Detection**: Ball bounces off walls, paddle, and ground
- **Score Calculation**: Points based on level and number of bounces
- **Level Progression**: Levels increase every 100 points

## Devvit Integration

- **Custom Post Type**: Creates interactive game posts in subreddits
- **Server API**: Game state persistence using Redis
- **React Runtime**: Full React support with hooks and state management
- **Responsive Canvas**: Adapts to different Reddit viewport sizes

## Development

### Prerequisites
- Node.js 18+
- Devvit CLI

### Setup
1. Install dependencies: `npm install`
2. Login to Devvit: `npm run login`
3. Start development: `npm run dev`

### Build and Deploy
1. Build the project: `npm run build`
2. Deploy to Devvit: `npm run deploy`
3. Publish the app: `npm run launch`

## API Endpoints

- `GET /api/game/init` - Initialize game state
- `POST /api/game/action` - Send game actions (start, pause, resume, reset, updateScore)

## Game Controls

- **Mouse/Touch**: Move paddle horizontally
- **Start Game**: Click "Start Game" button
- **Pause/Resume**: Use pause/resume buttons
- **Reset**: Reset game to initial state

## Technical Details

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas for game rendering
- **State Management**: Custom hooks with useReducer pattern
- **Physics**: Custom collision detection and ball physics
- **Backend**: Express.js with Redis for persistence

## Compatibility

- Works within Reddit's iframe environment
- Responsive design for different screen sizes
- Touch and mouse input support
- Optimized for Devvit's rendering constraints
