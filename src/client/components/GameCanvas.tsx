import React, { useRef, useEffect } from 'react';
import type { GameData, BallPosition } from '../types/game';
import {
  drawGradientBall,
  drawGradientPlatform,
  drawBackground,
  drawWalls,
  createParticleEffect,
  updateParticles,
  getScreenShakeOffset,
  updateVisualEffects,
  updateBallTrail,
} from '../utils/visualEffects';
import { getPowerUpIcon, getPowerUpColor, getObstacleColor } from '../utils/powerUps';

type GameCanvasProps = {
  gameData: GameData;
  trajectoryPoints: BallPosition[];
  onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchStart: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLCanvasElement>) => void;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameData,
  trajectoryPoints,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { config, ballPhysics, platform, collisionState, scoreData, currentLevel, aimData, controlState, visualEffects, ballTrail, screenShake, powerUps, obstacles, multiBalls } = gameData;

    // Get screen shake offset
    const shakeOffset = getScreenShakeOffset(screenShake);

    // Apply screen shake transform
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // Clear canvas
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Draw background
    drawBackground(ctx, config.canvasWidth, config.canvasHeight);

    // Draw walls
    drawWalls(ctx, config.canvasWidth, config.canvasHeight);

    // Draw ball trail
    if (ballTrail.length > 1) {
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ballTrail[0]!.x, ballTrail[0]!.y);
      for (let i = 1; i < ballTrail.length; i++) {
        const alpha = i / ballTrail.length;
        ctx.strokeStyle = `rgba(255, 107, 107, ${alpha * 0.3})`;
        ctx.lineTo(ballTrail[i]!.x, ballTrail[i]!.y);
      }
      ctx.stroke();
    }

    // Check if ball is near platform for proximity effect
    const ballPlatformDistance = Math.abs(ballPhysics.position.x - platform.x);
    const isNearPlatform = ballPlatformDistance < 50;

    // Draw platform
    drawGradientPlatform(ctx, platform.x, platform.y, platform.width, platform.height, isNearPlatform);

    // Draw ball
    drawGradientBall(ctx, ballPhysics.position.x, ballPhysics.position.y, ballPhysics.radius, ballPhysics.velocity);

    // Draw multi-balls
    multiBalls.forEach(ball => {
      drawGradientBall(ctx, ball.position.x, ball.position.y, ball.radius, ball.velocity);
    });

    // Draw obstacles
    obstacles.forEach(obstacle => {
      const color = getObstacleColor(obstacle.type);
      
      if (obstacle.type === 'breakable-brick') {
        // Draw breakable brick with health indicator
        const healthRatio = (obstacle.health || 1) / (obstacle.maxHealth || 1);
        const alpha = 0.3 + (healthRatio * 0.7);
        
        ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
        ctx.fillRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2,
          obstacle.width,
          obstacle.height
        );
        
        // Health bar
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2 - 5,
          obstacle.width * healthRatio,
          3
        );
      } else if (obstacle.type === 'speed-boost') {
        // Draw speed boost zone with pulsing effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 255, 0, ${pulse * 0.5})`;
        ctx.fillRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2,
          obstacle.width,
          obstacle.height
        );
        
        // Speed boost icon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', obstacle.x, obstacle.y + 5);
      } else {
        // Regular obstacle
        ctx.fillStyle = color;
        ctx.fillRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2,
          obstacle.width,
          obstacle.height
        );
      }
    });

    // Draw power-ups
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;
      
      const color = getPowerUpColor(powerUp.type);
      const icon = getPowerUpIcon(powerUp.type);
      
      // Power-up glow effect
      const glow = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Power-up icon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(icon, powerUp.x, powerUp.y + 6);
      
      // Collection indicator
      const timeLeft = powerUp.duration - (Date.now() - powerUp.startTime);
      if (timeLeft < 3000) { // Last 3 seconds
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw combo indicator
    if (scoreData.consecutiveBounces > 1) {
      const comboAlpha = Math.min(0.8, scoreData.consecutiveBounces / 10);
      ctx.fillStyle = `rgba(255, 0, 255, ${comboAlpha})`;
      ctx.beginPath();
      ctx.arc(ballPhysics.position.x, ballPhysics.position.y, ballPhysics.radius + 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw level-specific visual effects
    if (currentLevel.level >= 3) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * config.canvasWidth;
        const y = Math.random() * config.canvasHeight;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw aiming indicator and trajectory preview
    if (gameData.gameState === 'AIMING' && controlState.isDragging) {
      // Aiming line with gradient
      const gradient = ctx.createLinearGradient(aimData.startX, aimData.startY, aimData.endX, aimData.endY);
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#ffff00');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(aimData.startX, aimData.startY);
      ctx.lineTo(aimData.endX, aimData.endY);
      ctx.stroke();

      // Arrow head
      const angleRad = Math.atan2(aimData.endY - aimData.startY, aimData.endX - aimData.startX);
      ctx.save();
      ctx.translate(aimData.endX, aimData.endY);
      ctx.rotate(angleRad);
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-15, -8);
      ctx.lineTo(-15, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Trajectory preview (dotted line)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      if (trajectoryPoints.length > 0) {
        ctx.moveTo(trajectoryPoints[0]!.x, trajectoryPoints[0]!.y);
        for (let i = 1; i < trajectoryPoints.length; i++) {
          ctx.lineTo(trajectoryPoints[i]!.x, trajectoryPoints[i]!.y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Power meter with gradient
      const power = aimData.power;
      const powerHeight = power * 0.8; // Max height 80px
      const powerGradient = ctx.createLinearGradient(config.canvasWidth - 40, 10, config.canvasWidth - 40, 10 + powerHeight);
      
      if (power < 30) {
        powerGradient.addColorStop(0, '#ff0000');
        powerGradient.addColorStop(1, '#cc0000');
      } else if (power < 70) {
        powerGradient.addColorStop(0, '#ffff00');
        powerGradient.addColorStop(1, '#cccc00');
      } else {
        powerGradient.addColorStop(0, '#00ff00');
        powerGradient.addColorStop(1, '#00cc00');
      }

      ctx.fillStyle = powerGradient;
      ctx.fillRect(config.canvasWidth - 40, 10, 30, powerHeight);
      
      // Power meter border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(config.canvasWidth - 40, 10, 30, 80);
    }

    // Draw visual effects
    visualEffects.forEach(effect => {
      if (effect.type === 'particle' && effect.data) {
        effect.data.forEach((particle: any) => {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    });

    // Draw touch zones for mobile
    if (controlState.inputType === 'touch' && gameData.gameState === 'PLAYING') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      const screenWidth = config.canvasWidth;
      const zoneWidth = screenWidth / 3;

      // Left zone
      ctx.fillRect(0, 0, zoneWidth, config.canvasHeight);
      // Right zone
      ctx.fillRect(screenWidth - zoneWidth, 0, zoneWidth, config.canvasHeight);
      // Center zone
      ctx.fillRect(zoneWidth, 0, zoneWidth, config.canvasHeight);
    }

    // Restore transform
    ctx.restore();

  }, [gameData, trajectoryPoints]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={gameData.config.canvasWidth}
        height={gameData.config.canvasHeight}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="border-2 border-gray-600 rounded-xl cursor-pointer shadow-2xl bg-gray-800"
        style={{ 
          touchAction: 'none',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      
      {/* Canvas overlay for additional UI elements */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        {/* Level indicator */}
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-bold">
          Level {gameData.scoreData.level}
        </div>
        
        {/* Lives indicator */}
        <div className="flex space-x-1">
          {Array.from({ length: gameData.scoreData.lives }).map((_, i) => (
            <div key={i} className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          ))}
        </div>
        
        {/* Pause button */}
        {gameData.gameState === 'PLAYING' && (
          <button
            onClick={() => {/* Handle pause */}}
            className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-bold pointer-events-auto hover:bg-opacity-70"
          >
            ⏸️
          </button>
        )}
      </div>
    </div>
  );
};
