import React, { useState, useEffect } from 'react';
import { Character, Item } from '../types/game';
import { Sword, Shield, Crown, Footprints, Star, X } from 'lucide-react';

interface EquipmentScreenProps {
  party: Character[];
  inventory: Item[];
  onEquipItem: (characterId: string, item: Item, slot: string) => void;
  onUnequipItem: (characterId: string, slot: string) => void;
  onClose: () => void;
}

const EquipmentScreen: React.FC<EquipmentScreenProps> = ({
  party,
  inventory,
  onEquipItem,
  onUnequipItem,
  onClose
}) => {
  // Disable hotkeys in equipment screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape and 'e' to close equipment screen
      if (e.key === 'Escape' || e.key.toLowerCase() === 'e') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(party[0]);

  // Update selected character when party changes
  React.useEffect(() => {
    const updatedCharacter = party.find(c => c.id === selectedCharacter?.id);
    if (updatedCharacter) {
      setSelectedCharacter(updatedCharacter);
    }
  }, [party, selectedCharacter?.id]);

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-6 h-6" />;
      case 'armor': return <Shield className="w-6 h-6" />;
      case 'helmet': return <Crown className="w-6 h-6" />;
      case 'boots': return <Footprints className="w-6 h-6" />;
      case 'accessory': return <Star className="w-6 h-6" />;
      default: return null;
    }
  };

  const getEquipmentSlots = () => [
    { id: 'weapon', name: 'Weapon', item: selectedCharacter.equipment.weapon },
    { id: 'armor', name: 'Armor', item: selectedCharacter.equipment.armor },
    { id: 'helmet', name: 'Helmet', item: selectedCharacter.equipment.helmet },
    { id: 'boots', name: 'Boots', item: selectedCharacter.equipment.boots },
    { id: 'accessory', name: 'Accessory', item: selectedCharacter.equipment.accessory }
  ];

  const getAvailableItems = (slot: string) => {
    return inventory.filter(item => item.type === slot);
  };

  const getTotalStats = (character: Character) => {
    const baseStats = { ...character.stats };
    const equipmentBonuses = {
      damage: 0,
      defense: 0,
      strength: 0,
      agility: 0,
      intelligence: 0,
      endurance: 0,
      luck: 0
    };

    Object.values(character.equipment).forEach(item => {
      if (item?.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (stat in equipmentBonuses) {
            equipmentBonuses[stat as keyof typeof equipmentBonuses] += value || 0;
          }
        });
      }
    });

    return { baseStats, equipmentBonuses };
  };

  const { baseStats, equipmentBonuses } = getTotalStats(selectedCharacter);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-400">Equipment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Character Selection */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">Party Members</h3>
            <div className="space-y-2">
              {party.map(character => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all
                    ${selectedCharacter.id === character.id ? 
                      'bg-blue-600 text-white' : 
                      'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="font-bold">{character.name}</div>
                  <div className="text-sm opacity-75">Level {character.level} {character.class}</div>
                </button>
              ))}
            </div>

            {/* Character Stats */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold mb-3">Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Strength:</span>
                  <span>
                    {baseStats.strength}
                    {equipmentBonuses.strength > 0 && (
                      <span className="text-green-400"> (+{equipmentBonuses.strength})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Agility:</span>
                  <span>
                    {baseStats.agility}
                    {equipmentBonuses.agility > 0 && (
                      <span className="text-green-400"> (+{equipmentBonuses.agility})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Intelligence:</span>
                  <span>
                    {baseStats.intelligence}
                    {equipmentBonuses.intelligence > 0 && (
                      <span className="text-green-400"> (+{equipmentBonuses.intelligence})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Endurance:</span>
                  <span>
                    {baseStats.endurance}
                    {equipmentBonuses.endurance > 0 && (
                      <span className="text-green-400"> (+{equipmentBonuses.endurance})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Luck:</span>
                  <span>
                    {baseStats.luck}
                    {equipmentBonuses.luck > 0 && (
                      <span className="text-green-400"> (+{equipmentBonuses.luck})</span>
                    )}
                  </span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between">
                  <span>Damage:</span>
                  <span className="text-red-400">{equipmentBonuses.damage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Defense:</span>
                  <span className="text-blue-400">{equipmentBonuses.defense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Slots */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">Equipment Slots</h3>
            <div className="grid grid-cols-2 gap-4">
              {getEquipmentSlots().map(slot => (
                <div key={slot.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getSlotIcon(slot.id)}
                    <span className="font-bold">{slot.name}</span>
                  </div>
                  
                  {slot.item ? (
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="font-bold text-yellow-400 mb-1">{slot.item.name}</div>
                      <div className="text-xs text-gray-400 mb-2">{slot.item.description}</div>
                      {slot.item.stats && (
                        <div className="text-xs space-y-1 mb-3">
                          {Object.entries(slot.item.stats).map(([stat, value]) => (
                            <div key={stat} className="text-green-400">
                              {stat}: +{value}
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => onUnequipItem(selectedCharacter.id, slot.id)}
                        className="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold"
                      >
                        Unequip
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-700 rounded-lg p-3 text-center text-gray-500">
                      <div className="text-4xl mb-2">+</div>
                      <div className="text-xs">Empty Slot</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available Items */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">Available Equipment</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {['weapon', 'armor', 'helmet', 'boots', 'accessory'].map(slotType => {
                const availableItems = getAvailableItems(slotType);
                if (availableItems.length === 0) return null;

                return (
                  <div key={slotType}>
                    <h4 className="font-semibold mb-2 capitalize flex items-center gap-2">
                      {getSlotIcon(slotType)}
                      {slotType}s
                    </h4>
                    <div className="space-y-2">
                      {availableItems.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="bg-gray-800 rounded-lg p-3"
                        >
                          <div className="font-bold text-yellow-400 text-sm mb-1">{item.name}</div>
                          <div className="text-xs text-gray-400 mb-2">{item.description}</div>
                          {item.stats && (
                            <div className="text-xs space-y-1 mb-3">
                              {Object.entries(item.stats).map(([stat, value]) => (
                                <div key={stat} className="text-green-400">
                                  {stat}: +{value}
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => onEquipItem(selectedCharacter.id, item, slotType)}
                            className="w-full bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-bold transition-colors"
                          >
                            Equip
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentScreen;