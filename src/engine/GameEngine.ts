import { GameState, Position, Tile, Enemy, NPC, LootableItem, GameSettings } from '../types/game';
import { enemies } from '../data/enemies';
import { npcs } from '../data/npcs_data';
import { createAllMaps } from '../data/maps';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private settings: GameSettings;
  private keys: Set<string> = new Set();
  private lastTime = 0;
  private animationId: number | null = null;
  private stateChangeCallback?: (state: GameState) => void;
  private lootableCallback?: (lootable: LootableItem) => void;
  private allMaps: { [key: string]: any } = {};

  // Constants
  private readonly TILE_SIZE = 32;
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly VIEWPORT_TILES_X = Math.ceil(this.CANVAS_WIDTH / this.TILE_SIZE);
  private readonly VIEWPORT_TILES_Y = Math.ceil(this.CANVAS_HEIGHT / this.TILE_SIZE);
  private readonly PLAYER_SPEED = 128; // pixels per second

  constructor(canvas: HTMLCanvasElement, initialGameState: GameState, settings?: GameSettings) {
    this.canvas = canvas;
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    
    this.gameState = { ...initialGameState };
    this.settings = settings || this.getDefaultSettings();
    
    // Load all maps
    this.allMaps = createAllMaps();
    
    this.setupEventListeners();
    this.initializeVisibilityMap();
    this.start();
  }

  private getDefaultSettings(): GameSettings {
    return {
      masterVolume: 1.0,
      musicVolume: 0.8,
      sfxVolume: 0.8,
      graphics: 'high',
      lowGraphicsMode: false,
      fullscreen: false,
      showFPS: true,
      autoSave: true,
      difficulty: 'normal'
    };
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Canvas events
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default for game keys
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'f', 'i', 'e', 'c', 'q', 'm'];
    if (gameKeys.includes(e.key.toLowerCase()) || gameKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    this.keys.add(e.key.toLowerCase());
    
    // Handle immediate actions
    if (e.key === ' ' || e.key.toLowerCase() === 'f') {
      this.handleInteraction();
    }
    
    // Handle UI toggles
    if (e.key.toLowerCase() === 'i') {
      this.gameState.gameMode = this.gameState.gameMode === 'inventory' ? 'exploration' : 'inventory';
      this.notifyStateChange();
    }
    
    if (e.key.toLowerCase() === 'e') {
      this.gameState.gameMode = this.gameState.gameMode === 'equipment' ? 'exploration' : 'equipment';
      this.notifyStateChange();
    }
    
    if (e.key.toLowerCase() === 'c') {
      this.gameState.gameMode = this.gameState.gameMode === 'character' ? 'exploration' : 'character';
      this.notifyStateChange();
    }
    
    if (e.key.toLowerCase() === 'q') {
      this.gameState.gameMode = this.gameState.gameMode === 'quests' ? 'exploration' : 'quests';
      this.notifyStateChange();
    }
    
    if (e.key.toLowerCase() === 'm') {
      this.gameState.gameMode = this.gameState.gameMode === 'map' ? 'exploration' : 'map';
      this.notifyStateChange();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase());
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = x + this.gameState.camera.x;
    const worldY = y + this.gameState.camera.y;
    
    console.log(`Clicked at canvas: (${x}, ${y}), world: (${worldX}, ${worldY})`);
  }

  private handleInteraction(): void {
    const playerTileX = Math.floor(this.gameState.player.position.x / this.TILE_SIZE);
    const playerTileY = Math.floor(this.gameState.player.position.y / this.TILE_SIZE);
    
    // Check for NPCs in adjacent tiles
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkX = playerTileX + dx;
        const checkY = playerTileY + dy;
        
        // Find NPC at this position
        const npc = this.gameState.currentMap.npcs.find(npc => {
          const npcTileX = Math.floor(npc.position.x / this.TILE_SIZE);
          const npcTileY = Math.floor(npc.position.y / this.TILE_SIZE);
          return npcTileX === checkX && npcTileY === checkY;
        });
        
        if (npc) {
          this.startDialogue(npc);
          return;
        }
        
        // Check for lootables
        const lootable = this.gameState.currentMap.lootables.find(loot => {
          const lootTileX = Math.floor(loot.position.x / this.TILE_SIZE);
          const lootTileY = Math.floor(loot.position.y / this.TILE_SIZE);
          return lootTileX === checkX && lootTileY === checkY && !loot.looted;
        });
        
        if (lootable && this.lootableCallback) {
          this.lootableCallback(lootable);
          return;
        }
      }
    }
  }

  private startDialogue(npc: NPC): void {
    if (npc.dialogue.length > 0) {
      this.gameState.dialogue = {
        npcId: npc.id,
        currentNode: npc.dialogue[0].id,
        history: [`${npc.name}: ${npc.dialogue[0].text}`],
        choices: npc.dialogue[0].choices
      };
      this.gameState.gameMode = 'dialogue';
      this.notifyStateChange();
    }
  }

  private update(deltaTime: number): void {
    if (this.gameState.gameMode !== 'exploration') {
      return;
    }
    
    this.updatePlayer(deltaTime);
    this.updateCamera();
    this.updateVisibility();
    this.checkMapTransitions();
  }

  private updatePlayer(deltaTime: number): void {
    const player = this.gameState.player;
    let newX = player.position.x;
    let newY = player.position.y;
    let moved = false;
    
    const moveDistance = this.PLAYER_SPEED * deltaTime;
    
    // Handle movement
    if (this.keys.has('arrowup') || this.keys.has('w')) {
      newY -= moveDistance;
      player.direction = 'up';
      moved = true;
    }
    if (this.keys.has('arrowdown') || this.keys.has('s')) {
      newY += moveDistance;
      player.direction = 'down';
      moved = true;
    }
    if (this.keys.has('arrowleft') || this.keys.has('a')) {
      newX -= moveDistance;
      player.direction = 'left';
      moved = true;
    }
    if (this.keys.has('arrowright') || this.keys.has('d')) {
      newX += moveDistance;
      player.direction = 'right';
      moved = true;
    }
    
    // Check if new position is valid
    if (moved && this.isValidPosition(newX, newY)) {
      player.position.x = newX;
      player.position.y = newY;
      player.isMoving = true;
      
      // Update statistics
      const distance = Math.sqrt(Math.pow(newX - player.position.x, 2) + Math.pow(newY - player.position.y, 2));
      this.gameState.statistics.distanceTraveled += distance;
    } else {
      player.isMoving = false;
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    const tileX = Math.floor(x / this.TILE_SIZE);
    const tileY = Math.floor(y / this.TILE_SIZE);
    
    // Check bounds
    if (tileX < 0 || tileX >= this.gameState.currentMap.width || 
        tileY < 0 || tileY >= this.gameState.currentMap.height) {
      return false;
    }
    
    // Check if tile is walkable
    const tile = this.gameState.currentMap.tiles[tileY][tileX];
    return tile.walkable;
  }

  private checkMapTransitions(): void {
    const player = this.gameState.player;
    const tileX = Math.floor(player.position.x / this.TILE_SIZE);
    const tileY = Math.floor(player.position.y / this.TILE_SIZE);
    
    // Check if player is at map edge
    const mapWidth = this.gameState.currentMap.width;
    const mapHeight = this.gameState.currentMap.height;
    
    let targetMapId: string | null = null;
    let newPlayerX = player.position.x;
    let newPlayerY = player.position.y;
    
    // Check each edge
    if (tileX <= 0) {
      // West edge
      const connection = this.gameState.currentMap.connections.find(c => c.direction === 'west');
      if (connection) {
        targetMapId = connection.targetMapId;
        newPlayerX = (mapWidth - 2) * this.TILE_SIZE; // Place near east edge of new map
        newPlayerY = player.position.y; // Keep same Y position
      }
    } else if (tileX >= mapWidth - 1) {
      // East edge
      const connection = this.gameState.currentMap.connections.find(c => c.direction === 'east');
      if (connection) {
        targetMapId = connection.targetMapId;
        newPlayerX = this.TILE_SIZE; // Place near west edge of new map
        newPlayerY = player.position.y; // Keep same Y position
      }
    } else if (tileY <= 0) {
      // North edge
      const connection = this.gameState.currentMap.connections.find(c => c.direction === 'north');
      if (connection) {
        targetMapId = connection.targetMapId;
        newPlayerX = player.position.x; // Keep same X position
        newPlayerY = (mapHeight - 2) * this.TILE_SIZE; // Place near south edge of new map
      }
    } else if (tileY >= mapHeight - 1) {
      // South edge
      const connection = this.gameState.currentMap.connections.find(c => c.direction === 'south');
      if (connection) {
        targetMapId = connection.targetMapId;
        newPlayerX = player.position.x; // Keep same X position
        newPlayerY = this.TILE_SIZE; // Place near north edge of new map
      }
    }
    
    // Perform map transition if needed
    if (targetMapId && this.allMaps[targetMapId]) {
      this.transitionToMap(targetMapId, newPlayerX, newPlayerY);
    }
  }

  private transitionToMap(mapId: string, playerX: number, playerY: number): void {
    console.log(`Transitioning to map: ${mapId} at position (${playerX}, ${playerY})`);
    
    // Load the new map
    const newMap = this.allMaps[mapId];
    if (!newMap) {
      console.error(`Map ${mapId} not found`);
      return;
    }
    
    // Update game state
    this.gameState.currentMap = newMap;
    this.gameState.player.position.x = playerX;
    this.gameState.player.position.y = playerY;
    
    // Reset visibility map for new map
    this.initializeVisibilityMap();
    
    // Update camera to follow player
    this.updateCamera();
    
    // Notify state change
    this.notifyStateChange();
    
    console.log(`Successfully transitioned to ${newMap.name}`);
  }

  private updateCamera(): void {
    const player = this.gameState.player;
    
    // Center camera on player
    this.gameState.camera.x = player.position.x - this.CANVAS_WIDTH / 2;
    this.gameState.camera.y = player.position.y - this.CANVAS_HEIGHT / 2;
    
    // Clamp camera to map bounds
    const maxCameraX = (this.gameState.currentMap.width * this.TILE_SIZE) - this.CANVAS_WIDTH;
    const maxCameraY = (this.gameState.currentMap.height * this.TILE_SIZE) - this.CANVAS_HEIGHT;
    
    this.gameState.camera.x = Math.max(0, Math.min(this.gameState.camera.x, maxCameraX));
    this.gameState.camera.y = Math.max(0, Math.min(this.gameState.camera.y, maxCameraY));
  }

  private initializeVisibilityMap(): void {
    const map = this.gameState.currentMap;
    this.gameState.visibilityMap = [];
    
    for (let y = 0; y < map.height; y++) {
      this.gameState.visibilityMap[y] = [];
      for (let x = 0; x < map.width; x++) {
        this.gameState.visibilityMap[y][x] = false;
      }
    }
  }

  private updateVisibility(): void {
    const player = this.gameState.player;
    const playerTileX = Math.floor(player.position.x / this.TILE_SIZE);
    const playerTileY = Math.floor(player.position.y / this.TILE_SIZE);
    const visionRange = 8;
    
    // Update visibility around player
    for (let dy = -visionRange; dy <= visionRange; dy++) {
      for (let dx = -visionRange; dx <= visionRange; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;
        
        if (tileX >= 0 && tileX < this.gameState.currentMap.width &&
            tileY >= 0 && tileY < this.gameState.currentMap.height) {
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= visionRange) {
            this.gameState.visibilityMap[tileY][tileX] = true;
            this.gameState.currentMap.tiles[tileY][tileX].discovered = true;
            this.gameState.currentMap.tiles[tileY][tileX].visible = true;
          }
        }
      }
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.renderMap();
    this.renderEntities();
    this.renderPlayer();
    this.renderUI();
  }

  private renderMap(): void {
    const camera = this.gameState.camera;
    const map = this.gameState.currentMap;
    
    // Calculate visible tile range
    const startTileX = Math.floor(camera.x / this.TILE_SIZE);
    const startTileY = Math.floor(camera.y / this.TILE_SIZE);
    const endTileX = Math.min(startTileX + this.VIEWPORT_TILES_X + 1, map.width);
    const endTileY = Math.min(startTileY + this.VIEWPORT_TILES_Y + 1, map.height);
    
    // Render tiles
    for (let y = Math.max(0, startTileY); y < endTileY; y++) {
      for (let x = Math.max(0, startTileX); x < endTileX; x++) {
        const tile = map.tiles[y][x];
        
        if (!tile.discovered) continue;
        
        const screenX = (x * this.TILE_SIZE) - camera.x;
        const screenY = (y * this.TILE_SIZE) - camera.y;
        
        // Get tile color
        let color = this.getTileColor(tile.type);
        
        // Darken if not visible
        if (!this.gameState.visibilityMap[y][x]) {
          color = this.darkenColor(color, 0.5);
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
        
        // Draw tile border
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
      }
    }
  }

  private getTileColor(type: string): string {
    const colors: { [key: string]: string } = {
      grass: '#4a7c59',
      dirt: '#8b4513',
      stone: '#696969',
      water: '#4682b4',
      sand: '#f4a460',
      ruins: '#2f2f2f',
      building: '#654321'
    };
    return colors[type] || '#333333';
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private renderEntities(): void {
    const camera = this.gameState.camera;
    
    // Render NPCs
    this.gameState.currentMap.npcs.forEach(npc => {
      const screenX = npc.position.x - camera.x;
      const screenY = npc.position.y - camera.y;
      
      if (screenX >= -this.TILE_SIZE && screenX <= this.CANVAS_WIDTH &&
          screenY >= -this.TILE_SIZE && screenY <= this.CANVAS_HEIGHT) {
        
        const npcTileX = Math.floor(npc.position.x / this.TILE_SIZE);
        const npcTileY = Math.floor(npc.position.y / this.TILE_SIZE);
        
        if (this.gameState.visibilityMap[npcTileY] && this.gameState.visibilityMap[npcTileY][npcTileX]) {
          this.ctx.fillStyle = npc.isHostile ? '#ff4444' : '#44ff44';
          this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);
          
          // Draw name
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = '12px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(npc.name, screenX, screenY - 12);
        }
      }
    });
    
    // Render enemies
    this.gameState.currentMap.enemies.forEach(enemy => {
      const screenX = enemy.position.x - camera.x;
      const screenY = enemy.position.y - camera.y;
      
      if (screenX >= -this.TILE_SIZE && screenX <= this.CANVAS_WIDTH &&
          screenY >= -this.TILE_SIZE && screenY <= this.CANVAS_HEIGHT) {
        
        const enemyTileX = Math.floor(enemy.position.x / this.TILE_SIZE);
        const enemyTileY = Math.floor(enemy.position.y / this.TILE_SIZE);
        
        if (this.gameState.visibilityMap[enemyTileY] && this.gameState.visibilityMap[enemyTileY][enemyTileX]) {
          this.ctx.fillStyle = '#ff0000';
          this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);
          
          // Draw health bar
          const healthPercent = enemy.health / enemy.maxHealth;
          this.ctx.fillStyle = '#ff0000';
          this.ctx.fillRect(screenX - 12, screenY - 20, 24, 4);
          this.ctx.fillStyle = '#00ff00';
          this.ctx.fillRect(screenX - 12, screenY - 20, 24 * healthPercent, 4);
        }
      }
    });
    
    // Render lootables
    this.gameState.currentMap.lootables.forEach(lootable => {
      if (lootable.looted) return;
      
      const screenX = lootable.position.x - camera.x;
      const screenY = lootable.position.y - camera.y;
      
      if (screenX >= -this.TILE_SIZE && screenX <= this.CANVAS_WIDTH &&
          screenY >= -this.TILE_SIZE && screenY <= this.CANVAS_HEIGHT) {
        
        const lootTileX = Math.floor(lootable.position.x / this.TILE_SIZE);
        const lootTileY = Math.floor(lootable.position.y / this.TILE_SIZE);
        
        if (this.gameState.visibilityMap[lootTileY] && this.gameState.visibilityMap[lootTileY][lootTileX]) {
          this.ctx.fillStyle = '#ffff00';
          this.ctx.fillRect(screenX - 6, screenY - 6, 12, 12);
        }
      }
    });
  }

  private renderPlayer(): void {
    const player = this.gameState.player;
    const camera = this.gameState.camera;
    
    const screenX = player.position.x - camera.x;
    const screenY = player.position.y - camera.y;
    
    // Draw player
    this.ctx.fillStyle = '#0066ff';
    this.ctx.fillRect(screenX - 12, screenY - 12, 24, 24);
    
    // Draw direction indicator
    this.ctx.fillStyle = '#ffffff';
    const dirX = screenX + (player.direction === 'right' ? 8 : player.direction === 'left' ? -8 : 0);
    const dirY = screenY + (player.direction === 'down' ? 8 : player.direction === 'up' ? -8 : 0);
    this.ctx.fillRect(dirX - 2, dirY - 2, 4, 4);
    
    // Draw health bar
    const healthPercent = player.health / player.maxHealth;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(screenX - 16, screenY - 25, 32, 6);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(screenX - 16, screenY - 25, 32 * healthPercent, 6);
  }

  private renderUI(): void {
    // Draw minimap
    this.renderMinimap();
    
    // Draw player stats
    this.renderPlayerStats();
    
    // Draw current map name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(this.gameState.currentMap.name, 10, 30);
  }

  private renderMinimap(): void {
    const minimapSize = 150;
    const minimapX = this.CANVAS_WIDTH - minimapSize - 10;
    const minimapY = 10;
    
    // Draw minimap background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Draw minimap border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Calculate scale
    const map = this.gameState.currentMap;
    const scaleX = minimapSize / map.width;
    const scaleY = minimapSize / map.height;
    const scale = Math.min(scaleX, scaleY);
    
    // Draw discovered tiles
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        if (tile.discovered) {
          const pixelX = minimapX + (x * scale);
          const pixelY = minimapY + (y * scale);
          
          this.ctx.fillStyle = this.getTileColor(tile.type);
          this.ctx.fillRect(pixelX, pixelY, Math.max(1, scale), Math.max(1, scale));
        }
      }
    }
    
    // Draw player position
    const playerTileX = Math.floor(this.gameState.player.position.x / this.TILE_SIZE);
    const playerTileY = Math.floor(this.gameState.player.position.y / this.TILE_SIZE);
    const playerPixelX = minimapX + (playerTileX * scale);
    const playerPixelY = minimapY + (playerTileY * scale);
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(playerPixelX - 1, playerPixelY - 1, 3, 3);
  }

  private renderPlayerStats(): void {
    const player = this.gameState.player;
    const x = 10;
    let y = 60;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x - 5, y - 20, 200, 100);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`${player.name} (Level ${player.level})`, x, y);
    y += 20;
    this.ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, x, y);
    y += 15;
    this.ctx.fillText(`Energy: ${Math.floor(player.energy)}/${player.maxEnergy}`, x, y);
    y += 15;
    this.ctx.fillText(`Gold: ${this.gameState.gold}`, x, y);
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start(): void {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public setStateChangeCallback(callback: (state: GameState) => void): void {
    this.stateChangeCallback = callback;
  }

  public setLootableCallback(callback: (lootable: LootableItem) => void): void {
    this.lootableCallback = callback;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public setGameState(newState: GameState): void {
    this.gameState = { ...newState };
  }

  private notifyStateChange(): void {
    if (this.stateChangeCallback) {
      this.stateChangeCallback({ ...this.gameState });
    }
  }

  public handleCombatAction(action: string, targetIndex?: number): void {
    // Combat system implementation would go here
    console.log(`Combat action: ${action}, target: ${targetIndex}`);
  }
}