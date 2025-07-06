export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  name: string;
  background: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  class: 'warrior' | 'ranger' | 'medic' | 'engineer';
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  radiation: number;
  maxRadiation: number;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    endurance: number;
    luck: number;
    perception: number;
    charisma: number;
  };
  derivedStats: {
    carryWeight: number;
    actionPoints: number;
    criticalChance: number;
    damageResistance: number;
    radiationResistance: number;
  };
  skills: Skill[];
  perks: Perk[];
  equipment: Equipment;
  isInParty: boolean;
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  sprite: string;
  statusEffects: StatusEffect[];
  biography: string;
  traits: string[];
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    level?: number;
    stats?: { [key: string]: number };
    skills?: { [key: string]: number };
  };
  effects: PerkEffect[];
}

export interface PerkEffect {
  type: 'stat_bonus' | 'skill_bonus' | 'special_ability';
  target: string;
  value: number;
}

export interface LootableItem {
  id: string;
  position: Position;
  items: Item[];
  type: 'container' | 'corpse' | 'cache';
  sprite: string;
  discovered: boolean;
  looted: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  damage?: number;
  healing?: number;
  effect?: SkillEffect;
  range: number;
  cooldown: number;
  currentCooldown: number;
  unlockLevel: number;
  animation: string;
}

export interface SkillEffect {
  type: 'poison' | 'burn' | 'freeze' | 'stun' | 'buff' | 'debuff';
  duration: number;
  value: number;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  helmet?: Item;
  boots?: Item;
  accessory?: Item;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory' | 'consumable' | 'material' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  stats?: ItemStats;
  quantity?: number;
  value: number;
  sprite: string;
  stackable: boolean;
}

export interface ItemStats {
  damage?: number;
  defense?: number;
  strength?: number;
  agility?: number;
  intelligence?: number;
  endurance?: number;
  luck?: number;
  criticalChance?: number;
  criticalDamage?: number;
}

export interface Enemy {
  id: string;
  name: string;
  type: 'raider' | 'mutant' | 'robot' | 'beast' | 'boss';
  mapId?: string;
  level: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  damage: number;
  defense: number;
  experience: number;
  loot: LootDrop[];
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  sprite: string;
  ai: AIBehavior;
  statusEffects: StatusEffect[];
  skills: Skill[];
}

export interface NPC {
  id: string;
  name: string;
  type: 'trader' | 'quest_giver' | 'recruitable' | 'neutral';
  mapId?: string;
  position: Position;
  sprite: string;
  dialogue: DialogueNode[];
  inventory?: Item[];
  quests?: Quest[];
  faction?: string;
  isHostile: boolean;
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
  conditions?: string[];
  actions?: string[];
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNode?: string;
  condition?: string;
  action?: string;
}

export interface LootDrop {
  item: Item;
  chance: number;
  quantity: number;
}

export interface StatusEffect {
  type: string;
  duration: number;
  value: number;
  source: string;
}

export interface AIBehavior {
  type: 'aggressive' | 'defensive' | 'patrol' | 'guard';
  range: number;
  speed: number;
}

export interface Tile {
  x: number;
  y: number;
  type: 'grass' | 'dirt' | 'stone' | 'water' | 'lava' | 'ice' | 'sand' | 'ruins' | 'building';
  walkable: boolean;
  sprite: string;
  hasEnemy?: boolean;
  hasLootable?: boolean;
  lootableId?: string;
  hasNPC?: boolean;
  npcId?: string;
  discovered: boolean;
  visible: boolean;
  description?: string;
  buildingType?: string;
  buildingName?: string;
  buildingId?: string;
  isEnterable?: boolean;
  regionType?: string;
  regionName?: string;
  isEntrance?: boolean;
  isExit?: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
  name: string;
  id: string;
  bgMusic: string;
  npcs: NPC[];
  enemies: Enemy[];
  lootables: LootableItem[];
  isInterior?: boolean;
  parentMapId?: string;
  exitPosition?: Position;
  connections: MapConnection[];
}

