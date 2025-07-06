import React, { useEffect } from 'react';
import { GameMap, Position } from '../types/game';
import { X, MapPin, Eye, EyeOff } from 'lucide-react';

interface MapScreenProps {
  gameMap: GameMap;
  playerPosition: Position;
  visibilityMap: boolean[][];
  onClose: () => void;
}

const MapScreen: React.FC<MapScreenProps> = ({
  gameMap,
  playerPosition,
  visibilityMap,
  onClose
}) => {
  // Disable hotkeys in map screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape and 'm' to close map screen
      if (e.key === 'Escape' || e.key.toLowerCase() === 'm') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const TILE_SIZE = 8; // Smaller tiles for full map view
  const playerTileX = Math.floor(playerPosition.x / 32);
  const playerTileY = Math.floor(playerPosition.y / 32);

  const getTileColor = (tileType: string, discovered: boolean, visible: boolean) => {
    if (!discovered) return '#000000';
    
    let baseColor = '#333333';
    switch (tileType) {
      case 'grass': baseColor = '#4a7c59'; break;
      case 'dirt': baseColor = '#8b4513'; break;
      case 'stone': baseColor = '#696969'; break;
      case 'water': baseColor = '#4682b4'; break;
      case 'ruins': baseColor = '#2f2f2f'; break;
      case 'building': baseColor = '#654321'; break;
      case 'sand': baseColor = '#f4a460'; break;
    }
    
    if (!visible && discovered) {
      // Darken discovered but not visible tiles
      return baseColor + '80'; // Add transparency
    }
    
    return baseColor;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-green-400">{gameMap.name} Map</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Map */}
          <div className="flex-1">
            <div className="bg-black rounded-lg p-4 overflow-auto max-h-[70vh]">
              <div 
                className="relative"
                style={{ 
                  width: gameMap.width * TILE_SIZE, 
                  height: gameMap.height * TILE_SIZE 
                }}
              >
                {/* Render tiles */}
                {gameMap.tiles.map((row, y) =>
                  row.map((tile, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="absolute"
                      style={{
                        left: x * TILE_SIZE,
                        top: y * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        backgroundColor: getTileColor(
                          tile.type, 
                          tile.discovered, 
                          visibilityMap[y] && visibilityMap[y][x]
                        )
                      }}
                    />
                  ))
                )}

                {/* NPCs */}
                {gameMap.npcs.map(npc => {
                  const npcTileX = Math.floor(npc.position.x / 32);
                  const npcTileY = Math.floor(npc.position.y / 32);
                  const tile = gameMap.tiles[npcTileY]?.[npcTileX];
                  
                  if (!tile?.discovered) return null;
                  
                  return (
                    <div
                      key={npc.id}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: npcTileX * TILE_SIZE - 1,
                        top: npcTileY * TILE_SIZE - 1,
                        backgroundColor: npc.isHostile ? '#ff4444' : '#44ff44'
                      }}
                      title={npc.name}
                    />
                  );
                })}

                {/* Player position */}
                <div
                  className="absolute w-3 h-3 bg-red-500 rounded-full border border-white"
                  style={{
                    left: playerTileX * TILE_SIZE - 1.5,
                    top: playerTileY * TILE_SIZE - 1.5
                  }}
                />

                {/* Visible area indicator */}
                <div
                  className="absolute border-2 border-yellow-400 rounded-full opacity-30"
                  style={{
                    left: (playerTileX - 8) * TILE_SIZE,
                    top: (playerTileY - 8) * TILE_SIZE,
                    width: 16 * TILE_SIZE,
                    height: 16 * TILE_SIZE
                  }}
                />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-64 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-4">Map Legend</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full border border-white"></div>
                <span className="text-white">Your Position</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-white">Friendly NPC</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                <span className="text-white">Hostile NPC</span>
              </div>
              
              <div className="border-t border-gray-600 pt-3 mt-3">
                <h4 className="font-semibold text-gray-300 mb-2">Terrain</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3" style={{ backgroundColor: '#4a7c59' }}></div>
                    <span className="text-gray-300">Grass</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3" style={{ backgroundColor: '#8b4513' }}></div>
                    <span className="text-gray-300">Dirt</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3" style={{ backgroundColor: '#696969' }}></div>
                    <span className="text-gray-300">Stone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3" style={{ backgroundColor: '#4682b4' }}></div>
                    <span className="text-gray-300">Water</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3" style={{ backgroundColor: '#2f2f2f' }}></div>
                    <span className="text-gray-300">Ruins</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-black"></div>
                    <span className="text-gray-300">Unexplored</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-3 mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>Yellow circle shows vision range</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <EyeOff className="w-4 h-4" />
                  <span>Darker areas are discovered but not visible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;