import type { BallPosition, VisualEffect, ParticleEffect, BallPhysics } from '../types/game';

export const createParticleEffect = (
  x: number,
  y: number,
  count: number = 8,
  colors: string[] = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
): ParticleEffect[] => {
  const particles: ParticleEffect[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  
  return particles;
};

export const updateParticles = (particles: ParticleEffect[], deltaTime: number): ParticleEffect[] => {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime,
      y: particle.y + particle.vy * deltaTime,
      life: particle.life - deltaTime * 0.02,
      vx: particle.vx * 0.98,
      vy: particle.vy * 0.98,
    }))
    .filter(particle => particle.life > 0);
};

export const createVisualEffect = (
  type: 'particle' | 'flash' | 'shake' | 'popup',
  x: number,
  y: number,
  duration: number = 1000,
  data?: any
): VisualEffect => ({
  id: `${type}_${Date.now()}_${Math.random()}`,
  type,
  x,
  y,
  duration,
  startTime: Date.now(),
  data,
});

export const updateVisualEffects = (effects: VisualEffect[]): VisualEffect[] => {
  const now = Date.now();
  return effects.filter(effect => now - effect.startTime < effect.duration);
};

export const createBallTrail = (ball: BallPhysics, maxLength: number = 10): BallPosition[] => {
  return [ball.position];
};

export const updateBallTrail = (trail: BallPosition[], newPosition: BallPosition, maxLength: number = 10): BallPosition[] => {
  const newTrail = [...trail, newPosition];
  return newTrail.length > maxLength ? newTrail.slice(-maxLength) : newTrail;
};

export const getScreenShakeOffset = (screenShake: { intensity: number; duration: number; startTime: number }): { x: number; y: number } => {
  const now = Date.now();
  const elapsed = now - screenShake.startTime;
  
  if (elapsed >= screenShake.duration) {
    return { x: 0, y: 0 };
  }
  
  const progress = elapsed / screenShake.duration;
  const intensity = screenShake.intensity * (1 - progress);
  
  return {
    x: (Math.random() - 0.5) * intensity,
    y: (Math.random() - 0.5) * intensity,
  };
};

export const drawGradientBall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  velocity: { vx: number; vy: number }
): void => {
  const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#ff6b6b');
  gradient.addColorStop(1, '#e74c3c');
  
  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  // Highlight
  const highlightGradient = ctx.createRadialGradient(x - radius * 0.4, y - radius * 0.4, 0, x - radius * 0.4, y - radius * 0.4, radius * 0.3);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.arc(x - radius * 0.4, y - radius * 0.4, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
};

export const drawGradientPlatform = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isNearBall: boolean = false
): void => {
  const gradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
  
  if (isNearBall) {
    gradient.addColorStop(0, '#f39c12');
    gradient.addColorStop(0.5, '#e67e22');
    gradient.addColorStop(1, '#d35400');
  } else {
    gradient.addColorStop(0, '#2ecc71');
    gradient.addColorStop(0.5, '#27ae60');
    gradient.addColorStop(1, '#229954');
  }
  
  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  
  ctx.restore();
  
  // Highlight
  const highlightGradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x - width / 2, y + height / 2);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
};

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  // Main background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#2c3e50');
  gradient.addColorStop(0.5, '#34495e');
  gradient.addColorStop(1, '#2c3e50');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  
  const gridSize = 50;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

export const drawWalls = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  const wallGradient = ctx.createLinearGradient(0, 0, 0, 10);
  wallGradient.addColorStop(0, '#34495e');
  wallGradient.addColorStop(1, '#2c3e50');
  
  ctx.fillStyle = wallGradient;
  
  // Top wall
  ctx.fillRect(0, 0, width, 10);
  // Bottom wall
  ctx.fillRect(0, height - 10, width, 10);
  // Left wall
  ctx.fillRect(0, 0, 10, height);
  // Right wall
  ctx.fillRect(width - 10, 0, 10, height);
  
  // Wall highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 0, width, 2);
  ctx.fillRect(0, height - 2, width, 2);
  ctx.fillRect(0, 0, 2, height);
  ctx.fillRect(width - 2, 0, 2, height);
};
