import React, { useState, useEffect } from 'react';
import { Character, Enemy, CombatState, Skill, Item } from '../types/game';
import { Sword, Shield, Heart, Zap, Package, RotateCcw, ArrowLeft, Target, AlertCircle } from 'lucide-react';

interface CombatSystemProps {
  combatState: CombatState;
  onAction: (action: string, targetIndex?: number) => void;
  onEndCombat: () => void;
}

const CombatSystem: React.FC<CombatSystemProps> = ({
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
  const [animationState, setAnimationState] = useState<'idle' | 'attack' | 'skill' | 'damage' | 'victory'>('idle');
  const [damageText, setDamageText] = useState<{value: number, isVisible: boolean}>({value: 0, isVisible: false});
  const [actionMenu, setActionMenu] = useState<'main' | 'skills' | 'items'>('main');

  const currentActor = combatState.turnOrder[combatState.currentTurn];
  const isPlayerTurn = combatState.isPlayerTurn;

  // Get all available skills for the current actor
  const availableSkills = isPlayerTurn ? (currentActor as Character).skills : [];

  // Get usable consumable items from inventory (assuming we have access to it)
  const usableItems = [
    { id: 'stimpak', name: 'Stimpak', description: 'Restore 50 HP', energyCost: 1 },
    { id: 'rad_away', name: 'Rad-Away', description: 'Remove radiation', energyCost: 1 },
    { id: 'psycho', name: 'Psycho', description: 'Boost damage +25%', energyCost: 1 }
  ];

  useEffect(() => {
    if (combatState.combatLog.length > 0) {
      const latestLog = combatState.combatLog[combatState.combatLog.length - 1];
      
      // Extract damage value if present
      const damageMatch = latestLog.match(/(\d+) damage/);
      if (damageMatch) {
        setDamageText({value: parseInt(damageMatch[1]), isVisible: true});
        setAnimationState('damage');
        
        setTimeout(() => {
          setDamageText({value: 0, isVisible: false});
          setAnimationState('idle');
        }, 1000);
      }
    }
  }, [combatState.combatLog]);

  const handleAction = () => {
    if (selectedAction && selectedTarget >= 0) {
      if (selectedAction === 'attack') {
        setAnimationState('attack');
        setTimeout(() => {
          onAction('basic_attack', selectedTarget);
          setAnimationState('idle');
        }, 500);
      } else {
        setAnimationState('skill');
        setTimeout(() => {
          onAction(selectedAction, selectedTarget);
          setAnimationState('idle');
        }, 500);
      }
      
      setSelectedAction('');
      setSelectedTarget(-1);
      setActionMenu('main');
    }
  };

  const handleSkillSelect = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    if (skill && canUseSkill(skill, currentActor as Character)) {
      setSelectedAction(skillId);
      // Auto-select enemy as target for offensive skills
      const enemies = combatState.participants.filter(p => !('class' in p));
      if (enemies.length > 0) {
        setSelectedTarget(combatState.participants.indexOf(enemies[0]));
        handleAction();
      }
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedAction(`use_${itemId}`);
    // Auto-select self as target for items
    const allies = combatState.participants.filter(p => 'class' in p);
    if (allies.length > 0) {
      setSelectedTarget(combatState.participants.indexOf(allies[0]));
      handleAction();
    }
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

  const allies = combatState.participants.filter(p => isCharacter(p)) as Character[];
  const enemies = combatState.participants.filter(p => !isCharacter(p)) as Enemy[];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-blue-600/20"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Combat Header */}
        <div className="bg-black/70 backdrop-blur-sm p-4 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-yellow-400">
              {isPlayerTurn ? 
                `${(currentActor as Character).name}'s Turn` : 
                `${(currentActor as Enemy).name}'s Turn`
              }
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Round {combatState.round}</span>
              <button 
                onClick={onEndCombat}
                className="bg-red-600/60 hover:bg-red-600/80 px-3 py-1 rounded text-sm font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Flee
              </button>
            </div>
          </div>
        </div>

        {/* Combat Arena */}
        <div className="flex-1 flex flex-col">
          {/* Enemy Section */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {enemies.map((enemy, index) => (
                <div 
                  key={enemy.id}
                  className={`
                    bg-black/50 backdrop-blur-sm rounded-lg p-4 border-2 mb-4 transition-all
                    ${currentActor === enemy ? 'border-red-400 bg-red-900/30' : 'border-gray-600'}
                    ${selectedTarget === combatState.participants.indexOf(enemy) ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  onClick={() => {
                    if (isPlayerTurn && selectedAction) {
                      setSelectedTarget(combatState.participants.indexOf(enemy));
                      handleAction();
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Enemy Icon */}
                    <div className={`
                      w-16 h-16 rounded-lg flex items-center justify-center text-2xl
                      ${enemy.type === 'raider' ? 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500' : 
                        enemy.type === 'mutant' ? 'bg-gradient-to-br from-green-600 to-green-800 border-2 border-green-500' : 
                        enemy.type === 'robot' ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500' : 
                        'bg-gradient-to-br from-orange-600 to-yellow-800 border-2 border-yellow-500'}
                      ${animationState === 'damage' && selectedTarget === combatState.participants.indexOf(enemy) ? 'animate-bounce' : ''}
                    `}>
                      {enemy.type === 'raider' ? '👤' : 
                       enemy.type === 'mutant' ? '👹' : 
                       enemy.type === 'robot' ? '🤖' : '👾'}
                       
                      {/* Damage Text Animation */}
                      {damageText.isVisible && selectedTarget === combatState.participants.indexOf(enemy) && (
                        <div className="absolute -top-8 text-red-400 font-bold text-xl animate-bounce">
                          -{damageText.value}
                        </div>
                      )}
                    </div>
                    
                    {/* Enemy Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold">{enemy.name}</h3>
                        <span className="text-sm">Lvl {enemy.level}</span>
                      </div>
                      
                      {/* Health Bar */}
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                            style={{ width: `${getHealthPercentage(enemy.health, enemy.maxHealth)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{enemy.health}/{enemy.maxHealth}</span>
                      </div>
                      
                      {/* Status Effects */}
                      {enemy.statusEffects.length > 0 && (
                        <div className="flex gap-1">
                          {enemy.statusEffects.map((effect, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-purple-600/80">
                              {effect.type} ({Math.ceil(effect.duration)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Combat Log */}
          <div className="bg-black/70 backdrop-blur-sm p-3 border-y border-gray-600 h-20 overflow-y-auto">
            <div className="text-center text-gray-300">
              {combatState.combatLog.slice(-3).map((log, index) => (
                <div key={index} className={index === combatState.combatLog.length - 1 ? "text-white font-bold" : "text-gray-400"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          {/* Player Section */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {allies.map((character, index) => (
                <div 
                  key={character.id}
                  className={`
                    bg-black/50 backdrop-blur-sm rounded-lg p-4 border-2 mb-4 transition-all
                    ${currentActor === character ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600'}
                    ${selectedTarget === combatState.participants.indexOf(character) ? 'ring-2 ring-green-400' : ''}
                  `}
                  onClick={() => {
                    if (isPlayerTurn && selectedAction && selectedAction.includes('heal')) {
                      setSelectedTarget(combatState.participants.indexOf(character));
                      handleAction();
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Character Icon */}
                    <div className={`
                      w-16 h-16 rounded-lg flex items-center justify-center text-2xl
                      ${character.class === 'warrior' ? 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500' : 
                        character.class === 'ranger' ? 'bg-gradient-to-br from-green-600 to-green-800 border-2 border-green-500' : 
                        character.class === 'medic' ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500' : 
                        'bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-500'}
                      ${animationState === 'attack' && currentActor === character ? 'scale-110' : ''}
                    `}>
                      {character.class === 'warrior' ? '⚔️' : 
                       character.class === 'ranger' ? '🏹' : 
                       character.class === 'medic' ? '💉' : '🔧'}
                    </div>
                    
                    {/* Character Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold">{character.name}</h3>
                        <span className="text-sm">Lvl {character.level} {character.class}</span>
                      </div>
                      
                      {/* Health Bar */}
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                            style={{ width: `${getHealthPercentage(character.health, character.maxHealth)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{character.health}/{character.maxHealth}</span>
                      </div>
                      
                      {/* Energy Bar */}
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ width: `${getEnergyPercentage(character.energy, character.maxEnergy)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{Math.floor(character.energy)}/{character.maxEnergy}</span>
                      </div>
                      
                      {/* Status Effects */}
                      {character.statusEffects.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {character.statusEffects.map((effect, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-purple-600/80">
                              {effect.type} ({Math.ceil(effect.duration)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        {isPlayerTurn && (
          <div className="bg-black/80 backdrop-blur-sm border-t-2 border-gray-600 p-4">
            {actionMenu === 'main' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedAction('attack');
                    // Auto-select first enemy
                    if (enemies.length > 0) {
                      setSelectedTarget(combatState.participants.indexOf(enemies[0]));
                      setSelectedAction('attack');
                      handleAction();
                    }
                  }}
                  className="bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Sword className="w-5 h-5" />
                  <span className="font-bold">Attack</span>
                </button>
                
                <button
                  onClick={() => setActionMenu('skills')}
                  className="bg-purple-600/80 hover:bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Skills</span>
                </button>
                
                <button
                  onClick={() => setActionMenu('items')}
                  className="bg-green-600/80 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Package className="w-5 h-5" />
                  <span className="font-bold">Items</span>
                </button>
                
                <button
                  onClick={onEndCombat}
                  className="bg-gray-600/80 hover:bg-gray-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-bold">Flee</span>
                </button>
              </div>
            ) : actionMenu === 'skills' ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-purple-400">Skills</h3>
                  <button
                    onClick={() => setActionMenu('main')}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillSelect(skill.id)}
                      disabled={!canUseSkill(skill, currentActor as Character)}
                      className={`
                        p-2 rounded border text-left transition-all
                        ${canUseSkill(skill, currentActor as Character) ? 
                          'bg-purple-600/80 hover:bg-purple-600 border-purple-500' : 
                          'bg-gray-600/50 border-gray-600 opacity-50 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{skill.name}</span>
                        <span className="text-xs bg-blue-600/80 px-2 py-1 rounded">
                          {skill.energyCost} <Zap className="w-3 h-3 inline" />
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">{skill.description}</div>
                      <div className="flex justify-between text-xs mt-1">
                        {skill.damage && <span className="text-red-400">DMG: {skill.damage}</span>}
                        {skill.healing && <span className="text-green-400">HEAL: {skill.healing}</span>}
                        {skill.currentCooldown > 0 && (
                          <span className="text-yellow-400">CD: {Math.ceil(skill.currentCooldown)}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-green-400">Items</h3>
                  <button
                    onClick={() => setActionMenu('main')}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {usableItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemSelect(item.id)}
                      className="p-2 rounded border border-green-500 bg-green-600/80 hover:bg-green-600 text-left transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{item.name}</span>
                        <span className="text-xs bg-blue-600/80 px-2 py-1 rounded">
                          {item.energyCost} <Zap className="w-3 h-3 inline" />
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enemy Turn Indicator */}
        {!isPlayerTurn && (
          <div className="bg-black/80 backdrop-blur-sm border-t-2 border-gray-600 p-4 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-red-400 border-r-red-400 border-b-transparent border-l-transparent"></div>
              <div className="text-lg font-bold">
                <span className="text-red-400">{(currentActor as Enemy).name}</span> is planning their move...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatSystem;