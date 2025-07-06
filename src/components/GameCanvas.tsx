import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { GameState, GameSettings } from '../types/game';
import { useAudio } from '../hooks/useAudio';

interface GameCanvasProps {
  gameState: GameState;
  settings?: GameSettings;
  onGameStateChange: (newState: GameState) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, settings, onGameStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { playMusic } = useAudio();

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, gameState, settings);
      
      // Set up state change callback
      engineRef.current.setStateChangeCallback(onGameStateChange);
      
      // Set up lootable callback
      engineRef.current.setLootableCallback((lootable) => {
        // This will be handled by the parent component
        const event = new CustomEvent('openLootable', { detail: lootable });
        window.dispatchEvent(event);
      });
      
      // Set up periodic state sync
      const syncInterval = setInterval(() => {
        if (engineRef.current) {
          const currentState = engineRef.current.getGameState();
          onGameStateChange(currentState);
        }
      }, 50); // More frequent updates for better responsiveness

      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [onGameStateChange]);

  // Play exploration music when in exploration mode
  useEffect(() => {
    if (gameState && gameState.gameMode === 'exploration') {
      playMusic('exploration', 0.4, true);
    }
    // Don't stop music here as other components handle their own music
    // This prevents music from stopping when switching between modes
  }, [gameState?.gameMode, playMusic]);

  useEffect(() => {
    if (engineRef.current) {
      // Only update the game state when it changes significantly
      // This prevents constant re-rendering that could cause UI duplication
      const currentState = engineRef.current.getGameState();
      if (gameState.currentMap.id !== currentState.currentMap.id ||
          gameState.gameMode !== currentState.gameMode ||
          gameState.player.position.x !== currentState.player.position.x ||
          gameState.player.position.y !== currentState.player.position.y) {
        engineRef.current.setGameState(gameState);
      }
    }
  }, [gameState.currentMap.id, gameState.gameMode, gameState.player.position.x, gameState.player.position.y]);

  // Expose engine to parent component
  useEffect(() => {
    if (engineRef.current) {
      (window as any).gameEngine = engineRef.current;
    }
  }, []);
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-600 rounded-lg shadow-2xl"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default GameCanvas;