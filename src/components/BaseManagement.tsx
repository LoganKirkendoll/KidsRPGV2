import React from 'react';
import { Base, Character } from '../types/game';
import { Home, Wrench, Heart, Package, Dumbbell, Plus, Minus } from 'lucide-react';

interface BaseManagementProps {
  base: Base;
  allCharacters: Character[];
  onUpgradeFacility: (facility: string) => void;
  onManageParty: (characterId: string) => void;
  onBackToExploration: () => void;
}

const BaseManagement: React.FC<BaseManagementProps> = ({
  base,
  allCharacters,
  onUpgradeFacility,
  onManageParty,
  onBackToExploration
}) => {
  const partyMembers = allCharacters.filter(char => char.isInParty);
  const baseMembers = allCharacters.filter(char => !char.isInParty);

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case 'workshop': return <Wrench className="w-6 h-6" />;
      case 'medical': return <Heart className="w-6 h-6" />;
      case 'storage': return <Package className="w-6 h-6" />;
      case 'training': return <Dumbbell className="w-6 h-6" />;
      default: return <Home className="w-6 h-6" />;
    }
  };

  const getFacilityName = (facility: string) => {
    switch (facility) {
      case 'workshop': return 'Workshop';
      case 'medical': return 'Medical Bay';
      case 'storage': return 'Storage';
      case 'training': return 'Training Grounds';
      default: return facility;
    }
  };

  const getUpgradeCost = (level: number) => {
    return {
      scrap: level * 50,
      food: level * 20,
      medicine: level * 10,
      fuel: level * 15
    };
  };

  const canAffordUpgrade = (facility: string) => {
    const level = base.facilities[facility as keyof typeof base.facilities];
    const cost = getUpgradeCost(level);
    
    return base.resources.scrap >= cost.scrap &&
           base.resources.food >= cost.food &&
           base.resources.medicine >= cost.medicine &&
           base.resources.fuel >= cost.fuel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400">Base Management</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            onClick={onBackToExploration}
          >
            Back to Exploration
          </button>
        </div>

        {/* Resources */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold mb-4">Resources</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{base.resources.scrap}</div>
              <div className="text-sm">Scrap Metal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{base.resources.food}</div>
              <div className="text-sm">Food</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{base.resources.medicine}</div>
              <div className="text-sm">Medicine</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{base.resources.fuel}</div>
              <div className="text-sm">Fuel</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Facilities */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Facilities</h3>
            <div className="space-y-4">
              {Object.entries(base.facilities).map(([facility, level]) => {
                const cost = getUpgradeCost(level);
                const canAfford = canAffordUpgrade(facility);
                
                return (
                  <div key={facility} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getFacilityIcon(facility)}
                        <div>
                          <div className="font-bold">{getFacilityName(facility)}</div>
                          <div className="text-sm text-gray-400">Level {level}</div>
                        </div>
                      </div>
                      <button
                        className={`
                          px-3 py-1 rounded text-sm font-bold
                          ${canAfford ? 
                            'bg-green-600 hover:bg-green-700' : 
                            'bg-gray-600 cursor-not-allowed opacity-50'
                          }
                        `}
                        onClick={() => onUpgradeFacility(facility)}
                        disabled={!canAfford}
                      >
                        Upgrade
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Next level cost: {cost.scrap} Scrap, {cost.food} Food, {cost.medicine} Medicine, {cost.fuel} Fuel
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Party Management */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Party Management</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-bold mb-2 text-blue-400">Active Party ({partyMembers.length}/5)</h4>
              <div className="space-y-2">
                {partyMembers.map(character => (
                  <div key={character.id} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{character.name}</div>
                      <div className="text-sm text-gray-400">Level {character.level}</div>
                    </div>
                    <button
                      className="bg-red-600 hover:bg-red-700 p-1 rounded"
                      onClick={() => onManageParty(character.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {baseMembers.length > 0 && (
              <div>
                <h4 className="text-lg font-bold mb-2 text-gray-400">Available Characters</h4>
                <div className="space-y-2">
                  {baseMembers.map(character => (
                    <div key={character.id} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold">{character.name}</div>
                        <div className="text-sm text-gray-400">Level {character.level}</div>
                      </div>
                      <button
                        className={`
                          p-1 rounded
                          ${partyMembers.length < 5 ? 
                            'bg-green-600 hover:bg-green-700' : 
                            'bg-gray-600 cursor-not-allowed opacity-50'
                          }
                        `}
                        onClick={() => onManageParty(character.id)}
                        disabled={partyMembers.length >= 5}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseManagement;