import React, { useState, useEffect } from 'react';
import { Character } from '../types/game';

interface BackgroundCutsceneProps {
  character: Character;
  onComplete: () => void;
}

const BackgroundCutscene: React.FC<BackgroundCutsceneProps> = ({ character, onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showText, setShowText] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);

  // Get cutscene data based on character background
  const getCutsceneData = () => {
    switch(character.background) {
      case 'vault_dweller':
        return [
          {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            title: "Life in the Vault",
            subtitle: "Vault 101",
            text: "You were born in Vault 101, where no one ever enters and no one ever leaves...",
            duration: 4000,
            effects: 'vault-hum'
          },
          {
            background: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
            title: "The Overseer's Rule",
            subtitle: "Order and Control",
            text: "Under the Overseer's strict rule, life was predictable, safe, but confined...",
            duration: 4000,
            effects: 'vault-lights'
          },
          {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            title: "The Escape",
            subtitle: "Into the Unknown",
            text: "When your father left the vault, you had no choice but to follow, stepping into a world you'd only read about...",
            duration: 4000,
            effects: 'vault-door'
          }
        ];
      
      case 'wasteland_wanderer':
        return [
          {
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
            title: "Born to the Wastes",
            subtitle: "A Harsh Beginning",
            text: "You were born under the unforgiving sun of the wasteland, where survival is never guaranteed...",
            duration: 4000,
            effects: 'wasteland-wind'
          },
          {
            background: 'linear-gradient(135deg, #cd853f 0%, #a0522d 50%, #8b4513 100%)',
            title: "The Caravan Life",
            subtitle: "Always Moving",
            text: "Your family joined the trading caravans, always moving, always watching for raiders and mutants...",
            duration: 4000,
            effects: 'caravan-movement'
          },
          {
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
            title: "The Lone Path",
            subtitle: "Your Own Journey",
            text: "After losing your caravan to an ambush, you set out alone, determined to make your mark on the wasteland...",
            duration: 4000,
            effects: 'footsteps'
          }
        ];
      
      case 'tribal':
        return [
          {
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
            title: "The Ancient Ways",
            subtitle: "Tribal Wisdom",
            text: "Your tribe has preserved the old ways, living in harmony with the changed world...",
            duration: 4000,
            effects: 'tribal-drums'
          },
          {
            background: 'linear-gradient(135deg, #7f8c8d 0%, #34495e 50%, #2c3e50 100%)',
            title: "The Coming of Age",
            subtitle: "The Trial",
            text: "To become a warrior, you faced the trial of the ancients, venturing alone into the forbidden ruins...",
            duration: 4000,
            effects: 'tribal-chant'
          },
          {
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
            title: "The Vision Quest",
            subtitle: "A Greater Purpose",
            text: "The spirits showed you a vision of a world beyond your tribe, a destiny you must fulfill...",
            duration: 4000,
            effects: 'tribal-vision'
          }
        ];
      
      case 'raider':
        return [
          {
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%)',
            title: "Blood and Fire",
            subtitle: "The Raider's Life",
            text: "You were once part of the feared Red Eye Raiders, taking what you wanted through violence and intimidation...",
            duration: 4000,
            effects: 'raider-fire'
          },
          {
            background: 'linear-gradient(135deg, #ffcc02 0%, #f7931e 50%, #ff6b35 100%)',
            title: "The Turning Point",
            subtitle: "A Line Crossed",
            text: "But when your gang attacked an innocent settlement, something inside you finally broke...",
            duration: 4000,
            effects: 'raider-attack'
          },
          {
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%)',
            title: "Redemption's Path",
            subtitle: "A New Beginning",
            text: "Now you seek to atone for your past, using your skills to protect rather than harm...",
            duration: 4000,
            effects: 'raider-redemption'
          }
        ];
      
      default:
        return [
          {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            title: "The Wasteland",
            subtitle: "A Survivor's Tale",
            text: "In the harsh post-apocalyptic world, you've learned to survive against all odds...",
            duration: 4000,
            effects: 'default-background'
          },
          {
            background: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
            title: "A New Chapter",
            subtitle: "Your Journey Begins",
            text: "Now you face new challenges that will test everything you've learned...",
            duration: 4000,
            effects: 'default-journey'
          }
        ];
    }
  };

  const scenes = getCutsceneData();

  // Initialize audio
  useEffect(() => {
    if (!audioInitialized) {
      // Background music based on character background
      let musicPath = '/assets/audio/vault-theme.mp3';
      
      switch(character.background) {
        case 'vault_dweller':
          musicPath = '/assets/audio/vault-theme.mp3';
          break;
        case 'wasteland_wanderer':
          musicPath = '/assets/audio/wasteland-theme.mp3';
          break;
        case 'tribal':
          musicPath = '/assets/audio/tribal-theme.mp3';
          break;
        case 'raider':
          musicPath = '/assets/audio/raider-theme.mp3';
          break;
      }
      
      const bgm = new Audio(musicPath);
      bgm.loop = true;
      bgm.volume = 0.4;
      setBackgroundMusic(bgm);
      
      setAudioInitialized(true);
    }
  }, [audioInitialized, character.background]);

  // Play background music
  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
      
      return () => {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      };
    }
  }, [backgroundMusic]);

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
      // Prevent multiple clicks by disabling the button
      setCanSkip(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-1000 overflow-hidden"
      style={{ background: scenes[currentScene].background }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {scenes[currentScene].effects === 'vault-hum' && (
          <div className="absolute inset-0 bg-blue-900 opacity-10 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'vault-lights' && (
          <>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-1 bg-yellow-400 opacity-50 animate-pulse"
                style={{
                  left: `${10 + (i * 8)}%`,
                  top: '10%',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </>
        )}
        {scenes[currentScene].effects === 'vault-door' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-8 border-yellow-400 opacity-30 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'wasteland-wind' && (
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
        {scenes[currentScene].effects === 'caravan-movement' && (
          <div className="absolute bottom-20 w-full h-20 bg-gradient-to-r from-transparent via-black to-transparent opacity-20 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'footsteps' && (
          <>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-8 bg-yellow-800 opacity-20"
                style={{
                  left: `${30 + (i * 5)}%`,
                  bottom: `${20 + (i % 2 === 0 ? 5 : 0)}%`,
                  transform: `rotate(${i % 2 === 0 ? 15 : -15}deg)`
                }}
              />
            ))}
          </>
        )}
        {scenes[currentScene].effects === 'tribal-drums' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-900 to-transparent opacity-10 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'tribal-chant' && (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 rounded-full bg-yellow-600 opacity-10 animate-pulse"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: '30%',
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </>
        )}
        {scenes[currentScene].effects === 'tribal-vision' && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-transparent opacity-20 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'raider-fire' && (
          <>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-12 bg-gradient-to-t from-red-600 to-yellow-400 opacity-30 animate-pulse"
                style={{
                  left: `${10 + (i * 8)}%`,
                  bottom: '10%',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </>
        )}
        {scenes[currentScene].effects === 'raider-attack' && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-transparent opacity-30 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'raider-redemption' && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-transparent opacity-20 animate-pulse" />
        )}
        
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
          Skip
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

export default BackgroundCutscene;