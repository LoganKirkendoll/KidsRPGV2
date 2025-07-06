import React, { useState, useEffect } from 'react';
import { Character, Enemy, CombatState, Skill, Item, CombatAction } from '../types/game';
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
  const [damageText, setDamageText] = useState<{value: number, isVisible: boolean, targetIndex: number}>({value: 0, isVisible: false, targetIndex: -1});
  const [actionMenu, setActionMenu] = useState<'main' | 'skills' | 'items'>('main');
  const [showIntro, setShowIntro] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [sfx, setSfx] = useState<{[key: string]: HTMLAudioElement}>({});

  const currentActor = combatState.turnOrder[combatState.currentTurn];
  const isPlayerTurn = combatState.isPlayerTurn;

  // Get player character and enemy
  const player = combatState.participants.find(p => 'class' in p && p.id === 'player') as Character;
  const enemies = combatState.participants.filter(p => !('class' in p)) as Enemy[];
  const allies = combatState.participants.filter(p => 'class' in p) as Character[];

  // Get all available skills for the current actor
  const availableSkills = isPlayerTurn && 'skills' in currentActor ? currentActor.skills : [];

  // Get usable consumable items from inventory
  const usableItems = [
    { id: 'stimpak', name: 'Stimpak', description: 'Restore 50 HP', energyCost: 1 },
    { id: 'rad_away', name: 'Rad-Away', description: 'Remove radiation', energyCost: 1 },
    { id: 'psycho', name: 'Psycho', description: 'Boost damage +25%', energyCost: 1 },
    { id: 'buffout', name: 'Buffout', description: 'Boost strength +3', energyCost: 1 },
    { id: 'mentats', name: 'Mentats', description: 'Boost intelligence +3', energyCost: 1 }
  ];

  // Initialize audio
  useEffect(() => {
    if (!audioInitialized) {
      // Background music
      const bgm = new Audio('/assets/audio/combat-theme.mp3');
      bgm.loop = true;
      bgm.volume = 0.4;
      setBackgroundMusic(bgm);
      
      // Sound effects
      setSfx({
        attack: new Audio('/assets/audio/attack.mp3'),
        skill: new Audio('/assets/audio/skill.mp3'),
        damage: new Audio('/assets/audio/damage.mp3'),
        heal: new Audio('/assets/audio/heal.mp3'),
        victory: new Audio('/assets/audio/victory.mp3')
      });
      
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Play background music when combat starts
  useEffect(() => {
    if (backgroundMusic && !showIntro) {
      backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
      
      return () => {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      };
    }
  }, [backgroundMusic, showIntro]);

  // Handle combat log updates
  useEffect(() => {
    if (combatState.combatLog.length > 0) {
      const latestLog = combatState.combatLog[combatState.combatLog.length - 1];
      
      // Extract damage value if present
      const damageMatch = latestLog.match(/(\d+) damage/);
      if (damageMatch) {
        // Find which participant was targeted
        const targetIndex = latestLog.includes("attacks you") ? 
          combatState.participants.findIndex(p => p.id === 'player') : 
          combatState.participants.findIndex(p => !('class' in p));
        
        setDamageText({
          value: parseInt(damageMatch[1]), 
          isVisible: true,
          targetIndex
        });
        
        setAnimationState('damage');
        
        // Play damage sound
        if (sfx.damage) {
          sfx.damage.currentTime = 0;
          sfx.damage.play().catch(e => console.log("Audio play failed:", e));
        }
        
        setTimeout(() => {
          setDamageText({value: 0, isVisible: false, targetIndex: -1});
          setAnimationState('idle');
        }, 1000);
      }
    }
  }, [combatState.combatLog, sfx]);

  const handleAction = () => {
    if (selectedAction && selectedTarget >= 0) {
      if (selectedAction === 'attack') {
        setAnimationState('attack');
        
        // Play attack sound
        if (sfx.attack) {
          sfx.attack.currentTime = 0;
          sfx.attack.play().catch(e => console.log("Audio play failed:", e));
        }
        
        setTimeout(() => {
          onAction('basic_attack', selectedTarget);
          setAnimationState('idle');
        }, 500);
      } else if (selectedAction.startsWith('use_')) {
        // Play heal sound for items
        if (sfx.heal) {
          sfx.heal.currentTime = 0;
          sfx.heal.play().catch(e => console.log("Audio play failed:", e));
        }
        
        setTimeout(() => {
          onAction(selectedAction, selectedTarget);
        }, 300);
      } else {
        setAnimationState('skill');
        
        // Play skill sound
        if (sfx.skill) {
          sfx.skill.currentTime = 0;
          sfx.skill.play().catch(e => console.log("Audio play failed:", e));
        }
        
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
      
      // Auto-select target based on skill type
      if (skill.healing) {
        // Healing skills target allies
        const targetAlly = allies.find(a => a.health < a.maxHealth) || allies[0];
        setSelectedTarget(combatState.participants.indexOf(targetAlly));
      } else {
        // Damage skills target enemies
        if (enemies.length > 0) {
          setSelectedTarget(combatState.participants.indexOf(enemies[0]));
        }
      }
      
      // Auto execute if we have a target
      if (selectedTarget >= 0 || (enemies.length > 0 && !skill.healing) || allies.length > 0) {
        setTimeout(() => handleAction(), 50);
      }
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedAction(`use_${itemId}`);
    
    // Auto-select self as target for items
    if (allies.length > 0) {
      setSelectedTarget(combatState.participants.indexOf(allies[0]));
      setTimeout(() => handleAction(), 50);
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

  const getBackgroundForCharacter = (character: Character) => {
    switch(character.background) {
      case 'vault_dweller':
        return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
      case 'wasteland_wanderer':
        return 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)';
      case 'tribal':
        return 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)';
      case 'raider':
        return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%)';
      default:
        return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    }
  };

  const getIntroTextForBackground = (background: string) => {
    switch(background) {
      case 'vault_dweller':
        return "The Vault Dweller's technical knowledge gives them an edge in combat.";
      case 'wasteland_wanderer':
        return "Years in the wasteland have honed their survival instincts.";
      case 'tribal':
        return "Ancient tribal techniques make them a formidable warrior.";
      case 'raider':
        return "Their ruthless past as a raider makes them unpredictable in battle.";
      default:
        return "A survivor ready for combat.";
    }
  };

  // Combat intro screen
  if (showIntro) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center transition-all duration-1000"
        style={{ background: getBackgroundForCharacter(player) }}
      >
        <div className="absolute inset-0 opacity-20">
          {/* Background effects based on character background */}
          {player.background === 'vault_dweller' && (
            <div className="absolute inset-0 bg-blue-900 opacity-10 animate-pulse" />
          )}
          {player.background === 'wasteland_wanderer' && (
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black animate-pulse" />
          )}
          {player.background === 'tribal' && (
            <>
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-yellow-600 opacity-30 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                  }}
                />
              ))}
            </>
          )}
          {player.background === 'raider' && (
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
          )}
        </div>

        {/* Main content with cinematic bars */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Top cinematic bar */}
          <div className="h-16 bg-black opacity-80" />
          
          {/* Content area */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white drop-shadow-2xl tracking-wider animate-pulse">
                COMBAT ENGAGED
              </h1>
              <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-yellow-400 drop-shadow-lg">
                {player.name} vs {enemies[0]?.name || "Enemy"}
              </h2>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                {getIntroTextForBackground(player.background)}
              </p>
              
              <button
                onClick={() => setShowIntro(false)}
                className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-all"
              >
                FIGHT!
              </button>
            </div>
          </div>
          
          {/* Bottom cinematic bar */}
          <div className="h-16 bg-black opacity-80" />
        </div>
      </div>
    );
  }

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
                    ${damageText.isVisible && damageText.targetIndex === combatState.participants.indexOf(enemy) ? 'animate-bounce' : ''}
                    cursor-pointer
                  `}
                  onClick={() => {
                    if (isPlayerTurn && selectedAction) {
                      setSelectedTarget(combatState.participants.indexOf(enemy));
                      handleAction();
                    } else if (isPlayerTurn) {
                      // Quick attack when clicking enemy without selecting action
                      setSelectedAction('attack');
                      setSelectedTarget(combatState.participants.indexOf(enemy));
                      handleAction();
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Enemy Icon */}
                    <div className={`
                      w-16 h-16 rounded-lg flex items-center justify-center text-2xl relative
                      ${enemy.type === 'raider' ? 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500' : 
                        enemy.type === 'mutant' ? 'bg-gradient-to-br from-green-600 to-green-800 border-2 border-green-500' : 
                        enemy.type === 'robot' ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500' : 
                        'bg-gradient-to-br from-orange-600 to-yellow-800 border-2 border-yellow-500'}
                    `}>
                      {enemy.type === 'raider' ? '👤' : 
                       enemy.type === 'mutant' ? '👹' : 
                       enemy.type === 'robot' ? '🤖' : '👾'}
                       
                      {/* Damage Text Animation */}
                      {damageText.isVisible && damageText.targetIndex === combatState.participants.indexOf(enemy) && (
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
                    ${damageText.isVisible && damageText.targetIndex === combatState.participants.indexOf(character) ? 'animate-bounce' : ''}
                    ${animationState === 'attack' && currentActor === character ? 'scale-110' : ''}
                    cursor-pointer
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
                      w-16 h-16 rounded-lg flex items-center justify-center text-2xl relative
                      ${character.class === 'warrior' ? 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500' : 
                        character.class === 'ranger' ? 'bg-gradient-to-br from-green-600 to-green-800 border-2 border-green-500' : 
                        character.class === 'medic' ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500' : 
                        'bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-500'}
                    `}>
                      {character.class === 'warrior' ? '⚔️' : 
                       character.class === 'ranger' ? '🏹' : 
                       character.class === 'medic' ? '💉' : '🔧'}
                       
                      {/* Damage Text Animation */}
                      {damageText.isVisible && damageText.targetIndex === combatState.participants.indexOf(character) && (
                        <div className="absolute -top-8 text-red-400 font-bold text-xl animate-bounce">
                          -{damageText.value}
                        </div>
                      )}
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