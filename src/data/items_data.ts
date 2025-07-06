import { Item } from '../types/game';

export const items: Item[] = [
  // Weapons
  {
    id: 'rusty_pipe',
    name: 'Rusty Pipe',
    type: 'weapon',
    rarity: 'common',
    description: 'A makeshift weapon from the old world',
    stats: { damage: 8, criticalChance: 5 },
    value: 10,
    sprite: 'rusty_pipe',
    stackable: false
  },
  {
    id: 'combat_knife',
    name: 'Combat Knife',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'A sharp military-grade knife',
    stats: { damage: 12, criticalChance: 15, agility: 2 },
    value: 25,
    sprite: 'combat_knife',
    stackable: false
  },
  {
    id: 'assault_rifle',
    name: 'Assault Rifle',
    type: 'weapon',
    rarity: 'rare',
    description: 'A reliable automatic weapon',
    stats: { damage: 20, criticalChance: 10, strength: 1 },
    value: 150,
    sprite: 'assault_rifle',
    stackable: false
  },
  {
    id: 'plasma_rifle',
    name: 'Plasma Rifle',
    type: 'weapon',
    rarity: 'epic',
    description: 'An advanced energy weapon',
    stats: { damage: 35, criticalChance: 20, intelligence: 3 },
    value: 500,
    sprite: 'plasma_rifle',
    stackable: false
  },
  
  // Armor
  {
    id: 'leather_jacket',
    name: 'Leather Jacket',
    type: 'armor',
    rarity: 'common',
    description: 'Worn but protective leather armor',
    stats: { defense: 5, endurance: 1 },
    value: 15,
    sprite: 'leather_jacket',
    stackable: false
  },
  {
    id: 'combat_armor',
    name: 'Combat Armor',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Military-grade protective gear',
    stats: { defense: 12, strength: 2, endurance: 2 },
    value: 75,
    sprite: 'combat_armor',
    stackable: false
  },
  {
    id: 'power_armor',
    name: 'Power Armor',
    type: 'armor',
    rarity: 'legendary',
    description: 'Advanced powered exoskeleton',
    stats: { defense: 25, strength: 5, endurance: 5, agility: -2 },
    value: 1000,
    sprite: 'power_armor',
    stackable: false
  },
  
  // Consumables
  {
    id: 'stimpak',
    name: 'Stimpak',
    type: 'consumable',
    rarity: 'common',
    description: 'Instantly restores health',
    quantity: 1,
    value: 20,
    sprite: 'stimpak',
    stackable: true
  },
  {
    id: 'rad_away',
    name: 'Rad-Away',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Removes radiation poisoning',
    quantity: 1,
    value: 30,
    sprite: 'rad_away',
    stackable: true
  },
  {
    id: 'psycho',
    name: 'Psycho',
    type: 'consumable',
    rarity: 'rare',
    description: 'Increases damage but causes addiction',
    quantity: 1,
    value: 50,
    sprite: 'psycho',
    stackable: true
  },
  {
    id: 'buffout',
    name: 'Buffout',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Temporarily increases strength and endurance',
    quantity: 1,
    value: 40,
    sprite: 'buffout',
    stackable: true
  },
  {
    id: 'mentats',
    name: 'Mentats',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Temporarily increases intelligence and perception',
    quantity: 1,
    value: 35,
    sprite: 'mentats',
    stackable: true
  },
  
  // Materials
  {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    type: 'material',
    rarity: 'common',
    description: 'Useful for crafting and repairs',
    quantity: 1,
    value: 1,
    sprite: 'scrap_metal',
    stackable: true
  },
  {
    id: 'electronics',
    name: 'Electronics',
    type: 'material',
    rarity: 'uncommon',
    description: 'Complex electronic components',
    quantity: 1,
    value: 8,
    sprite: 'electronics',
    stackable: true
  },
  {
    id: 'rare_earth',
    name: 'Rare Earth Elements',
    type: 'material',
    rarity: 'rare',
    description: 'Precious materials for advanced crafting',
    quantity: 1,
    value: 35,
    sprite: 'rare_earth',
    stackable: true
  },
  
  // Add more common junk items
  {
    id: 'rusty_can',
    name: 'Rusty Can',
    type: 'material',
    rarity: 'common',
    description: 'An old, rusted tin can. Barely worth anything.',
    quantity: 1,
    value: 1,
    sprite: 'rusty_can',
    stackable: true
  },
  {
    id: 'broken_glass',
    name: 'Broken Glass',
    type: 'material',
    rarity: 'common',
    description: 'Shards of broken glass. Handle with care.',
    quantity: 1,
    value: 1,
    sprite: 'broken_glass',
    stackable: true
  },
  {
    id: 'dirty_water',
    name: 'Dirty Water',
    type: 'consumable',
    rarity: 'common',
    description: 'Contaminated water. Might make you sick.',
    quantity: 1,
    value: 2,
    sprite: 'dirty_water',
    stackable: true
  },
  {
    id: 'moldy_food',
    name: 'Moldy Food',
    type: 'consumable',
    rarity: 'common',
    description: 'Food that has seen better days. Probably not safe to eat.',
    quantity: 1,
    value: 1,
    sprite: 'moldy_food',
    stackable: true
  },
  {
    id: 'old_newspaper',
    name: 'Old Newspaper',
    type: 'material',
    rarity: 'common',
    description: 'A yellowed newspaper from before the war. Good for starting fires.',
    quantity: 1,
    value: 1,
    sprite: 'old_newspaper',
    stackable: true
  },
  {
    id: 'bent_spoon',
    name: 'Bent Spoon',
    type: 'material',
    rarity: 'common',
    description: 'A twisted piece of cutlery. Might have some scrap value.',
    quantity: 1,
    value: 1,
    sprite: 'bent_spoon',
    stackable: true
  }
];

