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

  const formatTime = () => {
    const hours = Math.floor(dayNightCycle * 24);
    const minutes = Math.floor((dayNightCycle * 24 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Right Side Action Bar */}
      <div className="fixed top-20 right-4 z-40 space-y-2 pointer-events-none">
        <button
          onClick={onOpenInventory} 
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Inventory (I)" 
        >
          <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenEquipment}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Equipment (E)"
        >
          <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenCharacter}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Character (C)"
        >
          <Sword className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenQuests}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Quests (Q)"
        >
          <div className="w-5 h-5 bg-yellow-500 rounded group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onOpenMap}
          className="w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg border border-gray-600 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Map (M)"
        >
          <Map className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="h-2" />
        
        <button
          onClick={onSave}
          className="w-12 h-12 bg-green-600/60 backdrop-blur-sm hover:bg-green-600/80 text-white rounded-lg border border-green-500 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Quick Save"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={onMenu}
          className="w-12 h-12 bg-red-600/60 backdrop-blur-sm hover:bg-red-600/80 text-white rounded-lg border border-red-500 transition-all flex items-center justify-center group shadow hover:shadow-lg pointer-events-auto"
          title="Main Menu"
        >
          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </>
  );
};

export default GameHUD;