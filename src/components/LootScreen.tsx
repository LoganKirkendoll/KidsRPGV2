import React, { useState, useEffect } from 'react';
import { Item, LootableItem } from '../types/game';
import { Package, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface LootScreenProps {
  lootable: LootableItem;
  playerInventory: Item[];
  onTakeItem: (item: Item, quantity?: number) => void;
  onTakeAll: () => void;
  onClose: () => void;
}

const LootScreen: React.FC<LootScreenProps> = ({
  lootable,
  playerInventory,
  onTakeItem,
  onTakeAll,
  onClose
}) => {
  // Disable hotkeys in loot screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close loot screen
      if (e.key === 'Escape') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const getItemIcon = (type: string) => {
    const icons: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      consumable: '💊',
      material: '🔧',
      quest: '📜'
    };
    return icons[type] || '📦';
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'border-gray-400 bg-gray-800',
      uncommon: 'border-green-400 bg-green-900',
      rare: 'border-blue-400 bg-blue-900',
      epic: 'border-purple-400 bg-purple-900',
      legendary: 'border-yellow-400 bg-yellow-900'
    };
    return colors[rarity] || 'border-gray-400 bg-gray-800';
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleTakeSelected = () => {
    lootable.items.forEach((item, index) => {
      if (selectedItems.has(`${item.id}_${index}`)) {
        onTakeItem(item, item.quantity);
      }
    });
    onClose();
  };

  const getContainerTitle = () => {
    switch (lootable.type) {
      case 'corpse': return 'Search Corpse';
      case 'container': return 'Container Contents';
      case 'cache': return 'Hidden Cache';
      default: return 'Loot';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden border-2 border-yellow-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Package className="w-6 h-6" />
            {getContainerTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Container Contents */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Available Items</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lootable.items.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>This container is empty</p>
                </div>
              ) : (
                lootable.items.map((item, index) => {
                  const itemKey = `${item.id}_${index}`;
                  const isSelected = selectedItems.has(itemKey);
                  
                  return (
                    <div
                      key={itemKey}
                      className={`
                        p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${getRarityColor(item.rarity)}
                        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                        hover:scale-105
                      `}
                      onClick={() => toggleItemSelection(itemKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getItemIcon(item.type)}</span>
                          <div>
                            <div className="font-bold text-yellow-400">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.description}</div>
                            {item.quantity && item.quantity > 1 && (
                              <div className="text-sm text-blue-400">Quantity: {item.quantity}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-400">{item.value} caps</div>
                          <div className="text-xs text-gray-400 capitalize">{item.rarity}</div>
                        </div>
                      </div>
                      
                      {item.stats && Object.keys(item.stats).length > 0 && (
                        <div className="mt-2 text-xs">
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <span key={stat} className="text-green-400 mr-2">
                              {stat}: +{value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Player Inventory Preview */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Your Inventory</h3>
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-400 mb-2">
                Inventory: {playerInventory.length}/50 items
              </div>
              <div className="space-y-1">
                {playerInventory.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.name}</span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-blue-400">x{item.quantity}</span>
                    )}
                  </div>
                ))}
                {playerInventory.length > 10 && (
                  <div className="text-xs text-gray-500">
                    ...and {playerInventory.length - 10} more items
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave
          </button>
          
          <div className="flex gap-3">
            {selectedItems.size > 0 && (
              <button
                onClick={handleTakeSelected}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Take Selected ({selectedItems.size})
              </button>
            )}
            
            {lootable.items.length > 0 && (
              <button
                onClick={() => {
                  onTakeAll();
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Take All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LootScreen;