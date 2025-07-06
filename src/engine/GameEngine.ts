import { GameState, Position, Tile, Character, Enemy, NPC, LootableItem, CombatState, GameMap } from '../types/game';
import { enemies } from '../data/enemies';
import { createAllMaps } from '../data/maps';
import { getBuildingById } from '../data/buildings';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private settings: any;
  private animationId: number | null = null;
  private lastTime = 0;
  private keys: Set<string> = new Set();
  private stateChangeCallback?: (state: GameState) => void;
  private lootableCallback?: (lootable: LootableItem) => void;
  private lastMoveTime = 0;
  private moveDelay = 150; // ms between moves
  private allMaps: { [key: string]: GameMap } = {};

  constructor(canvas: HTMLCanvasElement, initialState: GameState, settings?: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialState };
    this.settings = settings || {};
    
    // Load all maps
    this.allMaps = createAllMaps();
    
    this.setupCanvas();
    this.setupEventListeners();
    this.initializeVisibilityMap();
    this.start();
  }

  private setupCanvas() {
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.imageRendering = 'pixelated';
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.handleKeyPress(e);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      const gameKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'f'];
      if (gameKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
  }

  private handleKeyPress(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    
    // Handle hotkeys
    switch (key) {
      case 'f1':
        this.toggleDevMode();
        break;
      case 'escape':
        if (this.gameState.currentMap.isInterior) {
          this.exitBuilding();
        }
        break;
      case ' ':
      case 'f':
        this.handleInteraction();
        break;
    }
  }

  private handleMovement() {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveDelay) {
      return;
    }

    let dx = 0;
    let dy = 0;

    // Check movement keys
    if (this.keys.has('arrowup') || this.keys.has('w')) dy = -1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy = 1;
    if (this.keys.has('arrowleft') || this.keys.has('a')) dx = -1;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx = 1;

    if (dx !== 0 || dy !== 0) {
      this.movePlayer(dx, dy);
      this.lastMoveTime = currentTime;
    }
  }

  private movePlayer(dx: number, dy: number) {
    const player = this.gameState.player;
    const tileSize = 32;
    const newX = player.position.x + (dx * tileSize);
    const newY = player.position.y + (dy * tileSize);
    
    const mapWidth = this.gameState.currentMap.width * tileSize;
    const mapHeight = this.gameState.currentMap.height * tileSize;

    // Check for map edge transitions
    if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) {
      this.handleMapTransition(dx, dy, newX, newY);
      return;
    }

    // Check tile collision
    const tileX = Math.floor(newX / tileSize);
    const tileY = Math.floor(newY / tileSize);
    
    if (tileX >= 0 && tileX < this.gameState.currentMap.width && 
        tileY >= 0 && tileY < this.gameState.currentMap.height) {
      
      const tile = this.gameState.currentMap.tiles[tileY][tileX];
      
      if (tile.walkable) {
        // Update player position
        player.position.x = newX;
        player.position.y = newY;
        
        // Update direction
        if (dx > 0) player.direction = 'right';
        else if (dx < 0) player.direction = 'left';
        else if (dy > 0) player.direction = 'down';
        else if (dy < 0) player.direction = 'up';
        
        // Update visibility
        this.updateVisibility();
        
        // Update camera
        this.updateCamera();
        
        // Check for interactions
        this.checkTileInteractions(tileX, tileY);
        
        this.notifyStateChange();
      }
    }
  }

  private handleMapTransition(dx: number, dy: number, newX: number, newY: number) {
    const currentMap = this.gameState.currentMap;
    const tileSize = 32;
    
    // Determine transition direction
    let direction: 'north' | 'south' | 'east' | 'west' | null = null;
    
    if (newY < 0) direction = 'north';
    else if (newY >= currentMap.height * tileSize) direction = 'south';
    else if (newX < 0) direction = 'west';
    else if (newX >= currentMap.width * tileSize) direction = 'east';
    
    if (!direction) return;
    
    // Find connection for this direction
    const connection = currentMap.connections.find(conn => conn.direction === direction);
    
    if (!connection) {
      console.log(`No connection found for direction: ${direction}`);
      return;
    }
    
    // Load target map
    const targetMap = this.allMaps[connection.targetMapId];
    if (!targetMap) {
      console.log(`Target map not found: ${connection.targetMapId}`);
      return;
    }
    
    // Calculate new position on target map
    let newPlayerX: number;
    let newPlayerY: number;
    
    switch (direction) {
      case 'north':
        newPlayerX = connection.toPosition.x;
        newPlayerY = (targetMap.height - 1) * tileSize; // Bottom of new map
        break;
      case 'south':
        newPlayerX = connection.toPosition.x;
        newPlayerY = 0; // Top of new map
        break;
      case 'west':
        newPlayerX = (targetMap.width - 1) * tileSize; // Right side of new map
        newPlayerY = connection.toPosition.y;
        break;
      case 'east':
        newPlayerX = 0; // Left side of new map
        newPlayerY = connection.toPosition.y;
        break;
    }
    
    // Ensure the new position is on a walkable tile
    const targetTileX = Math.floor(newPlayerX / tileSize);
    const targetTileY = Math.floor(newPlayerY / tileSize);
    
    if (targetTileX >= 0 && targetTileX < targetMap.width && 
        targetTileY >= 0 && targetTileY < targetMap.height) {
      
      const targetTile = targetMap.tiles[targetTileY][targetTileX];
      
      if (targetTile.walkable) {
        // Perform the transition
        this.gameState.currentMap = targetMap;
        this.gameState.player.position.x = newPlayerX;
        this.gameState.player.position.y = newPlayerY;
        
        // Initialize visibility for new map
        this.initializeVisibilityMap();
        this.updateVisibility();
        this.updateCamera();
        
        console.log(`Transitioned to ${targetMap.name} at position (${newPlayerX}, ${newPlayerY})`);
        this.notifyStateChange();
      } else {
        console.log(`Target position is not walkable on ${targetMap.name}`);
      }
    } else {
      console.log(`Target position is out of bounds on ${targetMap.name}`);
    }
  }

  private checkTileInteractions(tileX: number, tileY: number) {
    const tile = this.gameState.currentMap.tiles[tileY][tileX];
    
    // Mark tile as discovered
    tile.discovered = true;
    
    // Check for building entrance
    if (tile.isEnterable && tile.buildingId) {
      // Auto-enter building when stepping on entrance
      this.enterBuilding(tile.buildingId);
    }
    
    // Check for NPCs
    const nearbyNPC = this.gameState.currentMap.npcs.find(npc => {
      const npcTileX = Math.floor(npc.position.x / 32);
      const npcTileY = Math.floor(npc.position.y / 32);
      return Math.abs(npcTileX - tileX) <= 1 && Math.abs(npcTileY - tileY) <= 1;
    });
    
    if (nearbyNPC && !nearbyNPC.isHostile) {
      // Auto-start dialogue with nearby friendly NPCs
      this.startDialogue(nearbyNPC);
    }
    
    // Check for enemies
    const nearbyEnemy = this.gameState.currentMap.enemies.find(enemy => {
      const enemyTileX = Math.floor(enemy.position.x / 32);
      const enemyTileY = Math.floor(enemy.position.y / 32);
      return Math.abs(enemyTileX - tileX) <= 1 && Math.abs(enemyTileY - tileY) <= 1;
    });
    
    if (nearbyEnemy) {
      this.startCombat([nearbyEnemy]);
    }
    
    // Check for lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find(lootable => {
      const lootTileX = Math.floor(lootable.position.x / 32);
      const lootTileY = Math.floor(lootable.position.y / 32);
      return Math.abs(lootTileX - tileX) <= 1 && Math.abs(lootTileY - tileY) <= 1;
    });
    
    if (nearbyLootable && !nearbyLootable.looted) {
      this.openLootable(nearbyLootable);
    }
  }

  private handleInteraction() {
    const player = this.gameState.player;
    const tileSize = 32;
    const playerTileX = Math.floor(player.position.x / tileSize);
    const playerTileY = Math.floor(player.position.y / tileSize);
    
    // Check interaction in front of player
    let checkX = playerTileX;
    let checkY = playerTileY;
    
    switch (player.direction) {
      case 'up': checkY--; break;
      case 'down': checkY++; break;
      case 'left': checkX--; break;
      case 'right': checkX++; break;
    }
    
    // Check for NPCs
    const npc = this.gameState.currentMap.npcs.find(npc => {
      const npcTileX = Math.floor(npc.position.x / tileSize);
      const npcTileY = Math.floor(npc.position.y / tileSize);
      return npcTileX === checkX && npcTileY === checkY;
    });
    
    if (npc) {
      if (npc.isHostile) {
        this.startCombat([]);
      } else {
        this.startDialogue(npc);
      }
      return;
    }
    
    // Check for lootables
    const lootable = this.gameState.currentMap.lootables.find(lootable => {
      const lootTileX = Math.floor(lootable.position.x / tileSize);
      const lootTileY = Math.floor(lootable.position.y / tileSize);
      return lootTileX === checkX && lootTileY === checkY;
    });
    
    if (lootable && !lootable.looted) {
      this.openLootable(lootable);
      return;
    }
    
    // Check for building entrance
    if (checkX >= 0 && checkX < this.gameState.currentMap.width && 
        checkY >= 0 && checkY < this.gameState.currentMap.height) {
      
      const tile = this.gameState.currentMap.tiles[checkY][checkX];
      if (tile.isEnterable && tile.buildingId) {
        this.enterBuilding(tile.buildingId);
      }
    }
  }

  private enterBuilding(buildingId: string) {
    const building = getBuildingById(buildingId);
    if (!building) return;
    
    // Store current map and position
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to building interior
    this.gameState.currentMap = building.interiorMap;
    this.gameState.player.position = { ...building.exitPosition };
    
    // Initialize visibility for interior
    this.initializeVisibilityMap();
    this.updateVisibility();
    this.updateCamera();
    
    this.notifyStateChange();
  }

  private exitBuilding() {
    if (!this.gameState.previousMap) return;
    
    // Return to previous map
    this.gameState.currentMap = this.gameState.previousMap.map;
    this.gameState.player.position = { ...this.gameState.previousMap.position };
    this.gameState.previousMap = undefined;
    
    // Restore visibility
    this.initializeVisibilityMap();
    this.updateVisibility();
    this.updateCamera();
    
    this.notifyStateChange();
  }

  private startDialogue(npc: NPC) {
    if (npc.dialogue.length === 0) return;
    
    const firstNode = npc.dialogue[0];
    this.gameState.dialogue = {
      npcId: npc.id,
      currentNode: firstNode.id,
      choices: firstNode.choices,
      history: [`${npc.name}: ${firstNode.text}`]
    };
    
    this.gameState.gameMode = 'dialogue';
    this.notifyStateChange();
  }

  private startCombat(enemies: Enemy[]) {
    const combatEnemies = enemies.map(enemy => ({ ...enemy }));
    
    const combatState: CombatState = {
      participants: [this.gameState.player, ...combatEnemies],
      turnOrder: [this.gameState.player, ...combatEnemies],
      currentTurn: 0,
      round: 1,
      selectedTargets: [],
      animations: [],
      battleground: this.gameState.currentMap.tiles,
      weather: this.gameState.weather,
      timeOfDay: 'day',
      isPlayerTurn: true,
      combatLog: ['Combat begins!']
    };
    
    this.gameState.combat = combatState;
    this.gameState.gameMode = 'combat';
    this.notifyStateChange();
  }

  private openLootable(lootable: LootableItem) {
    if (this.lootableCallback) {
      this.lootableCallback(lootable);
    }
  }

  private initializeVisibilityMap() {
    const map = this.gameState.currentMap;
    this.gameState.visibilityMap = Array(map.height).fill(null).map(() => Array(map.width).fill(false));
  }

  private updateVisibility() {
    const player = this.gameState.player;
    const tileSize = 32;
    const playerTileX = Math.floor(player.position.x / tileSize);
    const playerTileY = Math.floor(player.position.y / tileSize);
    const visionRange = 8;
    
    // Clear previous visibility
    for (let y = 0; y < this.gameState.visibilityMap.length; y++) {
      for (let x = 0; x < this.gameState.visibilityMap[y].length; x++) {
        this.gameState.visibilityMap[y][x] = false;
      }
    }
    
    // Set visibility around player
    for (let dy = -visionRange; dy <= visionRange; dy++) {
      for (let dx = -visionRange; dx <= visionRange; dx++) {
        const x = playerTileX + dx;
        const y = playerTileY + dy;
        
        if (x >= 0 && x < this.gameState.currentMap.width && 
            y >= 0 && y < this.gameState.currentMap.height) {
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= visionRange) {
            this.gameState.visibilityMap[y][x] = true;
            this.gameState.currentMap.tiles[y][x].discovered = true;
            this.gameState.currentMap.tiles[y][x].visible = true;
          }
        }
      }
    }
  }

  private updateCamera() {
    const player = this.gameState.player;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.gameState.camera.x = player.position.x - centerX;
    this.gameState.camera.y = player.position.y - centerY;
  }

  private toggleDevMode() {
    if (!this.gameState.devMode) {
      this.gameState.devMode = {
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
      };
    }
    
    this.gameState.devMode.enabled = !this.gameState.devMode.enabled;
    this.notifyStateChange();
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Only render if we have a valid game state
    if (!this.gameState || !this.gameState.currentMap) {
      return;
    }
    
    this.renderMap();
    this.renderEntities();
    this.renderUI();
  }

  private renderMap() {
    const map = this.gameState.currentMap;
    const tileSize = 32;
    const camera = this.gameState.camera;
    
    const startX = Math.max(0, Math.floor(camera.x / tileSize));
    const endX = Math.min(map.width, Math.ceil((camera.x + this.canvas.width) / tileSize));
    const startY = Math.max(0, Math.floor(camera.y / tileSize));
    const endY = Math.min(map.height, Math.ceil((camera.y + this.canvas.height) / tileSize));
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map.tiles[y][x];
        const screenX = x * tileSize - camera.x;
        const screenY = y * tileSize - camera.y;
        
        if (tile.discovered) {
          const isVisible = this.gameState.visibilityMap[y] && this.gameState.visibilityMap[y][x];
          this.renderTile(tile, screenX, screenY, isVisible);
        }
      }
    }
  }

  private renderTile(tile: Tile, x: number, y: number, isVisible: boolean) {
    const tileSize = 32;
    
    // Base tile color
    let color = this.getTileColor(tile.type);
    
    // Apply visibility
    if (!isVisible) {
      color = this.darkenColor(color, 0.5);
    }
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, tileSize, tileSize);
    
    // Add tile border for clarity
    this.ctx.strokeStyle = this.darkenColor(color, 0.2);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, tileSize, tileSize);
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'grass': return '#4a7c59';
      case 'dirt': return '#8b4513';
      case 'stone': return '#696969';
      case 'water': return '#4682b4';
      case 'lava': return '#ff4500';
      case 'ice': return '#b0e0e6';
      case 'sand': return '#f4a460';
      case 'ruins': return '#2f2f2f';
      case 'building': return '#654321';
      default: return '#333333';
    }
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private renderEntities() {
    this.renderNPCs();
    this.renderEnemies();
    this.renderLootables();
    this.renderPlayer();
  }

  private renderPlayer() {
    const player = this.gameState.player;
    const camera = this.gameState.camera;
    const screenX = player.position.x - camera.x;
    const screenY = player.position.y - camera.y;
    
    // Player circle
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.beginPath();
    this.ctx.arc(screenX + 16, screenY + 16, 12, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Direction indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    
    switch (player.direction) {
      case 'up':
        this.ctx.arc(screenX + 16, screenY + 8, 3, 0, Math.PI * 2);
        break;
      case 'down':
        this.ctx.arc(screenX + 16, screenY + 24, 3, 0, Math.PI * 2);
        break;
      case 'left':
        this.ctx.arc(screenX + 8, screenY + 16, 3, 0, Math.PI * 2);
        break;
      case 'right':
        this.ctx.arc(screenX + 24, screenY + 16, 3, 0, Math.PI * 2);
        break;
    }
    this.ctx.fill();
  }

  private renderNPCs() {
    const camera = this.gameState.camera;
    
    this.gameState.currentMap.npcs.forEach(npc => {
      const screenX = npc.position.x - camera.x;
      const screenY = npc.position.y - camera.y;
      
      // Only render if on screen
      if (screenX > -32 && screenX < this.canvas.width && 
          screenY > -32 && screenY < this.canvas.height) {
        
        const tileX = Math.floor(npc.position.x / 32);
        const tileY = Math.floor(npc.position.y / 32);
        const isVisible = this.gameState.visibilityMap[tileY] && this.gameState.visibilityMap[tileY][tileX];
        
        if (isVisible) {
          this.ctx.fillStyle = npc.isHostile ? '#ff4444' : '#44ff44';
          this.ctx.fillRect(screenX + 8, screenY + 8, 16, 16);
          
          // Name label
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = '10px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(npc.name, screenX + 16, screenY - 2);
        }
      }
    });
  }

  private renderEnemies() {
    const camera = this.gameState.camera;
    
    this.gameState.currentMap.enemies.forEach(enemy => {
      const screenX = enemy.position.x - camera.x;
      const screenY = enemy.position.y - camera.y;
      
      // Only render if on screen
      if (screenX > -32 && screenX < this.canvas.width && 
          screenY > -32 && screenY < this.canvas.height) {
        
        const tileX = Math.floor(enemy.position.x / 32);
        const tileY = Math.floor(enemy.position.y / 32);
        const isVisible = this.gameState.visibilityMap[tileY] && this.gameState.visibilityMap[tileY][tileX];
        
        if (isVisible) {
          this.ctx.fillStyle = '#ff0000';
          this.ctx.fillRect(screenX + 6, screenY + 6, 20, 20);
          
          // Health bar
          const healthPercent = enemy.health / enemy.maxHealth;
          this.ctx.fillStyle = '#ff0000';
          this.ctx.fillRect(screenX, screenY - 8, 32, 4);
          this.ctx.fillStyle = '#00ff00';
          this.ctx.fillRect(screenX, screenY - 8, 32 * healthPercent, 4);
        }
      }
    });
  }

  private renderLootables() {
    const camera = this.gameState.camera;
    
    this.gameState.currentMap.lootables.forEach(lootable => {
      if (lootable.looted) return;
      
      const screenX = lootable.position.x - camera.x;
      const screenY = lootable.position.y - camera.y;
      
      // Only render if on screen
      if (screenX > -32 && screenX < this.canvas.width && 
          screenY > -32 && screenY < this.canvas.height) {
        
        const tileX = Math.floor(lootable.position.x / 32);
        const tileY = Math.floor(lootable.position.y / 32);
        const isVisible = this.gameState.visibilityMap[tileY] && this.gameState.visibilityMap[tileY][tileX];
        
        if (isVisible) {
          this.ctx.fillStyle = '#ffff00';
          this.ctx.fillRect(screenX + 10, screenY + 10, 12, 12);
          
          // Glow effect
          this.ctx.shadowColor = '#ffff00';
          this.ctx.shadowBlur = 5;
          this.ctx.fillRect(screenX + 10, screenY + 10, 12, 12);
          this.ctx.shadowBlur = 0;
        }
      }
    });
  }

  private renderUI() {
    // Health bar
    const healthPercent = this.gameState.player.health / this.gameState.player.maxHealth;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(10, 10, 200, 20);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(10, 10, 200 * healthPercent, 20);
    
    // Health text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Health: ${this.gameState.player.health}/${this.gameState.player.maxHealth}`, 15, 25);
    
    // Energy bar
    const energyPercent = this.gameState.player.energy / this.gameState.player.maxEnergy;
    this.ctx.fillStyle = '#0000ff';
    this.ctx.fillRect(10, 40, 200, 20);
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(10, 40, 200 * energyPercent, 20);
    
    // Energy text
    this.ctx.fillText(`Energy: ${Math.floor(this.gameState.player.energy)}/${this.gameState.player.maxEnergy}`, 15, 55);
    
    // Map name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.gameState.currentMap.name, this.canvas.width / 2, 30);
  }

  private update(deltaTime: number) {
    this.handleMovement();
    this.updateGameTime(deltaTime);
    this.updateStatusEffects(deltaTime);
  }

  private updateGameTime(deltaTime: number) {
    this.gameState.gameTime += deltaTime;
    this.gameState.statistics.playtime += deltaTime / 1000;
    
    // Update day/night cycle
    const dayLength = 300000; // 5 minutes = 1 day
    this.gameState.dayNightCycle = (this.gameState.gameTime % dayLength) / dayLength;
  }

  private updateStatusEffects(deltaTime: number) {
    const player = this.gameState.player;
    
    // Update player status effects
    player.statusEffects = player.statusEffects.filter(effect => {
      effect.duration -= deltaTime / 1000;
      return effect.duration > 0;
    });
    
    // Regenerate energy
    if (player.energy < player.maxEnergy) {
      player.energy = Math.min(player.maxEnergy, player.energy + (deltaTime / 1000) * 2);
    }
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (!this.animationId) {
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public setStateChangeCallback(callback: (state: GameState) => void) {
    this.stateChangeCallback = callback;
  }

  public setLootableCallback(callback: (lootable: LootableItem) => void) {
    this.lootableCallback = callback;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public setGameState(newState: GameState) {
    this.gameState = { ...newState };
    this.initializeVisibilityMap();
    this.updateVisibility();
    this.updateCamera();
  }

  public handleCombatAction(action: string, targetIndex?: number) {
    // Combat action handling implementation
    console.log('Combat action:', action, targetIndex);
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback({ ...this.gameState });
    }
  }
}