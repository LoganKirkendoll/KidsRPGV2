import React, { useEffect } from 'react';
import { Character } from '../types/game';
import { X, User, Sword, Shield, Heart, Zap, Star, TrendingUp } from 'lucide-react';

interface CharacterScreenProps {
  character: Character;
  onClose: () => void;
}

const CharacterScreen: React.FC<CharacterScreenProps> = ({
  character,
  onClose
}) => {
  // Disable hotkeys in character screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape and 'c' to close character screen
      if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'strength': return <Sword className="w-5 h-5 text-red-400" />;
      case 'agility': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'intelligence': return <Star className="w-5 h-5 text-blue-400" />;
      case 'endurance': return <Shield className="w-5 h-5 text-yellow-400" />;
      case 'luck': return <Star className="w-5 h-5 text-purple-400" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getClassDescription = (className: string) => {
    switch (className) {
      case 'warrior': return 'A tough melee fighter with high health and strength';
      case 'ranger': return 'A skilled marksman with high agility and perception';
      case 'medic': return 'A healer with knowledge of medicine and technology';
      case 'engineer': return 'A tech specialist who can craft and repair equipment';
      default: return 'A survivor in the wasteland';
    }
  };

  const experiencePercentage = (character.experience / character.experienceToNext) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-400">Character Sheet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{character.name}</h3>
                <p className="text-blue-400 capitalize font-semibold">{character.class}</p>
                <p className="text-gray-400 text-sm">{getClassDescription(character.class)}</p>
              </div>
            </div>

            {/* Level and Experience */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-white">Level {character.level}</span>
                <span className="text-sm text-gray-400">
                  {character.experience} / {character.experienceToNext} XP
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${experiencePercentage}%` }}
                />
              </div>
            </div>

            {/* Health and Energy */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-white">Health</span>
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {character.health} / {character.maxHealth}
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">Energy</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.floor(character.energy)} / {character.maxEnergy}
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(character.energy / character.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status Effects */}
            {character.statusEffects.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Status Effects</h4>
                <div className="flex flex-wrap gap-2">
                  {character.statusEffects.map((effect, index) => (
                    <span 
                      key={index}
                      className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {effect.type} ({effect.duration}s)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats and Skills */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4">Attributes</h4>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {getStatIcon(stat)}
                      <span className="font-semibold text-white capitalize">{stat}</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-bold text-white mb-4">Skills</h4>
              <div className="space-y-3">
                {character.skills.map(skill => (
                  <div key={skill.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-yellow-400">{skill.name}</h5>
                      <div className="text-right">
                        <div className="text-sm text-blue-400">Energy: {skill.energyCost}</div>
                        {skill.currentCooldown > 0 && (
                          <div className="text-sm text-red-400">
                            Cooldown: {Math.ceil(skill.currentCooldown)}s
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{skill.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      {skill.damage && <span>Damage: {skill.damage}</span>}
                      {skill.healing && <span>Healing: {skill.healing}</span>}
                      <span>Range: {skill.range}</span>
                      <span>Cooldown: {skill.cooldown}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterScreen;