import React from 'react';
import type { GameData, GameAction } from '../types/game';
import { calculateLevelScore } from '../utils/gameLogic';
import { getPowerUpIcon, getPowerUpDescription } from '../utils/powerUps';

type GameUIProps = {
  gameData: GameData;
  dispatch: (action: GameAction) => void;
  isTouchDevice: boolean;
};

export const GameUI: React.FC<GameUIProps> = ({ gameData, dispatch, isTouchDevice }) => {
  const { gameState, scoreData, ballPhysics, currentLevel, aimData, controlState, powerUps, activePowerUps, achievements, audioSettings } = gameData;

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const handleEnterAiming = () => {
    dispatch({ type: 'ENTER_AIMING' });
  };

  const handlePauseGame = () => {
    dispatch({ type: 'PAUSE_GAME' });
  };

  const handleResumeGame = () => {
    dispatch({ type: 'RESUME_GAME' });
  };

  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const handleLaunchBall = () => {
    dispatch({ type: 'LAUNCH_BALL', payload: { angle: aimData.angle, power: aimData.power } });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (): number => {
    return Math.max(0, currentLevel.timeLimit - scoreData.timeElapsed);
  };

  const getPowerColor = (power: number): string => {
    if (power < 30) return 'text-red-500';
    if (power < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getComboColor = (combo: number): string => {
    if (combo <= 1) return 'text-gray-400';
    if (combo <= 3) return 'text-blue-400';
    if (combo <= 5) return 'text-purple-400';
    if (combo <= 10) return 'text-pink-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header Bar */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Score</div>
            <div className="text-2xl font-bold text-white">{scoreData.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">High Score</div>
            <div className="text-2xl font-bold text-yellow-400">{scoreData.highScore.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Level</div>
            <div className="text-2xl font-bold text-green-400">{scoreData.level}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Lives</div>
            <div className="text-2xl font-bold text-red-400">{scoreData.lives}</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-4 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Bounces</div>
            <div className="text-xl font-bold text-blue-400">{scoreData.bounceCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Combo</div>
            <div className={`text-xl font-bold ${getComboColor(scoreData.consecutiveBounces)}`}>
              {scoreData.consecutiveBounces}x
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Multiplier</div>
            <div className="text-xl font-bold text-orange-400">{scoreData.multiplier}x</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300 font-medium">Time</div>
            <div className="text-xl font-bold text-cyan-400">{formatTime(getTimeRemaining())}</div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="w-full max-w-4xl">
        <div className="text-center text-sm text-gray-300 mb-3 font-medium">
          Target: {currentLevel.targetBounces} bounces
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{
              width: `${Math.min(100, (scoreData.bounceCount / currentLevel.targetBounces) * 100)}%`
            }}
          />
        </div>
        <div className="text-center text-xs text-gray-400 mt-1">
          {scoreData.bounceCount} / {currentLevel.targetBounces}
        </div>
      </div>

      {/* Active Power-ups */}
      {activePowerUps.length > 0 && (
        <div className="w-full max-w-4xl bg-gradient-to-r from-purple-800 to-purple-700 rounded-xl p-4 shadow-lg">
          <div className="text-center text-sm text-gray-300 font-medium mb-2">Active Power-ups</div>
          <div className="flex justify-center space-x-4">
            {activePowerUps.map(powerUp => (
              <div key={powerUp.id} className="flex flex-col items-center">
                <div className="text-2xl">{getPowerUpIcon(powerUp.type)}</div>
                <div className="text-xs text-gray-300">{getPowerUpDescription(powerUp.type)}</div>
                <div className="text-xs text-yellow-400">
                  {Math.ceil((powerUp.duration - (Date.now() - powerUp.startTime)) / 1000)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.filter(a => a.unlocked).length > 0 && (
        <div className="w-full max-w-4xl bg-gradient-to-r from-yellow-800 to-orange-700 rounded-xl p-4 shadow-lg">
          <div className="text-center text-sm text-gray-300 font-medium mb-2">Achievements</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {achievements.filter(a => a.unlocked).map(achievement => (
              <div key={achievement.id} className="flex items-center space-x-2 bg-black bg-opacity-30 rounded-lg p-2">
                <div className="text-lg">{achievement.icon}</div>
                <div className="text-xs">
                  <div className="font-bold text-white">{achievement.name}</div>
                  <div className="text-gray-300">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game State Messages and Controls */}
      {gameState === 'MENU' && (
        <div className="text-center space-y-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Bounce Original
          </h1>
          <p className="text-gray-300 text-lg">A physics-based ball bouncing adventure</p>
          <button
            onClick={handleStartGame}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            🎮 Start Game
          </button>
          <div className="text-sm text-gray-400 space-y-1">
            <p>🖱️ Mouse: Drag to aim, move to control platform</p>
            <p>📱 Touch: Drag to aim, tap zones to move platform</p>
            <p>⌨️ Keyboard: A/D or Arrow keys to move, Spacebar to pause</p>
          </div>
        </div>
      )}

      {gameState === 'AIMING' && (
        <div className="text-center space-y-6 bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white">🎯 Aim & Launch!</h2>
          <p className="text-gray-200 text-lg">Drag on the canvas to set angle and power</p>
          <div className="flex flex-col items-center space-y-3 bg-black bg-opacity-30 rounded-xl p-4">
            <div className="text-xl text-gray-200">
              Angle: <span className="font-bold text-blue-400">{Math.round(aimData.angle)}°</span>
            </div>
            <div className="text-xl text-gray-200">
              Power: <span className={`font-bold ${getPowerColor(aimData.power)}`}>{aimData.power}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-300">Release to launch the ball</p>
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className="text-center space-y-6 bg-gradient-to-br from-yellow-800 to-orange-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-4xl font-bold text-white">⏸️ Game Paused</h2>
          <div className="space-y-4">
            <button
              onClick={handleResumeGame}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
            >
              ▶️ Resume Game
            </button>
            <button
              onClick={handleResetGame}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-lg shadow-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
            >
              🔄 Reset Game
            </button>
          </div>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="text-center space-y-6 bg-gradient-to-br from-red-800 to-red-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-4xl font-bold text-white">💀 GAME OVER!</h2>
          <div className="space-y-4">
            <p className="text-2xl text-white">Final Score: <span className="font-bold text-yellow-400">{scoreData.score.toLocaleString()}</span></p>
            <p className="text-xl text-yellow-400">High Score: {scoreData.highScore.toLocaleString()}</p>
            {scoreData.score === scoreData.highScore && (
              <p className="text-lg text-green-400 font-bold">🎉 New High Score!</p>
            )}
          </div>
          <div className="space-y-4">
            <button
              onClick={handleResetGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              🎮 Play Again
            </button>
            <button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              📤 Share Score
            </button>
          </div>
        </div>
      )}

      {gameState === 'LEVEL_COMPLETE' && (
        <div className="text-center space-y-6 bg-gradient-to-br from-purple-800 to-purple-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-4xl font-bold text-white">🎉 LEVEL COMPLETE!</h2>
          <div className="space-y-4">
            <p className="text-xl text-white">
              Level Score: <span className="font-bold text-green-400">
                {calculateLevelScore(scoreData.bounceCount, currentLevel.targetBounces, scoreData.timeElapsed, currentLevel.timeLimit)}
              </span>
            </p>
            <p className="text-lg text-white">Total Score: <span className="font-bold text-yellow-400">{scoreData.score.toLocaleString()}</span></p>
          </div>
          <button
            onClick={handleEnterAiming}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            🚀 Next Level
          </button>
        </div>
      )}

      {/* Device Info */}
      <div className="mt-6 text-center text-xs text-gray-500 bg-gray-800 rounded-lg p-3">
        <p>Current Input: <span className="font-bold text-gray-300">{controlState.inputType}</span></p>
        <p>Device: <span className="font-bold text-gray-300">{isTouchDevice ? 'Touch' : 'Mouse/Keyboard'}</span></p>
        <p className="mt-2">Level {gameData.scoreData.level} | Platform: {gameData.currentLevel.platformWidth}px | Gravity: {gameData.currentLevel.gravity}</p>
      </div>
    </div>
  );
};
