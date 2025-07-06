import React, { useState, useEffect } from 'react';
import { Item, Character } from '../types/game';
import { Package, Sword, Shield, Heart, Wrench, X, Search } from 'lucide-react';

interface InventoryScreenProps {
  inventory: Item[];
  party: Character[];
  onUseItem: (item: Item, characterId?: string) => void;
  onEquipItem: (item: Item, characterId: string) => void;
  onClose: () => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({
  inventory,
  party,
  onUseItem,
  onEquipItem,
  onClose
}) => {
  // Disable hotkeys in inventory screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape and 'i' to close inventory
      if (e.key === 'Escape' || e.key.toLowerCase() === 'i') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Sword className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'consumable': return <Heart className="w-5 h-5" />;
      case 'material': return <Wrench className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-800';
      case 'uncommon': return 'border-green-400 bg-green-900';
      case 'rare': return 'border-blue-400 bg-blue-900';
      case 'epic': return 'border-purple-400 bg-purple-900';
      case 'legendary': return 'border-yellow-400 bg-yellow-900';
      default: return 'border-gray-400 bg-gray-800';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All', icon: <Package className="w-4 h-4" /> },
    { id: 'weapon', name: 'Weapons', icon: <Sword className="w-4 h-4" /> },
    { id: 'armor', name: 'Armor', icon: <Shield className="w-4 h-4" /> },
    { id: 'consumable', name: 'Consumables', icon: <Heart className="w-4 h-4" /> },
    { id: 'material', name: 'Materials', icon: <Wrench className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-400">Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Categories and Search */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${selectedCategory === category.id ? 
                      'bg-green-600 text-white' : 
                      'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <span className="ml-auto text-sm">
                    {category.id === 'all' ? 
                      inventory.length : 
                      inventory.filter(item => item.type === category.id).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {filteredInventory.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => setSelectedItem(item)}
                  className={`
                    relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105
                    ${getRarityColor(item.rarity)}
                    ${selectedItem?.id === item.id ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  <div className="flex flex-col items-center">
                    {getItemIcon(item.type)}
                    <span className="text-xs text-center mt-1 font-medium">
                      {item.name}
                    </span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getItemIcon(selectedItem.type)}
                  <h3 className="font-bold text-yellow-400">{selectedItem.name}</h3>
                </div>
                
                <div className="mb-3">
                  <span className={`
                    px-2 py-1 rounded text-xs font-bold
                    ${selectedItem.rarity === 'common' ? 'bg-gray-600' :
                      selectedItem.rarity === 'uncommon' ? 'bg-green-600' :
                      selectedItem.rarity === 'rare' ? 'bg-blue-600' :
                      selectedItem.rarity === 'epic' ? 'bg-purple-600' :
                      'bg-yellow-600'
                    }
                  `}>
                    {selectedItem.rarity.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-4">{selectedItem.description}</p>

                {selectedItem.stats && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Stats:</h4>
                    <div className="text-xs space-y-1">
                      {selectedItem.stats.damage && (
                        <div className="text-red-400">Damage: +{selectedItem.stats.damage}</div>
                      )}
                      {selectedItem.stats.defense && (
                        <div className="text-blue-400">Defense: +{selectedItem.stats.defense}</div>
                      )}
                      {selectedItem.stats.strength && (
                        <div className="text-orange-400">Strength: +{selectedItem.stats.strength}</div>
                      )}
                      {selectedItem.stats.agility && (
                        <div className="text-green-400">Agility: +{selectedItem.stats.agility}</div>
                      )}
                      {selectedItem.stats.intelligence && (
                        <div className="text-purple-400">Intelligence: +{selectedItem.stats.intelligence}</div>
                      )}
                      {selectedItem.stats.endurance && (
                        <div className="text-yellow-400">Endurance: +{selectedItem.stats.endurance}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Value: {selectedItem.value} caps
                </div>

                <div className="space-y-2">
                  {selectedItem.type === 'consumable' && (
                    <button
                      onClick={() => onUseItem(selectedItem)}
                      className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-bold"
                    >
                      Use Item
                    </button>
                  )}

                  {(selectedItem.type === 'weapon' || selectedItem.type === 'armor') && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Equip to:</p>
                      {party.map(character => (
                        <button
                          key={character.id}
                          onClick={() => onEquipItem(selectedItem, character.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs mb-1"
                        >
                          {character.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select an item to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;