import type { AudioSettings, SoundEffect } from '../types/game';

// Audio utilities with visual fallbacks
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private settings: AudioSettings;

  constructor(settings: AudioSettings) {
    this.settings = settings;
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Check if Web Audio API is available
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new AudioContext();
        await this.createSoundEffects();
      }
    } catch (error) {
      console.log('Audio not available, using visual fallbacks');
    }
  }

  private async createSoundEffects(): Promise<void> {
    if (!this.audioContext) return;

    const sounds = [
      { id: 'bounce_paddle', frequency: 440, duration: 0.1 },
      { id: 'bounce_wall', frequency: 330, duration: 0.15 },
      { id: 'bounce_floor', frequency: 220, duration: 0.3 },
      { id: 'powerup_collect', frequency: 660, duration: 0.2 },
      { id: 'level_complete', frequency: 880, duration: 0.5 },
      { id: 'game_over', frequency: 110, duration: 1.0 },
      { id: 'high_score', frequency: 1320, duration: 0.3 },
      { id: 'achievement', frequency: 1760, duration: 0.4 },
    ];

    for (const sound of sounds) {
      const buffer = this.createTone(sound.frequency, sound.duration);
      this.sounds.set(sound.id, buffer);
    }
  }

  private createTone(frequency: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    }

    return buffer;
  }

  public playSound(soundId: string): void {
    if (!this.settings.enabled || this.settings.mute) {
      this.showVisualFeedback(soundId);
      return;
    }

    if (this.audioContext && this.sounds.has(soundId)) {
      try {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds.get(soundId)!;
        gainNode.gain.value = this.settings.volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
      } catch (error) {
        console.log('Audio playback failed, using visual feedback');
        this.showVisualFeedback(soundId);
      }
    } else {
      this.showVisualFeedback(soundId);
    }
  }

  private showVisualFeedback(soundId: string): void {
    // Create visual sound wave indicator
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Create sound wave effect
    const waveCount = 3;
    const maxRadius = 100;
    
    for (let i = 0; i < waveCount; i++) {
      setTimeout(() => {
        this.drawSoundWave(ctx, centerX, centerY, maxRadius, i * 0.3);
      }, i * 100);
    }

    // Screen flash for important sounds
    if (['bounce_floor', 'game_over', 'high_score', 'achievement'].includes(soundId)) {
      this.flashScreen(soundId);
    }
  }

  private drawSoundWave(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    maxRadius: number,
    delay: number
  ): void {
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) return;

      const radius = maxRadius * progress;
      const alpha = 1 - progress;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(animate);
    };

    setTimeout(animate, delay * 1000);
  }

  private flashScreen(soundId: string): void {
    const colors: Record<string, string> = {
      'bounce_floor': 'rgba(255, 0, 0, 0.3)',
      'game_over': 'rgba(255, 0, 0, 0.5)',
      'high_score': 'rgba(255, 215, 0, 0.4)',
      'achievement': 'rgba(0, 255, 0, 0.4)',
    };

    const color = colors[soundId] || 'rgba(255, 255, 255, 0.3)';
    
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = color;
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'opacity 0.2s ease-out';

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 200);
    }, 100);
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getSettings(): AudioSettings {
    return this.settings;
  }
}

// Visual feedback utilities for when audio is not available
export const createVisualSoundIndicator = (
  canvas: HTMLCanvasElement,
  soundId: string,
  intensity: number = 1
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Create pulsing circle effect
  const pulseCount = 3;
  const maxRadius = 50 * intensity;

  for (let i = 0; i < pulseCount; i++) {
    setTimeout(() => {
      animatePulse(ctx, centerX, centerY, maxRadius, i * 0.2);
    }, i * 150);
  }
};

const animatePulse = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxRadius: number,
  delay: number
): void => {
  const startTime = Date.now();
  const duration = 600;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;
    
    if (progress >= 1) return;

    const radius = maxRadius * progress;
    const alpha = (1 - progress) * 0.8;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(animate);
  };

  setTimeout(animate, delay * 1000);
};

// Vibration API for mobile devices
export const triggerVibration = (pattern: number[] = [100]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Sound effect patterns for different events
export const getVibrationPattern = (soundId: string): number[] => {
  const patterns: Record<string, number[]> = {
    'bounce_paddle': [50],
    'bounce_wall': [100],
    'bounce_floor': [200, 100, 200],
    'powerup_collect': [100, 50, 100],
    'level_complete': [150, 100, 150, 100, 150],
    'game_over': [300, 200, 300],
    'high_score': [100, 50, 100, 50, 100],
    'achievement': [200, 100, 200],
  };
  
  return patterns[soundId] || [100];
};
