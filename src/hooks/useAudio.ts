import { useCallback, useRef, useEffect } from 'react';

export const useAudio = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({
    menu: null,
    combat: null,
    exploration: null,
    victory: null,
    defeat: null,
    sfx: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements if they don't exist
    if (!audioRefs.current.menu) {
      audioRefs.current.menu = new Audio('/assets/audio/menu-theme.mp3');
    }
    if (!audioRefs.current.combat) {
      audioRefs.current.combat = new Audio('/assets/audio/combat-theme.mp3');
    }
    if (!audioRefs.current.exploration) {
      audioRefs.current.exploration = new Audio('/assets/audio/exploration-theme.mp3');
    }
    if (!audioRefs.current.victory) {
      audioRefs.current.victory = new Audio('/assets/audio/victory.mp3');
    }
    if (!audioRefs.current.defeat) {
      audioRefs.current.defeat = new Audio('/assets/audio/defeat.mp3');
    }
    if (!audioRefs.current.sfx) {
      audioRefs.current.sfx = new Audio();
    }

    // Cleanup on unmount
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const playMusic = useCallback((type: 'menu' | 'combat' | 'exploration' | 'victory' | 'defeat', volume = 0.5, loop = true) => {
    // Stop all other music first
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (audio && key !== type && key !== 'sfx') {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audio = audioRefs.current[type];
    if (audio) {
      audio.volume = volume;
      audio.loop = loop;
      
      // Only play if it's not already playing
      if (audio.paused) {
        audio.play().catch(e => console.log(`Failed to play ${type} audio:`, e));
      }
    }
  }, []);

  const stopMusic = useCallback(() => {
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (audio && key !== 'sfx') {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  const playSfx = useCallback((sfxPath: string, volume = 0.5) => {
    const sfx = audioRefs.current.sfx;
    if (sfx) {
      sfx.src = sfxPath;
      sfx.volume = volume;
      sfx.play().catch(e => console.log(`Failed to play SFX:`, e));
    }
  }, []);

  return {
    playMusic,
    stopMusic,
    playSfx
  };
};