import React, { useState, useEffect } from 'react';
import { Character, Enemy, CombatState, Skill } from '../types/game';
import { Heart, Zap, Sword, Shield, ArrowLeft, RotateCcw } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface PokemonStyleCombatProps {
  combatState: CombatState;
  onAction: (action: string, targetIndex?: number) => void;
  onEndCombat: () => void;
}

const PokemonStyleCombat: React.FC<PokemonStyleCombatProps> = ({
  combatState,
  onAction,
  onEndCombat
}) => {
  const [selectedAction, setSelectedAction] = useState<'attack' | 'skills' | 'items' | 'run' | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'attacking' | 'hurt' | 'victory'>('idle');
  const { playMusic, playSfx } = useAudio();
  const [combatText, setCombatText] = useState<string>('');
  const [showDamage, setShowDamage] = useState<{ amount: number; type: 'damage' | 'heal'; show: boolean; target: 'player' | 'enemy' }>({ amount: 0, type: 'damage', show: false, target: 'enemy' });

  const currentActor = combatState.turnOrder[combatState.currentTurn];
  const isPlayerTurn = combatState.isPlayerTurn;
  const player = combatState.participants.find(p => 'class' in p) as Character;
  const enemy = combatState.participants.find(p => !('class' in p)) as Enemy;

  useEffect(() => {
    // Disable movement hotkeys during combat
    const handleKeyDown = (e: KeyboardEvent) => {
      const preventedKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (preventedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === 'Escape') {
        onEndCombat();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onEndCombat]);

  // Play combat music when component mounts
  useEffect(() => {
    playMusic('combat', 0.5, true);
  }, [playMusic]);

  useEffect(() => {
    if (combatState.combatLog.length > 0) {
      const latestLog = combatState.combatLog[combatState.combatLog.length - 1];
      setCombatText(latestLog);
      
      // Show damage animation
      if (latestLog.includes('damage')) {
        const damageMatch = latestLog.match(/(\d+) damage/);
        if (damageMatch) {
          // Determine if player or enemy is taking damage
          const isPlayerDamaged = latestLog.includes(player.name) && !latestLog.startsWith(player.name);
          setShowDamage({ 
            amount: parseInt(damageMatch[1]), 
            type: 'damage', 
            show: true,
            target: isPlayerDamaged ? 'player' : 'enemy'
          });
          setTimeout(() => setShowDamage(prev => ({ ...prev, show: false })), 1500);
        }
        playSfx('/assets/audio/hit.mp3', 0.4);
      }
    }
  }, [combatState.combatLog]);

  const handleAttack = () => {
    setAnimationState('attacking');
    onAction('basic_attack', 1);
    playSfx('/assets/audio/attack.mp3', 0.4);
    setTimeout(() => setAnimationState('idle'), 1000);
    setSelectedAction(null);
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    setAnimationState('attacking');
    playSfx('/assets/audio/skill.mp3', 0.4);
    onAction(skill.id, 1);
    setTimeout(() => setAnimationState('idle'), 1000);
    setSelectedAction(null);
    setSelectedSkill(null);
  };

  const handleRun = () => {
    onEndCombat();
  };

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100);
  };

  const getHealthBarColor = (percentage: number) => {
    if (percentage > 60) return 'from-green-500 to-green-400';
    if (percentage > 30) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Battle Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-blue-600/20" />
        {/* Animated background elements */}
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

      {/* Top Section - Enemy */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center">
          {/* Enemy Info */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{enemy.name}</h2>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-400" />
                <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getHealthBarColor(getHealthPercentage(enemy.health, enemy.maxHealth))} transition-all duration-500 shadow`}
                    style={{ width: `${getHealthPercentage(enemy.health, enemy.maxHealth)}%` }}
                  />
                </div>
                <span className="text-white text-sm">{enemy.health}/{enemy.maxHealth}</span>
              </div>
              <div className="text-gray-300 text-sm">Level {enemy.level}</div>
            </div>
          </div>

          {/* Enemy Sprite */}
          <div className={`relative transition-all duration-300 ${animationState === 'hurt' ? 'animate-bounce' : ''}`}>
            <div className="w-32 h-32 mx-auto mb-4 relative">
              {/* Enemy visual representation */}
              <div className={`w-full h-full rounded-lg border-4 transition-all duration-300 ${
                enemy.type === 'robot' ? 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500' :
                enemy.type === 'mutant' ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500' :
                enemy.type === 'beast' ? 'bg-gradient-to-br from-yellow-600 to-orange-600 border-orange-500' :
                'bg-gradient-to-br from-red-400 to-red-600 border-red-500'
              }`}>
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                  {enemy.type === 'robot' ? '🤖' : 
                   enemy.type === 'mutant' ? '👹' :
                   enemy.type === 'beast' ? '🐺' : '💀'}
                </div>
              </div>
              
              {/* Damage number animation */}
              {showDamage.show && showDamage.target === 'enemy' && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <span className={`text-2xl font-bold ${showDamage.type === 'damage' ? 'text-red-400' : 'text-green-400'}`}>
                    {showDamage.type === 'damage' ? '-' : '+'}{showDamage.amount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Combat Text */}
      <div className="h-20 flex items-center justify-center">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-gray-600 max-w-2xl mx-4">
          <p className="text-white text-center text-lg">{combatText || 'What will you do?'}</p>
        </div>
      </div>

      {/* Bottom Section - Player */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center">
          {/* Player Sprite */}
          <div className={`relative transition-all duration-300 ${animationState === 'attacking' ? 'scale-110' : ''}`}>
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-4 border-blue-500">
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                  {player.class === 'warrior' ? '⚔️' :
                   player.class === 'ranger' ? '🏹' :
                   player.class === 'medic' ? '🏥' : '🔧'}
                </div>
                
                {/* Damage number animation for player */}
                {showDamage.show && showDamage.target === 'player' && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <span className={`text-2xl font-bold ${showDamage.type === 'damage' ? 'text-red-400' : 'text-green-400'}`}>
                      {showDamage.type === 'damage' ? '-' : '+'}{showDamage.amount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Player Info */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{player.name}</h2>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-400" />
                <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getHealthBarColor(getHealthPercentage(player.health, player.maxHealth))} transition-all duration-500 shadow`}
                    style={{ width: `${getHealthPercentage(player.health, player.maxHealth)}%` }}
                  />
                </div>
                <span className="text-white text-sm">{player.health}/{player.maxHealth}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 shadow"
                    style={{ width: `${getHealthPercentage(player.energy, player.maxEnergy)}%` }}
                  />
                </div>
                <span className="text-white text-sm">{Math.floor(player.energy)}/{player.maxEnergy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Menu */}
      {isPlayerTurn && (
        <div className="h-40 bg-black/80 backdrop-blur-sm border-t border-gray-600">
          {!selectedAction ? (
            /* Main Menu */
            <div className="grid grid-cols-2 gap-4 p-6 h-full">
              <button
                onClick={() => setSelectedAction('attack')}
                className="bg-red-600/80 hover:bg-red-600 text-white rounded-lg border border-red-500 transition-all flex items-center justify-center gap-2 text-lg font-bold"
              >
                <Sword className="w-6 h-6" />
                ATTACK
              </button>
              <button
                onClick={() => setSelectedAction('skills')}
                className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg border border-purple-500 transition-all flex items-center justify-center gap-2 text-lg font-bold"
              >
                <Zap className="w-6 h-6" />
                SKILLS
              </button>
              <button
                onClick={() => setSelectedAction('items')}
                className="bg-green-600/80 hover:bg-green-600 text-white rounded-lg border border-green-500 transition-all flex items-center justify-center gap-2 text-lg font-bold"
              >
                <Shield className="w-6 h-6" />
                ITEMS
              </button>
              <button
                onClick={() => setSelectedAction('run')}
                className="bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg border border-gray-500 transition-all flex items-center justify-center gap-2 text-lg font-bold"
              >
                <RotateCcw className="w-6 h-6" />
                RUN
              </button>
            </div>
          ) : selectedAction === 'attack' ? (
            /* Attack Menu */
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold">Choose Attack</h3>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={handleAttack}
                  className="bg-red-600/80 hover:bg-red-600 text-white rounded-lg border border-red-500 transition-all px-8 py-4 text-lg font-bold"
                >
                  Basic Attack
                </button>
              </div>
            </div>
          ) : selectedAction === 'skills' ? (
            /* Skills Menu */
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold">Choose Skill</h3>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                {player.skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillSelect(skill)}
                    disabled={player.energy < skill.energyCost || skill.currentCooldown > 0}
                    className={`p-2 rounded border transition-all text-sm ${
                      player.energy >= skill.energyCost && skill.currentCooldown <= 0
                        ? 'bg-purple-600/80 hover:bg-purple-600 text-white border-purple-500'
                        : 'bg-gray-600/50 text-gray-400 border-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-bold">{skill.name}</div>
                    <div className="text-xs">Energy: {skill.energyCost}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : selectedAction === 'run' ? (
            /* Run Confirmation */
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold">Flee from Battle?</h3>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center gap-4">
                <button
                  onClick={handleRun}
                  className="bg-red-600/80 hover:bg-red-600 text-white rounded-lg border border-red-500 transition-all px-8 py-4 text-lg font-bold"
                >
                  Yes, Flee
                </button>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg border border-gray-500 transition-all px-8 py-4 text-lg font-bold"
                >
                  No, Stay
                </button>
              </div>
            </div>
          ) : (
            /* Items Menu (placeholder) */
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold">Items</h3>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">No usable items</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enemy Turn Indicator */}
      {!isPlayerTurn && (
        <div className="h-40 bg-black/80 backdrop-blur-sm border-t border-gray-600 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xl font-bold mb-2">{enemy.name} is thinking...</div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonStyleCombat;