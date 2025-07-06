import { GameState, Position, Character, Enemy, CombatState, Tile, GameMap, NPC, LootableItem, Item } from '../types/game';
import { enemies } from '../data/enemies';
import { items } from '../data/items_data';
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
  private moveDelay = 150; // milliseconds between moves
  private allMaps: { [key: string]: GameMap } = {};

  constructor(canvas: HTMLCanvasElement, initialState: GameState, settings: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialState };
    this.settings = settings;
    
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    // Initialize all maps
    this.allMaps = createAllMaps();
    
    // Initialize visibility map
    this.initializeVisibilityMap();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start game loop
    this.gameLoop(0);
  }

  private initializeVisibilityMap() {
    const map = this.gameState.currentMap;
    this.gameState.visibilityMap = Array(map.height).fill(null).map(() => Array(map.width).fill(false));
    this.updateVisibility();
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

    // Canvas click events
    this.canvas.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });
  }

  private handleKeyPress(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    
    // Prevent default for game keys
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'i', 'e', 'c', 'q', 'm', 'escape', 'f1'].includes(key)) {
      e.preventDefault();
    }

    // Handle hotkeys
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
        if (this.gameState.currentMap.isInterior) {
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
        this.handleInteraction();
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
    
    // Handle click interactions
    this.handleWorldClick(worldX, worldY);
  }

  private handleWorldClick(worldX: number, worldY: number) {
    // Check for NPC interactions
    const clickedNPC = this.gameState.currentMap.npcs.find(npc => {
      const distance = Math.sqrt(
        Math.pow(npc.position.x - worldX, 2) + 
        Math.pow(npc.position.y - worldY, 2)
      );
      return distance < 32; // 32 pixel interaction radius
    });

    if (clickedNPC) {
      this.startDialogue(clickedNPC);
      return;
    }

    // Check for lootable interactions
    const clickedLootable = this.gameState.currentMap.lootables.find(lootable => {
      const distance = Math.sqrt(
        Math.pow(lootable.position.x - worldX, 2) + 
        Math.pow(lootable.position.y - worldY, 2)
      );
      return distance < 32 && !lootable.looted;
    });

    if (clickedLootable) {
      this.openLootable(clickedLootable);
      return;
    }
  }

  private gameLoop(currentTime: number) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game state
    this.update(deltaTime);
    
    // Render
    this.render();
    
    // Continue loop
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number) {
    // Update game time
    this.gameState.gameTime += deltaTime / 1000;
    this.gameState.dayNightCycle = (this.gameState.gameTime / 300) % 1; // 5 minute day cycle
    
    // Update player movement
    this.updatePlayerMovement(deltaTime);
    
    // Update enemies
    this.updateEnemies(deltaTime);
    
    // Update skill cooldowns
    this.updateSkillCooldowns(deltaTime);
    
    // Update visibility
    this.updateVisibility();
    
    // Update camera
    this.updateCamera();
    
    // Check for combat initiation
    this.checkCombatInitiation();
  }

  private updatePlayerMovement(deltaTime: number) {
    if (this.gameState.gameMode !== 'exploration') return;
    
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;

    const player = this.gameState.player;
    const moveSpeed = 32; // Move one tile at a time
    let newX = player.position.x;
    let newY = player.position.y;
    let moved = false;

    // Handle movement input
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      newY -= moveSpeed;
      player.direction = 'up';
      moved = true;
    } else if (this.keys.has('s') || this.keys.has('arrowdown')) {
      newY += moveSpeed;
      player.direction = 'down';
      moved = true;
    } else if (this.keys.has('a') || this.keys.has('arrowleft')) {
      newX -= moveSpeed;
      player.direction = 'left';
      moved = true;
    } else if (this.keys.has('d') || this.keys.has('arrowright')) {
      newX += moveSpeed;
      player.direction = 'right';
      moved = true;
    }

    if (moved) {
      // Check if the new position is valid
      if (this.isValidPosition(newX, newY)) {
        player.position.x = newX;
        player.position.y = newY;
        this.lastMoveTime = now;
        
        // Update statistics
        this.gameState.statistics.distanceTraveled += moveSpeed;
        
        // Check for map transitions
        this.checkMapTransitions();
        
        // Mark tiles as discovered
        this.discoverNearbyTiles();
      }
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    const map = this.gameState.currentMap;
    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
      return false;
    }
    
    const tile = map.tiles[tileY][tileX];
    return tile.walkable;
  }

  private checkMapTransitions() {
    const player = this.gameState.player;
    const map = this.gameState.currentMap;
    
    // Check for map edge transitions
    const tileX = Math.floor(player.position.x / 32);
    const tileY = Math.floor(player.position.y / 32);
    
    // Check connections
    for (const connection of map.connections) {
      const connectionTileX = Math.floor(connection.fromPosition.x / 32);
      const connectionTileY = Math.floor(connection.fromPosition.y / 32);
      
      if (tileX === connectionTileX && tileY === connectionTileY) {
        this.transitionToMap(connection.targetMapId, connection.toPosition);
        break;
      }
    }
  }

  private transitionToMap(mapId: string, newPosition: Position) {
    // Load the target map if not already loaded
    if (!this.gameState.availableMaps[mapId]) {
      this.gameState.availableMaps[mapId] = this.allMaps[mapId];
    }
    
    // Store current map state
    this.gameState.availableMaps[this.gameState.currentMap.id] = this.gameState.currentMap;
    
    // Switch to new map
    this.gameState.currentMap = this.gameState.availableMaps[mapId];
    this.gameState.player.position = { ...newPosition };
    
    // Initialize visibility for new map
    this.initializeVisibilityMap();
    
    this.notifyStateChange();
  }

  private discoverNearbyTiles() {
    const player = this.gameState.player;
    const tileX = Math.floor(player.position.x / 32);
    const tileY = Math.floor(player.position.y / 32);
    const map = this.gameState.currentMap;
    
    // Discover tiles in a radius around the player
    const radius = 2;
    for (let y = tileY - radius; y <= tileY + radius; y++) {
      for (let x = tileX - radius; x <= tileX + radius; x++) {
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
          map.tiles[y][x].discovered = true;
        }
      }
    }
  }

  private updateEnemies(deltaTime: number) {
    this.gameState.currentMap.enemies.forEach(enemy => {
      // Simple AI: move towards player if in range
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - this.gameState.player.position.x, 2) + 
        Math.pow(enemy.position.y - this.gameState.player.position.y, 2)
      );
      
      if (distance < enemy.ai.range * 32 && distance > 32) {
        // Move towards player
        const dx = this.gameState.player.position.x - enemy.position.x;
        const dy = this.gameState.player.position.y - enemy.position.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        
        if (magnitude > 0) {
          const moveX = (dx / magnitude) * enemy.ai.speed * (deltaTime / 1000);
          const moveY = (dy / magnitude) * enemy.ai.speed * (deltaTime / 1000);
          
          const newX = enemy.position.x + moveX;
          const newY = enemy.position.y + moveY;
          
          if (this.isValidPosition(newX, newY)) {
            enemy.position.x = newX;
            enemy.position.y = newY;
          }
        }
      }
    });
  }

  private updateSkillCooldowns(deltaTime: number) {
    // Update player skill cooldowns
    this.gameState.player.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime / 1000);
      }
    });
    
    // Update party skill cooldowns
    this.gameState.party.forEach(character => {
      character.skills.forEach(skill => {
        if (skill.currentCooldown > 0) {
          skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime / 1000);
        }
      });
    });
  }

  private updateVisibility() {
    const player = this.gameState.player;
    const tileX = Math.floor(player.position.x / 32);
    const tileY = Math.floor(player.position.y / 32);
    const map = this.gameState.currentMap;
    
    // Reset visibility
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        this.gameState.visibilityMap[y][x] = false;
      }
    }
    
    // Set visible tiles around player
    const visionRadius = 8;
    for (let y = tileY - visionRadius; y <= tileY + visionRadius; y++) {
      for (let x = tileX - visionRadius; x <= tileX + visionRadius; x++) {
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
          const distance = Math.sqrt((x - tileX) ** 2 + (y - tileY) ** 2);
          if (distance <= visionRadius) {
            this.gameState.visibilityMap[y][x] = true;
            map.tiles[y][x].visible = true;
          }
        }
      }
    }
  }

  private updateCamera() {
    const player = this.gameState.player;
    const targetX = player.position.x - this.canvas.width / 2;
    const targetY = player.position.y - this.canvas.height / 2;
    
    // Smooth camera movement
    this.gameState.camera.x += (targetX - this.gameState.camera.x) * 0.1;
    this.gameState.camera.y += (targetY - this.gameState.camera.y) * 0.1;
    
    // Clamp camera to map bounds
    const map = this.gameState.currentMap;
    this.gameState.camera.x = Math.max(0, Math.min(this.gameState.camera.x, map.width * 32 - this.canvas.width));
    this.gameState.camera.y = Math.max(0, Math.min(this.gameState.camera.y, map.height * 32 - this.canvas.height));
  }

  private checkCombatInitiation() {
    if (this.gameState.combat) return; // Already in combat
    
    const player = this.gameState.player;
    const nearbyEnemies = this.gameState.currentMap.enemies.filter(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - player.position.x, 2) + 
        Math.pow(enemy.position.y - player.position.y, 2)
      );
      return distance < 32; // Touch distance
    });
    
    if (nearbyEnemies.length > 0) {
      this.initiateCombat(nearbyEnemies);
    }
  }

  private initiateCombat(enemies: Enemy[]) {
    const participants = [this.gameState.player, ...enemies];
    
    // Sort by agility for turn order
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
      timeOfDay: this.getTimeOfDay(),
      isPlayerTurn: 'class' in turnOrder[0],
      combatLog: ['Combat begins!']
    };
    
    this.gameState.gameMode = 'combat';
    this.notifyStateChange();
  }

  public handleCombatAction(action: string, targetIndex?: number) {
    if (!this.gameState.combat) return;
    
    const combat = this.gameState.combat;
    const currentActor = combat.turnOrder[combat.currentTurn];
    
    if (action === 'basic_attack' && targetIndex !== undefined) {
      const target = combat.participants[targetIndex];
      this.performAttack(currentActor, target);
    } else {
      // Handle skill usage
      const skill = currentActor.skills.find(s => s.id === action);
      if (skill && targetIndex !== undefined) {
        const target = combat.participants[targetIndex];
        this.performSkill(currentActor, target, skill);
      }
    }
    
    // Advance turn
    this.advanceCombatTurn();
  }

  private performAttack(attacker: Character | Enemy, target: Character | Enemy) {
    if (!this.gameState.combat) return;
    
    // Calculate damage
    const baseDamage = 'damage' in attacker ? attacker.damage : 10;
    const attackerDamage = 'equipment' in attacker && attacker.equipment.weapon?.stats?.damage 
      ? baseDamage + attacker.equipment.weapon.stats.damage 
      : baseDamage;
    
    const targetDefense = 'defense' in target ? target.defense : 0;
    const equipmentDefense = 'equipment' in target && target.equipment.armor?.stats?.defense 
      ? target.equipment.armor.stats.defense 
      : 0;
    
    const totalDefense = targetDefense + equipmentDefense;
    const finalDamage = Math.max(1, attackerDamage - totalDefense);
    
    // Apply damage
    target.health = Math.max(0, target.health - finalDamage);
    
    // Add to combat log
    const attackerName = 'name' in attacker ? attacker.name : 'Enemy';
    const targetName = 'name' in target ? target.name : 'Enemy';
    this.gameState.combat.combatLog.push(`${attackerName} attacks ${targetName} for ${finalDamage} damage!`);
    
    // Check if target is defeated
    if (target.health <= 0) {
      this.handleCombatDefeat(target);
    }
    
    this.notifyStateChange();
  }

  private performSkill(attacker: Character | Enemy, target: Character | Enemy, skill: any) {
    if (!this.gameState.combat) return;
    
    // Check energy cost
    if (attacker.energy < skill.energyCost) {
      return;
    }
    
    // Consume energy
    attacker.energy -= skill.energyCost;
    
    // Apply skill effects
    if (skill.damage) {
      const finalDamage = Math.max(1, skill.damage);
      target.health = Math.max(0, target.health - finalDamage);
      
      const attackerName = 'name' in attacker ? attacker.name : 'Enemy';
      const targetName = 'name' in target ? target.name : 'Enemy';
      this.gameState.combat.combatLog.push(`${attackerName} uses ${skill.name} on ${targetName} for ${finalDamage} damage!`);
    }
    
    if (skill.healing) {
      const healAmount = skill.healing;
      target.health = Math.min(target.maxHealth, target.health + healAmount);
      
      const attackerName = 'name' in attacker ? attacker.name : 'Enemy';
      const targetName = 'name' in target ? target.name : 'Enemy';
      this.gameState.combat.combatLog.push(`${attackerName} heals ${targetName} for ${healAmount} health!`);
    }
    
    // Set cooldown
    skill.currentCooldown = skill.cooldown;
    
    // Check if target is defeated
    if (target.health <= 0) {
      this.handleCombatDefeat(target);
    }
    
    this.notifyStateChange();
  }

  private handleCombatDefeat(defeated: Character | Enemy) {
    if (!this.gameState.combat) return;
    
    const defeatedName = 'name' in defeated ? defeated.name : 'Enemy';
    this.gameState.combat.combatLog.push(`${defeatedName} is defeated!`);
    
    // If it's an enemy, give rewards
    if (!('class' in defeated)) {
      const enemy = defeated as Enemy;
      
      // Give experience
      this.gameState.player.experience += enemy.experience;
      this.gameState.statistics.enemiesKilled++;
      
      // Check for level up
      while (this.gameState.player.experience >= this.gameState.player.experienceToNext) {
        this.gameState.player.experience -= this.gameState.player.experienceToNext;
        this.gameState.player.level++;
        this.gameState.player.experienceToNext = this.gameState.player.level * 100;
        this.gameState.player.maxHealth += 10;
        this.gameState.player.maxEnergy += 5;
        this.gameState.player.health = this.gameState.player.maxHealth;
        this.gameState.player.energy = this.gameState.player.maxEnergy;
        
        this.gameState.combat.combatLog.push(`${this.gameState.player.name} reached level ${this.gameState.player.level}!`);
      }
      
      // Give loot
      enemy.loot.forEach(lootDrop => {
        if (Math.random() < lootDrop.chance) {
          const item = { ...lootDrop.item, quantity: lootDrop.quantity };
          this.gameState.inventory.push(item);
          this.gameState.combat!.combatLog.push(`Found: ${item.name} x${lootDrop.quantity}`);
        }
      });
      
      // Remove enemy from map
      const enemyIndex = this.gameState.currentMap.enemies.indexOf(enemy);
      if (enemyIndex >= 0) {
        this.gameState.currentMap.enemies.splice(enemyIndex, 1);
      }
    }
    
    // Check if combat should end
    const aliveEnemies = this.gameState.combat.participants.filter(p => !('class' in p) && p.health > 0);
    const aliveAllies = this.gameState.combat.participants.filter(p => 'class' in p && p.health > 0);
    
    if (aliveEnemies.length === 0) {
      // Victory
      this.gameState.combat.combatLog.push('Victory!');
      setTimeout(() => {
        this.endCombat();
      }, 2000);
    } else if (aliveAllies.length === 0) {
      // Defeat
      this.gameState.combat.combatLog.push('Defeat!');
      setTimeout(() => {
        this.endCombat();
      }, 2000);
    }
  }

  private advanceCombatTurn() {
    if (!this.gameState.combat) return;
    
    const combat = this.gameState.combat;
    
    // Move to next turn
    combat.currentTurn = (combat.currentTurn + 1) % combat.turnOrder.length;
    
    // If we've gone through all participants, start a new round
    if (combat.currentTurn === 0) {
      combat.round++;
      
      // Regenerate some energy for all participants
      combat.participants.forEach(participant => {
        participant.energy = Math.min(participant.maxEnergy, participant.energy + 2);
      });
    }
    
    // Check if current actor is alive
    const currentActor = combat.turnOrder[combat.currentTurn];
    if (currentActor.health <= 0) {
      this.advanceCombatTurn();
      return;
    }
    
    // Update turn indicator
    combat.isPlayerTurn = 'class' in currentActor;
    
    // If it's an AI turn, perform AI action
    if (!combat.isPlayerTurn) {
      setTimeout(() => {
        this.performAIAction(currentActor as Enemy);
      }, 1000);
    }
    
    this.notifyStateChange();
  }

  private performAIAction(enemy: Enemy) {
    if (!this.gameState.combat) return;
    
    // Simple AI: attack the player
    const playerIndex = this.gameState.combat.participants.findIndex(p => 'class' in p);
    if (playerIndex >= 0) {
      this.performAttack(enemy, this.gameState.combat.participants[playerIndex]);
      setTimeout(() => {
        this.advanceCombatTurn();
      }, 1000);
    }
  }

  private endCombat() {
    this.gameState.combat = undefined;
    this.gameState.gameMode = 'exploration';
    this.notifyStateChange();
  }

  private getTimeOfDay(): 'dawn' | 'day' | 'dusk' | 'night' {
    const cycle = this.gameState.dayNightCycle;
    if (cycle < 0.25) return 'night';
    if (cycle < 0.5) return 'dawn';
    if (cycle < 0.75) return 'day';
    return 'dusk';
  }

  private handleInteraction() {
    const player = this.gameState.player;
    
    // Check for nearby NPCs
    const nearbyNPC = this.gameState.currentMap.npcs.find(npc => {
      const distance = Math.sqrt(
        Math.pow(npc.position.x - player.position.x, 2) + 
        Math.pow(npc.position.y - player.position.y, 2)
      );
      return distance < 64; // Interaction range
    });
    
    if (nearbyNPC) {
      this.startDialogue(nearbyNPC);
      return;
    }
    
    // Check for nearby lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find(lootable => {
      const distance = Math.sqrt(
        Math.pow(lootable.position.x - player.position.x, 2) + 
        Math.pow(lootable.position.y - player.position.y, 2)
      );
      return distance < 64 && !lootable.looted;
    });
    
    if (nearbyLootable) {
      this.openLootable(nearbyLootable);
      return;
    }
    
    // Check for building entrances
    const playerTileX = Math.floor(player.position.x / 32);
    const playerTileY = Math.floor(player.position.y / 32);
    const currentTile = this.gameState.currentMap.tiles[playerTileY]?.[playerTileX];
    
    if (currentTile?.isEntrance && currentTile.buildingId) {
      this.enterBuilding(currentTile.buildingId);
    }
  }

  private startDialogue(npc: NPC) {
    if (npc.dialogue.length === 0) return;
    
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

  private openLootable(lootable: LootableItem) {
    lootable.discovered = true;
    if (this.lootableCallback) {
      this.lootableCallback(lootable);
    }
  }

  private enterBuilding(buildingId: string) {
    const building = getBuildingById(buildingId);
    if (!building) return;
    
    // Store current map state
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to building interior
    this.gameState.currentMap = building.interiorMap;
    this.gameState.player.position = { ...building.exitPosition };
    
    // Initialize visibility for interior
    this.initializeVisibilityMap();
    
    this.notifyStateChange();
  }

  private exitBuilding() {
    if (!this.gameState.previousMap) return;
    
    // Return to previous map
    this.gameState.currentMap = this.gameState.previousMap.map;
    this.gameState.player.position = { ...this.gameState.previousMap.position };
    this.gameState.previousMap = undefined;
    
    // Initialize visibility for exterior
    this.initializeVisibilityMap();
    
    this.notifyStateChange();
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render map
    this.renderMap();
    
    // Render entities
    this.renderEntities();
    
    // Render UI elements
    this.renderUI();
  }

  private renderMap() {
    const map = this.gameState.currentMap;
    const camera = this.gameState.camera;
    
    // Calculate visible tile range
    const startX = Math.floor(camera.x / 32);
    const startY = Math.floor(camera.y / 32);
    const endX = Math.min(map.width, startX + Math.ceil(this.canvas.width / 32) + 1);
    const endY = Math.min(map.height, startY + Math.ceil(this.canvas.height / 32) + 1);
    
    for (let y = Math.max(0, startY); y < endY; y++) {
      for (let x = Math.max(0, startX); x < endX; x++) {
        const tile = map.tiles[y][x];
        if (!tile.discovered) continue;
        
        const screenX = x * 32 - camera.x;
        const screenY = y * 32 - camera.y;
        
        // Apply visibility
        const isVisible = this.gameState.visibilityMap[y] && this.gameState.visibilityMap[y][x];
        this.ctx.globalAlpha = isVisible ? 1.0 : 0.5;
        
        // Render tile
        this.ctx.fillStyle = this.getTileColor(tile.type);
        this.ctx.fillRect(screenX, screenY, 32, 32);
        
        // Render tile borders for buildings
        if (tile.type === 'building') {
          this.ctx.strokeStyle = '#666666';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(screenX, screenY, 32, 32);
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'grass': return '#4a7c59';
      case 'dirt': return '#8b4513';
      case 'stone': return '#696969';
      case 'water': return '#4682b4';
      case 'ruins': return '#2f2f2f';
      case 'building': return '#654321';
      case 'sand': return '#f4a460';
      default: return '#333333';
    }
  }

  private renderEntities() {
    const camera = this.gameState.camera;
    
    // Render NPCs
    this.gameState.currentMap.npcs.forEach(npc => {
      const screenX = npc.position.x - camera.x;
      const screenY = npc.position.y - camera.y;
      
      // Check if NPC is visible
      const tileX = Math.floor(npc.position.x / 32);
      const tileY = Math.floor(npc.position.y / 32);
      const isVisible = this.gameState.visibilityMap[tileY] && this.gameState.visibilityMap[tileY][tileX];
      
      if (isVisible && screenX > -32 && screenX < this.canvas.width && screenY > -32 && screenY < this.canvas.height) {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(screenX - 16, screenY - 16, 32, 32);
        
        // Render name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, screenX, screenY - 20);
      }
    });
    
    // Render enemies
    this.gameState.currentMap.enemies.forEach(enemy => {
      const screenX = enemy.position.x - camera.x;
      const screenY = enemy.position.y - camera.y;
      
      // Check if enemy is visible
      const tileX = Math.floor(enemy.position.x / 32);
      const tileY = Math.floor(enemy.position.y / 32);
      const isVisible = this.gameState.visibilityMap[tileY] && this.gameState.visibilityMap[tileY][tileX];
      
      if (isVisible && screenX > -32 && screenX < this.canvas.width && screenY > -32 && screenY < this.canvas.height) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(screenX - 16, screenY - 16, 32, 32);
        
        // Render health bar
        const healthPercent = enemy.health / enemy.maxHealth;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(screenX - 16, screenY - 25, 32, 4);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(screenX - 16, screenY - 25, 32 * healthPercent, 4);
      }
    });
    
    // Render lootables
    this.gameState.currentMap.lootables.forEach(lootable => {
      if (lootable.looted) return;
      
      const screenX = lootable.position.x - camera.x;
      const screenY = lootable.position.y - camera.y;
      
      // Check if lootable is visible
      const tileX = Math.floor(lootable.position.x / 32);
      const tileY = Math.floor(lootable.position.y / 32);
      const isVisible = this.gameState.visibilityMap[tileY] && this.gameState.visibilityMap[tileY][tileX];
      
      if (isVisible && screenX > -32 && screenX < this.canvas.width && screenY > -32 && screenY < this.canvas.height) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);
      }
    });
    
    // Render player
    const player = this.gameState.player;
    const screenX = player.position.x - camera.x;
    const screenY = player.position.y - camera.y;
    
    this.ctx.fillStyle = '#0066ff';
    this.ctx.fillRect(screenX - 16, screenY - 16, 32, 32);
    
    // Render player direction indicator
    this.ctx.fillStyle = '#ffffff';
    switch (player.direction) {
      case 'up':
        this.ctx.fillRect(screenX - 4, screenY - 16, 8, 8);
        break;
      case 'down':
        this.ctx.fillRect(screenX - 4, screenY + 8, 8, 8);
        break;
      case 'left':
        this.ctx.fillRect(screenX - 16, screenY - 4, 8, 8);
        break;
      case 'right':
        this.ctx.fillRect(screenX + 8, screenY - 4, 8, 8);
        break;
    }
  }

  private renderUI() {
    // Render minimap
    this.renderMinimap();
    
    // Render day/night indicator
    this.renderDayNightIndicator();
  }

  private renderMinimap() {
    const minimapSize = 150;
    const minimapX = this.canvas.width - minimapSize - 10;
    const minimapY = 10;
    
    // Minimap background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Minimap border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    const map = this.gameState.currentMap;
    const scaleX = minimapSize / map.width;
    const scaleY = minimapSize / map.height;
    
    // Render discovered tiles
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        if (tile.discovered) {
          const pixelX = minimapX + x * scaleX;
          const pixelY = minimapY + y * scaleY;
          
          this.ctx.fillStyle = this.getTileColor(tile.type);
          this.ctx.fillRect(pixelX, pixelY, Math.max(1, scaleX), Math.max(1, scaleY));
        }
      }
    }
    
    // Render player position
    const playerTileX = Math.floor(this.gameState.player.position.x / 32);
    const playerTileY = Math.floor(this.gameState.player.position.y / 32);
    const playerPixelX = minimapX + playerTileX * scaleX;
    const playerPixelY = minimapY + playerTileY * scaleY;
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(playerPixelX - 1, playerPixelY - 1, 3, 3);
  }

  private renderDayNightIndicator() {
    const cycle = this.gameState.dayNightCycle;
    const timeOfDay = this.getTimeOfDay();
    
    // Time indicator
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 120, 30);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Time: ${timeOfDay}`, 15, 30);
    
    // Day/night cycle bar
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(15, 35, 100, 5);
    
    this.ctx.fillStyle = cycle < 0.5 ? '#ffff00' : '#000080';
    this.ctx.fillRect(15, 35, 100 * cycle, 5);
  }

  // Public methods for external access
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
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback({ ...this.gameState });
    }
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }
}