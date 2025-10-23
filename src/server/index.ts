import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse, GameInitResponse, GameUpdateResponse, GameActionRequest } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

// Game API endpoints
router.get<{ postId: string }, GameInitResponse | { status: string; message: string }>(
  '/api/game/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('Game Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [gameData, username] = await Promise.all([
        redis.get(`game:${postId}`),
        reddit.getCurrentUsername(),
      ]);

      const defaultGameData = {
        gameState: 'initial' as const,
        score: 0,
        highScore: 0,
        level: 1,
      };

      const parsedGameData = gameData ? JSON.parse(gameData) : defaultGameData;

      res.json({
        type: 'gameInit',
        postId: postId,
        gameData: parsedGameData,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`Game Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during game initialization';
      if (error instanceof Error) {
        errorMessage = `Game initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, GameUpdateResponse | { status: string; message: string }, GameActionRequest>(
  '/api/game/action',
  async (req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    try {
      const { action, score, highScore, level } = req.body;
      
      // Get current game data
      const currentGameData = await redis.get(`game:${postId}`);
      const gameData = currentGameData ? JSON.parse(currentGameData) : {
        gameState: 'initial',
        score: 0,
        highScore: 0,
        level: 1,
      };

      // Update game data based on action
      switch (action) {
        case 'start':
          gameData.gameState = 'playing';
          gameData.score = 0;
          break;
        case 'pause':
          gameData.gameState = 'paused';
          break;
        case 'resume':
          gameData.gameState = 'playing';
          break;
        case 'reset':
          gameData.gameState = 'initial';
          gameData.score = 0;
          break;
        case 'updateScore':
          if (score !== undefined) gameData.score = score;
          if (highScore !== undefined) gameData.highScore = Math.max(gameData.highScore, highScore);
          if (level !== undefined) gameData.level = level;
          break;
      }

      // Save updated game data
      await redis.set(`game:${postId}`, JSON.stringify(gameData));

      res.json({
        type: 'gameUpdate',
        postId,
        gameData,
      });
    } catch (error) {
      console.error(`Game Action Error for post ${postId}:`, error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to process game action',
      });
    }
  }
);

// High Score API
router.get<{ postId: string }, { highScore: number } | { status: string; message: string }>(
  '/api/game/highscore',
  async (_req, res): Promise<void> => {
    try {
      const highScore = await redis.get('highScore');
      res.json({
        highScore: highScore ? parseInt(highScore) : 0,
      });
    } catch (error) {
      console.error('High Score Error:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to get high score',
      });
    }
  }
);

router.post<{ postId: string }, { success: boolean } | { status: string; message: string }, { score: number }>(
  '/api/game/highscore',
  async (req, res): Promise<void> => {
    try {
      const { score } = req.body;
      const currentHighScore = await redis.get('highScore');
      const currentHigh = currentHighScore ? parseInt(currentHighScore) : 0;
      
      if (score > currentHigh) {
        await redis.set('highScore', score.toString());
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error('High Score Update Error:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to update high score',
      });
    }
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