export interface MapConnection {
  direction: 'north' | 'south' | 'east' | 'west';
  targetMapId: string;
  fromPosition: Position;
  toPosition: Position;
}

export interface DevMode {
  enabled: boolean;
  selectedTool: 'quest' | 'npc' | 'item' | 'lootable' | 'terrain';
  questEditor: QuestEditor;
  npcEditor: NPCEditor;
  itemEditor: ItemEditor;
}

export interface QuestEditor {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  requiredLevel: number;
  giver?: string;
}

export interface NPCEditor {
  id: string;
  name: string;
  type: 'trader' | 'quest_giver' | 'recruitable' | 'neutral';
  position: Position;
  dialogue: DialogueNode[];
  inventory: Item[];
  faction: string;
  isHostile: boolean;
  customImage?: string;
}

export interface ItemEditor {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory' | 'consumable' | 'material' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  stats: ItemStats;
  value: number;
  stackable: boolean;
  customImage?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  requiredLevel: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'talk' | 'explore';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'experience' | 'item' | 'gold';
  value: number;
  item?: Item;
}

export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  settings: GameSettings;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphics: 'low' | 'medium' | 'high' | 'ultra';
  lowGraphicsMode: boolean;
  autoDetectPerformance?: boolean;
  fullscreen: boolean;
  showFPS: boolean;
  autoSave: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
}

export interface GameState {
  player: Character;
  party: Character[];
  allCharacters: Character[];
  inventory: Item[];
  gold: number;
  currentMap: GameMap;
  previousMap?: {
    map: GameMap;
    position: Position;
  };
  availableMaps: { [key: string]: GameMap };
  mapPosition: Position;
  camera: Position;
  gameTime: number;
  dayNightCycle: number;
  weather: 'clear' | 'rain' | 'storm' | 'fog' | 'radiation';
  quests: Quest[];
  completedQuests: string[];
  discoveredMaps: string[];
  gameMode: 'exploration' | 'combat' | 'dialogue' | 'inventory' | 'equipment' | 'menu' | 'quests' | 'character' | 'map';
  combat?: CombatState;
  dialogue?: DialogueState;
  base: Base;
  achievements: Achievement[];
  statistics: GameStatistics;
  visibilityMap: boolean[][];
  devMode?: DevMode;
}

export interface CombatState {
  participants: (Character | Enemy)[];
  turnOrder: (Character | Enemy)[];
  currentTurn: number;
  round: number;
  selectedAction?: string;
  selectedTargets: (Character | Enemy)[];
  animations: CombatAnimation[];
  battleground: Tile[][];
  weather: string;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isPlayerTurn: boolean;
  combatLog: string[];
}

export interface CombatAnimation {
  id: string;
  type: 'attack' | 'skill' | 'movement' | 'effect';
  source: string;
  target?: string;
  duration: number;
  startTime: number;
}

export interface DialogueState {
  npcId: string;
  currentNode: string;
  history: string[];
  choices: DialogueChoice[];
}

export interface Base {
  level: number;
  name: string;
  facilities: { [key: string]: number };
  resources: Resources;
  defenses: Defense[];
  population: number;
  morale: number;
}

export interface Facility {
  id: string;
  name: string;
  type: 'workshop' | 'medical' | 'storage' | 'training' | 'research' | 'quarters';
  level: number;
  maxLevel: number;
  upgradeCost: Resources;
  benefits: FacilityBenefit[];
  isActive: boolean;
}

export interface FacilityBenefit {
  type: string;
  value: number;
  description: string;
}

export interface Resources {
  scrap: number;
  food: number;
  medicine: number;
  fuel: number;
  electronics: number;
  rare_materials: number;
}

export interface Defense {
  id: string;
  name: string;
  type: 'turret' | 'wall' | 'trap' | 'shield';
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  range: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface GameStatistics {
  playtime: number;
  enemiesKilled: number;
  questsCompleted: number;
  itemsFound: number;
  distanceTraveled: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  goldEarned: number;
  goldSpent: number;
}