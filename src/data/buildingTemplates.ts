import { GameMap, Tile, NPC, Item, Position, LootableItem } from '../types/game';
import { items } from './items_data';

export interface BuildingTemplate {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  floorType: string;
  wallType: string;
  entrancePositions: Position[];
  furnitureLayout: FurnitureItem[];
  npcTemplates: NPCTemplate[];
  lootableTemplates: LootableTemplate[];
  ambientMusic: string;
}

export interface FurnitureItem {
  position: Position;
  type: string;
  walkable: boolean;
}

export interface NPCTemplate {
  id: string;
  name: string;
  type: 'trader' | 'quest_giver' | 'neutral' | 'guard';
  position: Position;
  inventory: string[];
  dialogue: any[];
  faction: string;
}

export interface LootableTemplate {
  position: Position;
  type: 'container' | 'safe' | 'locker';
  items: string[];
  locked?: boolean;
}

const createTile = (x: number, y: number, type: string, walkable: boolean = true): Tile => ({
  x,
  y,
  type: type as any,
  walkable,
  sprite: type,
  discovered: true,
  visible: true,
  description: `${type} terrain`
});

// GENERAL STORE TEMPLATE
export const generalStoreTemplate: BuildingTemplate = {
  id: 'general_store',
  name: 'General Store',
  type: 'trader_post',
  width: 12,
  height: 10,
  floorType: 'stone',
  wallType: 'building',
  entrancePositions: [{ x: 6, y: 9 }],
  furnitureLayout: [
    { position: { x: 3, y: 3 }, type: 'building', walkable: false }, // Counter
    { position: { x: 4, y: 3 }, type: 'building', walkable: false },
    { position: { x: 5, y: 3 }, type: 'building', walkable: false },
    { position: { x: 8, y: 2 }, type: 'building', walkable: false }, // Shelves
    { position: { x: 9, y: 2 }, type: 'building', walkable: false },
    { position: { x: 8, y: 7 }, type: 'building', walkable: false },
    { position: { x: 9, y: 7 }, type: 'building', walkable: false }
  ],
  npcTemplates: [
    {
      id: 'shopkeeper',
      name: 'Shopkeeper',
      type: 'trader',
      position: { x: 4, y: 4 },
      inventory: ['stimpak', 'rad_away', 'scrap_metal', 'combat_knife', 'nuka_cola'],
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome! I have supplies for any wasteland wanderer.',
          choices: [
            { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
            { id: 'leave', text: 'Just browsing', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Come back anytime!',
          choices: []
        }
      ],
      faction: 'neutral'
    }
  ],
  lootableTemplates: [
    {
      position: { x: 2, y: 2 },
      type: 'container',
      items: ['scrap_metal', 'rusty_can']
    }
  ],
  ambientMusic: 'shop_ambient'
};

// CLINIC TEMPLATE
export const clinicTemplate: BuildingTemplate = {
  id: 'clinic',
  name: 'Medical Clinic',
  type: 'clinic',
  width: 14,
  height: 10,
  floorType: 'stone',
  wallType: 'building',
  entrancePositions: [{ x: 7, y: 9 }],
  furnitureLayout: [
    { position: { x: 2, y: 2 }, type: 'building', walkable: false }, // Medical bed
    { position: { x: 3, y: 2 }, type: 'building', walkable: false },
    { position: { x: 10, y: 2 }, type: 'building', walkable: false }, // Medicine cabinet
    { position: { x: 11, y: 2 }, type: 'building', walkable: false },
    { position: { x: 6, y: 5 }, type: 'building', walkable: false }, // Desk
    { position: { x: 7, y: 5 }, type: 'building', walkable: false }
  ],
  npcTemplates: [
    {
      id: 'doctor',
      name: 'Doctor',
      type: 'trader',
      position: { x: 7, y: 6 },
      inventory: ['stimpak', 'rad_away', 'buffout', 'mentats', 'psycho'],
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome to my clinic. I can heal your wounds or sell medical supplies.',
          choices: [
            { id: 'heal', text: 'I need healing', action: 'heal_player' },
            { id: 'trade', text: 'Show me your medical supplies', action: 'open_trade' },
            { id: 'leave', text: 'I\'m fine', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Stay healthy out there.',
          choices: []
        }
      ],
      faction: 'medical'
    }
  ],
  lootableTemplates: [
    {
      position: { x: 11, y: 3 },
      type: 'locker',
      items: ['stimpak', 'rad_away'],
      locked: true
    }
  ],
  ambientMusic: 'medical_ambient'
};

// WEAPON SHOP TEMPLATE
export const weaponShopTemplate: BuildingTemplate = {
  id: 'weapon_shop',
  name: 'Weapon Shop',
  type: 'armory',
  width: 15,
  height: 12,
  floorType: 'stone',
  wallType: 'building',
  entrancePositions: [{ x: 7, y: 11 }],
  furnitureLayout: [
    { position: { x: 4, y: 4 }, type: 'building', walkable: false }, // Counter
    { position: { x: 5, y: 4 }, type: 'building', walkable: false },
    { position: { x: 6, y: 4 }, type: 'building', walkable: false },
    { position: { x: 2, y: 2 }, type: 'building', walkable: false }, // Weapon racks
    { position: { x: 2, y: 3 }, type: 'building', walkable: false },
    { position: { x: 12, y: 2 }, type: 'building', walkable: false },
    { position: { x: 12, y: 3 }, type: 'building', walkable: false },
    { position: { x: 8, y: 8 }, type: 'building', walkable: false }, // Workbench
    { position: { x: 9, y: 8 }, type: 'building', walkable: false }
  ],
  npcTemplates: [
    {
      id: 'gunsmith',
      name: 'Gunsmith',
      type: 'trader',
      position: { x: 5, y: 5 },
      inventory: ['combat_knife', 'assault_rifle', 'combat_armor', 'scrap_metal', 'electronics'],
      dialogue: [
        {
          id: 'greeting',
          text: 'Looking for quality weapons and armor? You\'ve come to the right place.',
          choices: [
            { id: 'trade', text: 'Show me your weapons', action: 'open_trade' },
            { id: 'repair', text: 'Can you repair equipment?', nextNode: 'repair_info' },
            { id: 'leave', text: 'Just looking', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'repair_info',
          text: 'I can fix most weapons and armor. Bring me the item and some scrap metal.',
          choices: [
            { id: 'trade', text: 'Let me see what you have', action: 'open_trade' },
            { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Stay armed, stay alive!',
          choices: []
        }
      ],
      faction: 'neutral'
    }
  ],
  lootableTemplates: [
    {
      position: { x: 10, y: 9 },
      type: 'safe',
      items: ['plasma_rifle', 'rare_earth'],
      locked: true
    }
  ],
  ambientMusic: 'workshop_ambient'
};

// BAR/TAVERN TEMPLATE
export const tavernTemplate: BuildingTemplate = {
  id: 'tavern',
  name: 'Tavern',
  type: 'tavern',
  width: 18,
  height: 14,
  floorType: 'stone',
  wallType: 'building',
  entrancePositions: [{ x: 9, y: 13 }],
  furnitureLayout: [
    // Bar counter
    { position: { x: 6, y: 4 }, type: 'building', walkable: false },
    { position: { x: 7, y: 4 }, type: 'building', walkable: false },
    { position: { x: 8, y: 4 }, type: 'building', walkable: false },
    { position: { x: 9, y: 4 }, type: 'building', walkable: false },
    { position: { x: 10, y: 4 }, type: 'building', walkable: false },
    // Tables
    { position: { x: 3, y: 7 }, type: 'building', walkable: false },
    { position: { x: 13, y: 7 }, type: 'building', walkable: false },
    { position: { x: 3, y: 10 }, type: 'building', walkable: false },
    { position: { x: 13, y: 10 }, type: 'building', walkable: false }
  ],
  npcTemplates: [
    {
      id: 'bartender',
      name: 'Bartender',
      type: 'trader',
      position: { x: 8, y: 5 },
      inventory: ['nuka_cola', 'purified_water', 'dirty_water', 'psycho', 'buffout'],
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome to my establishment! What can I get you?',
          choices: [
            { id: 'drink', text: 'I need a drink', action: 'open_trade' },
            { id: 'info', text: 'Any news from the wasteland?', nextNode: 'wasteland_news' },
            { id: 'leave', text: 'Maybe later', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'wasteland_news',
          text: 'Travelers come through here all the time. Raiders to the north, strange lights in the east...',
          choices: [
            { id: 'drink', text: 'Interesting. How about that drink?', action: 'open_trade' },
            { id: 'leave', text: 'Thanks for the info', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Come back anytime, friend.',
          choices: []
        }
      ],
      faction: 'neutral'
    },
    {
      id: 'patron',
      name: 'Local Patron',
      type: 'neutral',
      position: { x: 4, y: 7 },
      inventory: [],
      dialogue: [
        {
          id: 'greeting',
          text: 'Just trying to forget the wasteland for a while...',
          choices: [
            { id: 'leave', text: 'Enjoy your drink', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Thanks, stranger.',
          choices: []
        }
      ],
      faction: 'neutral'
    }
  ],
  lootableTemplates: [
    {
      position: { x: 15, y: 3 },
      type: 'container',
      items: ['nuka_cola', 'caps']
    }
  ],
  ambientMusic: 'tavern_ambient'
};

// SECURITY OFFICE TEMPLATE
export const securityOfficeTemplate: BuildingTemplate = {
  id: 'security_office',
  name: 'Security Office',
  type: 'security',
  width: 12,
  height: 8,
  floorType: 'stone',
  wallType: 'building',
  entrancePositions: [{ x: 6, y: 7 }],
  furnitureLayout: [
    { position: { x: 3, y: 3 }, type: 'building', walkable: false }, // Desk
    { position: { x: 4, y: 3 }, type: 'building', walkable: false },
    { position: { x: 8, y: 2 }, type: 'building', walkable: false }, // Locker
    { position: { x: 9, y: 2 }, type: 'building', walkable: false }
  ],
  npcTemplates: [
    {
      id: 'guard_captain',
      name: 'Guard Captain',
      type: 'guard',
      position: { x: 4, y: 4 },
      inventory: ['combat_armor', 'assault_rifle', 'stimpak'],
      dialogue: [
        {
          id: 'greeting',
          text: 'This is a restricted area. State your business.',
          choices: [
            { id: 'business', text: 'I\'m here on official business', nextNode: 'official' },
            { id: 'leave', text: 'Sorry, I\'ll leave', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'official',
          text: 'Alright, but don\'t cause any trouble.',
          choices: [
            { id: 'leave', text: 'Understood', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Move along.',
          choices: []
        }
      ],
      faction: 'security'
    }
  ],
  lootableTemplates: [
    {
      position: { x: 9, y: 3 },
      type: 'locker',
      items: ['combat_armor', 'assault_rifle'],
      locked: true
    }
  ],
  ambientMusic: 'security_ambient'
};

export const buildingTemplates = {
  general_store: generalStoreTemplate,
  clinic: clinicTemplate,
  weapon_shop: weaponShopTemplate,
  tavern: tavernTemplate,
  security_office: securityOfficeTemplate
};

export function createBuildingFromTemplate(
  template: BuildingTemplate, 
  buildingId: string, 
  buildingName: string,
  parentMapId: string,
  exitPosition: Position
): GameMap {
  const tiles: Tile[][] = [];
  
  // Initialize with floor
  for (let y = 0; y < template.height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < template.width; x++) {
      row.push(createTile(x, y, 'stone', true));
    }
    tiles.push(row);
  }
  
  // Add walls around perimeter
  for (let x = 0; x < template.width; x++) {
    tiles[0][x] = createTile(x, 0, 'ruins', false);
    tiles[template.height - 1][x] = createTile(x, template.height - 1, 'ruins', false);
  }
  for (let y = 0; y < template.height; y++) {
    tiles[y][0] = createTile(0, y, 'ruins', false);
    tiles[y][template.width - 1] = createTile(template.width - 1, y, 'ruins', false);
  }
  
  // Add entrances
  template.entrancePositions.forEach(entrance => {
    tiles[entrance.y][entrance.x] = createTile(entrance.x, entrance.y, 'stone', true);
    tiles[entrance.y][entrance.x].isEntrance = true;
  });
  
  // Add furniture
  template.furnitureLayout.forEach(furniture => {
    if (furniture.type === 'building') {
      // Use dirt for furniture/obstacles
      tiles[furniture.position.y][furniture.position.x] = createTile(
        furniture.position.x, 
        furniture.position.y, 
        'dirt', 
        furniture.walkable
      );
    } else {
      tiles[furniture.position.y][furniture.position.x] = createTile(
        furniture.position.x, 
        furniture.position.y, 
        furniture.type, 
        furniture.walkable
      );
    }
  });
  
  // Create NPCs
  const npcs: NPC[] = template.npcTemplates.map(npcTemplate => ({
    id: `${buildingId}_${npcTemplate.id}`,
    name: npcTemplate.name,
    type: npcTemplate.type,
    position: { 
      x: npcTemplate.position.x * 32 + 16, 
      y: npcTemplate.position.y * 32 + 16 
    },
    sprite: npcTemplate.type === 'trader' ? 'trader' : 'npc',
    dialogue: npcTemplate.dialogue,
    inventory: npcTemplate.inventory.map(itemId => {
      const item = items.find(i => i.id === itemId);
      return item ? { ...item, quantity: item.stackable ? Math.floor(Math.random() * 5) + 1 : 1 } : null;
    }).filter(Boolean) as Item[],
    faction: npcTemplate.faction,
    isHostile: false
  }));
  
  // Create lootables
  const lootables: LootableItem[] = template.lootableTemplates.map((lootTemplate, index) => ({
    id: `${buildingId}_loot_${index}`,
    position: { 
      x: lootTemplate.position.x * 32 + 16, 
      y: lootTemplate.position.y * 32 + 16 
    },
    items: lootTemplate.items.map(itemId => {
      const item = items.find(i => i.id === itemId);
      return item ? { ...item, quantity: item.stackable ? Math.floor(Math.random() * 3) + 1 : 1 } : null;
    }).filter(Boolean) as Item[],
    type: lootTemplate.type,
    sprite: lootTemplate.type,
    discovered: false,
    looted: false
  }));
  
  return {
    id: `${buildingId}_interior`,
    width: template.width,
    height: template.height,
    tiles,
    name: buildingName,
    bgMusic: template.ambientMusic,
    npcs,
    enemies: [],
    lootables,
    isInterior: true,
    parentMapId,
    exitPosition,
    connections: []
  };
}