// Add new items for the expanded world
export const additionalItems: Item[] = [
  // Alien Technology
  {
    id: 'alien_blaster',
    name: 'Alien Blaster',
    type: 'weapon',
    rarity: 'legendary',
    description: 'An otherworldly energy weapon of unknown origin',
    stats: { damage: 50, criticalChance: 25, intelligence: 2 },
    value: 2000,
    sprite: 'alien_blaster',
    stackable: false
  },
  {
    id: 'alien_power_cell',
    name: 'Alien Power Cell',
    type: 'material',
    rarity: 'rare',
    description: 'Advanced alien energy storage device',
    quantity: 1,
    value: 100,
    sprite: 'alien_power_cell',
    stackable: true
  },
  
  // Vault-Tec Equipment
  {
    id: 'pip_boy',
    name: 'Pip-Boy 3000',
    type: 'accessory',
    rarity: 'epic',
    description: 'Personal Information Processor from Vault-Tec',
    stats: { intelligence: 3, perception: 2 },
    value: 1500,
    sprite: 'pip_boy',
    stackable: false
  },
  {
    id: 'vault_suit',
    name: 'Vault 101 Jumpsuit',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Standard issue Vault-Tec jumpsuit',
    stats: { defense: 3, endurance: 1 },
    value: 50,
    sprite: 'vault_suit',
    stackable: false
  },
  
  // Brotherhood Technology
  {
    id: 'brotherhood_armor',
    name: 'Brotherhood Combat Armor',
    type: 'armor',
    rarity: 'rare',
    description: 'Advanced combat armor used by the Brotherhood of Steel',
    stats: { defense: 18, strength: 2, endurance: 3 },
    value: 400,
    sprite: 'brotherhood_armor',
    stackable: false
  },
  {
    id: 'laser_rifle',
    name: 'Laser Rifle',
    type: 'weapon',
    rarity: 'rare',
    description: 'Military-grade energy weapon',
    stats: { damage: 28, criticalChance: 15, intelligence: 1 },
    value: 300,
    sprite: 'laser_rifle',
    stackable: false
  },
  
  // Enclave Equipment
  {
    id: 'enclave_armor',
    name: 'Enclave Power Armor',
    type: 'armor',
    rarity: 'epic',
    description: 'Advanced power armor used by Enclave forces',
    stats: { defense: 30, strength: 6, endurance: 6, agility: -3 },
    value: 1500,
    sprite: 'enclave_armor',
    stackable: false
  },
  
  // Special Quest Items
  {
    id: 'geck',
    name: 'G.E.C.K.',
    type: 'quest',
    rarity: 'legendary',
    description: 'Garden of Eden Creation Kit - the key to Project Purity',
    value: 0,
    sprite: 'geck',
    stackable: false
  },
  {
    id: 'declaration_independence',
    name: 'Declaration of Independence',
    type: 'quest',
    rarity: 'legendary',
    description: 'The founding document of the United States of America',
    value: 0,
    sprite: 'declaration',
    stackable: false
  },
  {
    id: 'water_chip',
    name: 'Water Chip',
    type: 'quest',
    rarity: 'epic',
    description: 'Essential component for water purification systems',
    value: 0,
    sprite: 'water_chip',
    stackable: false
  },
  
  // Consumables
  {
    id: 'nuka_cola',
    name: 'Nuka-Cola',
    type: 'consumable',
    rarity: 'common',
    description: 'The refreshing taste of the old world',
    quantity: 1,
    value: 15,
    sprite: 'nuka_cola',
    stackable: true
  },
  {
    id: 'purified_water',
    name: 'Purified Water',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Clean, radiation-free water',
    quantity: 1,
    value: 25,
    sprite: 'purified_water',
    stackable: true
  }
];

// Combine original items with additional items
items.push(...additionalItems);