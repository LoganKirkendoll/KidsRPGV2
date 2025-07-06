import React, { useState, useEffect } from 'react';
import { Play, SkipForward } from 'lucide-react';

interface IntroScreenProps {
  characterData: any;
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ characterData, onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showText, setShowText] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  // Generate scenes based on character background
  const getBackgroundScenes = (background: string) => {
    const baseScenes = [
      {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        title: "October 23, 2077",
        subtitle: "The Great War",
        text: "The world ended not with a whimper, but with the roar of atomic fire...",
        duration: 4000
      },
      {
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%)',
        title: "200 Years Later",
        subtitle: "The Capital Wasteland",
        text: "From the ashes of the old world, survivors emerge into a harsh new reality...",
        duration: 4000
      }
    ];

    // Add background-specific scenes
    switch (background) {
      case 'vault_dweller':
        return [
          ...baseScenes,
          {
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
            title: "Vault 101",
            subtitle: "Your Story Begins",
            text: "Born in the safety of an underground vault, you've never seen the surface world...",
            duration: 4000
          },
          {
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
            title: "Until Now",
            subtitle: "The Wasteland Awaits",
            text: "Your father has left the vault, breaking the most sacred rule. Now you must follow...",
            duration: 4000
          }
        ];
      
      case 'wasteland_wanderer':
        return [
          ...baseScenes,
          {
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
            title: "Born in the Wastes",
            subtitle: "A Harsh Beginning",
            text: "You've known nothing but the harsh reality of the wasteland your entire life...",
            duration: 4000
          },
          {
            background: 'linear-gradient(135deg, #654321 0%, #8b4513 50%, #a0522d 100%)',
            title: "Survival",
            subtitle: "Your Greatest Skill",
            text: "Where others see only death and destruction, you see opportunity and hope...",
            duration: 4000
          }
        ];
      
      case 'tribal':
        return [
          ...baseScenes,
          {
            background: 'linear-gradient(135deg, #228b22 0%, #32cd32 50%, #90ee90 100%)',
            title: "The Tribe",
            subtitle: "Ancient Ways",
            text: "Your people have maintained the old ways, living in harmony with the changed world...",
            duration: 4000
          },
          {
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
            title: "The Journey",
            subtitle: "Beyond Sacred Lands",
            text: "Now you must venture beyond your tribal lands into the unknown wasteland...",
            duration: 4000
          }
        ];
      
      case 'raider':
        return [
          ...baseScenes,
          {
            background: 'linear-gradient(135deg, #8b0000 0%, #dc143c 50%, #ff6347 100%)',
            title: "The Raider Life",
            subtitle: "Violence and Chaos",
            text: "You once lived by the gun, taking what you needed from the weak...",
            duration: 4000
          },
          {
            background: 'linear-gradient(135deg, #2f4f4f 0%, #696969 50%, #a9a9a9 100%)',
            title: "Redemption",
            subtitle: "A New Path",
            text: "But now you seek a different way, hoping to atone for your past sins...",
            duration: 4000
          }
        ];
      
      default:
        return [
          ...baseScenes,
          {
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
            title: "Your Story",
            subtitle: "Begins Now",
            text: "Whatever your past, the wasteland offers both danger and opportunity...",
            duration: 4000
          }
        ];
    }
  };

  const scenes = getBackgroundScenes(characterData?.background || 'vault_dweller');

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
        setTimeout(() => onComplete(characterData), 2000);
      }
    }, scenes[currentScene].duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(sceneTimer);
    };
  }, [currentScene, onComplete]);

  const handleSkip = () => {
    onComplete(characterData);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-1000"
      style={{ background: scenes[currentScene].background }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10 max-w-4xl mx-auto px-8">
        <div className={`transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white drop-shadow-2xl tracking-wider">
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

      {/* Skip button */}
      {canSkip && (
        <button
          onClick={handleSkip}
          className="fixed bottom-8 right-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 border border-gray-600"
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
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              index === currentScene ? 'bg-yellow-400' : 
              index < currentScene ? 'bg-white' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroScreen;