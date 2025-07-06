import React, { useState, useEffect } from 'react';
import { Play, SkipForward } from 'lucide-react';

interface IntroSequenceProps {
  onComplete: () => void;
}

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showText, setShowText] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  const scenes = [
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
    },
    {
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
      title: "Vault 101",
      subtitle: "Your Story Begins",
      text: "Born in the safety of an underground vault, you've never seen the surface world...",
      duration: 4000,
      effects: 'vault-hum'
    },
    {
      background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
      title: "Until Now",
      subtitle: "The Wasteland Awaits",
      text: "Your father has left the vault, breaking the most sacred rule. Now you must follow...",
      duration: 4000,
      effects: 'door-opening'
    }
  ];

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
  }, [currentScene, onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-1000 overflow-hidden"
      style={{ background: scenes[currentScene].background }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {scenes[currentScene].effects === 'nuclear-flash' && (
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'wasteland-wind' && (
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
        )}
        {scenes[currentScene].effects === 'vault-hum' && (
          <div className="absolute inset-0 bg-blue-900 opacity-10 animate-pulse" />
        )}
        {scenes[currentScene].effects === 'door-opening' && (
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black animate-pulse" />
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