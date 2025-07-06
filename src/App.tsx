import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import MainMenu from './components/UI/MainMenu';
import CharacterCreation from './components/UI/CharacterCreation';
import GameCanvas from './components/GameCanvas';
import { GameEngine } from './engine/GameEngine';
import InventoryScreen from './components/InventoryScreen';
import EquipmentScreen from './components/EquipmentScreen';
import CombatScreen from './components/CombatScreen';
import DialogueScreen from './components/DialogueScreen';
import TradingScreen from './components/TradingScreen';
import QuestScreen from './components/QuestScreen';
import CharacterScreen from './components/CharacterScreen';
import MapScreen from './components/MapScreen';
import CharacterSheet from './components/CharacterSheet';
import LootScreen from './components/LootScreen';
import QuestLog from './components/QuestLog';
import DevMode from './components/DevMode';
import GameOverScreen from './components/GameOverScreen';

function App() {
  const {
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
    completeQuest,
    updateQuestProgress
  } = useGameState();

  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [currentLootable, setCurrentLootable] = useState<any>(null);
  const [showTrading, setShowTrading] = useState(false);
  const [tradingNPC, setTradingNPC] = useState<any>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const engineRef = useRef<GameEngine | null>(null);

  // Listen for lootable events from the game engine
  useEffect(() => {
    const handleOpenLootable = (event: any) => {
      setCurrentLootable(event.detail);
    };
    
    window.addEventListener('openLootable', handleOpenLootable);
    return () => window.removeEventListener('openLootable', handleOpenLootable);
  }, []);

  // Check for game over condition
  useEffect(() => {
    if (gameState && gameState.player.health <= 0 && !showGameOver) {
      setShowGameOver(true);
    }
  }, [gameState?.player.health]); // Remove showGameOver dependency

  const handleSettings = () => {
    // Settings modal would be implemented here
    console.log('Settings clicked');
  };

  const handleUseItem = (item: any, characterId?: string) => {
    if (gameState) {
      // This would be handled by the game engine
      console.log('Using item:', item.name, 'on character:', characterId);
    }
  };

  const handleEquipItem = (item: any, characterId: string) => {
    if (gameState) {
      const newState = JSON.parse(JSON.stringify(gameState)); // Deep clone
      
      // Find character
      let character = newState.party.find((c: any) => c.id === characterId);
      if (!character) return;
      
      // Remove item from inventory
      const itemIndex = newState.inventory.findIndex((i: any) => i.id === item.id);
      if (itemIndex >= 0) {
        newState.inventory.splice(itemIndex, 1);
      }
      
      // Unequip current item if any
      const equipmentSlot = item.type;
      const currentItem = character.equipment[equipmentSlot];
      if (currentItem) {
        newState.inventory.push(currentItem);
      }
      
      // Equip new item
      character.equipment[equipmentSlot] = item;
      
      // Recalculate derived stats
      updateCharacterStats(character);
      
      // Update all character references
      const allCharIndex = newState.allCharacters.findIndex((c: any) => c.id === characterId);
      if (allCharIndex >= 0) {
        newState.allCharacters[allCharIndex] = character;
      }
      
      if (characterId === newState.player.id) {
        newState.player = character;
      }
      
      updateGameState(newState);
    }
  };

  const handleEquipToSlot = (characterId: string, item: any, slot: string) => {
    if (gameState) {
      handleEquipItem(item, characterId);
    }
  };

  const handleUnequipItem = (characterId: string, slot: string) => {
    if (gameState) {
      const newState = JSON.parse(JSON.stringify(gameState)); // Deep clone
      
      // Find character
      let character = newState.party.find((c: any) => c.id === characterId);
      if (!character) return;
      
      // Get current item in slot
      const currentItem = character.equipment[slot];
      if (!currentItem) return;
      
      // Add item back to inventory
      newState.inventory.push(currentItem);
      
      // Remove item from equipment
      character.equipment[slot] = undefined;
      
      // Recalculate derived stats
      updateCharacterStats(character);
      
      // Update all character references
      const allCharIndex = newState.allCharacters.findIndex((c: any) => c.id === characterId);
      if (allCharIndex >= 0) {
        newState.allCharacters[allCharIndex] = character;
      }
      
      if (characterId === newState.player.id) {
        newState.player = character;
      }
      
      updateGameState(newState);
    }
  };

  const updateCharacterStats = (character: any) => {
    // Reset derived stats to base values
    const baseStats = character.stats;
    
    // Calculate equipment bonuses
    let equipmentBonuses = {
      damage: 0,
      defense: 0,
      strength: 0,
      agility: 0,
      intelligence: 0,
      endurance: 0,
      luck: 0,
      criticalChance: 0
    };

    // Sum up all equipment bonuses
    Object.values(character.equipment).forEach((item: any) => {
      if (item?.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (stat in equipmentBonuses) {
            equipmentBonuses[stat as keyof typeof equipmentBonuses] += (value as number) || 0;
          }
        });
      }
    });

    // Update derived stats with equipment bonuses
    character.derivedStats = {
      carryWeight: (baseStats.strength + equipmentBonuses.strength) * 10,
      actionPoints: Math.floor((baseStats.agility + equipmentBonuses.agility) / 2),
      criticalChance: (baseStats.luck + equipmentBonuses.luck) + equipmentBonuses.criticalChance,
      damageResistance: equipmentBonuses.defense,
      radiationResistance: (baseStats.endurance + equipmentBonuses.endurance) * 2
    };
    
    character.equipmentBonuses = equipmentBonuses;
  };

  const handleCombatAction = (action: string, targetIndex?: number) => {
    if (gameState?.combat) {
      const engine = (window as any).gameEngine;
      if (engine) {
        engine.handleCombatAction(action, targetIndex);
      }
    }
  };

  const handleEndCombat = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.combat = undefined;
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleCloseInventory = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleCloseEquipment = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleCloseDialogue = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.dialogue = undefined;
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleCloseQuests = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleCloseCharacter = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleCloseMap = () => {
    if (gameState) {
      const newState = { ...gameState };
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleOpenTrading = (npc: any) => {
    setTradingNPC(npc);
    setShowTrading(true);
    
    // Hide dialogue when opening trading
    if (gameState) {
      const newState = { ...gameState };
      newState.dialogue = undefined;
      updateGameState(newState);
    }
  };

  const handleCloseTrading = () => {
    setShowTrading(false);
    setTradingNPC(null);
    
    // Return to exploration mode
    if (gameState) {
      const newState = { ...gameState };
      newState.gameMode = 'exploration';
      updateGameState(newState);
    }
  };

  const handleBuyItem = (item: any, quantity: number) => {
    if (gameState) {
      const totalCost = item.value * quantity;
      if (gameState.gold >= totalCost) {
        const newState = { ...gameState };
        newState.gold -= totalCost;
        
        // Add item to inventory
        const existingItem = newState.inventory.find(i => i.id === item.id);
        if (existingItem && existingItem.stackable) {
          existingItem.quantity = (existingItem.quantity || 1) + quantity;
        } else {
          newState.inventory.push({ ...item, quantity: item.stackable ? quantity : 1 });
        }
        
        updateGameState(newState);
      }
    }
  };

  const handleSellItem = (item: any, quantity: number) => {
    if (gameState) {
      const sellPrice = Math.floor(item.value * 0.6) * quantity;
      const newState = { ...gameState };
      newState.gold += sellPrice;
      
      // Remove item from inventory
      const itemIndex = newState.inventory.findIndex(i => i.id === item.id);
      if (itemIndex >= 0) {
        const inventoryItem = newState.inventory[itemIndex];
        if (inventoryItem.quantity && inventoryItem.quantity > quantity) {
          inventoryItem.quantity -= quantity;
        } else {
          newState.inventory.splice(itemIndex, 1);
        }
      }
      
      updateGameState(newState);
    }
  };

  const handleToggleCharacterSheet = () => {
    setShowCharacterSheet(!showCharacterSheet);
  };

  const handleDevModeUpdate = (newDevMode: any) => {
    if (gameState) {
      updateGameState({
        ...gameState,
        devMode: newDevMode
      });
    }
  };

  const handleCreateQuest = (quest: any) => {
    if (gameState) {
      updateGameState({
        ...gameState,
        quests: [...gameState.quests, quest]
      });
    }
  };

  const handleCreateNPC = (npc: any) => {
    if (gameState) {
      updateGameState({
        ...gameState,
        currentMap: {
          ...gameState.currentMap,
          npcs: [...gameState.currentMap.npcs, npc]
        }
      });
    }
  };

  const handleCreateItem = (item: any) => {
    if (gameState) {
      updateGameState({
        ...gameState,
        inventory: [...gameState.inventory, item]
      });
    }
  };

  const handleOpenLootable = (lootable: any) => {
    setCurrentLootable(lootable);
  };

  const handleTakeItem = (item: any, quantity?: number) => {
    if (gameState && currentLootable) {
      // Add item to inventory
      const existingItem = gameState.inventory.find(invItem => 
        invItem.id === item.id && invItem.stackable
      );
      
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (quantity || 1);
      } else {
        gameState.inventory.push({ ...item, quantity: quantity || 1 });
      }
      
      // Remove item from lootable
      const itemIndex = currentLootable.items.findIndex((lootItem: any, index: number) => 
        `${lootItem.id}_${index}` === `${item.id}_${currentLootable.items.indexOf(item)}`
      );
      
      if (itemIndex >= 0) {
        currentLootable.items.splice(itemIndex, 1);
      }
      
      updateGameState({ ...gameState });
    }
  };

  const handleTakeAllItems = () => {
    if (gameState && currentLootable) {
      currentLootable.items.forEach((item: any) => {
        handleTakeItem(item, item.quantity);
      });
      currentLootable.items = [];
      currentLootable.looted = true;
      updateGameState({ ...gameState });
    }
  };

  const handleGameOverLoadGame = () => {
    setShowGameOver(false);
    setGameMode('menu');
  };

  const handleGameOverMainMenu = () => {
    setShowGameOver(false);
    setGameMode('menu');
    setGameState(null);
  };

  switch (gameMode) {
    case 'menu':
      return (
        <MainMenu
          onNewGame={startNewGame}
          onLoadGame={loadGame}
          onSettings={handleSettings}
          onQuit={quitGame}
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      );

    case 'character-creation':
      return (
        <CharacterCreation
          onCreateCharacter={(characterData) => createNewGame(characterData.name, characterData.class)}
          onBack={returnToMenu}
        />
      );

    case 'playing':
      if (!gameState) return <div>Loading...</div>;

      // Show game over screen if player is dead
      if (showGameOver) {
        return (
          <GameOverScreen
            onLoadGame={handleGameOverLoadGame}
            onMainMenu={handleGameOverMainMenu}
          />
        );
      }

      // Handle different game modes
      if (gameState.gameMode === 'inventory') {
        return (
          <InventoryScreen
            inventory={gameState.inventory}
            party={gameState.party}
            onUseItem={handleUseItem}
            onEquipItem={handleEquipItem}
            onClose={handleCloseInventory}
          />
        );
      }

      if (gameState.gameMode === 'equipment') {
        return (
          <EquipmentScreen
            party={gameState.party}
            inventory={gameState.inventory}
            onEquipItem={handleEquipToSlot}
            onUnequipItem={handleUnequipItem}
            onClose={handleCloseEquipment}
          />
        );
      }

      if (gameState.gameMode === 'dialogue' && gameState.dialogue) {
        return (
          <DialogueScreen
            dialogue={gameState.dialogue}
            npcs={gameState.currentMap.npcs}
            onChoice={handleDialogueChoice}
            onOpenTrading={handleOpenTrading}
            onClose={handleCloseDialogue}
          />
        );
      }

      if (showTrading && tradingNPC) {
        return (
          <TradingScreen
            npc={tradingNPC}
            playerInventory={gameState.inventory}
            playerGold={gameState.gold}
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
            onClose={handleCloseTrading}
          />
        );
      }

      if (gameState.gameMode === 'quests') {
        return (
          <QuestScreen
            quests={gameState.quests}
            completedQuests={gameState.completedQuests}
            onClose={handleCloseQuests}
          />
        );
      }

      if (gameState.gameMode === 'character') {
        return (
          <CharacterScreen
            character={gameState.player}
            onClose={handleCloseCharacter}
          />
        );
      }

      if (gameState.gameMode === 'map') {
        return (
          <MapScreen
            gameMap={gameState.currentMap}
            playerPosition={gameState.player.position}
            visibilityMap={gameState.visibilityMap}
            onClose={handleCloseMap}
          />
        );
      }

      if (gameState.gameMode === 'combat' && gameState.combat) {
        return (
          <CombatScreen
            combatState={gameState.combat}
            onAction={handleCombatAction}
            onEndCombat={handleEndCombat}
          />
        );
      }

      return (
        <div className="relative">
          <GameCanvas
            gameState={gameState}
            settings={settings}
            onGameStateChange={updateGameState}
          />
          
          {/* Loot Screen */}
          {currentLootable && (
            <LootScreen
              lootable={currentLootable}
              playerInventory={gameState.inventory}
              onTakeItem={handleTakeItem}
              onTakeAll={handleTakeAllItems}
              onClose={() => setCurrentLootable(null)}
            />
          )}
          
          {/* Dialogue Screen */}
          {gameState.dialogue && (
            <DialogueScreen
              dialogue={gameState.dialogue}
              npcs={gameState.currentMap.npcs}
              onChoice={handleDialogueChoice}
              onOpenTrading={handleOpenTrading}
              onClose={() => {
                updateGameState({
                  ...gameState,
                  dialogue: undefined,
                  gameMode: 'exploration'
                });
              }}
            />
          )}
          
          {/* Quest Log */}
          {showQuestLog && (
            <QuestLog
              quests={gameState.quests}
              completedQuests={gameState.completedQuests}
              onClose={() => setShowQuestLog(false)}
            />
          )}
          
          {/* Character Sheet Modal */}
          {showCharacterSheet && (
            <CharacterSheet
              character={gameState.player}
              onClose={() => setShowCharacterSheet(false)}
            />
          )}
          
          {/* Dev Mode */}
          {gameState.devMode && (
            <DevMode
              devMode={gameState.devMode}
              onUpdateDevMode={handleDevModeUpdate}
              onCreateQuest={handleCreateQuest}
              onCreateNPC={handleCreateNPC}
              onCreateItem={handleCreateItem}
            />
          )}
          
          {/* Game UI Overlay */}
          <div className="absolute top-4 right-4 space-y-2">
            <button
              onClick={() => {
                const newState = { ...gameState };
                newState.gameMode = 'inventory';
                updateGameState(newState);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all block"
            >
              Inventory (I)
            </button>
            <button
              onClick={() => {
                const newState = { ...gameState };
                newState.gameMode = 'equipment';
                updateGameState(newState);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all block"
            >
              Equipment (E)
            </button>
            <button
              onClick={() => {
                const newState = { ...gameState };
                newState.gameMode = 'character';
                updateGameState(newState);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all block"
            >
              Character (C)
            </button>
            <button
              onClick={() => {
                const newState = { ...gameState };
                newState.gameMode = 'quests';
                updateGameState(newState);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all block"
            >
              Quests (Q)
            </button>
            <button
              onClick={() => {
                const newState = { ...gameState };
                newState.gameMode = 'map';
                updateGameState(newState);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all block"
            >
              Map (M)
            </button>
            <button
              onClick={() => saveGame(1)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all block"
            >
              Quick Save
            </button>
            <button
              onClick={returnToMenu}
              className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg border border-red-600 transition-all block"
            >
              Main Menu
            </button>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">Controls:</h3>
            <div className="text-sm space-y-1">
              <div>• Arrow Keys / WASD: Move</div>
              <div>• Space: Interact with NPCs/Enemies</div>
              <div>• F/Space: Enter Buildings / Interact</div>
              <div>• I: Inventory</div>
              <div>• E: Equipment</div>
              <div>• M: Map</div>
              <div>• C: Character Sheet</div>
              <div>• Q: Quests</div>
              <div>• F1: Dev Mode</div>
              <div>• ESC: Menu</div>
              {gameState.currentMap.isInterior && (
                <div className="text-yellow-400 font-bold">• ESC: Exit Building</div>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return <div>Loading...</div>;
  }
}

export default App;