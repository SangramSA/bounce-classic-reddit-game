import React from 'react';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { useGameState, useControls } from '../hooks/useGameState';

export const BounceGame: React.FC = () => {
  const { gameData, dispatch } = useGameState();
  const {
    isTouchDevice,
    trajectoryPoints,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useControls(gameData, dispatch);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Game UI */}
        <GameUI gameData={gameData} dispatch={dispatch} isTouchDevice={isTouchDevice} />

        {/* Game Canvas Container */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <GameCanvas
              gameData={gameData}
              trajectoryPoints={trajectoryPoints}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        </div>

        {/* Game Info Footer */}
        <div className="mt-8 text-center space-y-2">
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-300 font-medium">Bounce Original - Advanced Physics Ball Game</p>
            <p className="text-xs text-gray-400">Built with React, TypeScript, and Reddit Devvit</p>
            <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-500">
              <span>🎮 Multi-level Progression</span>
              <span>🎯 Visual Aiming System</span>
              <span>📱 Mobile Optimized</span>
              <span>⌨️ Full Keyboard Support</span>
            </div>
          </div>
          
          {/* Reddit-specific features */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-3 shadow-lg">
            <p className="text-sm text-white font-medium">🚀 Reddit Devvit Features</p>
            <div className="mt-1 flex justify-center space-x-3 text-xs text-orange-100">
              <span>📊 High Score Persistence</span>
              <span>🎯 Custom Post Integration</span>
              <span>📱 Responsive Design</span>
              <span>⚡ Real-time Physics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
