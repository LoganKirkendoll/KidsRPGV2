import { Character, Skill, Item, Enemy, GameMap, Quest, Achievement, NPC } from '../types/game';
import { skills } from './skills';
import { maps } from './maps';
import { allQuests } from './quests';
import { items } from './items_data';
import { npcs } from './npcs_data';

export const characterClasses = {
  warrior: {
    name: 'Warrior',
    description: 'A tough melee fighter with high health and strength',
    baseStats: { strength: 15, agility: 8, intelligence: 6, endurance: 14, luck: 7, perception: 8, charisma: 6 },
    startingSkills: ['slash', 'power_strike', 'defensive_stance'],
    sprite: 'warrior'
  },
  ranger: {
    name: 'Ranger',
    description: 'A skilled marksman with high agility and perception',
    baseStats: { strength: 10, agility: 15, intelligence: 10, endurance: 10, luck: 10, perception: 14, charisma: 8 },
    startingSkills: ['aimed_shot', 'quick_shot', 'explosive_shot'],
    sprite: 'ranger'
  },
  medic: {
    name: 'Medic',
    description: 'A healer with knowledge of medicine and technology',
    baseStats: { strength: 7, agility: 9, intelligence: 15, endurance: 11, luck: 8, perception: 10, charisma: 12 },
    startingSkills: ['heal', 'poison_dart', 'adrenaline_shot'],
    sprite: 'medic'
  },
  engineer: {
    name: 'Engineer',
    description: 'A tech specialist who can craft and repair equipment',
    baseStats: { strength: 9, agility: 11, intelligence: 14, endurance: 9, luck: 12, perception: 11, charisma: 7 },
    startingSkills: ['emp_blast', 'turret_deploy', 'shock_trap'],
    sprite: 'engineer'
  }
};

export const backgrounds = [
  {
    id: 'vault_dweller',
    name: 'Vault Dweller',
    description: 'Raised in the safety of an underground vault',
    bonuses: { intelligence: 2, endurance: 1 },
    penalties: { charisma: -1 },
    startingItems: ['pip_boy', 'vault_suit']
  },
  {
    id: 'wasteland_wanderer',
    name: 'Wasteland Wanderer',
    description: 'Born and raised in the harsh wasteland',
    bonuses: { endurance: 2, perception: 1 },
    penalties: { intelligence: -1 },
    startingItems: ['leather_jacket', 'water_bottle']
  },
  {
    id: 'tribal',
    name: 'Tribal',
    description: 'Member of a primitive post-war tribe',
    bonuses: { strength: 2, agility: 1 },
    penalties: { intelligence: -1 },
    startingItems: ['tribal_spear', 'healing_powder']
  },
  {
    id: 'raider',
    name: 'Ex-Raider',
    description: 'Former member of a raider gang seeking redemption',
    bonuses: { strength: 1, agility: 1, luck: 1 },
    penalties: { charisma: -2 },
    startingItems: ['sawed_off_shotgun', 'leather_armor']
  }
];

export const traits = [
  {
    id: 'fast_metabolism',
    name: 'Fast Metabolism',
    description: 'Your body processes food and chems quickly',
    bonus: 'Healing items are 50% more effective',
    penalty: 'Radiation damage is 25% higher'
  },
  {
    id: 'heavy_handed',
    name: 'Heavy Handed',
    description: 'You swing weapons with great force',
    bonus: '+4 melee damage',
    penalty: '-30% critical hit chance'
  },
  {
    id: 'small_frame',
    name: 'Small Frame',
    description: 'You are not quite as big as other people',
    bonus: '+1 Agility',
    penalty: 'Limbs are easier to cripple'
  },
  {
    id: 'one_hander',
    name: 'One Hander',
    description: 'You excel with one-handed weapons',
    bonus: '+20% accuracy with one-handed weapons',
    penalty: '-40% accuracy with two-handed weapons'
  }
];

// Export items from the dedicated items file
export { items };

export { skills };

