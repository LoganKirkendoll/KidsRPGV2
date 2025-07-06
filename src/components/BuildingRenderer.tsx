import React from 'react';
import { Tile } from '../types/game';

interface BuildingRendererProps {
  tile: Tile;
  x: number;
  y: number;
  isVisible: boolean;
  isDiscovered: boolean;
}

const BuildingRenderer: React.FC<BuildingRendererProps> = ({ tile, x, y, isVisible, isDiscovered }) => {
  if (!isDiscovered) return null;

  const getBuildingStyle = () => {
    const baseStyle = "absolute transition-all duration-300";
    const opacity = isVisible ? "opacity-100" : "opacity-60";
    
    switch (tile.buildingType) {
      case 'settlement':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-yellow-600 to-yellow-800 border-2 border-yellow-500`;
      case 'trader_post':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-500`;
      case 'clinic':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-500`;
      case 'workshop':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-500`;
      case 'tavern':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-500`;
      case 'security':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-blue-600 to-blue-800 border-2 border-blue-500`;
      case 'vault':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-cyan-600 to-cyan-800 border-2 border-cyan-500`;
      case 'luxury_tower':
        return `${baseStyle} ${opacity} bg-gradient-to-b from-gold-600 to-gold-800 border-2 border-gold-500`;
      default:
        return `${baseStyle} ${opacity} bg-gradient-to-b from-brown-600 to-brown-800 border-2 border-brown-500`;
    }
  };

  const getBuildingIcon = () => {
    switch (tile.buildingType) {
      case 'settlement': return '🏘️';
      case 'trader_post': return '🏪';
      case 'clinic': return '🏥';
      case 'workshop': return '🔧';
      case 'tavern': return '🍺';
      case 'security': return '🛡️';
      case 'vault': return '🚪';
      case 'luxury_tower': return '🏢';
      default: return '🏠';
    }
  };

  return (
    <div
      className={getBuildingStyle()}
      style={{
        left: x,
        top: y,
        width: 32,
        height: 32,
        zIndex: 10
      }}
    >
      {/* Building structure */}
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Building icon */}
        <span className="text-lg">{getBuildingIcon()}</span>
        
        {/* Entrance indicator */}
        {tile.isEntrance && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-yellow-400 rounded-t"></div>
        )}
        
        {/* Building glow effect for important buildings */}
        {isVisible && (tile.buildingType === 'vault' || tile.buildingType === 'luxury_tower') && (
          <div className="absolute inset-0 bg-yellow-400 opacity-20 rounded animate-pulse"></div>
        )}
      </div>
      
      {/* Building name tooltip on hover */}
      {tile.buildingName && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {tile.buildingName}
        </div>
      )}
    </div>
  );
};

export default BuildingRenderer;