import { Enemy } from '../types/game';
import { items } from './items_data';
import { skills } from './skills';

export const enemies: Enemy[] = [
  // CAPITAL WASTELAND ENEMIES
  {
    id: 'raider_scavenger',
    name: 'Raider Scavenger',
    type: 'raider',
    level: 2,
    health: 45,
    maxHealth: 45,
    energy: 12,
    maxEnergy: 12,
    defense: 3,
    damage: 14,
    experience: 20,
    loot: [
      { item: items.find(i => i.id === 'rusty_pipe')!, chance: 0.15, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'rusty_can')!, chance: 0.6, quantity: 1 },
      { item: items.find(i => i.id === 'stimpak')!, chance: 0.05, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'raider_scavenger',
    ai: { type: 'aggressive', range: 6, speed: 72 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!]
  },

  {
    id: 'super_mutant_brute',
    name: 'Super Mutant Brute',
    type: 'mutant',
    level: 8,
    health: 150,
    maxHealth: 150,
    energy: 20,
    maxEnergy: 20,
    defense: 12,
    damage: 35,
    experience: 80,
    loot: [
      { item: items.find(i => i.id === 'assault_rifle')!, chance: 0.08, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.6, quantity: 2 },
      { item: items.find(i => i.id === 'electronics')!, chance: 0.3, quantity: 1 },
      { item: items.find(i => i.id === 'rad_away')!, chance: 0.15, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'super_mutant_brute',
    ai: { type: 'aggressive', range: 8, speed: 48 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'power_strike')!, skills.find(s => s.id === 'aimed_shot')!]
  },

  {
    id: 'enclave_soldier',
    name: 'Enclave Soldier',
    type: 'robot',
    level: 12,
    health: 200,
    maxHealth: 200,
    energy: 35,
    maxEnergy: 35,
    defense: 18,
    damage: 45,
    experience: 120,
    loot: [
      { item: items.find(i => i.id === 'plasma_rifle')!, chance: 0.12, quantity: 1 },
      { item: items.find(i => i.id === 'power_armor')!, chance: 0.03, quantity: 1 },
      { item: items.find(i => i.id === 'electronics')!, chance: 0.5, quantity: 2 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.8, quantity: 3 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'enclave_soldier',
    ai: { type: 'aggressive', range: 10, speed: 64 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'explosive_shot')!]
  },

  {
    id: 'feral_ghoul',
    name: 'Feral Ghoul',
    type: 'mutant',
    level: 4,
    health: 60,
    maxHealth: 60,
    energy: 15,
    maxEnergy: 15,
    defense: 2,
    damage: 20,
    experience: 35,
    loot: [
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.3, quantity: 1 },
      { item: items.find(i => i.id === 'dirty_water')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'moldy_food')!, chance: 0.3, quantity: 1 },
      { item: items.find(i => i.id === 'rad_away')!, chance: 0.1, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'feral_ghoul',
    ai: { type: 'aggressive', range: 5, speed: 80 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!, skills.find(s => s.id === 'poison_dart')!]
  },

  {
    id: 'deathclaw',
    name: 'Deathclaw',
    type: 'beast',
    level: 15,
    health: 300,
    maxHealth: 300,
    energy: 40,
    maxEnergy: 40,
    defense: 15,
    damage: 60,
    experience: 200,
    loot: [
      { item: items.find(i => i.id === 'rare_earth')!, chance: 0.25, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.7, quantity: 4 },
      { item: items.find(i => i.id === 'electronics')!, chance: 0.4, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'deathclaw',
    ai: { type: 'aggressive', range: 12, speed: 96 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'power_strike')!, skills.find(s => s.id === 'slash')!]
  },

  // THE PITT ENEMIES
  {
    id: 'trog',
    name: 'Trog',
    type: 'mutant',
    mapId: 'northern_wasteland',
    level: 6,
    health: 80,
    maxHealth: 80,
    energy: 18,
    maxEnergy: 18,
    defense: 5,
    damage: 25,
    experience: 45,
    loot: [
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.8, quantity: 3 },
      { item: items.find(i => i.id === 'electronics')!, chance: 0.3, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'trog',
    ai: { type: 'aggressive', range: 6, speed: 88 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!, skills.find(s => s.id === 'poison_dart')!]
  },

  {
    id: 'pitt_raider',
    name: 'Pitt Raider',
    type: 'raider',
    mapId: 'northern_wasteland',
    level: 7,
    health: 90,
    maxHealth: 90,
    energy: 20,
    maxEnergy: 20,
    defense: 8,
    damage: 28,
    experience: 55,
    loot: [
      { item: items.find(i => i.id === 'combat_armor')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'assault_rifle')!, chance: 0.3, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.9, quantity: 4 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'pitt_raider',
    ai: { type: 'aggressive', range: 7, speed: 64 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'power_strike')!]
  },

  {
    id: 'wildman',
    name: 'Wildman',
    type: 'mutant',
    mapId: 'northern_wasteland',
    level: 9,
    health: 120,
    maxHealth: 120,
    energy: 25,
    maxEnergy: 25,
    defense: 6,
    damage: 32,
    experience: 70,
    loot: [
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.7, quantity: 3 },
      { item: items.find(i => i.id === 'stimpak')!, chance: 0.5, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'wildman',
    ai: { type: 'aggressive', range: 8, speed: 76 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!, skills.find(s => s.id === 'adrenaline_shot')!]
  },

  // POINT LOOKOUT ENEMIES
  {
    id: 'swampfolk',
    name: 'Swampfolk',
    type: 'mutant',
    mapId: 'southern_ruins',
    level: 10,
    health: 140,
    maxHealth: 140,
    energy: 28,
    maxEnergy: 28,
    defense: 10,
    damage: 38,
    experience: 85,
    loot: [
      { item: items.find(i => i.id === 'combat_knife')!, chance: 0.6, quantity: 1 },
      { item: items.find(i => i.id === 'stimpak')!, chance: 0.4, quantity: 2 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.5, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'swampfolk',
    ai: { type: 'aggressive', range: 9, speed: 56 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'poison_dart')!, skills.find(s => s.id === 'slash')!]
  },

  {
    id: 'mirelurk',
    name: 'Mirelurk',
    type: 'beast',
    mapId: 'southern_ruins',
    level: 8,
    health: 110,
    maxHealth: 110,
    energy: 22,
    maxEnergy: 22,
    defense: 15,
    damage: 30,
    experience: 60,
    loot: [
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.8, quantity: 4 },
      { item: items.find(i => i.id === 'rad_away')!, chance: 0.3, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'mirelurk',
    ai: { type: 'defensive', range: 6, speed: 40 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'defensive_stance')!, skills.find(s => s.id === 'slash')!]
  },

  {
    id: 'tribal_warrior',
    name: 'Tribal Warrior',
    type: 'raider',
    mapId: 'southern_ruins',
    level: 11,
    health: 130,
    maxHealth: 130,
    energy: 30,
    maxEnergy: 30,
    defense: 8,
    damage: 35,
    experience: 90,
    loot: [
      { item: items.find(i => i.id === 'combat_knife')!, chance: 0.7, quantity: 1 },
      { item: items.find(i => i.id === 'stimpak')!, chance: 0.6, quantity: 2 },
      { item: items.find(i => i.id === 'rare_earth')!, chance: 0.2, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'tribal_warrior',
    ai: { type: 'aggressive', range: 8, speed: 72 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'poison_dart')!]
  },

  // MOTHERSHIP ZETA ENEMIES
  {
    id: 'alien_worker',
    name: 'Alien Worker',
    type: 'robot',
    mapId: 'eastern_districts',
    level: 12,
    health: 100,
    maxHealth: 100,
    energy: 40,
    maxEnergy: 40,
    defense: 12,
    damage: 40,
    experience: 100,
    loot: [
      { item: items.find(i => i.id === 'electronics')!, chance: 0.9, quantity: 5 },
      { item: items.find(i => i.id === 'rare_earth')!, chance: 0.6, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'alien_worker',
    ai: { type: 'defensive', range: 8, speed: 60 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'emp_blast')!, skills.find(s => s.id === 'shock_trap')!]
  },

  {
    id: 'alien_soldier',
    name: 'Alien Soldier',
    type: 'robot',
    mapId: 'eastern_districts',
    level: 15,
    health: 180,
    maxHealth: 180,
    energy: 50,
    maxEnergy: 50,
    defense: 20,
    damage: 55,
    experience: 150,
    loot: [
      { item: items.find(i => i.id === 'plasma_rifle')!, chance: 0.8, quantity: 1 },
      { item: items.find(i => i.id === 'electronics')!, chance: 1.0, quantity: 8 },
      { item: items.find(i => i.id === 'rare_earth')!, chance: 0.7, quantity: 3 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'alien_soldier',
    ai: { type: 'aggressive', range: 12, speed: 80 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'explosive_shot')!, skills.find(s => s.id === 'emp_blast')!]
  },

  {
    id: 'alien_captain',
    name: 'Alien Captain',
    type: 'boss',
    mapId: 'eastern_districts',
    level: 20,
    health: 400,
    maxHealth: 400,
    energy: 80,
    maxEnergy: 80,
    defense: 25,
    damage: 70,
    experience: 300,
    loot: [
      { item: items.find(i => i.id === 'power_armor')!, chance: 1.0, quantity: 1 },
      { item: items.find(i => i.id === 'plasma_rifle')!, chance: 1.0, quantity: 1 },
      { item: items.find(i => i.id === 'rare_earth')!, chance: 1.0, quantity: 10 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'alien_captain',
    ai: { type: 'aggressive', range: 15, speed: 64 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'explosive_shot')!, skills.find(s => s.id === 'turret_deploy')!, skills.find(s => s.id === 'emp_blast')!]
  },

  // CITADEL ENEMIES
  {
    id: 'brotherhood_outcast',
    name: 'Brotherhood Outcast',
    type: 'robot',
    mapId: 'western_outskirts',
    level: 10,
    health: 160,
    maxHealth: 160,
    energy: 35,
    maxEnergy: 35,
    defense: 16,
    damage: 42,
    experience: 95,
    loot: [
      { item: items.find(i => i.id === 'combat_armor')!, chance: 0.8, quantity: 1 },
      { item: items.find(i => i.id === 'assault_rifle')!, chance: 0.6, quantity: 1 },
      { item: items.find(i => i.id === 'electronics')!, chance: 0.7, quantity: 3 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'brotherhood_outcast',
    ai: { type: 'aggressive', range: 10, speed: 56 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'defensive_stance')!]
  },

  {
    id: 'super_mutant_master',
    name: 'Super Mutant Master',
    type: 'boss',
    mapId: 'western_outskirts',
    level: 18,
    health: 500,
    maxHealth: 500,
    energy: 60,
    maxEnergy: 60,
    defense: 20,
    damage: 80,
    experience: 400,
    loot: [
      { item: items.find(i => i.id === 'power_armor')!, chance: 0.8, quantity: 1 },
      { item: items.find(i => i.id === 'plasma_rifle')!, chance: 1.0, quantity: 1 },
      { item: items.find(i => i.id === 'rare_earth')!, chance: 1.0, quantity: 8 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'super_mutant_master',
    ai: { type: 'aggressive', range: 12, speed: 48 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'power_strike')!, skills.find(s => s.id === 'explosive_shot')!, skills.find(s => s.id === 'adrenaline_shot')!]
  },

  // METRO TUNNELS ENEMIES
  {
    id: 'tunnel_rat',
    name: 'Giant Tunnel Rat',
    type: 'beast',
    mapId: 'metro_tunnels',
    level: 3,
    health: 40,
    maxHealth: 40,
    energy: 15,
    maxEnergy: 15,
    defense: 2,
    damage: 18,
    experience: 25,
    loot: [
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'stimpak')!, chance: 0.2, quantity: 1 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'tunnel_rat',
    ai: { type: 'aggressive', range: 4, speed: 96 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'quick_shot')!]
  },

  {
    id: 'metro_ghoul',
    name: 'Metro Ghoul',
    type: 'mutant',
    mapId: 'metro_tunnels',
    level: 5,
    health: 70,
    maxHealth: 70,
    energy: 18,
    maxEnergy: 18,
    defense: 4,
    damage: 22,
    experience: 40,
    loot: [
      { item: items.find(i => i.id === 'rad_away')!, chance: 0.7, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.6, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'metro_ghoul',
    ai: { type: 'aggressive', range: 6, speed: 72 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!, skills.find(s => s.id === 'poison_dart')!]
  },

  {
    id: 'metro_security_robot',
    name: 'Metro Security Robot',
    type: 'robot',
    mapId: 'metro_tunnels',
    level: 7,
    health: 120,
    maxHealth: 120,
    energy: 30,
    maxEnergy: 30,
    defense: 14,
    damage: 30,
    experience: 65,
    loot: [
      { item: items.find(i => i.id === 'electronics')!, chance: 0.9, quantity: 4 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 1.0, quantity: 6 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'metro_security_robot',
    ai: { type: 'patrol', range: 8, speed: 48 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'emp_blast')!]
  }
];