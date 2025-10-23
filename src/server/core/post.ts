import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'Bounce Original',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Play Game',
      description: 'A classic bounce ball game experience',
      entryUri: 'index.html',
      heading: 'Welcome to Bounce Original!',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
      highScore: 0,
      level: 1,
    },
    subredditName: subredditName,
    title: 'Bounce Original - Interactive Ball Game',
  });
};
