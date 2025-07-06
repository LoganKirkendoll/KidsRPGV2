import React, { useEffect } from 'react';
import { Skull, RotateCcw, Home } from 'lucide-react';

interface GameOverScreenProps {
  onLoadGame: () => void;
  onMainMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onLoadGame, onMainMenu }) => {
  // Disable all hotkeys in game over screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent all hotkeys in game over screen
      e.stopPropagation();
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 border-4 border-red-600 text-center">
        <div className="mb-6">
          <Skull className="w-24 h-24 mx-auto mb-4 text-red-500 animate-pulse" />
          <h2 className="text-4xl font-bold text-red-400 mb-2">GAME OVER</h2>
          <p className="text-gray-300 text-lg">
            You have fallen in the wasteland...
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onLoadGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Load Last Save
          </button>
          
          <button
            onClick={onMainMenu}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Main Menu
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          "In the wasteland, death is just another beginning..."
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;