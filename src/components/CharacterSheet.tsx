import React, { useEffect } from 'react';
import { Character } from '../types/game';
import { X, User, Sword, Shield, Heart, Zap, Star, Award } from 'lucide-react';

interface CharacterSheetProps {
  character: Character;
  onClose: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onClose }) => {
  // Disable hotkeys in character sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close character sheet
      if (e.key === 'Escape') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const getStatColor = (value: number) => {
    if (value >= 8) return 'text-green-400';
    if (value >= 6) return 'text-yellow-400';
    if (value >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthPercentage = () => (character.health / character.maxHealth) * 100;
  const getEnergyPercentage = () => (character.energy / character.maxEnergy) * 100;
  const getRadiationPercentage = () => (character.radiation / character.maxRadiation) * 100;
  const getExperiencePercentage = () => (character.experience / character.experienceToNext) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
            <User className="w-8 h-8" />
            Character Sheet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Character Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-bold text-white">{character.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Class:</span>
                  <span className="font-bold text-blue-400 capitalize">{character.class}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="font-bold text-green-400">{character.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Background:</span>
                  <span className="font-bold text-purple-400 capitalize">{character.background?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Age:</span>
                  <span className="font-bold text-gray-300">{character.age}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gender:</span>
                  <span className="font-bold text-gray-300 capitalize">{character.gender}</span>
                </div>
              </div>
            </div>

            {/* Vital Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Vital Statistics</h3>
              
              {/* Health */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Health
                  </span>
                  <span className="font-bold">{character.health}/{character.maxHealth}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${getHealthPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    Energy
                  </span>
                  <span className="font-bold">{character.energy}/{character.maxEnergy}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${getEnergyPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Radiation */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    Radiation
                  </span>
                  <span className="font-bold">{character.radiation}/{character.maxRadiation}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${getRadiationPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Experience
                  </span>
                  <span className="font-bold">{character.experience}/{character.experienceToNext}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${getExperiencePercentage()}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Biography */}
            {character.biography && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Biography</h3>
                <p className="text-gray-300 leading-relaxed">{character.biography}</p>
              </div>
            )}
          </div>

          {/* Stats and Combat */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Primary Attributes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className={`text-2xl font-bold ${getStatColor(value)}`}>{value}</div>
                    <div className="text-sm text-gray-400 capitalize">{stat}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derived Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Derived Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">{character.derivedStats.carryWeight}</div>
                  <div className="text-sm text-gray-400">Carry Weight</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{character.derivedStats.actionPoints}</div>
                  <div className="text-sm text-gray-400">Action Points</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{character.derivedStats.criticalChance}%</div>
                  <div className="text-sm text-gray-400">Critical Chance</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{character.derivedStats.damageResistance}</div>
                  <div className="text-sm text-gray-400">Damage Resistance</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{character.derivedStats.radiationResistance}</div>
                  <div className="text-sm text-gray-400">Rad Resistance</div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Skills & Abilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {character.skills.map((skill) => (
                  <div key={skill.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-blue-400">{skill.name}</span>
                      <span className="text-sm text-gray-400">Energy: {skill.energyCost}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{skill.description}</p>
                    <div className="flex justify-between text-xs">
                      {skill.damage && <span className="text-red-400">Damage: {skill.damage}</span>}
                      {skill.healing && <span className="text-green-400">Healing: {skill.healing}</span>}
                      <span className="text-yellow-400">Range: {skill.range}</span>
                    </div>
                    {skill.currentCooldown > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-red-400">Cooldown: {skill.currentCooldown.toFixed(1)}s</div>
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-red-500 h-1 rounded-full"
                            style={{ width: `${(skill.currentCooldown / skill.cooldown) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            {character.perks && character.perks.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Perks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character.perks.map((perk) => (
                    <div key={perk.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="font-bold text-purple-400 mb-1">{perk.name}</div>
                      <p className="text-sm text-gray-300">{perk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traits */}
            {character.traits && character.traits.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Traits</h3>
                <div className="space-y-2">
                  {character.traits.map((traitId) => (
                    <div key={traitId} className="bg-gray-700 rounded-lg p-3">
                      <div className="font-bold text-orange-400 capitalize">{traitId.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Effects */}
            {character.statusEffects.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Status Effects</h3>
                <div className="space-y-2">
                  {character.statusEffects.map((effect, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-purple-400 capitalize">{effect.type}</span>
                        <span className="text-sm text-gray-400 ml-2">from {effect.source}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {effect.duration.toFixed(1)}s remaining
                      </div>
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

export default CharacterSheet;