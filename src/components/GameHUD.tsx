import React from 'react';
import { Character } from '../types/game';
import { Heart, Zap, Shield, Sword, Package, Map, Settings, Save } from 'lucide-react';

interface GameHUDProps {
  player: Character;
  gold: number;
  gameTime: number;
  dayNightCycle: number;
  weather: string;
  onOpenInventory: () => void;
  onOpenEquipment: () => void;
  onOpenCharacter: () => void;
  onOpenQuests: () => void;
  onOpenMap: () => void;
  onSave: () => void;
  onMenu: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  player,
  gold,
  gameTime,
  dayNightCycle,
  weather,
  onOpenInventory,
  onOpenEquipment,
  onOpenCharacter,
  onOpenQuests,
  onOpenMap,
  onSave,
  onMenu
}) => {
  const getHealthPercentage = () => (player.health / player.maxHealth) * 100;
  const getEnergyPercentage = () => (player.energy / player.maxEnergy) * 100;
  const getRadiationPercentage = () => (player.radiation / player.maxRadiation) * 100;
  const getExperiencePercentage = () => (player.experience / player.experienceToNext) * 100;

  const formatTime = () => {
    const hours = Math.floor(dayNightCycle * 24);
    const minutes = Math.floor((dayNightCycle * 24 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Top HUD Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Player Info */}
          <div className="flex items-center gap-6 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center border-2 border-blue-400">
              <span className="text-white font-bold text-lg">{player.name[0]}</span>
            </div>
            
            {/* Stats */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{player.name}</span>
                <span className="text-yellow-400 text-sm">Lv.{player.level}</span>
              </div>
              
              {/* Health Bar */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                    style={{ width: `${getHealthPercentage()}%` }}
                  />
                </div>
                <span className="text-white text-xs">{player.health}/{player.maxHealth}</span>
              </div>
              
              {/* Energy Bar */}
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                    style={{ width: `${getEnergyPercentage()}%` }}
                  />
                </div>
                <span className="text-white text-xs">{Math.floor(player.energy)}/{player.maxEnergy}</span>
              </div>
            </div>
          </div>

          {/* Time and Weather */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
            <div className="text-center">
              <div className="text-yellow-400 font-bold">{formatTime()}</div>
              <div className="text-gray-300 text-sm capitalize">{weather}</div>
            </div>
          </div>

          {/* Gold */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">$</span>
              </div>
              <span className="text-yellow-400 font-bold">{gold}</span>
            </div>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${getExperiencePercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right Side Action Bar */}
      <div className="fixed top-20 right-4 z-40 space-y-2">
        <button
          onClick={onOpenInventory}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group"
          title="Inventory (I)"
        >
          <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenEquipment}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group"
          title="Equipment (E)"
        >
          <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenCharacter}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group"
          title="Character (C)"
        >
          <Sword className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenQuests}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group"
          title="Quests (Q)"
        >
          <div className="w-5 h-5 bg-yellow-500 rounded group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenMap}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group"
          title="Map (M)"
        >
          <Map className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="h-2" />
        
        <button
          onClick={onSave}
          className="w-12 h-12 bg-green-600/60 backdrop-blur-sm hover:bg-green-600/80 text-white rounded-lg border border-green-500 transition-all flex items-center justify-center group"
          title="Quick Save"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onMenu}
          className="w-12 h-12 bg-red-600/60 backdrop-blur-sm hover:bg-red-600/80 text-white rounded-lg border border-red-500 transition-all flex items-center justify-center group"
          title="Main Menu"
        >
          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Bottom Status Effects */}
      {player.statusEffects.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40 flex gap-2">
          {player.statusEffects.map((effect, index) => (
            <div
              key={index}
              className="bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-purple-400"
            >
              {effect.type} ({Math.ceil(effect.duration)}s)
            </div>
          ))}
        </div>
      )}

      {/* Radiation Warning */}
      {getRadiationPercentage() > 50 && (
        <div className="fixed bottom-4 right-4 z-40 bg-green-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-green-400 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-ping" />
            <span>Radiation: {Math.floor(getRadiationPercentage())}%</span>
          </div>
        </div>
      )}
    </>
  );
};

export default GameHUD;