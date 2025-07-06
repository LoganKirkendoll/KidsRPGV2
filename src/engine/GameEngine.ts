import { GameState, Position, Character, Enemy, Tile, NPC, Item, LootableItem, CombatState, CombatAction, GameSettings } from '../types/game';
import { enemies } from '../data/enemies';
import { items } from '../data/items_data';
import { createAllMaps } from '../data/maps';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private settings: GameSettings;
  private animationId: number | null = null;
  private lastTime = 0;
  private keys: Set<string> = new Set();
  private stateChangeCallback?: (state: GameState) => void;
  private lootableCallback?: (lootable: LootableItem) => void;
  private particles: Particle[] = [];
  private lightSources: LightSource[] = [];
  private performanceMode = false;
  private frameCount = 0;
  private lastFpsTime = 0;
  private fps = 0;

  // Constants
  private readonly TILE_SIZE = 32;
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly MOVEMENT_SPEED = 128; // pixels per second
  private readonly VISION_RADIUS = 8; // tiles
  private readonly INTERACTION_RANGE = 48; // pixels

  constructor(canvas: HTMLCanvasElement, gameState: GameState, settings?: GameSettings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = gameState;
    this.settings = settings || this.getDefaultSettings();
    
    this.setupCanvas();
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
      autoDetectPerformance: true,
      fullscreen: false,
      showFPS: true,
      autoSave: true,
      difficulty: 'normal'
    };
  }

  private setupCanvas() {
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    this.ctx.imageSmoothingEnabled = false; // Pixel art style
    
    // Auto-detect performance if enabled
    if (this.settings.autoDetectPerformance) {
      this.detectPerformance();
    }
    
    this.performanceMode = this.settings.lowGraphicsMode;
  }

  private detectPerformance() {
    // Simple performance detection based on device capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      this.performanceMode = true;
      return;
    }

    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      this.performanceMode = true;
    }

    // Check memory (if available)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) {
      this.performanceMode = true;
    }
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

    // Mouse events for interaction
    this.canvas.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private handleKeyPress(key: string) {
    // Handle immediate key presses (non-movement)
    switch (key) {
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
      case 'escape':
        this.handleEscape();
        break;
      case 'f1':
        this.toggleDevMode();
        break;
    }
  }

  private handleCanvasClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldX = x + this.gameState.camera.x;
    const worldY = y + this.gameState.camera.y;
    
    // Check for interactions at click position
    this.checkInteractionAtPosition({ x: worldX, y: worldY });
  }

  private initializeVisibilityMap() {
    const map = this.gameState.currentMap;
    this.gameState.visibilityMap = Array(map.height).fill(null).map(() => Array(map.width).fill(false));
    this.updateVisibility();
  }

  private start() {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (currentTime: number = performance.now()) => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Calculate FPS
    this.frameCount++;
    if (currentTime - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = currentTime;
    }

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    // Update game time
    this.gameState.gameTime += deltaTime;
    this.gameState.dayNightCycle = (this.gameState.gameTime / 300) % 1; // 5 minute day cycle

    // Handle movement
    this.handleMovement(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Update NPCs
    this.updateNPCs(deltaTime);

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update combat if active
    if (this.gameState.combat) {
      this.updateCombat(deltaTime);
    }

    // Update camera
    this.updateCamera();

    // Update visibility
    this.updateVisibility();

    // Check for map transitions
    this.checkMapTransitions();

    // Auto-save periodically
    if (this.settings.autoSave && Math.floor(this.gameState.gameTime) % 60 === 0) {
      this.notifyStateChange();
    }
  }

  private handleMovement(deltaTime: number) {
    if (this.gameState.gameMode !== 'exploration' || this.gameState.combat) {
      return;
    }

    const player = this.gameState.player;
    let newX = player.position.x;
    let newY = player.position.y;
    let moved = false;

    const moveDistance = this.MOVEMENT_SPEED * deltaTime;

    // Handle WASD and arrow keys
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      newY -= moveDistance;
      player.direction = 'up';
      moved = true;
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      newY += moveDistance;
      player.direction = 'down';
      moved = true;
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      newX -= moveDistance;
      player.direction = 'left';
      moved = true;
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      newX += moveDistance;
      player.direction = 'right';
      moved = true;
    }

    if (moved) {
      // Check if new position is valid
      if (this.isValidPosition(newX, newY)) {
        player.position.x = newX;
        player.position.y = newY;
        player.isMoving = true;

        // Update statistics
        const distance = Math.sqrt(Math.pow(newX - player.position.x, 2) + Math.pow(newY - player.position.y, 2));
        this.gameState.statistics.distanceTraveled += distance;

        // Check for random encounters
        this.checkRandomEncounters();
      }
    } else {
      player.isMoving = false;
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    const map = this.gameState.currentMap;
    const tileX = Math.floor(x / this.TILE_SIZE);
    const tileY = Math.floor(y / this.TILE_SIZE);

    // Check map boundaries
    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
      return false;
    }

    // Check tile walkability
    const tile = map.tiles[tileY][tileX];
    if (!tile.walkable) {
      return false;
    }

    // Check for NPCs (can't walk through them)
    const npcAtPosition = map.npcs.find(npc => {
      const npcTileX = Math.floor(npc.position.x / this.TILE_SIZE);
      const npcTileY = Math.floor(npc.position.y / this.TILE_SIZE);
      return npcTileX === tileX && npcTileY === tileY;
    });

    if (npcAtPosition) {
      return false;
    }

    return true;
  }

  private updateParticles(deltaTime: number) {
    this.particles = this.particles.filter(particle => {
      particle.life -= deltaTime;
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      return particle.life > 0;
    });
  }

  private updateNPCs(deltaTime: number) {
    // NPCs are mostly static, but could have simple behaviors here
    this.gameState.currentMap.npcs.forEach(npc => {
      // Simple idle animation or patrol behavior could go here
    });
  }

  private updateEnemies(deltaTime: number) {
    this.gameState.currentMap.enemies.forEach(enemy => {
      if (enemy.ai.type === 'patrol') {
        // Simple patrol behavior
        this.updateEnemyPatrol(enemy, deltaTime);
      } else if (enemy.ai.type === 'aggressive') {
        // Check if player is in range
        const distance = this.getDistance(enemy.position, this.gameState.player.position);
        if (distance <= enemy.ai.range * this.TILE_SIZE) {
          this.initiateEnemyEncounter(enemy);
        }
      }
    });
  }

  private updateEnemyPatrol(enemy: Enemy, deltaTime: number) {
    // Simple back-and-forth patrol
    const moveDistance = enemy.ai.speed * deltaTime;
    
    if (enemy.direction === 'left') {
      enemy.position.x -= moveDistance;
      if (enemy.position.x <= 0) {
        enemy.direction = 'right';
      }
    } else {
      enemy.position.x += moveDistance;
      if (enemy.position.x >= this.gameState.currentMap.width * this.TILE_SIZE) {
        enemy.direction = 'left';
      }
    }
  }

  private updateCombat(deltaTime: number) {
    if (!this.gameState.combat) return;

    const combat = this.gameState.combat;
    
    // Update skill cooldowns
    combat.participants.forEach(participant => {
      if ('skills' in participant) {
        participant.skills.forEach(skill => {
          if (skill.currentCooldown > 0) {
            skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
          }
        });
      }
    });

    // Update status effects
    combat.participants.forEach(participant => {
      participant.statusEffects = participant.statusEffects.filter(effect => {
        effect.duration -= deltaTime;
        
        // Apply effect
        if (effect.type === 'poison') {
          participant.health = Math.max(0, participant.health - effect.value * deltaTime);
        }
        
        return effect.duration > 0;
      });
    });

    // Check for combat end conditions
    const aliveAllies = combat.participants.filter(p => 'class' in p && p.health > 0);
    const aliveEnemies = combat.participants.filter(p => !('class' in p) && p.health > 0);

    if (aliveAllies.length === 0) {
      // Player defeated
      this.endCombat(false);
    } else if (aliveEnemies.length === 0) {
      // Enemies defeated
      this.endCombat(true);
    }

    // Process AI turns for enemies
    if (!combat.isPlayerTurn) {
      this.processEnemyTurn();
    }
  }

  private processEnemyTurn() {
    if (!this.gameState.combat) return;

    const combat = this.gameState.combat;
    const currentActor = combat.turnOrder[combat.currentTurn];

    if (!('class' in currentActor)) {
      // This is an enemy
      const enemy = currentActor as Enemy;
      
      // Simple AI: attack the player or use a skill
      const playerCharacters = combat.participants.filter(p => 'class' in p && p.health > 0);
      if (playerCharacters.length > 0) {
        const target = playerCharacters[0]; // Target first alive player character
        const targetIndex = combat.participants.indexOf(target);
        
        // Choose action based on enemy's available skills
        if (enemy.skills.length > 0 && enemy.energy >= enemy.skills[0].energyCost) {
          // Use first available skill
          const skill = enemy.skills[0];
          this.handleCombatAction({
            type: 'skill',
            skillId: skill.id,
            targetIndex
          }, targetIndex);
        } else {
          // Basic attack
          this.handleCombatAction({
            type: 'attack',
            targetIndex
          }, targetIndex);
        }
      }
    }

    // Advance to next turn after a delay
    setTimeout(() => {
      this.advanceCombatTurn();
    }, 1000);
  }

  private updateCamera() {
    const player = this.gameState.player;
    const targetX = player.position.x - this.CANVAS_WIDTH / 2;
    const targetY = player.position.y - this.CANVAS_HEIGHT / 2;

    // Smooth camera following
    const lerpFactor = 0.1;
    this.gameState.camera.x += (targetX - this.gameState.camera.x) * lerpFactor;
    this.gameState.camera.y += (targetY - this.gameState.camera.y) * lerpFactor;

    // Clamp camera to map bounds
    const map = this.gameState.currentMap;
    this.gameState.camera.x = Math.max(0, Math.min(this.gameState.camera.x, map.width * this.TILE_SIZE - this.CANVAS_WIDTH));
    this.gameState.camera.y = Math.max(0, Math.min(this.gameState.camera.y, map.height * this.TILE_SIZE - this.CANVAS_HEIGHT));
  }

  private updateVisibility() {
    const player = this.gameState.player;
    const map = this.gameState.currentMap;
    const playerTileX = Math.floor(player.position.x / this.TILE_SIZE);
    const playerTileY = Math.floor(player.position.y / this.TILE_SIZE);

    // Clear current visibility
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        this.gameState.visibilityMap[y][x] = false;
      }
    }

    // Calculate visible tiles using simple circle
    for (let dy = -this.VISION_RADIUS; dy <= this.VISION_RADIUS; dy++) {
      for (let dx = -this.VISION_RADIUS; dx <= this.VISION_RADIUS; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= this.VISION_RADIUS) {
          const tileX = playerTileX + dx;
          const tileY = playerTileY + dy;
          
          if (tileX >= 0 && tileX < map.width && tileY >= 0 && tileY < map.height) {
            this.gameState.visibilityMap[tileY][tileX] = true;
            map.tiles[tileY][tileX].discovered = true;
            map.tiles[tileY][tileX].visible = true;
          }
        }
      }
    }
  }

  private checkMapTransitions() {
    const player = this.gameState.player;
    const map = this.gameState.currentMap;

    // Check for map connections
    map.connections.forEach(connection => {
      const distance = this.getDistance(player.position, connection.fromPosition);
      if (distance < this.TILE_SIZE) {
        this.transitionToMap(connection.targetMapId, connection.toPosition);
      }
    });

    // Check for building entrances
    const playerTileX = Math.floor(player.position.x / this.TILE_SIZE);
    const playerTileY = Math.floor(player.position.y / this.TILE_SIZE);
    
    if (playerTileX >= 0 && playerTileX < map.width && playerTileY >= 0 && playerTileY < map.height) {
      const tile = map.tiles[playerTileY][playerTileX];
      
      if (tile.isEntrance && tile.buildingId) {
        this.enterBuilding(tile.buildingId);
      }
    }
  }

  private checkRandomEncounters() {
    // Small chance of random encounter while moving
    if (Math.random() < 0.001) { // 0.1% chance per movement
      this.triggerRandomEncounter();
    }
  }

  private triggerRandomEncounter() {
    // Create a random enemy encounter
    const enemyTypes = enemies.filter(e => !e.mapId || e.mapId === this.gameState.currentMap.id);
    if (enemyTypes.length > 0) {
      const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      this.initiateEnemyEncounter(randomEnemy);
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Render based on current game mode
    if (this.gameState.combat) {
      this.renderCombat();
    } else {
      this.renderExploration();
    }

    // Render UI elements
    this.renderUI();
  }

  private renderExploration() {
    const map = this.gameState.currentMap;
    const camera = this.gameState.camera;

    // Calculate visible tile range
    const startTileX = Math.floor(camera.x / this.TILE_SIZE);
    const endTileX = Math.min(map.width, Math.ceil((camera.x + this.CANVAS_WIDTH) / this.TILE_SIZE));
    const startTileY = Math.floor(camera.y / this.TILE_SIZE);
    const endTileY = Math.min(map.height, Math.ceil((camera.y + this.CANVAS_HEIGHT) / this.TILE_SIZE));

    // Render tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
          const tile = map.tiles[y][x];
          if (tile.discovered) {
            this.renderTile(tile, x, y);
          }
        }
      }
    }

    // Render lootables
    map.lootables.forEach(lootable => {
      if (this.isInViewport(lootable.position) && !lootable.looted) {
        this.renderLootable(lootable);
      }
    });

    // Render NPCs
    map.npcs.forEach(npc => {
      if (this.isInViewport(npc.position)) {
        this.renderNPC(npc);
      }
    });

    // Render enemies
    map.enemies.forEach(enemy => {
      if (this.isInViewport(enemy.position)) {
        this.renderEnemy(enemy);
      }
    });

    // Render player
    this.renderPlayer();

    // Render particles
    if (!this.performanceMode) {
      this.renderParticles();
    }

    // Render lighting effects
    if (!this.performanceMode) {
      this.renderLighting();
    }
  }

  private renderCombat() {
    // Combat rendering is handled by the CombatSystem component
    // This method can be used for any additional combat-specific rendering
  }

  private renderTile(tile: Tile, x: number, y: number) {
    const screenX = x * this.TILE_SIZE - this.gameState.camera.x;
    const screenY = y * this.TILE_SIZE - this.gameState.camera.y;

    // Get tile color based on type
    let color = this.getTileColor(tile.type);
    
    // Apply visibility effects
    if (!this.gameState.visibilityMap[y][x]) {
      color = this.darkenColor(color, 0.3);
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);

    // Add tile borders for clarity
    this.ctx.strokeStyle = this.darkenColor(color, 0.2);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);

    // Render building indicators
    if (tile.buildingType) {
      this.renderBuildingTile(tile, screenX, screenY);
    }
  }

  private renderBuildingTile(tile: Tile, screenX: number, screenY: number) {
    // Render building with appropriate color
    let buildingColor = '#8B4513'; // Default brown
    
    switch (tile.buildingType) {
      case 'settlement':
        buildingColor = '#DAA520';
        break;
      case 'trader_post':
        buildingColor = '#32CD32';
        break;
      case 'clinic':
        buildingColor = '#FF6347';
        break;
      case 'workshop':
        buildingColor = '#708090';
        break;
      case 'tavern':
        buildingColor = '#9932CC';
        break;
      case 'vault':
        buildingColor = '#4682B4';
        break;
    }

    this.ctx.fillStyle = buildingColor;
    this.ctx.fillRect(screenX + 2, screenY + 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4);

    // Add entrance indicator
    if (tile.isEntrance) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillRect(screenX + this.TILE_SIZE/2 - 2, screenY + this.TILE_SIZE - 4, 4, 4);
    }
  }

  private renderPlayer() {
    const player = this.gameState.player;
    const screenX = player.position.x - this.gameState.camera.x;
    const screenY = player.position.y - this.gameState.camera.y;

    // Player representation
    this.ctx.fillStyle = '#0066FF';
    this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);

    // Direction indicator
    this.ctx.fillStyle = '#FFFFFF';
    switch (player.direction) {
      case 'up':
        this.ctx.fillRect(screenX - 2, screenY - 8, 4, 4);
        break;
      case 'down':
        this.ctx.fillRect(screenX - 2, screenY + 4, 4, 4);
        break;
      case 'left':
        this.ctx.fillRect(screenX - 8, screenY - 2, 4, 4);
        break;
      case 'right':
        this.ctx.fillRect(screenX + 4, screenY - 2, 4, 4);
        break;
    }

    // Player name
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(player.name, screenX, screenY - 12);
  }

  private renderNPC(npc: NPC) {
    const screenX = npc.position.x - this.gameState.camera.x;
    const screenY = npc.position.y - this.gameState.camera.y;

    // NPC representation
    let color = '#00FF00'; // Default green for friendly
    if (npc.isHostile) {
      color = '#FF0000';
    } else if (npc.type === 'trader') {
      color = '#FFD700';
    } else if (npc.type === 'quest_giver') {
      color = '#FF69B4';
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX - 6, screenY - 6, 12, 12);

    // NPC name
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(npc.name, screenX, screenY - 10);
  }

  private renderEnemy(enemy: Enemy) {
    const screenX = enemy.position.x - this.gameState.camera.x;
    const screenY = enemy.position.y - this.gameState.camera.y;

    // Enemy representation
    let color = '#FF4500';
    switch (enemy.type) {
      case 'robot':
        color = '#C0C0C0';
        break;
      case 'mutant':
        color = '#9ACD32';
        break;
      case 'beast':
        color = '#8B4513';
        break;
      case 'boss':
        color = '#8B0000';
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);

    // Health bar
    const healthPercent = enemy.health / enemy.maxHealth;
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(screenX - 10, screenY - 15, 20, 3);
    this.ctx.fillStyle = '#00FF00';
    this.ctx.fillRect(screenX - 10, screenY - 15, 20 * healthPercent, 3);
  }

  private renderLootable(lootable: LootableItem) {
    const screenX = lootable.position.x - this.gameState.camera.x;
    const screenY = lootable.position.y - this.gameState.camera.y;

    // Lootable representation
    let color = '#FFD700';
    switch (lootable.type) {
      case 'corpse':
        color = '#8B0000';
        break;
      case 'cache':
        color = '#4169E1';
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(screenX - 4, screenY - 4, 8, 8);

    // Glint effect
    if (!this.performanceMode) {
      const time = Date.now() / 1000;
      const alpha = (Math.sin(time * 3) + 1) / 2;
      this.ctx.globalAlpha = alpha * 0.5;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(screenX - 2, screenY - 2, 4, 4);
      this.ctx.globalAlpha = 1;
    }
  }

  private renderParticles() {
    this.particles.forEach(particle => {
      const screenX = particle.position.x - this.gameState.camera.x;
      const screenY = particle.position.y - this.gameState.camera.y;
      
      const alpha = particle.life / particle.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(screenX, screenY, particle.size, particle.size);
    });
    this.ctx.globalAlpha = 1;
  }

  private renderLighting() {
    // Simple lighting system
    if (this.gameState.dayNightCycle < 0.2 || this.gameState.dayNightCycle > 0.8) {
      // Night time - apply darkness overlay
      const darkness = this.gameState.dayNightCycle < 0.2 ? 
        (0.2 - this.gameState.dayNightCycle) / 0.2 : 
        (this.gameState.dayNightCycle - 0.8) / 0.2;
      
      this.ctx.globalAlpha = darkness * 0.7;
      this.ctx.fillStyle = '#000033';
      this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
      this.ctx.globalAlpha = 1;

      // Player light source
      const playerScreenX = this.gameState.player.position.x - this.gameState.camera.x;
      const playerScreenY = this.gameState.player.position.y - this.gameState.camera.y;
      
      const gradient = this.ctx.createRadialGradient(
        playerScreenX, playerScreenY, 0,
        playerScreenX, playerScreenY, 100
      );
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
      
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(playerScreenX - 100, playerScreenY - 100, 200, 200);
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }

  private renderUI() {
    // FPS counter
    if (this.settings.showFPS) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    }

    // Performance mode indicator
    if (this.performanceMode) {
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = '12px Arial';
      this.ctx.fillText('Performance Mode', 10, this.CANVAS_HEIGHT - 10);
    }
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'grass': return '#228B22';
      case 'dirt': return '#8B4513';
      case 'stone': return '#696969';
      case 'water': return '#4682B4';
      case 'lava': return '#FF4500';
      case 'ice': return '#B0E0E6';
      case 'sand': return '#F4A460';
      case 'ruins': return '#2F4F4F';
      case 'building': return '#8B4513';
      default: return '#228B22';
    }
  }

  private darkenColor(color: string, factor: number): string {
    // Simple color darkening
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor));
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor));
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private isInViewport(position: Position): boolean {
    const camera = this.gameState.camera;
    return position.x >= camera.x - this.TILE_SIZE &&
           position.x <= camera.x + this.CANVAS_WIDTH + this.TILE_SIZE &&
           position.y >= camera.y - this.TILE_SIZE &&
           position.y <= camera.y + this.CANVAS_HEIGHT + this.TILE_SIZE;
  }

  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  // Public methods for external interaction
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
    this.gameState = newState;
    this.initializeVisibilityMap();
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(this.gameState);
    }
  }

  // Interaction methods
  private handleInteraction() {
    const player = this.gameState.player;
    const interactionRange = this.INTERACTION_RANGE;

    // Check for NPCs
    const nearbyNPC = this.gameState.currentMap.npcs.find(npc => {
      return this.getDistance(player.position, npc.position) <= interactionRange;
    });

    if (nearbyNPC) {
      this.interactWithNPC(nearbyNPC);
      return;
    }

    // Check for lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find(lootable => {
      return !lootable.looted && this.getDistance(player.position, lootable.position) <= interactionRange;
    });

    if (nearbyLootable) {
      this.interactWithLootable(nearbyLootable);
      return;
    }

    // Check for enemies (initiate combat)
    const nearbyEnemy = this.gameState.currentMap.enemies.find(enemy => {
      return this.getDistance(player.position, enemy.position) <= interactionRange;
    });

    if (nearbyEnemy) {
      this.initiateEnemyEncounter(nearbyEnemy);
      return;
    }
  }

  private checkInteractionAtPosition(position: Position) {
    // Similar to handleInteraction but for a specific position
    const interactionRange = this.INTERACTION_RANGE;

    // Check for NPCs
    const nearbyNPC = this.gameState.currentMap.npcs.find(npc => {
      return this.getDistance(position, npc.position) <= interactionRange;
    });

    if (nearbyNPC) {
      this.interactWithNPC(nearbyNPC);
      return;
    }

    // Check for lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find(lootable => {
      return !lootable.looted && this.getDistance(position, lootable.position) <= interactionRange;
    });

    if (nearbyLootable) {
      this.interactWithLootable(nearbyLootable);
      return;
    }
  }

  private interactWithNPC(npc: NPC) {
    // Start dialogue
    this.gameState.dialogue = {
      npcId: npc.id,
      currentNode: 'greeting',
      history: [],
      choices: npc.dialogue.find(d => d.id === 'greeting')?.choices || []
    };
    this.gameState.gameMode = 'dialogue';
    this.notifyStateChange();
  }

  private interactWithLootable(lootable: LootableItem) {
    if (this.lootableCallback) {
      this.lootableCallback(lootable);
    }
  }

  private initiateEnemyEncounter(enemy: Enemy) {
    // Create combat state
    const combatState: CombatState = {
      participants: [this.gameState.player, enemy],
      turnOrder: [this.gameState.player, enemy],
      currentTurn: 0,
      round: 1,
      selectedTargets: [],
      animations: [],
      battleground: this.createBattleground(),
      weather: this.gameState.weather,
      timeOfDay: this.getTimeOfDay(),
      isPlayerTurn: true,
      combatLog: [`Combat begins! ${this.gameState.player.name} vs ${enemy.name}`]
    };

    this.gameState.combat = combatState;
    this.gameState.gameMode = 'combat';
    this.notifyStateChange();
  }

  private createBattleground(): Tile[][] {
    // Create a simple 10x10 battleground
    const battleground: Tile[][] = [];
    for (let y = 0; y < 10; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < 10; x++) {
        row.push({
          x, y,
          type: 'dirt',
          walkable: true,
          sprite: 'dirt',
          discovered: true,
          visible: true
        });
      }
      battleground.push(row);
    }
    return battleground;
  }

  private getTimeOfDay(): 'dawn' | 'day' | 'dusk' | 'night' {
    const cycle = this.gameState.dayNightCycle;
    if (cycle < 0.2) return 'night';
    if (cycle < 0.3) return 'dawn';
    if (cycle < 0.7) return 'day';
    if (cycle < 0.8) return 'dusk';
    return 'night';
  }

  public handleCombatAction(action: CombatAction, targetIndex?: number) {
    if (!this.gameState.combat) return;

    const combat = this.gameState.combat;
    const currentActor = combat.turnOrder[combat.currentTurn];
    
    if (!('class' in currentActor)) return; // Only handle player actions here

    const character = currentActor as Character;
    let logMessage = '';

    switch (action.type) {
      case 'attack':
        if (targetIndex !== undefined) {
          const target = combat.participants[targetIndex];
          const damage = this.calculateDamage(character, target);
          target.health = Math.max(0, target.health - damage);
          character.energy = Math.max(0, character.energy - 2);
          logMessage = `${character.name} attacks ${target.name} for ${damage} damage!`;
          
          // Add particles
          this.addDamageParticles(target.position, damage);
        }
        break;

      case 'skill':
        if (action.skillId && targetIndex !== undefined) {
          const skill = character.skills.find(s => s.id === action.skillId);
          if (skill && character.energy >= skill.energyCost && skill.currentCooldown <= 0) {
            const target = combat.participants[targetIndex];
            
            if (skill.damage) {
              const damage = skill.damage + Math.floor(Math.random() * 10);
              target.health = Math.max(0, target.health - damage);
              logMessage = `${character.name} uses ${skill.name} on ${target.name} for ${damage} damage!`;
            } else if (skill.healing) {
              const healing = skill.healing + Math.floor(Math.random() * 5);
              target.health = Math.min(target.maxHealth, target.health + healing);
              logMessage = `${character.name} uses ${skill.name} on ${target.name} for ${healing} healing!`;
            }
            
            character.energy = Math.max(0, character.energy - skill.energyCost);
            skill.currentCooldown = skill.cooldown;
            
            // Apply status effects
            if (skill.effect) {
              target.statusEffects.push({
                type: skill.effect.type,
                duration: skill.effect.duration,
                value: skill.effect.value,
                source: skill.name
              });
            }
          }
        }
        break;

      case 'item':
        if (action.itemId && targetIndex !== undefined) {
          const target = combat.participants[targetIndex];
          
          // Handle different item types
          switch (action.itemId) {
            case 'stimpak':
              const healing = 50;
              target.health = Math.min(target.maxHealth, target.health + healing);
              logMessage = `${character.name} uses Stimpak on ${target.name} for ${healing} healing!`;
              break;
            case 'rad_away':
              // Remove radiation (if implemented)
              logMessage = `${character.name} uses Rad-Away on ${target.name}!`;
              break;
            case 'psycho':
              target.statusEffects.push({
                type: 'damage_boost',
                duration: 5,
                value: 25,
                source: 'Psycho'
              });
              logMessage = `${character.name} uses Psycho! Damage increased!`;
              break;
          }
          
          character.energy = Math.max(0, character.energy - 1);
        }
        break;
    }

    if (logMessage) {
      combat.combatLog.push(logMessage);
    }

    this.advanceCombatTurn();
    this.notifyStateChange();
  }

  private calculateDamage(attacker: Character | Enemy, target: Character | Enemy): number {
    let baseDamage = 10;
    
    if ('class' in attacker) {
      // Character damage calculation
      const character = attacker as Character;
      baseDamage = character.stats.strength + (character.equipment.weapon?.stats?.damage || 0);
    } else {
      // Enemy damage calculation
      const enemy = attacker as Enemy;
      baseDamage = enemy.damage;
    }

    // Apply target defense
    let defense = 0;
    if ('class' in target) {
      const character = target as Character;
      defense = character.equipment.armor?.stats?.defense || 0;
    } else {
      const enemy = target as Enemy;
      defense = enemy.defense;
    }

    const finalDamage = Math.max(1, baseDamage - defense + Math.floor(Math.random() * 5));
    return finalDamage;
  }

  private addDamageParticles(position: Position, damage: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        position: { x: position.x + (Math.random() - 0.5) * 20, y: position.y + (Math.random() - 0.5) * 20 },
        velocity: { x: (Math.random() - 0.5) * 100, y: -Math.random() * 50 },
        life: 1,
        maxLife: 1,
        size: 3,
        color: '#FF0000'
      });
    }
  }

  private advanceCombatTurn() {
    if (!this.gameState.combat) return;

    const combat = this.gameState.combat;
    combat.currentTurn = (combat.currentTurn + 1) % combat.turnOrder.length;
    
    if (combat.currentTurn === 0) {
      combat.round++;
    }

    // Update turn indicator
    const currentActor = combat.turnOrder[combat.currentTurn];
    combat.isPlayerTurn = 'class' in currentActor;

    this.notifyStateChange();
  }

  private endCombat(victory: boolean) {
    if (!this.gameState.combat) return;

    if (victory) {
      // Give rewards
      const combat = this.gameState.combat;
      const enemies = combat.participants.filter(p => !('class' in p)) as Enemy[];
      
      let totalExp = 0;
      let totalGold = 0;
      const lootItems: Item[] = [];

      enemies.forEach(enemy => {
        totalExp += enemy.experience;
        totalGold += Math.floor(Math.random() * 20) + 10;
        
        // Roll for loot
        enemy.loot.forEach(lootDrop => {
          if (Math.random() < lootDrop.chance) {
            for (let i = 0; i < lootDrop.quantity; i++) {
              lootItems.push({ ...lootDrop.item });
            }
          }
        });
      });

      // Apply rewards
      this.gameState.player.experience += totalExp;
      this.gameState.gold += totalGold;
      this.gameState.inventory.push(...lootItems);

      // Check for level up
      while (this.gameState.player.experience >= this.gameState.player.experienceToNext) {
        this.gameState.player.experience -= this.gameState.player.experienceToNext;
        this.gameState.player.level++;
        this.gameState.player.experienceToNext = this.gameState.player.level * 100;
        this.gameState.player.maxHealth += 10;
        this.gameState.player.maxEnergy += 5;
        this.gameState.player.health = this.gameState.player.maxHealth;
        this.gameState.player.energy = this.gameState.player.maxEnergy;
      }

      // Remove defeated enemies from map
      this.gameState.currentMap.enemies = this.gameState.currentMap.enemies.filter(enemy => 
        !combat.participants.includes(enemy)
      );
    } else {
      // Player defeated - reset to last safe position or respawn
      this.gameState.player.health = this.gameState.player.maxHealth;
      this.gameState.player.energy = this.gameState.player.maxEnergy;
    }

    // Clear combat state
    this.gameState.combat = undefined;
    this.gameState.gameMode = 'exploration';
    this.notifyStateChange();
  }

  // UI interaction methods
  private openInventory() {
    this.gameState.gameMode = 'inventory';
    this.notifyStateChange();
  }

  private openEquipment() {
    this.gameState.gameMode = 'equipment';
    this.notifyStateChange();
  }

  private openCharacter() {
    this.gameState.gameMode = 'character';
    this.notifyStateChange();
  }

  private openQuests() {
    this.gameState.gameMode = 'quests';
    this.notifyStateChange();
  }

  private openMap() {
    this.gameState.gameMode = 'map';
    this.notifyStateChange();
  }

  private handleEscape() {
    if (this.gameState.currentMap.isInterior) {
      // Exit building
      this.exitBuilding();
    } else {
      // Open menu
      this.gameState.gameMode = 'menu';
      this.notifyStateChange();
    }
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

  // Map transition methods
  private transitionToMap(mapId: string, position: Position) {
    // Load or create the target map
    if (!this.gameState.availableMaps[mapId]) {
      const allMaps = createAllMaps();
      if (allMaps[mapId]) {
        this.gameState.availableMaps[mapId] = allMaps[mapId];
      } else {
        console.error(`Map ${mapId} not found`);
        return;
      }
    }

    // Store current map state
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };

    // Switch to new map
    this.gameState.currentMap = this.gameState.availableMaps[mapId];
    this.gameState.player.position = { ...position };
    
    // Initialize visibility for new map
    this.initializeVisibilityMap();
    
    this.notifyStateChange();
  }

  private enterBuilding(buildingId: string) {
    // This would load the building interior
    // For now, just log the action
    console.log(`Entering building: ${buildingId}`);
  }

  private exitBuilding() {
    if (this.gameState.previousMap) {
      this.gameState.currentMap = this.gameState.previousMap.map;
      this.gameState.player.position = this.gameState.previousMap.position;
      this.gameState.previousMap = undefined;
      this.initializeVisibilityMap();
      this.notifyStateChange();
    }
  }

  private updateGameState(newState: GameState) {
    this.gameState = newState;
    this.notifyStateChange();
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