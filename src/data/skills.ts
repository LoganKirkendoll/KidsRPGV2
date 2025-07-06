import { Skill } from '../types/game';

export const skills: Skill[] = [
  // Warrior Skills
  {
    id: 'slash',
    name: 'Slash',
    description: 'A basic melee attack with a bladed weapon',
    energyCost: 2,
    damage: 15,
    range: 1,
    cooldown: 1,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'slash'
  },
  {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A devastating melee attack that deals massive damage',
    energyCost: 5,
    damage: 35,
    range: 1,
    cooldown: 3,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'power_strike'
  },
  {
    id: 'defensive_stance',
    name: 'Defensive Stance',
    description: 'Increases defense but reduces movement speed',
    energyCost: 3,
    effect: { type: 'buff', duration: 5, value: 10 },
    range: 0,
    cooldown: 5,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'defensive_stance'
  },
  
  // Ranger Skills
  {
    id: 'aimed_shot',
    name: 'Aimed Shot',
    description: 'A precise ranged attack with increased critical chance',
    energyCost: 4,
    damage: 25,
    range: 5,
    cooldown: 2,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'aimed_shot'
  },
  {
    id: 'quick_shot',
    name: 'Quick Shot',
    description: 'A fast ranged attack with reduced damage',
    energyCost: 2,
    damage: 12,
    range: 4,
    cooldown: 0.5,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'quick_shot'
  },
  {
    id: 'explosive_shot',
    name: 'Explosive Shot',
    description: 'A shot that explodes on impact, dealing area damage',
    energyCost: 6,
    damage: 30,
    range: 5,
    cooldown: 4,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'explosive_shot'
  },
  
  // Medic Skills
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restore health to an ally',
    energyCost: 4,
    healing: 30,
    range: 2,
    cooldown: 1,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'heal'
  },
  {
    id: 'poison_dart',
    name: 'Poison Dart',
    description: 'A ranged attack that poisons the target',
    energyCost: 3,
    damage: 10,
    effect: { type: 'poison', duration: 3, value: 5 },
    range: 3,
    cooldown: 2,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'poison_dart'
  },
  {
    id: 'adrenaline_shot',
    name: 'Adrenaline Shot',
    description: 'Inject an ally with adrenaline, boosting their damage',
    energyCost: 5,
    effect: { type: 'buff', duration: 4, value: 15 },
    range: 2,
    cooldown: 5,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'adrenaline_shot'
  },
  
  // Engineer Skills
  {
    id: 'emp_blast',
    name: 'EMP Blast',
    description: 'An electromagnetic pulse that damages robotic enemies',
    energyCost: 4,
    damage: 25,
    range: 3,
    cooldown: 3,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'emp_blast'
  },
  {
    id: 'turret_deploy',
    name: 'Deploy Turret',
    description: 'Deploy a temporary turret that attacks enemies',
    energyCost: 8,
    damage: 15,
    range: 1,
    cooldown: 8,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'turret_deploy'
  },
  {
    id: 'shock_trap',
    name: 'Shock Trap',
    description: 'Place an electric trap that stuns enemies',
    energyCost: 5,
    damage: 20,
    effect: { type: 'stun', duration: 2, value: 1 },
    range: 2,
    cooldown: 4,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'shock_trap'
  },
  
  // Universal Skills
  {
    id: 'cure',
    name: 'Cure',
    description: 'Remove negative status effects from an ally',
    energyCost: 3,
    range: 2,
    cooldown: 2,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'cure'
  },
  {
    id: 'stimpack',
    name: 'Stimpack',
    description: 'Quick healing injection',
    energyCost: 2,
    healing: 20,
    range: 1,
    cooldown: 1,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'stimpack'
  }
];