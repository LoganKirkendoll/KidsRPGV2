import React, { useState, useEffect } from 'react';
import { Character, Enemy, CombatState, Skill, Item } from '../types/game';
import { Sword, Shield, Heart, Zap, Target, RotateCcw, Package } from 'lucide-react';

interface CombatScreenProps {
  combatState: CombatState;
  onAction: (action: string, targetIndex?: number) => void;
  onEndCombat: () => void;
}

const CombatScreen: React.FC<CombatScreenProps> = ({
  combatState,
  onAction,
  onEndCombat
}) => {
  // Disable movement hotkeys during combat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent movement and other hotkeys during combat
      const preventedKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'i', 'e', 'c', 'q', 'm', 'f', ' '];
      
      if (preventedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Allow escape to flee combat
      if (e.key === 'Escape') {
        onEndCombat();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onEndCombat]);
  
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<number>(-1);
  const [animationQueue, setAnimationQueue] = useState<string[]>([]);
  const [showItems, setShowItems] = useState(false);

  const currentActor = combatState.turnOrder[combatState.currentTurn];
  const isPlayerTurn = combatState.isPlayerTurn;

  // Get all available skills for the current actor
  const availableSkills = currentActor?.skills || [];

  // Get usable consumable items from inventory (assuming we have access to it)
  const usableItems = [
    { id: 'stimpak', name: 'Stimpak', description: 'Restore 50 HP', energyCost: 1 },
    { id: 'rad_away', name: 'Rad-Away', description: 'Remove radiation', energyCost: 1 },
    { id: 'psycho', name: 'Psycho', description: 'Boost damage +25%', energyCost: 1 },
    { id: 'buffout', name: 'Buffout', description: 'Boost strength +3', energyCost: 1 },
    { id: 'mentats', name: 'Mentats', description: 'Boost intelligence +3', energyCost: 1 }
  ];

  useEffect(() => {
    if (combatState.combatLog.length > 0) {
      const latestLog = combatState.combatLog[combatState.combatLog.length - 1];
      setAnimationQueue(prev => [...prev, latestLog]);
      
      setTimeout(() => {
        setAnimationQueue(prev => prev.slice(1));
      }, 2000);
    }
  }, [combatState.combatLog]);

  const handleAction = () => {
    if (selectedAction && selectedTarget >= 0) {
      onAction(selectedAction, selectedTarget);
      setSelectedAction('');
      setSelectedTarget(-1);
      setShowItems(false);
    }
  };

  const handleSkillSelect = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    if (skill && canUseSkill(skill, currentActor)) {
      setSelectedAction(skillId);
      setSelectedTarget(-1); // Reset target selection
      setShowItems(false);
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedAction(`use_${itemId}`);
    setSelectedTarget(-1);
    setShowItems(false);
  };

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100);
  };

  const getEnergyPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100);
  };

  const isCharacter = (actor: Character | Enemy): actor is Character => {
    return 'class' in actor;
  };

  const canUseSkill = (skill: Skill, actor: Character | Enemy): boolean => {
    return actor.energy >= skill.energyCost && skill.currentCooldown <= 0;
  };

  const getSkillTargets = (skill: Skill) => {
    // Determine valid targets based on skill type
    if (skill.healing || skill.id === 'heal' || skill.id === 'cure' || skill.id === 'stimpack' || skill.id === 'adrenaline_shot') {
      return allies; // Healing skills target allies
    } else {
      return enemies; // Damage skills target enemies
    }
  };

  const getItemTargets = (itemId: string) => {
    // Most items target allies (healing, buffs)
    if (itemId === 'stimpak' || itemId === 'rad_away' || itemId === 'buffout' || itemId === 'mentats' || itemId === 'psycho') {
      return allies;
    }
    return allies; // Default to allies
  };

  const isValidTarget = (targetIndex: number) => {
    if (!selectedAction) return false;
    
    if (selectedAction.startsWith('use_')) {
      const itemId = selectedAction.replace('use_', '');
      const validTargets = getItemTargets(itemId);
      const target = combatState.participants[targetIndex];
      return validTargets.includes(target) && target.health > 0;
    }
    
    const skill = availableSkills.find(s => s.id === selectedAction);
    if (!skill) return false;
    
    const validTargets = getSkillTargets(skill);
    const target = combatState.participants[targetIndex];
    
    return validTargets.includes(target) && target.health > 0;
  };

  const allies = combatState.participants.filter(p => isCharacter(p)) as Character[];
  const enemies = combatState.participants.filter(p => !isCharacter(p)) as Enemy[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-orange-600 to-transparent"></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Combat Header */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-red-400 mb-2">
              TACTICAL COMBAT
            </h2>
            <div className="flex justify-center items-center gap-4 text-lg">
              <span>Round {combatState.round}</span>
              <span className="text-yellow-400">
                {isPlayerTurn ? 
                  `${(currentActor as Character).name}'s Turn` : 
                  `${(currentActor as Enemy).name}'s Turn`
                }
              </span>
            </div>
          </div>

          {/* Combat Log */}
          {animationQueue.length > 0 && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg text-xl font-bold animate-pulse border-2 border-yellow-400">
                {animationQueue[0]}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Allies */}
            <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 border-2 border-blue-600">
              <h3 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Your Party
              </h3>
              <div className="space-y-4">
                {allies.map((character, index) => (
                  <div 
                    key={character.id}
                    className={`
                      bg-gray-700 rounded-lg p-4 border-2 transition-all cursor-pointer
                      ${currentActor === character ? 'border-blue-400 bg-blue-900 bg-opacity-30' : 'border-gray-600'}
                      ${selectedAction && isValidTarget(index) ? 'hover:bg-gray-600 ring-2 ring-green-400' : ''}
                    `}
                    onClick={() => {
                      if (selectedAction && isValidTarget(index)) {
                        setSelectedTarget(index);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-bold text-lg">{character.name}</span>
                        <span className="ml-2 text-sm text-gray-400">Lv.{character.level} {character.class}</span>
                      </div>
                      {currentActor === character && (
                        <div className="bg-blue-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                          ACTIVE
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <div className="flex-1 bg-gray-600 rounded-full h-3">
                          <div 
                            className="bg-red-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getHealthPercentage(character.health, character.maxHealth)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{character.health}/{character.maxHealth}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <div className="flex-1 bg-gray-600 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getEnergyPercentage(character.energy, character.maxEnergy)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{Math.floor(character.energy)}/{character.maxEnergy}</span>
                      </div>
                    </div>

                    {character.statusEffects.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {character.statusEffects.map((effect, i) => (
                          <span key={i} className="bg-purple-600 px-2 py-1 rounded text-xs">
                            {effect.type} ({Math.ceil(effect.duration)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enemies */}
            <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 border-2 border-red-600">
              <h3 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Enemies
              </h3>
              <div className="space-y-4">
                {enemies.map((enemy, index) => (
                  <div 
                    key={`${enemy.id}-${index}`}
                    className={`
                      bg-gray-700 rounded-lg p-4 border-2 transition-all cursor-pointer
                      ${currentActor === enemy ? 'border-red-400 bg-red-900 bg-opacity-30' : 'border-gray-600'}
                      ${selectedAction && isValidTarget(allies.length + index) ? 'hover:bg-gray-600 ring-2 ring-red-400' : ''}
                    `}
                    onClick={() => {
                      if (selectedAction && isValidTarget(allies.length + index)) {
                        setSelectedTarget(allies.length + index);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-bold text-lg">{enemy.name}</span>
                        <span className="ml-2 text-sm text-gray-400">Lv.{enemy.level}</span>
                      </div>
                      {currentActor === enemy && (
                        <div className="bg-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                          ACTIVE
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <div className="flex-1 bg-gray-600 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getHealthPercentage(enemy.health, enemy.maxHealth)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{enemy.health}/{enemy.maxHealth}</span>
                    </div>

                    {enemy.statusEffects.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {enemy.statusEffects.map((effect, i) => (
                          <span key={i} className="bg-purple-600 px-2 py-1 rounded text-xs">
                            {effect.type} ({Math.ceil(effect.duration)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Panel */}
          {isPlayerTurn && (
            <>
              <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 border-2 border-yellow-600">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Choose Your Action</h3>
                
                {/* Action Type Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowItems(false)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      !showItems ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Skills
                  </button>
                  <button
                    onClick={() => setShowItems(true)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      showItems ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Package className="w-4 h-4 inline mr-2" />
                    Items
                  </button>
                </div>

                {/* Skills */}
                {!showItems && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {availableSkills.map((skill) => (
                      <button
                        key={skill.id}
                        className={`
                          p-4 rounded-lg border-2 transition-all
                          ${selectedAction === skill.id ? 
                            'border-yellow-400 bg-yellow-900 bg-opacity-50' : 
                            'border-gray-600 bg-gray-700 hover:bg-gray-600'
                          }
                          ${!canUseSkill(skill, currentActor) ? 
                            'opacity-50 cursor-not-allowed' : ''
                          }
                        `}
                        onClick={() => handleSkillSelect(skill.id)}
                        disabled={!canUseSkill(skill, currentActor)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {skill.damage ? <Sword className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                          <span className="font-bold text-sm">{skill.name}</span>
                        </div>
                        <p className="text-xs text-gray-300 mb-2">{skill.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">Energy: {skill.energyCost}</span>
                          <span className="text-yellow-400">Range: {skill.range}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          {skill.damage && (
                            <span className="text-red-400">Damage: {skill.damage}</span>
                          )}
                          {skill.healing && (
                            <span className="text-green-400">Heal: {skill.healing}</span>
                          )}
                          {skill.currentCooldown > 0 && (
                            <span className="text-red-400">CD: {Math.ceil(skill.currentCooldown)}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Items */}
                {showItems && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {usableItems.map((item) => (
                      <button
                        key={item.id}
                        className={`
                          p-4 rounded-lg border-2 transition-all
                          ${selectedAction === `use_${item.id}` ? 
                            'border-yellow-400 bg-yellow-900 bg-opacity-50' : 
                            'border-gray-600 bg-gray-700 hover:bg-gray-600'
                          }
                        `}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5" />
                          <span className="font-bold text-sm">{item.name}</span>
                        </div>
                        <p className="text-xs text-gray-300 mb-2">{item.description}</p>
                        <div className="text-xs text-blue-400">
                          Energy: {item.energyCost}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedAction && (
                  <div className="text-center">
                    <p className="mb-4 text-lg">
                      <span className="text-yellow-400 font-bold">
                        {selectedAction.startsWith('use_') ? 
                          usableItems.find(i => selectedAction === `use_${i.id}`)?.name :
                          availableSkills.find(s => s.id === selectedAction)?.name
                        }
                      </span>
                      {selectedTarget >= 0 && (
                        <span className="text-green-400 ml-2">
                          → {combatState.participants[selectedTarget].name}
                        </span>
                      )}
                    </p>
                    
                    <div className="mb-4 text-sm text-gray-300">
                      {selectedAction.startsWith('use_') ? 
                        usableItems.find(i => selectedAction === `use_${i.id}`)?.description :
                        availableSkills.find(s => s.id === selectedAction)?.description
                      }
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <button
                        className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAction}
                        disabled={selectedTarget < 0}
                      >
                        Execute Action
                      </button>
                      <button
                        className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-bold"
                        onClick={() => {
                          setSelectedAction('');
                          setSelectedTarget(-1);
                          setShowItems(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Combat Log */}
              <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 mt-4 max-h-32 overflow-y-auto">
                <h4 className="text-lg font-bold mb-2 text-white">Combat Log</h4>
                <div className="space-y-1">
                  {combatState.combatLog.slice(-5).map((log, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Enemy Turn Indicator */}
          {!isPlayerTurn && (
            <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 border-2 border-red-600 text-center">
              <h3 className="text-xl font-bold mb-4 text-red-400">Enemy Turn</h3>
              <p className="text-gray-300 mb-4">{(currentActor as Enemy).name} is planning their move...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
              </div>
            </div>
          )}

          {/* Combat Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
              onClick={onEndCombat}
            >
              <RotateCcw className="w-5 h-5" />
              Flee Combat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatScreen;