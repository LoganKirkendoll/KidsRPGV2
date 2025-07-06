import React, { useState, useEffect } from 'react';
import { Item, NPC } from '../types/game';
import { X, Coins, ShoppingCart, Package, ArrowLeftRight } from 'lucide-react';

interface TradingScreenProps {
  npc: NPC;
  playerInventory: Item[];
  playerGold: number;
  onBuyItem: (item: Item, quantity: number) => void;
  onSellItem: (item: Item, quantity: number) => void;
  onClose: () => void;
}

const TradingScreen: React.FC<TradingScreenProps> = ({
  npc,
  playerInventory,
  playerGold,
  onBuyItem,
  onSellItem,
  onClose
}) => {
  // Disable hotkeys in trading screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close trading screen
      if (e.key === 'Escape') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'consumable': return '💊';
      case 'material': return '🔧';
      default: return '📦';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const canAfford = (item: Item) => {
    return playerGold >= (item.value * quantity);
  };

  const sellableItems = playerInventory.filter(item => item.value > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-yellow-400">Trading with {npc.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Player Gold */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold text-white">Your Gold: </span>
            <span className="text-xl font-bold text-yellow-400">{playerGold}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setSelectedTab('buy')}
            className={`flex-1 py-3 px-6 font-bold transition-all ${
              selectedTab === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Buy from {npc.name}
          </button>
          <button
            onClick={() => setSelectedTab('sell')}
            className={`flex-1 py-3 px-6 font-bold transition-all ${
              selectedTab === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Coins className="w-5 h-5 inline mr-2" />
            Sell to {npc.name}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-white">
                {selectedTab === 'buy' ? `${npc.name}'s Inventory` : 'Your Inventory'}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(selectedTab === 'buy' ? (npc.inventory || []) : sellableItems).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => setSelectedItem(item)}
                    className={`
                      bg-gray-700 rounded-lg p-3 cursor-pointer transition-all border-2
                      ${selectedItem?.id === item.id ? 'border-yellow-400' : getRarityColor(item.rarity)}
                      hover:bg-gray-600
                    `}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{getItemIcon(item.type)}</div>
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-yellow-400 font-bold">
                        {selectedTab === 'buy' ? `${item.value}g` : `${Math.floor(item.value * 0.6)}g`}
                      </div>
                      {item.quantity && item.quantity > 1 && (
                        <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedTab === 'buy' && (!npc.inventory || npc.inventory.length === 0) && (
                <div className="text-center text-gray-500 py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{npc.name} has nothing to sell</p>
                </div>
              )}
              
              {selectedTab === 'sell' && sellableItems.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>You have nothing to sell</p>
                </div>
              )}
            </div>
          </div>

          {/* Item Details & Transaction */}
          <div className="bg-gray-800 rounded-lg p-4">
            {selectedItem ? (
              <div>
                <h3 className="text-lg font-bold mb-4 text-yellow-400">{selectedItem.name}</h3>
                
                <div className="mb-4">
                  <div className="text-2xl mb-2">{getItemIcon(selectedItem.type)}</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${
                    selectedItem.rarity === 'common' ? 'bg-gray-600' :
                    selectedItem.rarity === 'uncommon' ? 'bg-green-600' :
                    selectedItem.rarity === 'rare' ? 'bg-blue-600' :
                    selectedItem.rarity === 'epic' ? 'bg-purple-600' :
                    'bg-yellow-600'
                  }`}>
                    {selectedItem.rarity.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{selectedItem.description}</p>
                </div>

                {selectedItem.stats && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-white">Stats:</h4>
                    <div className="text-xs space-y-1">
                      {Object.entries(selectedItem.stats).map(([stat, value]) => (
                        <div key={stat} className="text-green-400">
                          {stat}: +{value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-lg font-bold text-white mb-2">
                    Price: <span className="text-yellow-400">
                      {selectedTab === 'buy' ? selectedItem.value : Math.floor(selectedItem.value * 0.6)}g
                    </span>
                  </div>
                  
                  {selectedItem.stackable && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedTab === 'buy' ? 99 : (selectedItem.quantity || 1)}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-400 mb-3">
                    Total: {(selectedTab === 'buy' ? selectedItem.value : Math.floor(selectedItem.value * 0.6)) * quantity}g
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (selectedTab === 'buy') {
                      onBuyItem(selectedItem, quantity);
                    } else {
                      onSellItem(selectedItem, quantity);
                    }
                    setSelectedItem(null);
                    setQuantity(1);
                  }}
                  disabled={selectedTab === 'buy' && !canAfford(selectedItem)}
                  className={`
                    w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2
                    ${selectedTab === 'buy'
                      ? (canAfford(selectedItem)
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed')
                      : 'bg-red-600 hover:bg-red-700 text-white'
                    }
                  `}
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  {selectedTab === 'buy' ? 'Buy Item' : 'Sell Item'}
                </button>
                
                {selectedTab === 'buy' && !canAfford(selectedItem) && (
                  <p className="text-red-400 text-sm mt-2 text-center">Not enough gold!</p>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select an item to {selectedTab}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingScreen;