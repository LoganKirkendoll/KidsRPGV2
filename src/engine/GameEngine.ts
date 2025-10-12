import { GameState, Position, Character, Enemy, NPC, Tile, GameMap } from '../types/game';
import { maps } from '../data/maps';
import { getBuildingByPosition, getBuildingById } from '../data/buildings';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private settings: any;
  private keys: { [key: string]: boolean } = {};
  private lastTime = 0;
  private animationId: number | null = null;
  private stateChangeCallback?: (newState: GameState) => void;
  private lootableCallback?: (lootable: any) => void;
  private loadedMaps: { [key: string]: GameMap } = {};
  private isTransitioning = false;
  private transitionCooldown = 0;
  private edgeTimer = 0;
  private isAtEdge = false;
  private edgeDirection: 'north' | 'south' | 'east' | 'west' | null = null;
  
  // Graphics system
  private tileSprites: { [key: string]: HTMLCanvasElement } = {};
  private characterSprites: { [key: string]: HTMLCanvasElement } = {};
  private uiSprites: { [key: string]: HTMLCanvasElement } = {};
  private particleSystem: Particle[] = [];
  private lightingSystem: LightSource[] = [];
  
  // Performance optimization properties
  private frameCount = 0;
  private lastFpsTime = 0;
  private targetFps = 60;
  private frameInterval = 1000 / this.targetFps;
  private lastRenderTime = 0;
  private visibleTileCache: { [key: string]: boolean } = {};
  private lastCameraPosition = { x: -1, y: -1 };
  private renderBounds = { startX: 0, startY: 0, endX: 0, endY: 0 };
  private isLowPerformanceDevice = false;
  private tileRenderCache: ImageData | null = null;
  private cacheInvalidated = true;
  private lastPlayerPosition = { x: -1, y: -1 };
  private renderSkipCounter = 0;
  private maxRenderSkip = 2;

  constructor(canvas: HTMLCanvasElement, initialGameState: GameState, settings?: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialGameState };
    this.settings = settings || { lowGraphicsMode: false };
    
    this.canvas.width = 1024;
    this.canvas.height = 768;
    
    // Initialize graphics system
    this.initializeGraphics();
    
    // Detect low performance devices
    this.detectPerformance();
    
    // Load only current map initially
    this.loadedMaps[this.gameState.currentMap.id] = this.gameState.currentMap;
    
    this.setupEventListeners();
    this.gameLoop(0);
  }

  private initializeGraphics() {
    // Create tile sprites
    this.createTileSprites();
    this.createCharacterSprites();
    this.createUISprites();
    
    // Initialize lighting
    this.initializeLighting();
  }

  private createTileSprites() {
    const tileSize = 32;

    // Grass tile with improved texture
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = grassCanvas.height = tileSize;
    const grassCtx = grassCanvas.getContext('2d')!;

    // Base grass color with gradient
    const grassGradient = grassCtx.createLinearGradient(0, 0, tileSize, tileSize);
    grassGradient.addColorStop(0, '#4a7c59');
    grassGradient.addColorStop(0.5, '#5a8c69');
    grassGradient.addColorStop(1, '#4a7c59');
    grassCtx.fillStyle = grassGradient;
    grassCtx.fillRect(0, 0, tileSize, tileSize);

    // Add grass blades with better detail
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * tileSize;
      const y = Math.random() * tileSize;
      grassCtx.fillStyle = `rgba(${60 + Math.random() * 50}, ${130 + Math.random() * 50}, ${70 + Math.random() * 40}, ${0.4 + Math.random() * 0.4})`;
      grassCtx.fillRect(x, y, 1 + Math.random(), 3 + Math.random() * 3);
    }

    // Add subtle highlights
    for (let i = 0; i < 10; i++) {
      grassCtx.fillStyle = `rgba(180, 220, 190, ${0.1 + Math.random() * 0.2})`;
      grassCtx.fillRect(Math.random() * tileSize, Math.random() * tileSize, 2, 2);
    }
    this.tileSprites['grass'] = grassCanvas;

    // Stone tile with improved brick pattern
    const stoneCanvas = document.createElement('canvas');
    stoneCanvas.width = stoneCanvas.height = tileSize;
    const stoneCtx = stoneCanvas.getContext('2d')!;

    // Base stone with gradient
    const stoneGradient = stoneCtx.createRadialGradient(tileSize/2, tileSize/2, 0, tileSize/2, tileSize/2, tileSize);
    stoneGradient.addColorStop(0, '#787878');
    stoneGradient.addColorStop(1, '#5a5a5a');
    stoneCtx.fillStyle = stoneGradient;
    stoneCtx.fillRect(0, 0, tileSize, tileSize);

    // Brick pattern with depth
    stoneCtx.strokeStyle = '#404040';
    stoneCtx.lineWidth = 2;
    for (let y = 0; y < tileSize; y += 8) {
      stoneCtx.beginPath();
      stoneCtx.moveTo(0, y);
      stoneCtx.lineTo(tileSize, y);
      stoneCtx.stroke();
    }
    for (let x = 0; x < tileSize; x += 16) {
      stoneCtx.beginPath();
      stoneCtx.moveTo(x, 0);
      stoneCtx.lineTo(x, tileSize);
      stoneCtx.stroke();
    }

    // Add stone texture noise
    for (let i = 0; i < 40; i++) {
      stoneCtx.fillStyle = `rgba(${100 + Math.random() * 40}, ${100 + Math.random() * 40}, ${100 + Math.random() * 40}, 0.3)`;
      stoneCtx.fillRect(Math.random() * tileSize, Math.random() * tileSize, 1, 1);
    }
    this.tileSprites['stone'] = stoneCanvas;

    // Dirt tile with texture
    const dirtCanvas = document.createElement('canvas');
    dirtCanvas.width = dirtCanvas.height = tileSize;
    const dirtCtx = dirtCanvas.getContext('2d')!;
    
    dirtCtx.fillStyle = '#8b4513';
    dirtCtx.fillRect(0, 0, tileSize, tileSize);
    
    // Add dirt texture
    for (let i = 0; i < 30; i++) {
      dirtCtx.fillStyle = `rgba(${100 + Math.random() * 50}, ${50 + Math.random() * 30}, ${10 + Math.random() * 20}, 0.4)`;
      dirtCtx.fillRect(Math.random() * tileSize, Math.random() * tileSize, 1, 1);
    }
    this.tileSprites['dirt'] = dirtCanvas;

    // Water tile with animation
    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = waterCanvas.height = tileSize;
    const waterCtx = waterCanvas.getContext('2d')!;
    
    const gradient = waterCtx.createLinearGradient(0, 0, tileSize, tileSize);
    gradient.addColorStop(0, '#4682b4');
    gradient.addColorStop(0.5, '#5a9bd4');
    gradient.addColorStop(1, '#4682b4');
    waterCtx.fillStyle = gradient;
    waterCtx.fillRect(0, 0, tileSize, tileSize);
    
    // Add water ripples
    waterCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    waterCtx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      waterCtx.beginPath();
      waterCtx.arc(Math.random() * tileSize, Math.random() * tileSize, 4 + Math.random() * 4, 0, Math.PI * 2);
      waterCtx.stroke();
    }
    this.tileSprites['water'] = waterCanvas;

    // Building/wall tile
    const buildingCanvas = document.createElement('canvas');
    buildingCanvas.width = buildingCanvas.height = tileSize;
    const buildingCtx = buildingCanvas.getContext('2d')!;
    
    buildingCtx.fillStyle = '#654321';
    buildingCtx.fillRect(0, 0, tileSize, tileSize);
    
    // Add wood grain
    buildingCtx.strokeStyle = '#543a1a';
    buildingCtx.lineWidth = 1;
    for (let y = 4; y < tileSize; y += 8) {
      buildingCtx.beginPath();
      buildingCtx.moveTo(0, y);
      buildingCtx.lineTo(tileSize, y);
      buildingCtx.stroke();
    }
    this.tileSprites['building'] = buildingCanvas;

    // Furniture tile
    const furnitureCanvas = document.createElement('canvas');
    furnitureCanvas.width = furnitureCanvas.height = tileSize;
    const furnitureCtx = furnitureCanvas.getContext('2d')!;
    
    furnitureCtx.fillStyle = '#8B4513';
    furnitureCtx.fillRect(0, 0, tileSize, tileSize);
    
    // Add furniture details
    furnitureCtx.fillStyle = '#A0522D';
    furnitureCtx.fillRect(2, 2, tileSize - 4, tileSize - 4);
    
    furnitureCtx.strokeStyle = '#654321';
    furnitureCtx.lineWidth = 2;
    furnitureCtx.strokeRect(0, 0, tileSize, tileSize);
    this.tileSprites['furniture'] = furnitureCanvas;

    // Ruins tile
    const ruinsCanvas = document.createElement('canvas');
    ruinsCanvas.width = ruinsCanvas.height = tileSize;
    const ruinsCtx = ruinsCanvas.getContext('2d')!;
    
    ruinsCtx.fillStyle = '#2f2f2f';
    ruinsCtx.fillRect(0, 0, tileSize, tileSize);
    
    // Add rubble
    for (let i = 0; i < 10; i++) {
      ruinsCtx.fillStyle = `rgba(${80 + Math.random() * 40}, ${80 + Math.random() * 40}, ${80 + Math.random() * 40}, 0.8)`;
      ruinsCtx.fillRect(Math.random() * tileSize, Math.random() * tileSize, 3 + Math.random() * 4, 3 + Math.random() * 4);
    }
    this.tileSprites['ruins'] = ruinsCanvas;

    // Sand tile
    const sandCanvas = document.createElement('canvas');
    sandCanvas.width = sandCanvas.height = tileSize;
    const sandCtx = sandCanvas.getContext('2d')!;
    
    sandCtx.fillStyle = '#f4a460';
    sandCtx.fillRect(0, 0, tileSize, tileSize);
    
    // Add sand texture
    for (let i = 0; i < 50; i++) {
      sandCtx.fillStyle = `rgba(${240 + Math.random() * 15}, ${160 + Math.random() * 20}, ${90 + Math.random() * 10}, 0.3)`;
      sandCtx.fillRect(Math.random() * tileSize, Math.random() * tileSize, 1, 1);
    }
    this.tileSprites['sand'] = sandCanvas;
  }

  private createCharacterSprites() {
    const spriteSize = 32;

    // Enhanced Player sprite with better detail
    const playerCanvas = document.createElement('canvas');
    playerCanvas.width = playerCanvas.height = spriteSize;
    const playerCtx = playerCanvas.getContext('2d')!;

    // Shadow
    playerCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    playerCtx.ellipse(spriteSize/2, spriteSize - 4, 8, 3, 0, 0, Math.PI * 2);
    playerCtx.fill();

    // Body with gradient
    const bodyGradient = playerCtx.createLinearGradient(0, 10, 0, 26);
    bodyGradient.addColorStop(0, '#5aa3ff');
    bodyGradient.addColorStop(1, '#3a83df');
    playerCtx.fillStyle = bodyGradient;
    playerCtx.fillRect(10, 12, 12, 14);

    // Head with shading
    const headGradient = playerCtx.createRadialGradient(16, 8, 2, 16, 8, 6);
    headGradient.addColorStop(0, '#ffccbb');
    headGradient.addColorStop(1, '#e8a492');
    playerCtx.fillStyle = headGradient;
    playerCtx.fillRect(12, 4, 8, 10);

    // Eyes
    playerCtx.fillStyle = '#000000';
    playerCtx.fillRect(14, 7, 2, 2);
    playerCtx.fillRect(18, 7, 2, 2);

    // Arms with shading
    playerCtx.fillStyle = '#4a90e2';
    playerCtx.fillRect(6, 14, 4, 12);
    playerCtx.fillRect(22, 14, 4, 12);

    // Arm highlights
    playerCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    playerCtx.fillRect(7, 14, 1, 6);
    playerCtx.fillRect(23, 14, 1, 6);

    // Legs
    playerCtx.fillStyle = '#2c5aa0';
    playerCtx.fillRect(11, 24, 4, 6);
    playerCtx.fillRect(17, 24, 4, 6);

    // Belt
    playerCtx.fillStyle = '#654321';
    playerCtx.fillRect(10, 20, 12, 2);

    this.characterSprites['player'] = playerCanvas;

    // NPC sprite
    const npcCanvas = document.createElement('canvas');
    npcCanvas.width = npcCanvas.height = spriteSize;
    const npcCtx = npcCanvas.getContext('2d')!;
    
    // Body
    npcCtx.fillStyle = '#44ff44';
    npcCtx.fillRect(6, 8, 12, 16);
    
    // Head
    npcCtx.fillStyle = '#fdbcb4';
    npcCtx.fillRect(8, 2, 8, 8);
    
    // Arms
    npcCtx.fillStyle = '#44ff44';
    npcCtx.fillRect(2, 10, 4, 10);
    npcCtx.fillRect(18, 10, 4, 10);
    
    // Legs
    npcCtx.fillStyle = '#2c8c2c';
    npcCtx.fillRect(8, 20, 3, 4);
    npcCtx.fillRect(13, 20, 3, 4);
    
    this.characterSprites['npc'] = npcCanvas;

    // Enemy sprite
    const enemyCanvas = document.createElement('canvas');
    enemyCanvas.width = enemyCanvas.height = spriteSize;
    const enemyCtx = enemyCanvas.getContext('2d')!;
    
    // Body
    enemyCtx.fillStyle = '#ff0000';
    enemyCtx.fillRect(6, 8, 12, 16);
    
    // Head
    enemyCtx.fillStyle = '#cc0000';
    enemyCtx.fillRect(8, 2, 8, 8);
    
    // Arms
    enemyCtx.fillStyle = '#ff0000';
    enemyCtx.fillRect(2, 10, 4, 10);
    enemyCtx.fillRect(18, 10, 4, 10);
    
    // Legs
    enemyCtx.fillStyle = '#aa0000';
    enemyCtx.fillRect(8, 20, 3, 4);
    enemyCtx.fillRect(13, 20, 3, 4);
    
    this.characterSprites['enemy'] = enemyCanvas;
  }

  private createUISprites() {
    // Health bar background
    const healthBgCanvas = document.createElement('canvas');
    healthBgCanvas.width = 200;
    healthBgCanvas.height = 20;
    const healthBgCtx = healthBgCanvas.getContext('2d')!;
    
    healthBgCtx.fillStyle = '#333333';
    healthBgCtx.fillRect(0, 0, 200, 20);
    healthBgCtx.strokeStyle = '#666666';
    healthBgCtx.lineWidth = 2;
    healthBgCtx.strokeRect(0, 0, 200, 20);
    
    this.uiSprites['healthBg'] = healthBgCanvas;
  }

  private initializeLighting() {
    // Add ambient lighting for interiors
    this.lightingSystem = [];
    
    // Player light source
    this.lightingSystem.push({
      position: { x: 0, y: 0 },
      radius: 100,
      intensity: 0.8,
      color: '#ffffff'
    });
  }

  private detectPerformance() {
    // Simple performance detection based on user agent and hardware
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isOldBrowser = !window.requestAnimationFrame || !window.performance;
    
    // Check for hardware acceleration
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    
    this.isLowPerformanceDevice = isMobile || isOldBrowser || !hasWebGL;
    
    if (this.isLowPerformanceDevice) {
      this.targetFps = 30; // Lower FPS for low-end devices
      this.frameInterval = 1000 / this.targetFps;
      this.settings.lowGraphicsMode = true;
      this.maxRenderSkip = 3; // Skip more frames on low-end devices
    }
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.handleKeyPress(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'f', 'i', 'e', 'c', 'q', 'm', 'escape'];
      if (gameKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    // Handle visibility change to pause/resume game
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseGame();
      } else {
        this.resumeGame();
      }
    });
  }

  private pauseGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private resumeGame() {
    if (!this.animationId) {
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  private handleKeyPress(key: string) {
    if (this.gameState.gameMode !== 'exploration') return;

    switch (key) {
      case 'i':
        this.gameState.gameMode = 'inventory';
        this.notifyStateChange();
        break;
      case 'e':
        this.gameState.gameMode = 'equipment';
        this.notifyStateChange();
        break;
      case 'c':
        this.gameState.gameMode = 'character';
        this.notifyStateChange();
        break;
      case 'q':
        this.gameState.gameMode = 'quests';
        this.notifyStateChange();
        break;
      case 'm':
        this.gameState.gameMode = 'map';
        this.notifyStateChange();
        break;
      case 'escape':
        // Exit building if in interior
        if (this.gameState.currentMap.isInterior && this.gameState.previousMap) {
          this.exitBuilding();
        }
        break;
      case 'f1':
        this.gameState.devMode = this.gameState.devMode || {
          enabled: false,
          selectedTool: 'quest',
          questEditor: { id: '', title: '', description: '', objectives: [], rewards: [], requiredLevel: 1 },
          npcEditor: { id: '', name: '', type: 'neutral', position: { x: 400, y: 400 }, dialogue: [], inventory: [], faction: 'neutral', isHostile: false },
          itemEditor: { id: '', name: '', type: 'material', rarity: 'common', description: '', stats: {}, value: 10, stackable: false }
        };
        this.gameState.devMode.enabled = !this.gameState.devMode.enabled;
        this.notifyStateChange();
        break;
      case ' ':
      case 'f':
        this.handleInteraction();
        break;
    }
  }

  private handleInteraction() {
    const playerPos = this.gameState.player.position;
    const interactionRange = 64; // 2 tiles for better building detection
    
    // Check for enterable buildings first
    const playerTileX = Math.floor(playerPos.x / 32);
    const playerTileY = Math.floor(playerPos.y / 32);
    
    // Check surrounding tiles for enterable buildings
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkY = playerTileY + dy;
        const checkX = playerTileX + dx;
        const tile = this.gameState.currentMap.tiles[checkY]?.[checkX];
        
        if (tile?.isEnterable && tile.buildingId) {
          this.enterBuilding(tile.buildingId);
          return;
        }
      }
    }
    
    // Check for nearby building entrances
    const nearbyBuilding = getBuildingByPosition(playerPos, interactionRange);
    if (nearbyBuilding) {
      this.enterBuilding(nearbyBuilding.id);
      return;
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
      return;
    }

    // Check for lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find((lootable, index) => {
      if (lootable.looted) return false;
      const distance = Math.sqrt(
        Math.pow(lootable.position.x - playerPos.x, 2) + 
        Math.pow(lootable.position.y - playerPos.y, 2)
      );
      if (distance <= interactionRange) {
        lootable.looted = true;
        return true;
      }
      return false;
    });

    if (nearbyLootable && this.lootableCallback) {
      this.lootableCallback(nearbyLootable);
      
      setTimeout(() => {
        const lootIndex = this.gameState.currentMap.lootables.findIndex(l => l.id === nearbyLootable.id);
        if (lootIndex >= 0) {
          this.gameState.currentMap.lootables.splice(lootIndex, 1);
          this.notifyStateChange();
        }
      }, 100);
      return;
    }
  }

  private startDialogue(npc: NPC) {
    if (npc.dialogue.length > 0) {
      const firstNode = npc.dialogue[0];
      this.gameState.dialogue = {
        npcId: npc.id,
        currentNode: firstNode.id,
        history: [`${npc.name}: ${firstNode.text}`],
        choices: firstNode.choices
      };
      this.gameState.gameMode = 'dialogue';
      this.notifyStateChange();
    }
  }

  private startCombat(enemies: Enemy[]) {
    const participants = [this.gameState.player, ...enemies];
    const turnOrder = [...participants].sort((a, b) => {
      const aAgility = 'stats' in a ? a.stats.agility : 5;
      const bAgility = 'stats' in b ? b.stats.agility : 5;
      return bAgility - aAgility;
    });

    this.gameState.combat = {
      participants,
      turnOrder,
      currentTurn: 0,
      round: 1,
      selectedTargets: [],
      animations: [],
      battleground: this.gameState.currentMap.tiles,
      weather: this.gameState.weather,
      timeOfDay: 'day',
      isPlayerTurn: turnOrder[0] === this.gameState.player,
      combatLog: ['Combat begins!']
    };
    
    this.gameState.gameMode = 'combat';
    this.notifyStateChange();
  }

  private updatePlayerMovement(deltaTime: number) {
    if (this.gameState.gameMode !== 'exploration') return;
    if (this.isTransitioning) return;

    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= deltaTime;
    }

    // Movement speed
    const speed = this.isLowPerformanceDevice ? 96 : 128;
    const moveDistance = speed * (deltaTime / 1000);
    
    let newX = this.gameState.player.position.x;
    let newY = this.gameState.player.position.y;
    let moved = false;
    let direction = this.gameState.player.direction;

    // Handle diagonal movement
    let moveX = 0;
    let moveY = 0;

    if (this.keys['w'] || this.keys['arrowup']) {
      moveY = -1;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      moveY = 1;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      moveX = -1;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      moveX = 1;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // sqrt(2)/2 for diagonal normalization
      moveY *= 0.707;
    }

    if (moveX !== 0 || moveY !== 0) {
      newX += moveX * moveDistance;
      newY += moveY * moveDistance;
      moved = true;

      // Update direction based on movement
      if (moveX > 0) direction = 'right';
      else if (moveX < 0) direction = 'left';
      else if (moveY > 0) direction = 'down';
      else if (moveY < 0) direction = 'up';

      this.gameState.player.direction = direction;
    }

    if (moved) {
      const mapWidth = this.gameState.currentMap.width * 32;
      const mapHeight = this.gameState.currentMap.height * 32;
      
      const atEdge = newX < 16 || newX >= mapWidth - 16 || newY < 16 || newY >= mapHeight - 16;
      
      if (atEdge && this.transitionCooldown <= 0) {
        let currentEdgeDirection: 'north' | 'south' | 'east' | 'west' | null = null;
        if (newX < 16) currentEdgeDirection = 'west';
        else if (newX >= mapWidth - 16) currentEdgeDirection = 'east';
        else if (newY < 16) currentEdgeDirection = 'north';
        else if (newY >= mapHeight - 16) currentEdgeDirection = 'south';
        
        if (!this.isAtEdge || this.edgeDirection !== currentEdgeDirection) {
          this.isAtEdge = true;
          this.edgeDirection = currentEdgeDirection;
          this.edgeTimer = 0;
        } else {
          this.edgeTimer += deltaTime;
          
          if (this.edgeTimer >= 2000) {
            this.handleMapTransition(newX, newY, mapWidth, mapHeight);
            return;
          }
        }
      } else {
        this.isAtEdge = false;
        this.edgeDirection = null;
        this.edgeTimer = 0;
      }

      const tileX = Math.floor(newX / 32);
      const tileY = Math.floor(newY / 32);
      
      if (this.isValidPosition(tileX, tileY)) {
        this.gameState.player.position.x = newX;
        this.gameState.player.position.y = newY;
        this.gameState.player.isMoving = true;
        
        // Update lighting position
        this.lightingSystem[0].position = { x: newX, y: newY };
        
        // Only update camera and visibility if player moved significantly
        const playerMoved = Math.abs(newX - this.lastPlayerPosition.x) > 8 || 
                           Math.abs(newY - this.lastPlayerPosition.y) > 8;
        
        if (playerMoved) {
          this.updateCamera();
          this.updateVisibility();
          this.lastPlayerPosition = { x: newX, y: newY };
          this.cacheInvalidated = true;
        }
        
        this.gameState.statistics.distanceTraveled += moveDistance;
      }
    } else {
      this.gameState.player.isMoving = false;
    }
  }

  private handleMapTransition(newX: number, newY: number, mapWidth: number, mapHeight: number) {
    if (this.isTransitioning || this.transitionCooldown > 0) return;
    
    this.isAtEdge = false;
    this.edgeDirection = null;
    this.edgeTimer = 0;
    
    this.isTransitioning = true;
    this.transitionCooldown = 1000;
    
    let direction: 'north' | 'south' | 'east' | 'west' | null = null;
    
    if (newX < 16) direction = 'west';
    else if (newX >= mapWidth - 16) direction = 'east';
    else if (newY < 16) direction = 'north';
    else if (newY >= mapHeight - 16) direction = 'south';
    
    if (!direction) {
      this.isTransitioning = false;
      return;
    }
    
    const connection = this.gameState.currentMap.connections.find(conn => conn.direction === direction);
    if (!connection) {
      this.isTransitioning = false;
      return;
    }
    
    let targetMap = this.loadedMaps[connection.targetMapId];
    if (!targetMap) {
      const createMapFn = maps[connection.targetMapId as keyof typeof maps];
      if (createMapFn) {
        targetMap = createMapFn();
        this.loadedMaps[connection.targetMapId] = targetMap;
      } else {
        this.isTransitioning = false;
        return;
      }
    }
    
    let targetPosition: Position;
    const safeMargin = 64;
    
    switch (direction) {
      case 'north':
        targetPosition = { 
          x: Math.max(safeMargin, Math.min(connection.toPosition.x, (targetMap.width - 2) * 32)), 
          y: (targetMap.height - 3) * 32 
        };
        break;
      case 'south':
        targetPosition = { 
          x: Math.max(safeMargin, Math.min(connection.toPosition.x, (targetMap.width - 2) * 32)), 
          y: safeMargin 
        };
        break;
      case 'east':
        targetPosition = { 
          x: safeMargin, 
          y: Math.max(safeMargin, Math.min(connection.toPosition.y, (targetMap.height - 2) * 32)) 
        };
        break;
      case 'west':
        targetPosition = { 
          x: (targetMap.width - 3) * 32, 
          y: Math.max(safeMargin, Math.min(connection.toPosition.y, (targetMap.height - 2) * 32)) 
        };
        break;
      default:
        this.isTransitioning = false;
        return;
    }
    
    this.gameState.currentMap = targetMap;
    this.gameState.player.position = { ...targetPosition };
    
    const tileX = Math.floor(this.gameState.player.position.x / 32);
    const tileY = Math.floor(this.gameState.player.position.y / 32);
    
    if (!this.isValidPosition(tileX, tileY)) {
      let found = false;
      for (let radius = 1; radius <= 10 && !found; radius++) {
        for (let dy = -radius; dy <= radius && !found; dy++) {
          for (let dx = -radius; dx <= radius && !found; dx++) {
            if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
              const checkX = tileX + dx;
              const checkY = tileY + dy;
              if (this.isValidPosition(checkX, checkY)) {
                this.gameState.player.position.x = checkX * 32 + 16;
                this.gameState.player.position.y = checkY * 32 + 16;
                found = true;
              }
            }
          }
        }
      }
    }
    
    // Clear caches for new map
    this.visibleTileCache = {};
    this.lastCameraPosition = { x: -1, y: -1 };
    
    this.updateCamera();
    this.updateVisibility();
    this.notifyStateChange();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  private isValidPosition(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileY < 0 || 
        tileY >= this.gameState.currentMap.tiles.length || 
        tileX >= this.gameState.currentMap.tiles[0].length) {
      return false;
    }
    
    const tile = this.gameState.currentMap.tiles[tileY][tileX];
    return tile.walkable;
  }

  private updateCamera() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    const targetCameraX = this.gameState.player.position.x - centerX;
    const targetCameraY = this.gameState.player.position.y - centerY;

    // Use actual tile array dimensions instead of declared map dimensions
    const actualMapHeight = this.gameState.currentMap.tiles.length;
    const actualMapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    const mapWidth = actualMapWidth * 32;
    const mapHeight = actualMapHeight * 32;

    // Clamp target position
    const clampedTargetX = Math.max(0, Math.min(targetCameraX, mapWidth - this.canvas.width));
    const clampedTargetY = Math.max(0, Math.min(targetCameraY, mapHeight - this.canvas.height));

    // Smooth camera follow with lerp
    const lerpFactor = 0.15;
    this.gameState.camera.x += (clampedTargetX - this.gameState.camera.x) * lerpFactor;
    this.gameState.camera.y += (clampedTargetY - this.gameState.camera.y) * lerpFactor;

    // Snap if very close to target
    if (Math.abs(this.gameState.camera.x - clampedTargetX) < 0.5) {
      this.gameState.camera.x = clampedTargetX;
    }
    if (Math.abs(this.gameState.camera.y - clampedTargetY) < 0.5) {
      this.gameState.camera.y = clampedTargetY;
    }

    // Update render bounds only if camera moved significantly
    if (Math.abs(this.gameState.camera.x - this.lastCameraPosition.x) > 16 ||
        Math.abs(this.gameState.camera.y - this.lastCameraPosition.y) > 16) {

      this.renderBounds.startX = Math.max(0, Math.floor(this.gameState.camera.x / 32) - 1);
      this.renderBounds.startY = Math.max(0, Math.floor(this.gameState.camera.y / 32) - 1);
      this.renderBounds.endX = Math.min(this.renderBounds.startX + Math.ceil(this.canvas.width / 32) + 2, actualMapWidth);
      this.renderBounds.endY = Math.min(this.renderBounds.startY + Math.ceil(this.canvas.height / 32) + 2, actualMapHeight);

      this.lastCameraPosition = { ...this.gameState.camera };
      this.cacheInvalidated = true;
    }
  }

  private updateVisibility() {
    const playerTileX = Math.floor(this.gameState.player.position.x / 32);
    const playerTileY = Math.floor(this.gameState.player.position.y / 32);
    const visionRange = this.isLowPerformanceDevice ? 6 : 10;
    
    const actualMapHeight = this.gameState.currentMap.tiles.length;
    const actualMapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    
    if (!this.gameState.visibilityMap || this.gameState.visibilityMap.length !== actualMapHeight) {
      this.gameState.visibilityMap = Array(actualMapHeight)
        .fill(null)
        .map(() => Array(actualMapWidth).fill(false));
    }
    
    // Only update visibility for tiles in a smaller area around player
    const visibilityBounds = {
      startX: Math.max(0, playerTileX - visionRange - 2),
      startY: Math.max(0, playerTileY - visionRange - 2),
      endX: Math.min(actualMapWidth, playerTileX + visionRange + 3),
      endY: Math.min(actualMapHeight, playerTileY + visionRange + 3)
    };
    
    for (let y = visibilityBounds.startY; y < visibilityBounds.endY; y++) {
      for (let x = visibilityBounds.startX; x < visibilityBounds.endX; x++) {
        if (y >= 0 && y < actualMapHeight && x >= 0 && x < actualMapWidth) {
          this.gameState.currentMap.tiles[y][x].visible = false;
        }
      }
    }
    
    // Set visibility around player
    const minY = Math.max(0, playerTileY - visionRange);
    const maxY = Math.min(actualMapHeight, playerTileY + visionRange + 1);
    const minX = Math.max(0, playerTileX - visionRange);
    const maxX = Math.min(actualMapWidth, playerTileX + visionRange + 1);
    
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (y >= 0 && y < actualMapHeight && x >= 0 && x < actualMapWidth) {
          const distance = Math.sqrt(Math.pow(x - playerTileX, 2) + Math.pow(y - playerTileY, 2));
          if (distance <= visionRange) {
            this.gameState.currentMap.tiles[y][x].visible = true;
            this.gameState.currentMap.tiles[y][x].discovered = true;
            this.gameState.visibilityMap[y][x] = true;
          }
        }
      }
    }
  }

  private gameLoop(currentTime: number) {
    // Improved frame rate limiting with skip logic
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameInterval) {
      this.lastTime = currentTime - (deltaTime % this.frameInterval);
      
      // Update game logic
      this.updatePlayerMovement(deltaTime);
      this.updateGameTime(deltaTime);
      this.updateParticles(deltaTime);

      // Smart rendering - skip frames when performance is poor
      const shouldRender = this.renderSkipCounter >= this.maxRenderSkip || 
                          (currentTime - this.lastRenderTime >= this.frameInterval * 2);
      
      if (shouldRender) {
        this.render();
        this.lastRenderTime = currentTime;
        this.renderSkipCounter = 0;
      } else {
        this.renderSkipCounter++;
      }
    }

    // Continue loop
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private updateGameTime(deltaTime: number) {
    this.gameState.gameTime += deltaTime / 1000;
    this.gameState.statistics.playtime += deltaTime / 1000;
    
    const dayLength = 24 * 60;
    this.gameState.dayNightCycle = (this.gameState.gameTime % dayLength) / dayLength;
  }

  private updateParticles(deltaTime: number) {
    // Update particle system
    this.particleSystem = this.particleSystem.filter(particle => {
      particle.life -= deltaTime / 1000;
      particle.position.x += particle.velocity.x * deltaTime / 1000;
      particle.position.y += particle.velocity.y * deltaTime / 1000;
      particle.velocity.y += 50 * deltaTime / 1000; // Gravity
      return particle.life > 0;
    });
  }

  private render() {
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    
    if (this.gameState.currentMap.isInterior) {
      gradient.addColorStop(0, '#2a2a2a');
      gradient.addColorStop(1, '#1a1a1a');
    } else {
      // Outdoor gradient based on time of day
      const timeOfDay = this.gameState.dayNightCycle;
      if (timeOfDay < 0.25 || timeOfDay > 0.75) { // Night
        gradient.addColorStop(0, '#0a0a2a');
        gradient.addColorStop(1, '#000015');
      } else if (timeOfDay < 0.5) { // Day
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
      } else { // Evening
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(1, '#F7931E');
      }
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render game world
    this.renderTiles();
    this.renderLootables();
    this.renderNPCs();
    this.renderEnemies();
    this.renderPlayer();
    this.renderParticles();
    this.renderLighting();
    this.renderUI();
    
    if (this.isAtEdge && this.edgeTimer > 0) {
      this.renderEdgeTimer();
    }
  }
  
  private renderEdgeTimer() {
    const progress = this.edgeTimer / 2000;
    const barWidth = 300;
    const barHeight = 30;
    const x = (this.canvas.width - barWidth) / 2;
    const y = 50;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(x - 20, y - 20, barWidth + 40, barHeight + 60);
    
    // Progress bar background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, barWidth, barHeight);
    
    // Progress bar fill
    const progressGradient = this.ctx.createLinearGradient(x, y, x + barWidth, y);
    progressGradient.addColorStop(0, '#ffaa00');
    progressGradient.addColorStop(1, '#ff6600');
    this.ctx.fillStyle = progressGradient;
    this.ctx.fillRect(x, y, barWidth * progress, barHeight);
    
    // Border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `Transitioning to ${this.edgeDirection}... ${Math.ceil((2000 - this.edgeTimer) / 1000)}s`,
      this.canvas.width / 2,
      y + barHeight + 35
    );
  }

  private renderTiles() {
    const actualMapHeight = this.gameState.currentMap.tiles.length;
    const actualMapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    
    const isInterior = this.gameState.currentMap.isInterior;
    
    const startY = Math.max(0, Math.min(this.renderBounds.startY, actualMapHeight - 1));
    const endY = Math.min(this.renderBounds.endY, actualMapHeight);
    const startX = Math.max(0, Math.min(this.renderBounds.startX, actualMapWidth - 1));
    const endX = Math.min(this.renderBounds.endX, actualMapWidth);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (!this.gameState.currentMap.tiles[y] || !this.gameState.currentMap.tiles[y][x]) {
          continue;
        }
        
        const tile = this.gameState.currentMap.tiles[y][x];
        
        if (!isInterior && !tile.discovered) continue;

        const screenX = x * 32 - this.gameState.camera.x;
        const screenY = y * 32 - this.gameState.camera.y;

        // Skip tiles that are completely off-screen
        if (screenX < -32 || screenX > this.canvas.width || 
            screenY < -32 || screenY > this.canvas.height) continue;

        // Use sprite if available, otherwise fallback to color
        const sprite = this.tileSprites[tile.type];
        if (sprite) {
          this.ctx.drawImage(sprite, screenX, screenY);
        } else {
          this.ctx.fillStyle = this.getTileColor(tile.type);
          this.ctx.fillRect(screenX, screenY, 32, 32);
        }

        // Apply darkness for non-visible exterior tiles
        if (!isInterior && !tile.visible) {
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          this.ctx.fillRect(screenX, screenY, 32, 32);
        }
        
        // Render entrance indicator for enterable buildings
        if (!isInterior && tile.isEnterable && tile.visible) {
          this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
          this.ctx.fillRect(screenX + 8, screenY + 8, 16, 16);
          this.ctx.fillStyle = '#000000';
          this.ctx.font = 'bold 14px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('E', screenX + 16, screenY + 20);
        }
      }
    }
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
      case 'furniture': return '#8B4513';
      default: return '#333333';
    }
  }

  private renderPlayer() {
    const screenX = this.gameState.player.position.x - this.gameState.camera.x;
    const screenY = this.gameState.player.position.y - this.gameState.camera.y;

    // Add walking animation bob
    const time = Date.now() / 1000;
    const bobOffset = this.gameState.player.isMoving ? Math.sin(time * 10) * 2 : 0;

    // Use sprite if available
    const sprite = this.characterSprites['player'];
    if (sprite) {
      this.ctx.drawImage(sprite, screenX - 16, screenY - 16 + bobOffset);
    } else {
      // Fallback rendering
      this.ctx.fillStyle = '#4a90e2';
      this.ctx.fillRect(screenX - 12, screenY - 12 + bobOffset, 24, 24);
    }

    // Direction indicator with glow
    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 8;
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    switch (this.gameState.player.direction) {
      case 'up':
        this.ctx.moveTo(screenX, screenY - 20 + bobOffset);
        this.ctx.lineTo(screenX - 5, screenY - 12 + bobOffset);
        this.ctx.lineTo(screenX + 5, screenY - 12 + bobOffset);
        break;
      case 'down':
        this.ctx.moveTo(screenX, screenY + 20 + bobOffset);
        this.ctx.lineTo(screenX - 5, screenY + 12 + bobOffset);
        this.ctx.lineTo(screenX + 5, screenY + 12 + bobOffset);
        break;
      case 'left':
        this.ctx.moveTo(screenX - 20, screenY + bobOffset);
        this.ctx.lineTo(screenX - 12, screenY - 5 + bobOffset);
        this.ctx.lineTo(screenX - 12, screenY + 5 + bobOffset);
        break;
      case 'right':
        this.ctx.moveTo(screenX + 20, screenY + bobOffset);
        this.ctx.lineTo(screenX + 12, screenY - 5 + bobOffset);
        this.ctx.lineTo(screenX + 12, screenY + 5 + bobOffset);
        break;
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Player name with better styling
    this.ctx.font = 'bold 13px Arial';
    this.ctx.textAlign = 'center';

    // Name background
    const nameWidth = this.ctx.measureText(this.gameState.player.name).width;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(screenX - nameWidth/2 - 4, screenY - 35 + bobOffset, nameWidth + 8, 16);

    // Name text with outline
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;
    this.ctx.strokeText(this.gameState.player.name, screenX, screenY - 23 + bobOffset);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(this.gameState.player.name, screenX, screenY - 23 + bobOffset);

    // Health bar above name
    const healthPercent = this.gameState.player.health / this.gameState.player.maxHealth;
    const barWidth = 40;
    const barHeight = 4;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(screenX - barWidth/2, screenY - 40 + bobOffset, barWidth, barHeight);
    this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    this.ctx.fillRect(screenX - barWidth/2, screenY - 40 + bobOffset, barWidth * healthPercent, barHeight);
  }

  private renderNPCs() {
    this.gameState.currentMap.npcs.forEach(npc => {
      const screenX = npc.position.x - this.gameState.camera.x;
      const screenY = npc.position.y - this.gameState.camera.y;

      if (screenX < -32 || screenX > this.canvas.width + 32 || 
          screenY < -32 || screenY > this.canvas.height + 32) return;

      const tileX = Math.floor(npc.position.x / 32);
      const tileY = Math.floor(npc.position.y / 32);
      if (!this.gameState.currentMap.isInterior && !this.gameState.currentMap.tiles[tileY]?.[tileX]?.discovered) return;

      // Use sprite if available
      const sprite = this.characterSprites['npc'];
      if (sprite) {
        this.ctx.drawImage(sprite, screenX - 12, screenY - 12);
      } else {
        this.ctx.fillStyle = npc.isHostile ? '#ff4444' : '#44ff44';
        this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
      }

      // NPC name
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(npc.name, screenX, screenY - 20);
      this.ctx.fillText(npc.name, screenX, screenY - 20);
    });
  }

  private renderEnemies() {
    this.gameState.currentMap.enemies.forEach(enemy => {
      const screenX = enemy.position.x - this.gameState.camera.x;
      const screenY = enemy.position.y - this.gameState.camera.y;

      if (screenX < -32 || screenX > this.canvas.width + 32 || 
          screenY < -32 || screenY > this.canvas.height + 32) return;

      const tileX = Math.floor(enemy.position.x / 32);
      const tileY = Math.floor(enemy.position.y / 32);
      if (!this.gameState.currentMap.isInterior && !this.gameState.currentMap.tiles[tileY]?.[tileX]?.discovered) return;

      // Use sprite if available
      const sprite = this.characterSprites['enemy'];
      if (sprite) {
        this.ctx.drawImage(sprite, screenX - 12, screenY - 12);
      } else {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
      }

      // Health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(screenX - 15, screenY - 25, 30, 4);
      this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      this.ctx.fillRect(screenX - 15, screenY - 25, 30 * healthPercent, 4);

      // Enemy name
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(enemy.name, screenX, screenY + 25);
      this.ctx.fillText(enemy.name, screenX, screenY + 25);
    });
  }

  private renderLootables() {
    this.gameState.currentMap.lootables.forEach(lootable => {
      if (lootable.looted) return;

      const screenX = lootable.position.x - this.gameState.camera.x;
      const screenY = lootable.position.y - this.gameState.camera.y;

      if (screenX < -32 || screenX > this.canvas.width + 32 || 
          screenY < -32 || screenY > this.canvas.height + 32) return;

      const tileX = Math.floor(lootable.position.x / 32);
      const tileY = Math.floor(lootable.position.y / 32);
      if (!this.gameState.currentMap.isInterior && !this.gameState.currentMap.tiles[tileY]?.[tileX]?.discovered) return;

      // Animated loot indicator
      const time = Date.now() / 1000;
      const bounce = Math.sin(time * 3) * 2;
      
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.fillRect(screenX - 8, screenY - 8 + bounce, 16, 16);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('?', screenX, screenY + 4 + bounce);
      
      // Glow effect
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 10;
      this.ctx.strokeStyle = '#ffaa00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenX - 8, screenY - 8 + bounce, 16, 16);
      this.ctx.shadowBlur = 0;
    });
  }

  private renderParticles() {
    this.particleSystem.forEach(particle => {
      const screenX = particle.position.x - this.gameState.camera.x;
      const screenY = particle.position.y - this.gameState.camera.y;
      
      this.ctx.globalAlpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(screenX, screenY, particle.size, particle.size);
      this.ctx.globalAlpha = 1;
    });
  }

  private renderLighting() {
    if (this.gameState.currentMap.isInterior) {
      // Apply lighting overlay for interiors
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.fillStyle = 'rgba(100, 100, 150, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Add light sources
      this.lightingSystem.forEach(light => {
        const screenX = light.position.x - this.gameState.camera.x;
        const screenY = light.position.y - this.gameState.camera.y;
        
        const gradient = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, light.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(screenX - light.radius, screenY - light.radius, light.radius * 2, light.radius * 2);
      });
      
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }

  private renderUI() {
    // Enhanced UI with better graphics
    const uiPadding = 15;
    const barHeight = 28;
    const barWidth = 280;

    // Semi-transparent UI panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, barWidth + uiPadding * 2, (barHeight + 12) * 3 + uiPadding * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, barWidth + uiPadding * 2, (barHeight + 12) * 3 + uiPadding * 2);

    // Health bar with icon
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('❤', uiPadding, uiPadding + 20);
    this.renderStatusBar(
      uiPadding + 25, uiPadding,
      barWidth - 25, barHeight,
      this.gameState.player.health / this.gameState.player.maxHealth,
      '#ff3333', '#aa0000',
      `${this.gameState.player.health}/${this.gameState.player.maxHealth}`
    );

    // Energy bar with icon
    this.ctx.fillStyle = '#4499ff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('⚡', uiPadding, uiPadding + barHeight + 32);
    this.renderStatusBar(
      uiPadding + 25, uiPadding + barHeight + 12,
      barWidth - 25, barHeight,
      this.gameState.player.energy / this.gameState.player.maxEnergy,
      '#3388ff', '#0055cc',
      `${Math.floor(this.gameState.player.energy)}/${this.gameState.player.maxEnergy}`
    );

    // Experience bar with icon
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText('★', uiPadding, uiPadding + (barHeight + 12) * 2 + 20);
    this.renderStatusBar(
      uiPadding + 25, uiPadding + (barHeight + 12) * 2,
      barWidth - 25, barHeight,
      this.gameState.player.experience / this.gameState.player.experienceToNext,
      '#ffbb00', '#dd9900',
      `Lv.${this.gameState.player.level} - ${this.gameState.player.experience}/${this.gameState.player.experienceToNext}`
    );

    // Location and time info panel
    const infoPanelY = this.canvas.height - 95;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(uiPadding - 5, infoPanelY, 320, 85);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(uiPadding - 5, infoPanelY, 320, 85);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 15px Arial';
    this.ctx.textAlign = 'left';

    // Location with icon
    this.ctx.fillText('📍', uiPadding, infoPanelY + 25);
    this.ctx.fillText(this.gameState.currentMap.name, uiPadding + 25, infoPanelY + 25);

    // Time with icon
    const timeOfDay = this.gameState.dayNightCycle < 0.25 || this.gameState.dayNightCycle > 0.75 ? '🌙 Night' :
                     this.gameState.dayNightCycle < 0.5 ? '☀️ Day' : '🌅 Evening';
    this.ctx.fillText(timeOfDay, uiPadding, infoPanelY + 50);

    // Weather with icon
    const weatherIcon = this.gameState.weather === 'clear' ? '☀️' :
                       this.gameState.weather === 'rain' ? '🌧️' :
                       this.gameState.weather === 'storm' ? '⛈️' :
                       this.gameState.weather === 'fog' ? '🌫️' : '☢️';
    this.ctx.fillText(`${weatherIcon} ${this.gameState.weather.charAt(0).toUpperCase() + this.gameState.weather.slice(1)}`, uiPadding, infoPanelY + 75);

    // Gold counter
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(this.canvas.width - 170, uiPadding - 5, 160, 45);
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.canvas.width - 170, uiPadding - 5, 160, 45);

    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`💰 ${this.gameState.gold}`, this.canvas.width - 20, uiPadding + 25);

    // Show exit hint for interiors with better styling
    if (this.gameState.currentMap.isInterior && this.gameState.previousMap) {
      const time = Date.now() / 1000;
      const pulse = 0.8 + Math.sin(time * 3) * 0.2;

      this.ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.lineWidth = 4;
      this.ctx.strokeText('⬅ Press ESC to exit building', this.canvas.width / 2, 60);
      this.ctx.fillText('⬅ Press ESC to exit building', this.canvas.width / 2, 60);
    }

    // Mini-map
    this.renderMiniMap();
  }

  private renderStatusBar(x: number, y: number, width: number, height: number,
                         percentage: number, fillColor: string, bgColor: string, text: string) {
    // Outer border with glow
    this.ctx.shadowColor = fillColor;
    this.ctx.shadowBlur = 8;
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    this.ctx.shadowBlur = 0;

    // Bar background
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x, y, width, height);

    // Bar fill with animated gradient
    const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(0.5, this.lightenColor(fillColor, 0.4));
    gradient.addColorStop(1, fillColor);
    this.ctx.fillStyle = gradient;

    const fillWidth = width * Math.max(0, Math.min(1, percentage));
    this.ctx.fillRect(x, y, fillWidth, height);

    // Add shine effect on bar
    const shineGradient = this.ctx.createLinearGradient(x, y, x, y + height);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = shineGradient;
    this.ctx.fillRect(x, y, fillWidth, height / 2);

    // Inner border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    // Text with shadow
    this.ctx.font = 'bold 13px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, x + width / 2, y + height / 2 + 5);
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  private lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.floor(255 * factor));
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.floor(255 * factor));
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.floor(255 * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private renderMiniMap() {
    const miniMapSize = 160;
    const miniMapX = this.canvas.width - miniMapSize - 15;
    const miniMapY = 80;

    // Enhanced background with border
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(miniMapX - 8, miniMapY - 8, miniMapSize + 16, miniMapSize + 16);

    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(miniMapX - 6, miniMapY - 6, miniMapSize + 12, miniMapSize + 12);

    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

    const scaleX = miniMapSize / this.gameState.currentMap.width;
    const scaleY = miniMapSize / this.gameState.currentMap.height;

    // Render discovered tiles with better sampling
    const sampleRate = Math.max(1, Math.floor(this.gameState.currentMap.width / 60));

    for (let y = 0; y < this.gameState.currentMap.height; y += sampleRate) {
      for (let x = 0; x < this.gameState.currentMap.width; x += sampleRate) {
        if (!this.gameState.currentMap.tiles[y] || !this.gameState.currentMap.tiles[y][x]) continue;
        const tile = this.gameState.currentMap.tiles[y][x];
        if (!tile.discovered) continue;

        const pixelX = miniMapX + x * scaleX;
        const pixelY = miniMapY + y * scaleY;

        let color = this.getTileColor(tile.type);
        if (!tile.visible && !this.gameState.currentMap.isInterior) {
          color = this.darkenColor(color, 0.4);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, Math.max(1, scaleX * sampleRate), Math.max(1, scaleY * sampleRate));
      }
    }

    // View cone indicator
    const viewRadius = 10;
    const playerMapX = miniMapX + (this.gameState.player.position.x / 32) * scaleX;
    const playerMapY = miniMapY + (this.gameState.player.position.y / 32) * scaleY;

    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(playerMapX, playerMapY, viewRadius * scaleX, 0, Math.PI * 2);
    this.ctx.stroke();

    // Enemies
    this.gameState.currentMap.enemies.forEach(enemy => {
      const enemyX = miniMapX + (enemy.position.x / 32) * scaleX;
      const enemyY = miniMapY + (enemy.position.y / 32) * scaleY;
      this.ctx.fillStyle = '#ff3333';
      this.ctx.beginPath();
      this.ctx.arc(enemyX, enemyY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // NPCs
    this.gameState.currentMap.npcs.forEach(npc => {
      const npcX = miniMapX + (npc.position.x / 32) * scaleX;
      const npcY = miniMapY + (npc.position.y / 32) * scaleY;
      this.ctx.fillStyle = npc.isHostile ? '#ff6666' : '#66ff66';
      this.ctx.beginPath();
      this.ctx.arc(npcX, npcY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Player position with pulse effect
    const time = Date.now() / 1000;
    const pulse = 1 + Math.sin(time * 4) * 0.3;

    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(playerMapX, playerMapY, 3 * pulse, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Direction indicator
    const dirLength = 8;
    let dirX = 0, dirY = 0;
    switch (this.gameState.player.direction) {
      case 'up': dirY = -dirLength; break;
      case 'down': dirY = dirLength; break;
      case 'left': dirX = -dirLength; break;
      case 'right': dirX = dirLength; break;
    }

    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(playerMapX, playerMapY);
    this.ctx.lineTo(playerMapX + dirX, playerMapY + dirY);
    this.ctx.stroke();

    // Map title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 11px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('MAP', miniMapX + miniMapSize / 2, miniMapY - 12);
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substring(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substring(2, 4), 16) * factor);
    const b = Math.floor(parseInt(hex.substring(4, 6), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  private enterBuilding(buildingId: string) {
    const building = getBuildingById(buildingId);
    if (!building) return;
    
    // Store current map and position for return
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to building interior
    this.gameState.currentMap = building.interiorMap;
    this.gameState.player.position = { ...building.exitPosition };
    
    // Clear caches for new map
    this.visibleTileCache = {};
    this.lastCameraPosition = { x: -1, y: -1 };
    
    // Initialize visibility map for interior
    const mapHeight = this.gameState.currentMap.tiles.length;
    const mapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    
    this.gameState.visibilityMap = Array(mapHeight)
      .fill(null)
      .map(() => Array(mapWidth).fill(false));
    
    // Force discovery and visibility of all interior tiles since it's a small enclosed space
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (this.gameState.currentMap.tiles[y] && this.gameState.currentMap.tiles[y][x]) {
          this.gameState.currentMap.tiles[y][x].discovered = true;
          this.gameState.currentMap.tiles[y][x].visible = true;
          this.gameState.visibilityMap[y][x] = true;
        }
      }
    }
    
    this.updateCamera();
    this.updateVisibility();
    this.cacheInvalidated = true;
    this.notifyStateChange();
  }
  
  private exitBuilding() {
    if (!this.gameState.previousMap) return;
    
    // Return to previous map
    this.gameState.currentMap = this.gameState.previousMap.map;
    this.gameState.player.position = { ...this.gameState.previousMap.position };
    this.gameState.previousMap = undefined;
    
    // Clear caches for map change
    this.visibleTileCache = {};
    this.lastCameraPosition = { x: -1, y: -1 };
    this.cacheInvalidated = true;
    
    this.updateCamera();
    this.updateVisibility();
    this.notifyStateChange();
  }

  public setStateChangeCallback(callback: (newState: GameState) => void) {
    this.stateChangeCallback = callback;
  }

  public setLootableCallback(callback: (lootable: any) => void) {
    this.lootableCallback = callback;
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback({ ...this.gameState });
    }
  }

  public setGameState(newState: GameState) {
    this.gameState = { ...newState };
    this.cacheInvalidated = true;
  }

  public updateGameState(newState: GameState) {
    const mapChanged = this.gameState.currentMap.id !== newState.currentMap.id;
    this.gameState = { ...newState };

    if (mapChanged) {
      this.visibleTileCache = {};
      this.lastCameraPosition = { x: -1, y: -1 };
      this.cacheInvalidated = true;
      this.updateCamera();
      this.updateVisibility();
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public handleCombatAction(action: string, targetIndex?: number) {
    console.log('Combat action:', action, targetIndex);
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Particle system interfaces
interface Particle {
  position: Position;
  velocity: Position;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface LightSource {
  position: Position;
  radius: number;
  intensity: number;
  color: string;
}