export const enemyTypes: Enemy[] = [
  {
    id: 'raider',
    name: 'Wasteland Raider',
    type: 'raider',
    level: 1,
    health: 40,
    maxHealth: 40,
    energy: 10,
    maxEnergy: 10,
    defense: 2,
    damage: 12,
    experience: 15,
    loot: [
      { item: items.find(i => i.id === 'rusty_pipe')!, chance: 0.3, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.8, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'raider',
    ai: { type: 'aggressive', range: 5, speed: 64 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!]
  },
  {
    id: 'mutant',
    name: 'Irradiated Mutant',
    type: 'mutant',
    level: 3,
    health: 80,
    maxHealth: 80,
    energy: 15,
    maxEnergy: 15,
    defense: 5,
    damage: 18,
    experience: 35,
    loot: [
      { item: items.find(i => i.id === 'rad_away')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.6, quantity: 3 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'mutant',
    ai: { type: 'aggressive', range: 6, speed: 48 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!, skills.find(s => s.id === 'poison_dart')!]
  },
  {
    id: 'robot',
    name: 'Security Robot',
    type: 'robot',
    level: 5,
    health: 120,
    maxHealth: 120,
    energy: 30,
    maxEnergy: 30,
    defense: 10,
    damage: 25,
    experience: 60,
    loot: [
      { item: items.find(i => i.id === 'electronics')!, chance: 0.7, quantity: 2 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.9, quantity: 5 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'robot',
    ai: { type: 'patrol', range: 8, speed: 32 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'emp_blast')!]
  },
  {
    id: 'raider_boss',
    name: 'Raider Chief',
    type: 'raider',
    level: 4,
    health: 100,
    maxHealth: 100,
    energy: 20,
    maxEnergy: 20,
    defense: 8,
    damage: 22,
    experience: 80,
    loot: [
      { item: items.find(i => i.id === 'combat_armor')!, chance: 0.6, quantity: 1 },
      { item: items.find(i => i.id === 'assault_rifle')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 1.0, quantity: 5 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'raider_boss',
    ai: { type: 'aggressive', range: 6, speed: 56 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'power_strike')!, skills.find(s => s.id === 'aimed_shot')!]
  }
];

// Export npcs from the dedicated npcs file
export { npcs };

export const createStartingCharacter = (name: string, characterClass: keyof typeof characterClasses): Character => {
  const classData = characterClasses[characterClass];
  const startingSkills = classData.startingSkills
    .map(skillId => skills.find(skill => skill.id === skillId))
    .filter(Boolean) as Skill[];
  
  const character = {
    id: 'player',
    name,
    background: 'vault_dweller',
    age: 25,
    gender: 'male' as const,
    class: characterClass,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    energy: 50,
    maxEnergy: 50,
    radiation: 0,
    maxRadiation: 1000,
    stats: { ...classData.baseStats },
    derivedStats: {
      carryWeight: classData.baseStats.strength * 10,
      actionPoints: Math.floor(classData.baseStats.agility / 2),
      criticalChance: classData.baseStats.luck,
      damageResistance: 0,
      radiationResistance: classData.baseStats.endurance * 2
    },
    skills: startingSkills,
    perks: [],
    equipment: {
      weapon: items.find(i => i.id === 'rusty_pipe'),
      armor: items.find(i => i.id === 'leather_jacket')
    },
    isInParty: true,
    position: { x: 50 * 32, y: 50 * 32 },
    direction: 'down' as const,
    isMoving: false,
    sprite: classData.sprite,
    statusEffects: [],
    biography: '',
    traits: []
  };
  
  // Add equipment bonuses tracking
  (character as any).equipmentBonuses = {
    damage: 0,
    defense: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    endurance: 0,
    luck: 0,
    criticalChance: 0
  };
  
  return character;
};

export const createStartingMap = (): GameMap => {
  // This function is deprecated - use createAllMaps from maps.ts instead
  const { createCapitalWasteland } = require('./maps');
  return createCapitalWasteland();
};

export const achievements: Achievement[] = [
  {
    id: 'first_kill',
    name: 'First Blood',
    description: 'Kill your first enemy',
    icon: 'skull',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'level_up',
    name: 'Growing Stronger',
    description: 'Reach level 5',
    icon: 'star',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discover 100 tiles',
    icon: 'map',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Find 50 items',
    icon: 'package',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 1 hour',
    icon: 'clock',
    unlocked: false,
    progress: 0,
    maxProgress: 3600
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 10 quests',
    icon: 'scroll',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'raider_slayer',
    name: 'Raider Slayer',
    description: 'Kill 25 raiders',
    icon: 'sword',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  }
];

export const quests: Quest[] = [
  ...allQuests.filter(q => q.status === 'active')
];