import React, { useState, useEffect } from 'react';
import { Play, SkipForward } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface IntroSequenceProps {
  onComplete: () => void;
  characterClass?: string;
}

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete, characterClass = 'warrior' }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showText, setShowText] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const { playMusic, stopMusic } = useAudio();

  // Character-specific intro scenes
  const getScenes = (charClass: string) => {
    const baseScenes = [
      {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        title: "October 23, 2077",
        subtitle: "The Great War",
        text: "The world ended not with a whimper, but with the roar of atomic fire...",
        duration: 4000,
        effects: 'nuclear-flash'
      },
      {
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%)',
        title: "200 Years Later",
        subtitle: "The Capital Wasteland",
        text: "From the ashes of the old world, survivors emerge into a harsh new reality...",
        duration: 4000,
        effects: 'wasteland-wind'
      }
    ];

    const classSpecificScenes = {
      warrior: [
        {
          background: 'linear-gradient(135deg, #8b0000 0%, #dc143c 50%, #ff6347 100%)',
          title: "The Warrior's Path",
          subtitle: "Born for Battle",
          text: "You were trained from birth to fight. In the wasteland, strength is survival, and you have both in abundance.",
          duration: 4000,
          effects: 'combat-sparks'
        },
        {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
          title: "Vault 101",
          subtitle: "Your Story Begins",
          text: "But even the mightiest warrior must leave their sanctuary. Your father has broken the vault's most sacred rule...",
          duration: 4000,
          effects: 'vault-hum'
        }
      ],
      ranger: [
        {
          background: 'linear-gradient(135deg, #228b22 0%, #32cd32 50%, #90ee90 100%)',
          title: "The Ranger's Way",
          subtitle: "Eyes of the Eagle",
          text: "You learned to survive by watching, waiting, and striking with precision. The wasteland rewards the patient.",
          duration: 4000,
          effects: 'wind-whistle'
        },
        {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
          title: "Vault 101",
          subtitle: "Your Story Begins",
          text: "Your keen eyes noticed the signs before others. Your father's departure was no accident...",
          duration: 4000,
          effects: 'vault-hum'
        }
      ],
      medic: [
        {
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #e6f3ff 100%)',
          title: "The Healer's Oath",
          subtitle: "First, Do No Harm",
          text: "In a world of violence and death, you chose to preserve life. Your knowledge of medicine is invaluable.",
          duration: 4000,
          effects: 'healing-glow'
        },
        {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
          title: "Vault 101",
          subtitle: "Your Story Begins",
          text: "Your father, the vault's doctor, taught you everything. Now he's gone, and the vault needs answers...",
          duration: 4000,
          effects: 'vault-hum'
        }
      ],
      engineer: [
        {
          background: 'linear-gradient(135deg, #4169e1 0%, #1e90ff 50%, #87ceeb 100%)',
          title: "The Engineer's Mind",
          subtitle: "Technology Reborn",
          text: "While others see scrap, you see potential. In the wasteland, those who understand technology hold power.",
          duration: 4000,
          effects: 'tech-sparks'
        },
        {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
          title: "Vault 101",
          subtitle: "Your Story Begins",
          text: "The vault's systems are failing, and your father knew it. His departure may be connected to something bigger...",
          duration: 4000,
          effects: 'vault-hum'
        }
      ]
    };

    return [...baseScenes, ...classSpecificScenes[charClass as keyof typeof classSpecificScenes]];
  };

  const scenes = getScenes(characterClass);

  // Play intro music when component mounts
  useEffect(() => {
    playMusic('menu', 0.4, true);
    
    return () => {
      stopMusic();
    };
  }, [playMusic, stopMusic]);

  useEffect(() => {
    setCanSkip(true);
    
    const timer = setTimeout(() => {
      setShowText(true);
    }, 500);

    const sceneTimer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setShowText(false);
        setTimeout(() => {
          setCurrentScene(currentScene + 1);
        }, 500);
      } else {
        setTimeout(onComplete, 2000);
      }
    }, scenes[currentScene].duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(sceneTimer);
    };
  }, [currentScene, onComplete, scenes]);

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
      setCanSkip(false);
    }
  };

  const getEffectElements = (effectType: string) => {
    switch (effectType) {
      case 'nuclear-flash':
        return <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />;
      
      case 'wasteland-wind':
        return (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-yellow-600 opacity-30 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </>
        );
      
      case 'combat-sparks':
        return (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full opacity-60 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </>
        );
      
      case 'wind-whistle':
        return (
          <>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-1 bg-green-400 opacity-40 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </>
        );
      
      case 'healing-glow':
        return (
          <div className="absolute inset-0 bg-gradient-radial from-blue-200 via-transparent to-transparent opacity-30 animate-pulse" />
        );
      
      case 'tech-sparks':
        return (
          <>
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`
                }}
              />
            ))}
          </>
        );
      
      case 'vault-hum':
        return <div className="absolute inset-0 bg-blue-900 opacity-10 animate-pulse" />;
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-1000 overflow-hidden"
      style={{ background: scenes[currentScene].background }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {getEffectElements(scenes[currentScene].effects)}
        
        {/* Floating particles */}
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

      {/* Main content with cinematic bars */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top cinematic bar */}
        <div className="h-16 bg-black opacity-80" />
        
        {/* Content area */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className={`text-center transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white drop-shadow-2xl tracking-wider animate-pulse">
              {scenes[currentScene].title}
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-yellow-400 drop-shadow-lg">
              {scenes[currentScene].subtitle}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              {scenes[currentScene].text}
            </p>
          </div>
        </div>
        
        {/* Bottom cinematic bar */}
        <div className="h-16 bg-black opacity-80" />
      </div>

      {/* Skip button */}
      {canSkip && (
        <button
          onClick={handleSkip}
          className="fixed bottom-8 right-8 bg-black bg-opacity-70 hover:bg-opacity-90 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 border border-gray-600 backdrop-blur-sm"
        >
          <SkipForward className="w-5 h-5" />
          Skip Intro
        </button>
      )}

      {/* Progress indicator */}
      <div className="fixed bottom-8 left-8 flex gap-2">
        {scenes.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-all duration-500 ${
              index === currentScene ? 'bg-yellow-400 scale-125' : 
              index < currentScene ? 'bg-white' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroSequence;