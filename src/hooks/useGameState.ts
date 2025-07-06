import { useState, useCallback, useEffect } from 'react';
import { GameState, Character, GameSettings, Item, DialogueChoice, Quest } from '../types/game';
import { createStartingCharacter, achievements, items } from '../data/gameData';
import { createAllMaps } from '../data/maps';
import { maps } from '../data/maps';
import { allQuests } from '../data/quests';
import { SaveSystem } from '../engine/SaveSystem';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>(SaveSystem.loadSettings());
  const [gameMode, setGameMode] = useState<'menu' | 'character-creation' | 'playing'>('menu');

  // Auto-save every 30 seconds
  useEffect(() => {
    if (gameState && settings.autoSave) {
      const autoSaveInterval = setInterval(() => {
        SaveSystem.autoSave(gameState, settings);
      }, 30000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [gameState, settings.autoSave]);

  const updateGameState = useCallback((newState: GameState) => {
    // Avoid deep cloning for performance - just update the reference
    setGameState(newState);
  }, []);

  const createNewGame = useCallback((playerName: string, characterClass: any) => {
    const player = createStartingCharacter(playerName, characterClass);
    // Only create the starting map initially
    const startingMap = maps['capital_wasteland']();
    
    // Add starting items to inventory
    const startingInventory: Item[] = [
      { ...items.find(i => i.id === 'stimpak')!, quantity: 3 },
      { ...items.find(i => i.id === 'scrap_metal')!, quantity: 5 },
      { ...items.find(i => i.id === 'combat_knife')! },
      { ...items.find(i => i.id === 'combat_armor')! }
    ];
    
    const newGameState: GameState = {
      player,
      party: [player],
      allCharacters: [player],
      inventory: startingInventory,
      gold: 100,
      currentMap: startingMap,
      availableMaps: { capital_wasteland: startingMap }, // Keep at least the starting map
      mapPosition: { x: 25, y: 25 },
      camera: { x: 0, y: 0 },
      gameTime: 0,
      dayNightCycle: 0.5, // Start at noon
      weather: 'clear',
      quests: [],
      completedQuests: [],
      discoveredMaps: ['wasteland'],
      gameMode: 'exploration',
      base: {
        level: 1,
        name: 'Survivor\'s Haven',
        facilities: {
          workshop: 1,
          medical: 1,
          storage: 1,
          training: 1
        },
        resources: {
          scrap: 50,
          food: 30,
          medicine: 10,
          fuel: 20,
          electronics: 5,
          rare_materials: 0
        },
        defenses: [],
        population: 1,
        morale: 75
      },
      achievements: [...achievements],
      statistics: {
        playtime: 0,
        enemiesKilled: 0,
        questsCompleted: 0,
        itemsFound: 0,
        distanceTraveled: 0,
        damageDealt: 0,
        damageTaken: 0,
        healingDone: 0,
        goldEarned: 0,
        goldSpent: 0
      },
      visibilityMap: [],
      quests: [allQuests.find(q => q.id === 'escape_vault_101')!], // Start with the escape quest
      devMode: {
        enabled: false,
        selectedTool: 'quest',
        questEditor: {
          id: '',
          title: '',
          description: '',
          objectives: [],
          rewards: [],
          requiredLevel: 1
        },
        npcEditor: {
          id: '',
          name: '',
          type: 'neutral',
          position: { x: 400, y: 400 },
          dialogue: [],
          inventory: [],
          faction: 'neutral',
          isHostile: false
        },
        itemEditor: {
          id: '',
          name: '',
          type: 'material',
          rarity: 'common',
          description: '',
          stats: {},
          value: 10,
          stackable: false
        }
      }
    };

    setGameState(newGameState);
    setGameMode('playing');
  }, []);

  const loadGame = useCallback((slot: number) => {
    const saveData = SaveSystem.loadGame(slot);
    if (saveData) {
      setGameState(saveData.gameState);
      setSettings(saveData.settings);
      setGameMode('playing');
      return true;
    }
    return false;
  }, []);

  const saveGame = useCallback((slot: number) => {
    if (gameState) {
      return SaveSystem.saveGame(slot, gameState, settings);
    }
    return false;
  }, [gameState, settings]);

  const handleDialogueChoice = useCallback((choiceId: string) => {
    if (!gameState || !gameState.dialogue) return;

    const npc = gameState.currentMap.npcs.find(n => n.id === gameState.dialogue!.npcId);
    if (!npc) return;

    const currentNode = npc.dialogue.find(d => d.id === gameState.dialogue!.currentNode);
    const choice = currentNode?.choices.find(c => c.id === choiceId);
    
    if (!choice) return;

    const newState = { ...gameState };
    
    // Add to history
    newState.dialogue!.history.push(`You: ${choice.text}`);
    
    // Handle choice actions
    if (choice.action === 'give_quest' && npc.quests) {
      // Give quest to player
      npc.quests.forEach(quest => {
        const existingQuest = newState.quests.find(q => q.id === quest.id);
        if (!existingQuest) {
          newState.quests.push({ ...quest, status: 'active' });
        }
      });
    }
    
    if (choice.action === 'open_trade') {
      // TODO: Implement trading system
      console.log('Opening trade with', npc.name);
    }
    
    // Move to next dialogue node or end conversation
    if (choice.nextNode) {
      const nextNode = npc.dialogue.find(d => d.id === choice.nextNode);
      if (nextNode) {
        newState.dialogue!.currentNode = choice.nextNode;
        newState.dialogue!.choices = nextNode.choices;
        newState.dialogue!.history.push(`${npc.name}: ${nextNode.text}`);
      }
    } else {
      // End conversation
      newState.dialogue = undefined;
      newState.gameMode = 'exploration';
    }
    
    updateGameState(newState);
  }, [gameState]);

  const updateQuestProgress = useCallback((questId: string, objectiveId: string, amount: number = 1) => {
    if (!gameState) return;

    const newState = { ...gameState };
    const quest = newState.quests.find(q => q.id === questId);
    
    if (quest && quest.status === 'active') {
      const objective = quest.objectives.find(obj => obj.id === objectiveId);
      if (objective && !objective.completed) {
        objective.current = Math.min(objective.current + amount, objective.required);
        if (objective.current >= objective.required) {
          objective.completed = true;
        }
        
        // Check if all objectives are completed
        const allCompleted = quest.objectives.every(obj => obj.completed);
        if (allCompleted) {
          quest.status = 'completed';
          newState.completedQuests.push(quest.id);
          
          // Give rewards
          quest.rewards.forEach(reward => {
            if (reward.type === 'experience') {
              newState.player.experience += reward.value;
              // Check for level up
              while (newState.player.experience >= newState.player.experienceToNext) {
                newState.player.experience -= newState.player.experienceToNext;
                newState.player.level++;
                newState.player.experienceToNext = newState.player.level * 100;
                newState.player.maxHealth += 10;
                newState.player.maxEnergy += 5;
                newState.player.health = newState.player.maxHealth;
                newState.player.energy = newState.player.maxEnergy;
              }
            } else if (reward.type === 'gold') {
              newState.gold += reward.value;
            } else if (reward.type === 'item' && reward.item) {
              newState.inventory.push({ ...reward.item });
            }
          });
        }
      }
    }
    
    updateGameState(newState);
  }, [gameState, updateGameState]);

  // Auto-update quest progress based on game events
  useEffect(() => {
    if (!gameState) return;

    const newState = { ...gameState };
    let updated = false;

    // Update exploration quest progress
    const explorationQuest = newState.quests.find(q => q.id === 'first_steps');
    if (explorationQuest && explorationQuest.status === 'active') {
      const exploreObjective = explorationQuest.objectives.find(obj => obj.id === 'explore_tiles');
      if (exploreObjective && !exploreObjective.completed) {
        const discoveredTiles = newState.currentMap.tiles.flat().filter(tile => tile.discovered).length;
        if (discoveredTiles > exploreObjective.current) {
          exploreObjective.current = Math.min(discoveredTiles, exploreObjective.required);
          if (exploreObjective.current >= exploreObjective.required) {
            exploreObjective.completed = true;
          }
          updated = true;
        }
      }
    }

    // Check if any quest is completed
    newState.quests.forEach(quest => {
      if (quest.status === 'active') {
        const allCompleted = quest.objectives.every(obj => obj.completed);
        if (allCompleted) {
          quest.status = 'completed';
          if (!newState.completedQuests.includes(quest.id)) {
            newState.completedQuests.push(quest.id);
          }
          
          // Give rewards
          quest.rewards.forEach(reward => {
            if (reward.type === 'experience') {
              newState.player.experience += reward.value;
              // Check for level up
              while (newState.player.experience >= newState.player.experienceToNext) {
                newState.player.experience -= newState.player.experienceToNext;
                newState.player.level++;
                newState.player.experienceToNext = newState.player.level * 100;
                newState.player.maxHealth += 10;
                newState.player.maxEnergy += 5;
                newState.player.health = newState.player.maxHealth;
                newState.player.energy = newState.player.maxEnergy;
              }
            } else if (reward.type === 'gold') {
              newState.gold += reward.value;
            } else if (reward.type === 'item' && reward.item) {
              newState.inventory.push({ ...reward.item });
            }
          });
          updated = true;
        }
      }
    });

    if (updated) {
      updateGameState(newState);
    }
  }, [gameState?.currentMap.tiles, gameState?.quests, updateGameState]);

  const completeQuest = useCallback((questId: string) => {
    if (!gameState) return;

    const newState = { ...gameState };
    const quest = newState.quests.find(q => q.id === questId);
    
    if (quest) {
      quest.status = 'completed';
      if (!newState.completedQuests.includes(questId)) {
        newState.completedQuests.push(questId);
      }
      updateGameState(newState);
    }
  }, [gameState, updateGameState]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    SaveSystem.saveSettings(updatedSettings);
  }, [settings]);

  const startNewGame = useCallback(() => {
    setGameMode('character-creation');
  }, []);

  const returnToMenu = useCallback(() => {
    setGameMode('menu');
    setGameState(null);
  }, []);

  const quitGame = useCallback(() => {
    // In a real application, this might close the window or navigate away
    console.log('Quitting game...');
  }, []);

  return {
    gameState,
    settings,
    gameMode,
    createNewGame,
    loadGame,
    saveGame,
    updateSettings,
    updateGameState,
    startNewGame,
    returnToMenu,
    quitGame,
    handleDialogueChoice,
    updateQuestProgress,
    completeQuest
  };
};