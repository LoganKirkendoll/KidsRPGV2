import React, { useState, useEffect } from 'react';
import { characterClasses, backgrounds, traits } from '../../data/gameData';
import { Sword, Target, Heart, Wrench, ArrowRight, ArrowLeft, User, Book, Star, Dice6 } from 'lucide-react';

interface CharacterCreationProps {
  onCreateCharacter: (characterData: any) => void;
  onBack: () => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreateCharacter, onBack }) => {
  const [step, setStep] = useState<'basic' | 'background' | 'stats' | 'traits' | 'confirm'>('basic');
  
  // Disable hotkeys during character creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent all hotkeys except escape during character creation
      if (e.key !== 'Escape') {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
  
  const [characterData, setCharacterData] = useState({
    name: '',
    age: 25,
    gender: 'male' as 'male' | 'female' | 'other',
    class: 'warrior' as keyof typeof characterClasses,
    background: 'vault_dweller',
    stats: { strength: 5, agility: 5, intelligence: 5, endurance: 5, luck: 5, perception: 5, charisma: 5 },
    traits: [] as string[],
    biography: '',
    availablePoints: 15
  });

  const getClassIcon = (className: keyof typeof characterClasses) => {
    switch (className) {
      case 'warrior': return <Sword className="w-8 h-8" />;
      case 'ranger': return <Target className="w-8 h-8" />;
      case 'medic': return <Heart className="w-8 h-8" />;
      case 'engineer': return <Wrench className="w-8 h-8" />;
    }
  };

  const handleStatChange = (stat: string, delta: number) => {
    const newValue = characterData.stats[stat as keyof typeof characterData.stats] + delta;
    if (newValue >= 1 && newValue <= 10) {
      const pointsUsed = delta;
      if (characterData.availablePoints - pointsUsed >= 0) {
        setCharacterData(prev => ({
          ...prev,
          stats: { ...prev.stats, [stat]: newValue },
          availablePoints: prev.availablePoints - pointsUsed
        }));
      }
    }
  };

  const handleTraitToggle = (traitId: string) => {
    setCharacterData(prev => ({
      ...prev,
      traits: prev.traits.includes(traitId) 
        ? prev.traits.filter(t => t !== traitId)
        : prev.traits.length < 2 ? [...prev.traits, traitId] : prev.traits
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 'basic': return characterData.name.trim().length > 0;
      case 'background': return true;
      case 'stats': return characterData.availablePoints === 0;
      case 'traits': return true;
      case 'confirm': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    const steps = ['basic', 'background', 'stats', 'traits', 'confirm'];
    const currentIndex = steps.indexOf(step);
    
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1] as any);
    } else {
      onCreateCharacter(characterData);
    }
  };

  const handleBack = () => {
    const steps = ['basic', 'background', 'stats', 'traits', 'confirm'];
    const currentIndex = steps.indexOf(step);
    
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as any);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-6xl w-full mx-4 border-2 border-red-600">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-red-400 mb-2">Create Your Survivor</h2>
          <p className="text-gray-300">Step {['basic', 'background', 'stats', 'traits', 'confirm'].indexOf(step) + 1} of 5</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((['basic', 'background', 'stats', 'traits', 'confirm'].indexOf(step) + 1) / 5) * 100}%` }}
          />
        </div>

        {step === 'basic' && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={characterData.name}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  value={characterData.age}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                  min="16"
                  max="80"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  value={characterData.gender}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(characterClasses).map(([key, classData]) => (
                    <button
                      key={key}
                      onClick={() => setCharacterData(prev => ({ ...prev, class: key as any }))}
                      className={`
                        p-3 rounded-lg border-2 transition-all flex items-center gap-2
                        ${characterData.class === key ? 
                          'border-red-400 bg-red-900/30' : 
                          'border-gray-600 bg-gray-700 hover:border-red-400'
                        }
                      `}
                    >
                      {getClassIcon(key as keyof typeof characterClasses)}
                      <span className="text-sm font-bold">{classData.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Biography (Optional)</label>
              <textarea
                value={characterData.biography}
                onChange={(e) => setCharacterData(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Tell us about your character's background..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-400 focus:outline-none h-24 resize-none"
                maxLength={500}
              />
            </div>
          </div>
        )}

        {step === 'background' && (
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center gap-2">
              <Book className="w-6 h-6" />
              Choose Your Background
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backgrounds.map((bg) => (
                <div
                  key={bg.id}
                  className={`
                    p-6 rounded-lg border-2 cursor-pointer transition-all
                    ${characterData.background === bg.id ? 
                      'border-red-400 bg-red-900/30' : 
                      'border-gray-600 bg-gray-700 hover:border-red-400'
                    }
                  `}
                  onClick={() => setCharacterData(prev => ({ ...prev, background: bg.id }))}
                >
                  <h4 className="text-xl font-bold text-yellow-400 mb-2">{bg.name}</h4>
                  <p className="text-gray-300 mb-4">{bg.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-green-400 font-semibold">Bonuses: </span>
                      {Object.entries(bg.bonuses).map(([stat, value]) => (
                        <span key={stat} className="text-green-400">+{value} {stat} </span>
                      ))}
                    </div>
                    {Object.keys(bg.penalties).length > 0 && (
                      <div>
                        <span className="text-red-400 font-semibold">Penalties: </span>
                        {Object.entries(bg.penalties).map(([stat, value]) => (
                          <span key={stat} className="text-red-400">{value} {stat} </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'stats' && (
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center gap-2">
              <Dice6 className="w-6 h-6" />
              Distribute Attribute Points
            </h3>
            
            <div className="text-center mb-6">
              <span className="text-lg font-bold">Available Points: </span>
              <span className="text-2xl font-bold text-yellow-400">{characterData.availablePoints}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {Object.entries(characterData.stats).map(([stat, value]) => (
                <div key={stat} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold capitalize">{stat}</span>
                    <span className="text-xl font-bold text-yellow-400">{value}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatChange(stat, -1)}
                      disabled={value <= 1}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed w-8 h-8 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    
                    <div className="flex-1 bg-gray-600 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-yellow-500 h-4 rounded-full transition-all"
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                    
                    <button
                      onClick={() => handleStatChange(stat, 1)}
                      disabled={value >= 10 || characterData.availablePoints <= 0}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed w-8 h-8 rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'traits' && (
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center gap-2">
              <Star className="w-6 h-6" />
              Choose Traits (Optional - Max 2)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {traits.map((trait) => (
                <div
                  key={trait.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${characterData.traits.includes(trait.id) ? 
                      'border-yellow-400 bg-yellow-900/30' : 
                      'border-gray-600 bg-gray-700 hover:border-yellow-400'
                    }
                    ${characterData.traits.length >= 2 && !characterData.traits.includes(trait.id) ? 
                      'opacity-50 cursor-not-allowed' : ''
                    }
                  `}
                  onClick={() => handleTraitToggle(trait.id)}
                >
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">{trait.name}</h4>
                  <p className="text-gray-300 mb-3">{trait.description}</p>
                  
                  <div className="space-y-1">
                    <div className="text-green-400 text-sm">
                      <span className="font-semibold">Bonus: </span>{trait.bonus}
                    </div>
                    <div className="text-red-400 text-sm">
                      <span className="font-semibold">Penalty: </span>{trait.penalty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6 text-gray-400">
              Selected: {characterData.traits.length}/2
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Confirm Your Character</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4">Character Details</h4>
                <div className="space-y-2">
                  <div><span className="font-semibold">Name:</span> {characterData.name}</div>
                  <div><span className="font-semibold">Age:</span> {characterData.age}</div>
                  <div><span className="font-semibold">Gender:</span> {characterData.gender}</div>
                  <div><span className="font-semibold">Class:</span> {characterClasses[characterData.class].name}</div>
                  <div><span className="font-semibold">Background:</span> {backgrounds.find(b => b.id === characterData.background)?.name}</div>
                </div>
                
                {characterData.biography && (
                  <div className="mt-4">
                    <span className="font-semibold">Biography:</span>
                    <p className="text-gray-300 mt-1">{characterData.biography}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-xl font-bold mb-4">Attributes</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(characterData.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between">
                      <span className="capitalize">{stat}:</span>
                      <span className="font-bold text-yellow-400">{value}</span>
                    </div>
                  ))}
                </div>
                
                {characterData.traits.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Traits:</h5>
                    {characterData.traits.map(traitId => {
                      const trait = traits.find(t => t.id === traitId);
                      return trait ? (
                        <div key={traitId} className="text-sm text-yellow-400">
                          • {trait.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2
              ${canProceed() ? 
                'bg-red-600 hover:bg-red-700 text-white' : 
                'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {step === 'confirm' ? 'Create Character' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;