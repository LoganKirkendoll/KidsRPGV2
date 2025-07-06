import { GameState, Position, Character, Enemy, Tile, GameMap, NPC, LootableItem, CombatState, GameSettings } from '../types/game';
import { buildings, getBuildingByPosition } from '../data/buildings';
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
  
  // Enhanced graphics properties
  private particleSystem: Particle[] = [];
  private lightSources: LightSource[] = [];
  private weatherEffects: WeatherEffect[] = [];
  private shadows: Shadow[] = [];
  
  // Camera properties
  private cameraShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  private cameraZoom = 1;
  private targetZoom = 1;
  
  // Rendering layers
  private backgroundLayer: HTMLCanvasElement;
  private gameLayer: HTMLCanvasElement;
  private uiLayer: HTMLCanvasElement;
  private effectsLayer: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, initialState: GameState, settings?: GameSettings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialState };
    this.settings = settings || this.getDefaultSettings();
    
    this.setupCanvas();
    this.setupLayers();
    this.setupEventListeners();
    this.initializeVisibilityMap();
    this.initializeLighting();
    this.start();
  }

  private setupCanvas() {
    this.canvas.width = 1024;
    this.canvas.height = 768;
    this.ctx.imageSmoothingEnabled = false;
    
    // Enable high DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  private setupLayers() {
    // Create off-screen canvases for different rendering layers
    this.backgroundLayer = document.createElement('canvas');
    this.gameLayer = document.createElement('canvas');
    this.uiLayer = document.createElement('canvas');
    this.effectsLayer = document.createElement('canvas');
    
    [this.backgroundLayer, this.gameLayer, this.uiLayer, this.effectsLayer].forEach(layer => {
      layer.width = this.canvas.width;
      layer.height = this.canvas.height;
    });
  }

  private initializeLighting() {
    // Add ambient lighting
    this.lightSources.push({
      x: this.gameState.player.position.x,
      y: this.gameState.player.position.y,
      radius: 200,
      intensity: 0.8,
      color: '#ffeb3b',
      type: 'player'
    });
    
    // Add building lights
    buildings.forEach(building => {
      this.lightSources.push({
        x: building.entrancePosition.x,
        y: building.entrancePosition.y,
        radius: 100,
        intensity: 0.6,
        color: '#ff9800',
        type: 'building'
      });
    });
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.handleKeyPress(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Mouse events for enhanced interaction
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleMouseClick(x, y);
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleMouseClick(x: number, y: number) {
    // Convert screen coordinates to world coordinates
    const worldX = x + this.gameState.camera.x - this.canvas.width / 2;
    const worldY = y + this.gameState.camera.y - this.canvas.height / 2;
    
    // Add click effect
    this.addParticleEffect(worldX, worldY, 'click');
  }

  private addParticleEffect(x: number, y: number, type: string) {
    const particleCount = type === 'click' ? 5 : 10;
    
    for (let i = 0; i < particleCount; i++) {
      this.particleSystem.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 1,
        maxLife: 1,
        size: Math.random() * 4 + 2,
        color: type === 'click' ? '#ffeb3b' : '#ff5722',
        type
      });
    }
  }

  private handleKeyPress(key: string) {
    if (this.gameState.gameMode !== 'exploration') return;

    switch (key) {
      case 'f1':
        this.toggleDevMode();
        break;
      case 'escape':
        this.handleEscape();
        break;
      case 'f':
      case ' ':
        this.handleInteraction();
        break;
      case 'i':
        this.openInventory();
        break;
      case 'e':
        this.openEquipment();
        break;
      case 'c':
        this.openCharacter();
        break;
      case 'q':
        this.openQuests();
        break;
      case 'm':
        this.openMap();
        break;
    }
  }

  private handleEscape() {
    if (this.gameState.currentMap.isInterior) {
      this.exitBuilding();
    }
  }

  private exitBuilding() {
    if (this.gameState.currentMap.isInterior && this.gameState.previousMap) {
      const newState = { ...this.gameState };
      newState.currentMap = this.gameState.previousMap.map;
      newState.player.position = this.gameState.previousMap.position;
      newState.previousMap = undefined;
      this.updateGameState(newState);
    }
  }

  private handleInteraction() {
    const playerPos = this.gameState.player.position;
    const interactionRange = 48;

    // Check for building entrance
    if (!this.gameState.currentMap.isInterior) {
      const building = getBuildingByPosition(playerPos, interactionRange);
      if (building) {
        this.enterBuilding(building.id);
        return;
      }
    }

    // Check for NPCs
    const nearbyNPC = this.gameState.currentMap.npcs.find(npc => {
      const distance = Math.sqrt(
        Math.pow(npc.position.x - playerPos.x, 2) + 
        Math.pow(npc.position.y - playerPos.y, 2)
      );
      return distance <= interactionRange;
    });

    if (nearbyNPC) {
      this.startDialogue(nearbyNPC);
      return;
    }

    // Check for lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find(lootable => {
      const distance = Math.sqrt(
        Math.pow(lootable.position.x - playerPos.x, 2) + 
        Math.pow(lootable.position.y - playerPos.y, 2)
      );
      return distance <= interactionRange && !lootable.looted;
    });

    if (nearbyLootable) {
      this.openLootable(nearbyLootable);
      return;
    }

    // Check for enemies (start combat)
    const nearbyEnemy = this.gameState.currentMap.enemies.find(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - playerPos.x, 2) + 
        Math.pow(enemy.position.y - playerPos.y, 2)
      );
      return distance <= interactionRange;
    });

    if (nearbyEnemy) {
      this.startCombat([nearbyEnemy]);
    }
  }

  private enterBuilding(buildingId: string) {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const newState = { ...this.gameState };
    
    // Store current map and position
    newState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to building interior
    newState.currentMap = building.interiorMap;
    newState.player.position = { ...building.exitPosition };
    
    this.updateGameState(newState);
  }

  private startDialogue(npc: NPC) {
    if (npc.dialogue.length === 0) return;

    const newState = { ...this.gameState };
    newState.dialogue = {
      npcId: npc.id,
      currentNode: npc.dialogue[0].id,
      history: [`${npc.name}: ${npc.dialogue[0].text}`],
      choices: npc.dialogue[0].choices
    };
    newState.gameMode = 'dialogue';
    this.updateGameState(newState);
  }

  private openLootable(lootable: LootableItem) {
    if (this.lootableCallback) {
      this.lootableCallback(lootable);
    }
  }

  private startCombat(enemies: Enemy[]) {
    const combatState: CombatState = {
      participants: [this.gameState.player, ...this.gameState.party.filter(p => p.id !== this.gameState.player.id), ...enemies],
      turnOrder: [],
      currentTurn: 0,
      round: 1,
      selectedTargets: [],
      animations: [],
      battleground: this.gameState.currentMap.tiles,
      weather: this.gameState.weather,
      timeOfDay: this.getTimeOfDay(),
      isPlayerTurn: true,
      combatLog: ['Combat begins!']
    };

    // Initialize turn order based on agility
    combatState.turnOrder = [...combatState.participants].sort((a, b) => {
      const aAgility = 'stats' in a ? a.stats.agility : 5;
      const bAgility = 'stats' in b ? b.stats.agility : 5;
      return bAgility - aAgility;
    });

    const newState = { ...this.gameState };
    newState.combat = combatState;
    newState.gameMode = 'combat';
    this.updateGameState(newState);
  }

  private getTimeOfDay(): 'dawn' | 'day' | 'dusk' | 'night' {
    const cycle = this.gameState.dayNightCycle;
    if (cycle < 0.25) return 'night';
    if (cycle < 0.5) return 'dawn';
    if (cycle < 0.75) return 'day';
    return 'dusk';
  }

  private toggleDevMode() {
    const newState = { ...this.gameState };
    if (!newState.devMode) {
      newState.devMode = {
        enabled: true,
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
    } else {
      newState.devMode.enabled = !newState.devMode.enabled;
    }
    this.updateGameState(newState);
  }

  private openInventory() {
    const newState = { ...this.gameState };
    newState.gameMode = 'inventory';
    this.updateGameState(newState);
  }

  private openEquipment() {
    const newState = { ...this.gameState };
    newState.gameMode = 'equipment';
    this.updateGameState(newState);
  }

  private openCharacter() {
    const newState = { ...this.gameState };
    newState.gameMode = 'character';
    this.updateGameState(newState);
  }

  private openQuests() {
    const newState = { ...this.gameState };
    newState.gameMode = 'quests';
    this.updateGameState(newState);
  }

  private openMap() {
    const newState = { ...this.gameState };
    newState.gameMode = 'map';
    this.updateGameState(newState);
  }

  private update(deltaTime: number) {
    this.updatePlayer(deltaTime);
    this.updateCamera(deltaTime);
    this.updateParticles(deltaTime);
    this.updateLighting(deltaTime);
    this.updateWeather(deltaTime);
    this.updateDayNightCycle(deltaTime);
    this.updateVisibility();
    this.updateCameraEffects(deltaTime);
  }

  private updatePlayer(deltaTime: number) {
    if (this.gameState.gameMode !== 'exploration') return;

    const player = this.gameState.player;
    const speed = 128; // pixels per second
    const moveDistance = speed * deltaTime;
    
    let newX = player.position.x;
    let newY = player.position.y;
    let isMoving = false;
    let newDirection = player.direction;

    // Handle movement
    if (this.keys.has('arrowup') || this.keys.has('w')) {
      newY -= moveDistance;
      newDirection = 'up';
      isMoving = true;
    }
    if (this.keys.has('arrowdown') || this.keys.has('s')) {
      newY += moveDistance;
      newDirection = 'down';
      isMoving = true;
    }
    if (this.keys.has('arrowleft') || this.keys.has('a')) {
      newX -= moveDistance;
      newDirection = 'left';
      isMoving = true;
    }
    if (this.keys.has('arrowright') || this.keys.has('d')) {
      newX += moveDistance;
      newDirection = 'right';
      isMoving = true;
    }

    // Check collision
    if (this.canMoveTo(newX, newY)) {
      const newState = { ...this.gameState };
      newState.player.position.x = newX;
      newState.player.position.y = newY;
      newState.player.direction = newDirection;
      newState.player.isMoving = isMoving;
      
      // Update statistics
      if (isMoving) {
        newState.statistics.distanceTraveled += moveDistance / 32; // Convert to tiles
        
        // Add movement particles
        if (Math.random() < 0.1) {
          this.addParticleEffect(newX, newY + 16, 'dust');
        }
      }
      
      this.updateGameState(newState);
      this.checkMapTransitions(newX, newY);
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    if (tileX < 0 || tileY < 0 || 
        tileX >= this.gameState.currentMap.width || 
        tileY >= this.gameState.currentMap.height) {
      return false;
    }
    
    const tile = this.gameState.currentMap.tiles[tileY][tileX];
    return tile.walkable;
  }

  private checkMapTransitions(x: number, y: number) {
    if (this.gameState.currentMap.isInterior) return;

    const mapEdgeThreshold = 32;
    
    // Check if player is near map edge
    if (x < mapEdgeThreshold || y < mapEdgeThreshold || 
        x > (this.gameState.currentMap.width - 1) * 32 - mapEdgeThreshold ||
        y > (this.gameState.currentMap.height - 1) * 32 - mapEdgeThreshold) {
      
      // Find appropriate connection
      const connection = this.gameState.currentMap.connections.find(conn => {
        const distance = Math.sqrt(
          Math.pow(conn.fromPosition.x - x, 2) + 
          Math.pow(conn.fromPosition.y - y, 2)
        );
        return distance < 64;
      });
      
      if (connection) {
        this.transitionToMap(connection.targetMapId, connection.toPosition);
      }
    }
  }

  private transitionToMap(mapId: string, position: Position) {
    // Load map if not already loaded
    if (!this.gameState.availableMaps[mapId]) {
      const allMaps = createAllMaps();
      if (allMaps[mapId]) {
        const newState = { ...this.gameState };
        newState.availableMaps[mapId] = allMaps[mapId];
        newState.currentMap = allMaps[mapId];
        newState.player.position = { ...position };
        this.updateGameState(newState);
        
        // Add transition effect
        this.addCameraShake(5, 500);
        this.addParticleEffect(position.x, position.y, 'teleport');
      }
    } else {
      const newState = { ...this.gameState };
      newState.currentMap = this.gameState.availableMaps[mapId];
      newState.player.position = { ...position };
      this.updateGameState(newState);
      
      // Add transition effect
      this.addCameraShake(5, 500);
      this.addParticleEffect(position.x, position.y, 'teleport');
    }
  }

  private addCameraShake(intensity: number, duration: number) {
    this.cameraShake.intensity = intensity;
    this.cameraShake.duration = duration;
  }

  private updateCamera(deltaTime: number) {
    const player = this.gameState.player;
    const targetX = player.position.x - this.canvas.width / 2;
    const targetY = player.position.y - this.canvas.height / 2;
    
    // Smooth camera following
    const lerpFactor = 5 * deltaTime;
    this.gameState.camera.x += (targetX - this.gameState.camera.x) * lerpFactor;
    this.gameState.camera.y += (targetY - this.gameState.camera.y) * lerpFactor;
    
    // Apply camera shake
    if (this.cameraShake.duration > 0) {
      this.cameraShake.duration -= deltaTime * 1000;
      this.cameraShake.x = (Math.random() - 0.5) * this.cameraShake.intensity;
      this.cameraShake.y = (Math.random() - 0.5) * this.cameraShake.intensity;
    } else {
      this.cameraShake.x = 0;
      this.cameraShake.y = 0;
    }
    
    // Apply zoom
    this.cameraZoom += (this.targetZoom - this.cameraZoom) * 3 * deltaTime;
  }

  private updateCameraEffects(deltaTime: number) {
    // Update camera shake
    if (this.cameraShake.duration > 0) {
      this.cameraShake.duration -= deltaTime * 1000;
      if (this.cameraShake.duration <= 0) {
        this.cameraShake.x = 0;
        this.cameraShake.y = 0;
      }
    }
  }

  private updateParticles(deltaTime: number) {
    this.particleSystem = this.particleSystem.filter(particle => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= deltaTime;
      particle.vy += 50 * deltaTime; // Gravity
      return particle.life > 0;
    });
  }

  private updateLighting(deltaTime: number) {
    // Update player light position
    const playerLight = this.lightSources.find(light => light.type === 'player');
    if (playerLight) {
      playerLight.x = this.gameState.player.position.x;
      playerLight.y = this.gameState.player.position.y;
      
      // Flicker effect
      playerLight.intensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.1;
    }
    
    // Update other dynamic lights
    this.lightSources.forEach(light => {
      if (light.type === 'fire') {
        light.intensity = 0.6 + Math.sin(Date.now() * 0.02 + light.x * 0.01) * 0.2;
      }
    });
  }

  private updateWeather(deltaTime: number) {
    // Slower weather changes - only change every 2-5 minutes
    if (Math.random() < 0.0001) { // Much lower chance
      const weatherTypes = ['clear', 'rain', 'fog'];
      const currentIndex = weatherTypes.indexOf(this.gameState.weather);
      let newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      
      // Prefer staying with current weather
      if (Math.random() < 0.7) {
        newWeather = this.gameState.weather;
      }
      
      if (newWeather !== this.gameState.weather) {
        const newState = { ...this.gameState };
        newState.weather = newWeather as any;
        this.updateGameState(newState);
      }
    }
    
    // Update weather effects based on current weather
    switch (this.gameState.weather) {
      case 'rain':
        this.updateRainEffects(deltaTime);
        break;
      case 'storm':
        this.updateStormEffects(deltaTime);
        break;
      case 'fog':
        this.updateFogEffects(deltaTime);
        break;
    }
  }

  private updateRainEffects(deltaTime: number) {
    // Add rain particles
    if (Math.random() < 0.8) {
      this.weatherEffects.push({
        x: Math.random() * this.canvas.width + this.gameState.camera.x,
        y: this.gameState.camera.y - 50,
        vx: -20,
        vy: 300,
        life: 3,
        type: 'rain'
      });
    }
    
    // Update existing rain
    this.weatherEffects = this.weatherEffects.filter(effect => {
      effect.x += effect.vx * deltaTime;
      effect.y += effect.vy * deltaTime;
      effect.life -= deltaTime;
      return effect.life > 0;
    });
  }

  private updateStormEffects(deltaTime: number) {
    this.updateRainEffects(deltaTime);
    
    // Add lightning flashes
    if (Math.random() < 0.001) {
      this.addCameraShake(10, 200);
    }
  }

  private updateFogEffects(deltaTime: number) {
    // Fog reduces visibility
    this.lightSources.forEach(light => {
      if (light.type === 'player') {
        light.radius = Math.max(100, light.radius * 0.7);
      }
    });
  }

  private updateDayNightCycle(deltaTime: number) {
    const newState = { ...this.gameState };
    newState.dayNightCycle += deltaTime * 0.01; // Slow cycle
    if (newState.dayNightCycle > 1) {
      newState.dayNightCycle = 0;
    }
    newState.gameTime += deltaTime;
    this.updateGameState(newState);
  }

  private updateVisibility() {
    const player = this.gameState.player;
    const visionRange = 8; // tiles
    
    // Initialize visibility map if needed
    if (this.gameState.visibilityMap.length === 0) {
      this.initializeVisibilityMap();
    }
    
    const playerTileX = Math.floor(player.position.x / 32);
    const playerTileY = Math.floor(player.position.y / 32);
    
    // Update visibility around player
    for (let y = playerTileY - visionRange; y <= playerTileY + visionRange; y++) {
      for (let x = playerTileX - visionRange; x <= playerTileX + visionRange; x++) {
        if (x >= 0 && y >= 0 && x < this.gameState.currentMap.width && y < this.gameState.currentMap.height) {
          const distance = Math.sqrt((x - playerTileX) ** 2 + (y - playerTileY) ** 2);
          if (distance <= visionRange) {
            this.gameState.currentMap.tiles[y][x].discovered = true;
            this.gameState.currentMap.tiles[y][x].visible = distance <= visionRange * 0.6;
            
            if (!this.gameState.visibilityMap[y]) {
              this.gameState.visibilityMap[y] = [];
            }
            this.gameState.visibilityMap[y][x] = this.gameState.currentMap.tiles[y][x].visible;
          }
        }
      }
    }
  }

  private initializeVisibilityMap() {
    const newState = { ...this.gameState };
    newState.visibilityMap = [];
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      newState.visibilityMap[y] = [];
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        newState.visibilityMap[y][x] = false;
      }
    }
    this.updateGameState(newState);
  }

  private render() {
    // Clear main canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply camera transform with shake and zoom
    this.ctx.save();
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
    this.ctx.translate(
      -this.gameState.camera.x + this.cameraShake.x,
      -this.gameState.camera.y + this.cameraShake.y
    );
    
    // Render layers
    this.renderBackground();
    this.renderTerrain();
    this.renderShadows();
    this.renderEntities();
    this.renderLighting();
    this.renderWeatherEffects();
    this.renderParticles();
    
    this.ctx.restore();
    
    // Render UI elements (not affected by camera)
    this.renderUI();
  }

  private renderBackground() {
    // Render sky gradient based on time of day
    const timeOfDay = this.getTimeOfDay();
    let gradient;
    
    switch (timeOfDay) {
      case 'dawn':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(1, '#f7931e');
        break;
      case 'day':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
        break;
      case 'dusk':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#ff4500');
        gradient.addColorStop(1, '#8b0000');
        break;
      case 'night':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#191970');
        gradient.addColorStop(1, '#000000');
        break;
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      this.gameState.camera.x,
      this.gameState.camera.y,
      this.canvas.width,
      this.canvas.height
    );
  }

  private renderTerrain() {
    const startX = Math.floor(this.gameState.camera.x / 32) - 1;
    const startY = Math.floor(this.gameState.camera.y / 32) - 1;
    const endX = startX + Math.ceil(this.canvas.width / 32) + 2;
    const endY = startY + Math.ceil(this.canvas.height / 32) + 2;

    for (let y = Math.max(0, startY); y < Math.min(this.gameState.currentMap.height, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(this.gameState.currentMap.width, endX); x++) {
        const tile = this.gameState.currentMap.tiles[y][x];
        
        if (!tile.discovered && !this.settings.lowGraphicsMode) continue;
        
        const tileX = x * 32;
        const tileY = y * 32;
        
        // Enhanced tile rendering with textures and details
        this.renderEnhancedTile(tile, tileX, tileY);
        
        // Add tile borders for better definition
        if (!this.settings.lowGraphicsMode) {
          this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(tileX, tileY, 32, 32);
        }
      }
    }
  }

  private renderEnhancedTile(tile: Tile, x: number, y: number) {
    // Base tile color with enhanced graphics
    let baseColor = this.getTileColor(tile.type);
    
    if (!tile.visible && tile.discovered) {
      baseColor = this.darkenColor(baseColor, 0.5);
    }
    
    // Render buildings properly
    if (tile.type === 'building') {
      this.renderBuilding(tile, x, y);
      return;
    }
    
    // Add texture pattern
    if (!this.settings.lowGraphicsMode) {
      this.renderTileTexture(tile.type, x, y, baseColor);
    } else {
      this.ctx.fillStyle = baseColor;
      this.ctx.fillRect(x, y, 32, 32);
    }
    
    // Add environmental details
    if (tile.visible && !this.settings.lowGraphicsMode) {
      this.renderTileDetails(tile, x, y);
    }
  }

  private renderBuilding(tile: Tile, x: number, y: number) {
    // Building base
    this.ctx.fillStyle = '#8B4513'; // Brown building color
    this.ctx.fillRect(x, y, 32, 32);
    
    // Building details
    if (!this.settings.lowGraphicsMode) {
      // Windows
      this.ctx.fillStyle = '#FFD700'; // Golden windows
      this.ctx.fillRect(x + 4, y + 4, 6, 6);
      this.ctx.fillRect(x + 22, y + 4, 6, 6);
      this.ctx.fillRect(x + 4, y + 22, 6, 6);
      this.ctx.fillRect(x + 22, y + 22, 6, 6);
      
      // Door (if it's an entrance)
      if (tile.isEntrance) {
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x + 12, y + 20, 8, 12);
        
        // Door handle
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 18, y + 26, 2, 2);
      }
      
      // Building name
      if (tile.buildingName) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(tile.buildingName.substring(0, 8), x + 16, y - 2);
      }
    }
    
    // Building border
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, 32, 32);
  }

  private renderTileTexture(type: string, x: number, y: number, baseColor: string) {
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(x, y, 32, 32);
    
    // Add texture patterns
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    
    switch (type) {
      case 'grass':
        // Grass texture
        this.ctx.fillStyle = '#2d5016';
        for (let i = 0; i < 8; i++) {
          const px = x + Math.random() * 32;
          const py = y + Math.random() * 32;
          this.ctx.fillRect(px, py, 2, 4);
        }
        break;
        
      case 'stone':
        // Stone texture
        this.ctx.fillStyle = '#555555';
        for (let i = 0; i < 4; i++) {
          const px = x + Math.random() * 32;
          const py = y + Math.random() * 32;
          this.ctx.fillRect(px, py, 4, 4);
        }
        break;
        
      case 'dirt':
        // Dirt texture
        this.ctx.fillStyle = '#8b4513';
        for (let i = 0; i < 6; i++) {
          const px = x + Math.random() * 32;
          const py = y + Math.random() * 32;
          this.ctx.fillRect(px, py, 3, 3);
        }
        break;
        
      case 'water':
        // Water animation
        const time = Date.now() * 0.001;
        this.ctx.fillStyle = `rgba(0, 100, 200, ${0.3 + Math.sin(time + x * 0.01) * 0.1})`;
        this.ctx.fillRect(x, y, 32, 32);
        break;
    }
    
    this.ctx.restore();
  }

  private renderTileDetails(tile: Tile, x: number, y: number) {
    // Add small environmental details
    switch (tile.type) {
      case 'grass':
        if (Math.random() < 0.1) {
          this.ctx.fillStyle = '#228b22';
          this.ctx.fillRect(x + 10, y + 20, 2, 6);
          this.ctx.fillRect(x + 20, y + 15, 2, 8);
        }
        break;
        
      case 'ruins':
        if (Math.random() < 0.2) {
          this.ctx.fillStyle = '#696969';
          this.ctx.fillRect(x + 5, y + 25, 8, 4);
          this.ctx.fillRect(x + 20, y + 10, 6, 6);
        }
        break;
    }
  }

  private renderShadows() {
    if (this.settings.lowGraphicsMode) return;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#000000';
    
    // Render building shadows
    this.gameState.currentMap.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === 'building' && tile.visible) {
          // Cast shadow to the southeast
          this.ctx.fillRect((x + 1) * 32 + 2, (y + 1) * 32 + 2, 30, 30);
        }
      });
    });
    
    this.ctx.restore();
  }

  private renderEntities() {
    // Render lootables
    this.gameState.currentMap.lootables.forEach(lootable => {
      if (this.isInViewport(lootable.position) && !lootable.looted) {
        this.renderLootable(lootable);
      }
    });

    // Render NPCs
    this.gameState.currentMap.npcs.forEach(npc => {
      if (this.isInViewport(npc.position)) {
        this.renderNPC(npc);
      }
    });

    // Render enemies
    this.gameState.currentMap.enemies.forEach(enemy => {
      if (this.isInViewport(enemy.position)) {
        this.renderEnemy(enemy);
      }
    });

    // Render party members
    this.gameState.party.forEach(character => {
      if (this.isInViewport(character.position)) {
        this.renderCharacter(character);
      }
    });
  }

  private renderCharacter(character: Character) {
    const x = character.position.x - 16;
    const y = character.position.y - 16;
    
    // Enhanced character rendering
    this.ctx.save();
    
    // Character shadow
    if (!this.settings.lowGraphicsMode) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(x + 2, y + 28, 28, 6);
      this.ctx.globalAlpha = 1;
    }
    
    // Character body
    this.ctx.fillStyle = character.id === 'player' ? '#4CAF50' : '#2196F3';
    this.ctx.fillRect(x + 4, y + 8, 24, 24);
    
    // Character details
    if (!this.settings.lowGraphicsMode) {
      // Head
      this.ctx.fillStyle = '#ffdbac';
      this.ctx.fillRect(x + 8, y + 4, 16, 12);
      
      // Equipment highlights
      if (character.equipment.weapon) {
        this.ctx.fillStyle = '#ff9800';
        this.ctx.fillRect(x + 28, y + 12, 6, 12);
      }
      
      if (character.equipment.armor) {
        this.ctx.strokeStyle = '#795548';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 4, y + 8, 24, 24);
      }
    }
    
    // Health bar
    if (character.health < character.maxHealth) {
      this.renderHealthBar(x + 16, y - 8, character.health, character.maxHealth);
    }
    
    // Status effects
    this.renderStatusEffects(character, x + 16, y - 16);
    
    this.ctx.restore();
  }

  private renderNPC(npc: NPC) {
    const x = npc.position.x - 16;
    const y = npc.position.y - 16;
    
    this.ctx.save();
    
    // NPC shadow
    if (!this.settings.lowGraphicsMode) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(x + 2, y + 28, 28, 6);
      this.ctx.globalAlpha = 1;
    }
    
    // NPC body
    let npcColor = '#FFC107'; // Default yellow for neutral
    if (npc.type === 'trader') npcColor = '#9C27B0';
    if (npc.type === 'quest_giver') npcColor = '#FF5722';
    if (npc.isHostile) npcColor = '#F44336';
    
    this.ctx.fillStyle = npcColor;
    this.ctx.fillRect(x + 4, y + 8, 24, 24);
    
    // NPC details
    if (!this.settings.lowGraphicsMode) {
      // Head
      this.ctx.fillStyle = '#ffdbac';
      this.ctx.fillRect(x + 8, y + 4, 16, 12);
      
      // Type indicator
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      
      let indicator = '?';
      if (npc.type === 'trader') indicator = '$';
      if (npc.type === 'quest_giver') indicator = '!';
      
      this.ctx.fillText(indicator, x + 16, y + 20);
    }
    
    // Interaction indicator
    const distance = Math.sqrt(
      Math.pow(npc.position.x - this.gameState.player.position.x, 2) + 
      Math.pow(npc.position.y - this.gameState.player.position.y, 2)
    );
    
    if (distance <= 48) {
      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.fillRect(x + 14, y - 8, 4, 4);
    }
    
    this.ctx.restore();
  }

  private renderEnemy(enemy: Enemy) {
    const x = enemy.position.x - 16;
    const y = enemy.position.y - 16;
    
    this.ctx.save();
    
    // Enemy shadow
    if (!this.settings.lowGraphicsMode) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(x + 2, y + 28, 28, 6);
      this.ctx.globalAlpha = 1;
    }
    
    // Enemy body
    let enemyColor = '#F44336';
    if (enemy.type === 'robot') enemyColor = '#607D8B';
    if (enemy.type === 'mutant') enemyColor = '#4CAF50';
    if (enemy.type === 'beast') enemyColor = '#795548';
    
    this.ctx.fillStyle = enemyColor;
    this.ctx.fillRect(x + 4, y + 8, 24, 24);
    
    // Enemy details
    if (!this.settings.lowGraphicsMode) {
      // Type-specific details
      if (enemy.type === 'robot') {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 12, y + 12, 4, 4);
        this.ctx.fillRect(x + 16, y + 12, 4, 4);
      }
      
      // Threat level indicator
      this.ctx.strokeStyle = enemy.level > this.gameState.player.level ? '#ff0000' : '#ffeb3b';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 2, y + 6, 28, 28);
    }
    
    // Health bar
    this.renderHealthBar(x + 16, y - 8, enemy.health, enemy.maxHealth);
    
    // Status effects
    this.renderStatusEffects(enemy, x + 16, y - 16);
    
    this.ctx.restore();
  }

  private renderLootable(lootable: LootableItem) {
    const x = lootable.position.x - 16;
    const y = lootable.position.y - 16;
    
    this.ctx.save();
    
    // Lootable glow effect
    if (!this.settings.lowGraphicsMode) {
      const time = Date.now() * 0.003;
      this.ctx.globalAlpha = 0.5 + Math.sin(time) * 0.3;
      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.fillRect(x - 2, y - 2, 36, 36);
      this.ctx.globalAlpha = 1;
    }
    
    // Lootable body
    let lootColor = '#8BC34A';
    if (lootable.type === 'corpse') lootColor = '#795548';
    if (lootable.type === 'cache') lootColor = '#FF9800';
    
    this.ctx.fillStyle = lootColor;
    this.ctx.fillRect(x + 4, y + 4, 24, 24);
    
    // Lootable details
    if (!this.settings.lowGraphicsMode) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('?', x + 16, y + 20);
    }
    
    this.ctx.restore();
  }

  private renderHealthBar(x: number, y: number, health: number, maxHealth: number) {
    const barWidth = 32;
    const barHeight = 4;
    const healthPercent = health / maxHealth;
    
    // Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x - barWidth/2, y, barWidth, barHeight);
    
    // Health
    this.ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : 
                       healthPercent > 0.3 ? '#FF9800' : '#F44336';
    this.ctx.fillRect(x - barWidth/2, y, barWidth * healthPercent, barHeight);
    
    // Border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - barWidth/2, y, barWidth, barHeight);
  }

  private renderStatusEffects(entity: Character | Enemy, x: number, y: number) {
    if (entity.statusEffects.length === 0) return;
    
    entity.statusEffects.forEach((effect, index) => {
      const iconX = x + (index * 12) - (entity.statusEffects.length * 6);
      const iconY = y;
      
      let effectColor = '#ffffff';
      if (effect.type === 'poison') effectColor = '#4CAF50';
      if (effect.type === 'burn') effectColor = '#FF5722';
      if (effect.type === 'freeze') effectColor = '#2196F3';
      
      this.ctx.fillStyle = effectColor;
      this.ctx.fillRect(iconX, iconY, 8, 8);
    });
  }

  private renderLighting() {
    if (this.settings.lowGraphicsMode) return;
    
    // Create lighting overlay
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'multiply';
    
    // Base darkness
    const timeOfDay = this.getTimeOfDay();
    let darkness = 0.1; // Much lighter base darkness
    if (timeOfDay === 'night') darkness = 0.4; // Reduced night darkness
    if (timeOfDay === 'dusk' || timeOfDay === 'dawn') darkness = 0.2; // Reduced twilight darkness
    
    this.ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
    this.ctx.fillRect(
      this.gameState.camera.x,
      this.gameState.camera.y,
      this.canvas.width,
      this.canvas.height
    );
    
    // Light sources
    this.ctx.globalCompositeOperation = 'screen';
    this.lightSources.forEach(light => {
      if (this.isInViewport({ x: light.x, y: light.y })) {
        // Reduce radiation glow intensity
        const intensity = light.type === 'radiation' ? light.intensity * 0.3 : light.intensity;
        
        const gradient = this.ctx.createRadialGradient(
          light.x, light.y, 0,
          light.x, light.y, light.radius
        );
        
        // Use different colors for different light types
        if (light.type === 'radiation') {
          gradient.addColorStop(0, `rgba(0, 255, 0, ${intensity * 0.5})`); // Subtle green
          gradient.addColorStop(0.5, `rgba(0, 200, 0, ${intensity * 0.3})`);
        } else {
          gradient.addColorStop(0, `rgba(255, 235, 59, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(255, 193, 7, ${intensity * 0.5})`);
        }
        gradient.addColorStop(1, 'rgba(255, 193, 7, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
          light.x - light.radius,
          light.y - light.radius,
          light.radius * 2,
          light.radius * 2
        );
      }
    });
    
    this.ctx.restore();
  }

  private renderWeatherEffects() {
    if (this.settings.lowGraphicsMode) return;
    
    this.ctx.save();
    
    this.weatherEffects.forEach(effect => {
      switch (effect.type) {
        case 'rain':
          this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.6)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(effect.x, effect.y);
          this.ctx.lineTo(effect.x + effect.vx * 0.1, effect.y + effect.vy * 0.1);
          this.ctx.stroke();
          break;
      }
    });
    
    this.ctx.restore();
  }

  private renderParticles() {
    if (this.settings.lowGraphicsMode) return;
    
    this.ctx.save();
    
    this.particleSystem.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      
      const size = particle.size * alpha;
      this.ctx.fillRect(
        particle.x - size/2,
        particle.y - size/2,
        size,
        size
      );
    });
    
    this.ctx.restore();
  }

  private renderUI() {
    // Render minimap
    this.renderMinimap();
    
    // Render compass
    this.renderCompass();
    
    // Render time and weather
    this.renderTimeWeather();
  }

  private renderMinimap() {
    const minimapSize = 150;
    const minimapX = this.canvas.width - minimapSize - 20;
    const minimapY = 20;
    
    this.ctx.save();
    
    // Minimap background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Minimap border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Scale factor
    const scale = minimapSize / Math.max(this.gameState.currentMap.width, this.gameState.currentMap.height);
    
    // Render discovered tiles
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        const tile = this.gameState.currentMap.tiles[y][x];
        if (tile.discovered) {
          const tileColor = this.getTileColor(tile.type);
          this.ctx.fillStyle = tile.visible ? tileColor : this.darkenColor(tileColor, 0.5);
          this.ctx.fillRect(
            minimapX + x * scale,
            minimapY + y * scale,
            Math.max(1, scale),
            Math.max(1, scale)
          );
        }
      }
    }
    
    // Player position
    const playerX = minimapX + (this.gameState.player.position.x / 32) * scale;
    const playerY = minimapY + (this.gameState.player.position.y / 32) * scale;
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(playerX - 2, playerY - 2, 4, 4);
    
    this.ctx.restore();
  }

  private renderCompass() {
    const compassSize = 60;
    const compassX = 30;
    const compassY = 30;
    
    this.ctx.save();
    
    // Compass background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(compassX + compassSize/2, compassY + compassSize/2, compassSize/2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Compass border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // North indicator
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', compassX + compassSize/2, compassY + 15);
    
    this.ctx.restore();
  }

  private renderTimeWeather() {
    const x = 20;
    const y = this.canvas.height - 60;
    
    this.ctx.save();
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, 200, 40);
    
    // Time
    const hours = Math.floor(this.gameState.dayNightCycle * 24);
    const minutes = Math.floor((this.gameState.dayNightCycle * 24 - hours) * 60);
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Time: ${timeString}`, x + 10, y + 15);
    
    // Weather with clearer descriptions
    const weatherDescriptions = {
      clear: 'Clear Skies',
      rain: 'Light Rain',
      storm: 'Heavy Storm',
      fog: 'Dense Fog',
      radiation: 'Rad Storm'
    };
    const weatherDesc = weatherDescriptions[this.gameState.weather as keyof typeof weatherDescriptions] || this.gameState.weather;
    this.ctx.fillText(`Weather: ${weatherDesc}`, x + 10, y + 30);
    
    this.ctx.restore();
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'grass': return '#4CAF50';
      case 'dirt': return '#8D6E63';
      case 'stone': return '#9E9E9E';
      case 'water': return '#2196F3';
      case 'lava': return '#FF5722';
      case 'ice': return '#E3F2FD';
      case 'sand': return '#FFEB3B';
      case 'ruins': return '#424242';
      case 'building': return '#795548';
      default: return '#9E9E9E';
    }
  }

  private darkenColor(color: string, factor: number): string {
    // Simple color darkening
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private isInViewport(position: Position): boolean {
    const margin = 64;
    return position.x >= this.gameState.camera.x - margin &&
           position.x <= this.gameState.camera.x + this.canvas.width + margin &&
           position.y >= this.gameState.camera.y - margin &&
           position.y <= this.gameState.camera.y + this.canvas.height + margin;
  }

  private getDefaultSettings(): GameSettings {
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

  private gameLoop = (currentTime: number) => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.gameLoop);
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

  public updateGameState(newState: GameState) {
    this.gameState = newState;
    if (this.stateChangeCallback) {
      this.stateChangeCallback(newState);
    }
  }

  public setGameState(newState: GameState) {
    this.gameState = newState;
    this.initializeVisibilityMap();
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public handleCombatAction(action: string, targetIndex?: number) {
    // Combat action handling would be implemented here
    console.log('Combat action:', action, 'target:', targetIndex);
  }
}

// Type definitions for enhanced graphics
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: string;
}

interface LightSource {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color: string;
  type: string;
}

interface WeatherEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  type: string;
}

interface Shadow {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}