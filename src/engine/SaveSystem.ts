import { SaveData, GameState, GameSettings } from '../types/game';

export class SaveSystem {
  private static readonly SAVE_KEY_PREFIX = 'wasteland_rpg_save_';
  private static readonly SETTINGS_KEY = 'wasteland_rpg_settings';
  private static readonly MAX_SAVES = 10;
  
  static saveGame(slot: number, gameState: GameState, settings: GameSettings): boolean {
    try {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        gameState: { ...gameState },
        settings: { ...settings }
      };
      
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      // Update save list
      this.updateSaveList(slot, saveData);
      
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }
  
  static loadGame(slot: number): SaveData | null {
    try {
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      const saveDataString = localStorage.getItem(saveKey);
      
      if (!saveDataString) {
        return null;
      }
      
      const saveData: SaveData = JSON.parse(saveDataString);
      
      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.error('Invalid save data');
        return null;
      }
      
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }
  
  static deleteSave(slot: number): boolean {
    try {
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      localStorage.removeItem(saveKey);
      
      // Update save list
      this.updateSaveList(slot, null);
      
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }
  
  static getSaveList(): Array<{ slot: number; timestamp: number; playerName: string; level: number; playtime: number } | null> {
    const saves: Array<{ slot: number; timestamp: number; playerName: string; level: number; playtime: number } | null> = [];
    
    for (let i = 0; i < this.MAX_SAVES; i++) {
      try {
        const saveKey = `${this.SAVE_KEY_PREFIX}${i}`;
        const saveDataString = localStorage.getItem(saveKey);
        
        if (saveDataString) {
          const saveData: SaveData = JSON.parse(saveDataString);
          saves[i] = {
            slot: i,
            timestamp: saveData.timestamp,
            playerName: saveData.gameState.player.name,
            level: saveData.gameState.player.level,
            playtime: saveData.gameState.statistics.playtime
          };
        } else {
          saves[i] = null;
        }
      } catch (error) {
        saves[i] = null;
      }
    }
    
    return saves;
  }
  
  static saveSettings(settings: GameSettings): boolean {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }
  
  static loadSettings(): GameSettings {
    try {
      const settingsString = localStorage.getItem(this.SETTINGS_KEY);
      
      if (settingsString) {
        return JSON.parse(settingsString);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    // Return default settings
    return {
      masterVolume: 1.0,
      musicVolume: 0.8,
      sfxVolume: 0.8,
      graphics: 'high',
      lowGraphicsMode: false,
      autoDetectPerformance: true,
      fullscreen: false,
      showFPS: true,
      autoSave: true,
      difficulty: 'normal'
    };
  }
  
  static exportSave(slot: number): string | null {
    const saveData = this.loadGame(slot);
    if (!saveData) {
      return null;
    }
    
    return btoa(JSON.stringify(saveData));
  }
  
  static importSave(slot: number, exportedData: string): boolean {
    try {
      const saveData: SaveData = JSON.parse(atob(exportedData));
      
      if (!this.validateSaveData(saveData)) {
        return false;
      }
      
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      this.updateSaveList(slot, saveData);
      
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
  
  private static validateSaveData(saveData: SaveData): boolean {
    return (
      saveData &&
      saveData.version &&
      saveData.timestamp &&
      saveData.gameState &&
      saveData.gameState.player &&
      saveData.gameState.player.name &&
      typeof saveData.gameState.player.level === 'number'
    );
  }
  
  private static updateSaveList(slot: number, saveData: SaveData | null): void {
    try {
      const saveListKey = 'wasteland_rpg_save_list';
      let saveList = JSON.parse(localStorage.getItem(saveListKey) || '{}');
      
      if (saveData) {
        saveList[slot] = {
          timestamp: saveData.timestamp,
          playerName: saveData.gameState.player.name,
          level: saveData.gameState.player.level,
          playtime: saveData.gameState.statistics.playtime
        };
      } else {
        delete saveList[slot];
      }
      
      localStorage.setItem(saveListKey, JSON.stringify(saveList));
    } catch (error) {
      console.error('Failed to update save list:', error);
    }
  }
  
  static autoSave(gameState: GameState, settings: GameSettings): boolean {
    if (!settings.autoSave) {
      return false;
    }
    
    // Use slot 0 for autosave
    return this.saveGame(0, gameState, settings);
  }
  
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    
    for (let key in localStorage) {
      if (key.startsWith(this.SAVE_KEY_PREFIX) || key === this.SETTINGS_KEY) {
        used += localStorage[key].length;
      }
    }
    
    // Estimate total available storage (5MB is typical for localStorage)
    const total = 5 * 1024 * 1024;
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }
  
  static clearAllSaves(): boolean {
    try {
      for (let i = 0; i < this.MAX_SAVES; i++) {
        const saveKey = `${this.SAVE_KEY_PREFIX}${i}`;
        localStorage.removeItem(saveKey);
      }
      
      localStorage.removeItem('wasteland_rpg_save_list');
      
      return true;
    } catch (error) {
      console.error('Failed to clear saves:', error);
      return false;
    }
  }
}