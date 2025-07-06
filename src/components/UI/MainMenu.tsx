import React, { useState, useEffect } from 'react';
import { SaveSystem } from '../../engine/SaveSystem';
import { Play, Save, Settings, Trophy, FileText, X } from 'lucide-react';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: (slot: number) => void;
  onSettings: () => void;
  onQuit: () => void;
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGame, onSettings, onQuit, settings, onUpdateSettings }) => {
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  
  // Disable hotkeys in main menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent all hotkeys in main menu
      e.stopPropagation();
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
  
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const saveList = SaveSystem.getSaveList();

  const formatPlaytime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (showLoadMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 border-2 border-red-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-red-400">Load Game</h2>
            <button
              onClick={() => setShowLoadMenu(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saveList.map((save, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${save ? 
                    'bg-gray-700 border-gray-600 hover:border-red-400 hover:bg-gray-600' : 
                    'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
                  }
                `}
                onClick={() => save && onLoadGame(index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">Slot {index + 1}</h3>
                  {save && (
                    <span className="text-sm text-gray-400">{formatDate(save.timestamp)}</span>
                  )}
                </div>
                
                {save ? (
                  <div className="space-y-1">
                    <div className="text-yellow-400 font-semibold">{save.playerName}</div>
                    <div className="text-sm text-gray-300">Level {save.level}</div>
                    <div className="text-sm text-gray-400">Playtime: {formatPlaytime(save.playtime)}</div>
                  </div>
                ) : (
                  <div className="text-gray-500">Empty Slot</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showAchievements) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 border-2 border-red-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-red-400">Achievements</h2>
            <button
              onClick={() => setShowAchievements(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <p>Start a new game to unlock achievements!</p>
          </div>
        </div>
      </div>
    );
  }

  if (showCredits) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 border-2 border-red-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-red-400">Credits</h2>
            <button
              onClick={() => setShowCredits(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6 text-center">
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Wasteland Survivors</h3>
              <p className="text-gray-300">A Post-Apocalyptic RPG Experience</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-2">Game Design & Development</h4>
              <p className="text-gray-300">Built with React, TypeScript, and HTML5 Canvas</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-2">Features</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Real-time character movement with arrow keys</li>
                <li>• Turn-based tactical combat system</li>
                <li>• Character progression and skill trees</li>
                <li>• Save/Load system with multiple slots</li>
                <li>• Dynamic weather and day/night cycle</li>
                <li>• Achievement system</li>
                <li>• Quest system with objectives</li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-500">
              Version 1.0.0 - Built for production
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 border-2 border-red-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-red-400">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Graphics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Low Graphics Mode (Better Performance)</span>
                  <button
                    onClick={() => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      lowGraphicsMode: !settings?.lowGraphicsMode
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings?.lowGraphicsMode ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings?.lowGraphicsMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Auto-detect Performance</span>
                  <button
                    onClick={() => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      autoDetectPerformance: !settings?.autoDetectPerformance
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings?.autoDetectPerformance !== false ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings?.autoDetectPerformance !== false ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Graphics Quality</span>
                  <select
                    value={settings?.graphics || 'high'}
                    onChange={(e) => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      graphics: e.target.value
                    })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Audio</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Master Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings?.masterVolume || 1}
                    onChange={(e) => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      masterVolume: parseFloat(e.target.value)
                    })}
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Music Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings?.musicVolume || 0.8}
                    onChange={(e) => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      musicVolume: parseFloat(e.target.value)
                    })}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Gameplay</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto Save</span>
                  <button
                    onClick={() => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      autoSave: !settings?.autoSave
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings?.autoSave ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings?.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Difficulty</span>
                  <select
                    value={settings?.difficulty || 'normal'}
                    onChange={(e) => onUpdateSettings && onUpdateSettings({
                      ...settings,
                      difficulty: e.target.value
                    })}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1"
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="nightmare">Nightmare</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-red-400 mb-4 tracking-wider">
            WASTELAND
          </h1>
          <h2 className="text-3xl font-bold text-yellow-400 tracking-widest">
            SURVIVORS
          </h2>
          <p className="text-gray-300 mt-4 text-lg">
            A Post-Apocalyptic RPG Experience
          </p>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={onNewGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <Play className="w-6 h-6" />
            New Game
          </button>
          
          <button
            onClick={() => setShowLoadMenu(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <Save className="w-6 h-6" />
            Load Game
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <Settings className="w-6 h-6" />
            Settings
          </button>
          
          <button
            onClick={() => setShowAchievements(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <Trophy className="w-6 h-6" />
            Achievements
          </button>
          
          <button
            onClick={() => setShowCredits(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <FileText className="w-6 h-6" />
            Credits
          </button>
        </div>
        
        <div className="mt-12 text-gray-500 text-sm">
          Use arrow keys or WASD to move • Space to interact • I for inventory
        </div>
      </div>
    </div>
  );
};

export default MainMenu;