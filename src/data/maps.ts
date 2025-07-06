import { GameMap, Tile, NPC, Enemy, LootableItem, MapConnection } from '../types/game';
import { items } from './items_data';
import { npcs } from './npcs_data';
import { enemies } from './enemies';

export const createTile = (x: number, y: number, type: string, walkable: boolean = true): Tile => ({
  x,
  y,
  type: type as any,
  walkable,
  sprite: type,
  discovered: false,
  visible: false,
  description: `${type} terrain`
});

// CAPITAL WASTELAND - Starting area (30x30)
export const createCapitalWasteland = (): GameMap => {
  const width = 30;
  const height = 30;
  const tiles: Tile[][] = [];
  
  // Initialize with grass as base terrain
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      let tileType = 'grass';
      
      // Add some terrain variation
      const random = Math.random();
      if (random < 0.1) {
        tileType = 'dirt';
      } else if (random < 0.15) {
        tileType = 'stone';
      } else if (random < 0.02) {
        tileType = 'water';
      }
      
      row.push(createTile(x, y, tileType, tileType !== 'water'));
    }
    tiles.push(row);
  }
  
  // Add some buildings
  tiles[10][10] = createTile(10, 10, 'building', false);
  tiles[10][11] = createTile(10, 11, 'building', false);
  tiles[11][10] = createTile(11, 10, 'building', false);
  tiles[11][11] = createTile(11, 11, 'building', false);
  
  tiles[20][15] = createTile(20, 15, 'building', false);
  tiles[20][16] = createTile(20, 16, 'building', false);
  tiles[21][15] = createTile(21, 15, 'building', false);
  tiles[21][16] = createTile(21, 16, 'building', false);
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'northern_wasteland',
      fromPosition: { x: 15 * 32, y: 0 },
      toPosition: { x: 15 * 32, y: 29 * 32 }
    },
    {
      direction: 'south',
      targetMapId: 'southern_ruins',
      fromPosition: { x: 15 * 32, y: 29 * 32 },
      toPosition: { x: 15 * 32, y: 0 }
    },
    {
      direction: 'east',
      targetMapId: 'eastern_districts',
      fromPosition: { x: 29 * 32, y: 15 * 32 },
      toPosition: { x: 0, y: 15 * 32 }
    },
    {
      direction: 'west',
      targetMapId: 'western_outskirts',
      fromPosition: { x: 0, y: 15 * 32 },
      toPosition: { x: 29 * 32, y: 15 * 32 }
    }
  ];
  
  return {
    id: 'capital_wasteland',
    width,
    height,
    tiles,
    name: 'Capital Wasteland',
    bgMusic: 'wasteland_ambient',
    npcs: npcs.filter(npc => !npc.mapId || npc.mapId === 'capital_wasteland'),
    enemies: enemies.filter(enemy => !enemy.mapId || enemy.mapId === 'capital_wasteland').slice(0, 3),
    lootables: createLootables(width, height, 0.02),
    connections
  };
};

// NORTHERN WASTELAND - Industrial area (25x25)
export const createNorthernWasteland = (): GameMap => {
  const width = 25;
  const height = 25;
  const tiles: Tile[][] = [];
  
  // Initialize with dirt/ruins (industrial wasteland)
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      let tileType = 'dirt';
      
      const random = Math.random();
      if (random < 0.3) {
        tileType = 'stone';
      } else if (random < 0.4) {
        tileType = 'ruins';
      }
      
      row.push(createTile(x, y, tileType, true));
    }
    tiles.push(row);
  }
  
  // Add industrial buildings
  for (let y = 8; y < 12; y++) {
    for (let x = 8; x < 15; x++) {
      tiles[y][x] = createTile(x, y, 'building', false);
    }
  }
  
  const connections: MapConnection[] = [
    {
      direction: 'south',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 12 * 32, y: 24 * 32 },
      toPosition: { x: 15 * 32, y: 0 }
    }
  ];
  
  return {
    id: 'northern_wasteland',
    width,
    height,
    tiles,
    name: 'Northern Wasteland',
    bgMusic: 'industrial_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'northern_wasteland'),
    enemies: enemies.filter(enemy => enemy.mapId === 'northern_wasteland').slice(0, 4),
    lootables: createLootables(width, height, 0.03),
    connections
  };
};

// SOUTHERN RUINS - Urban decay (25x25)
export const createSouthernRuins = (): GameMap => {
  const width = 25;
  const height = 25;
  const tiles: Tile[][] = [];
  
  // Initialize with ruins as base
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      let tileType = 'ruins';
      
      const random = Math.random();
      if (random < 0.2) {
        tileType = 'dirt';
      } else if (random < 0.3) {
        tileType = 'stone';
      }
      
      row.push(createTile(x, y, tileType, true));
    }
    tiles.push(row);
  }
  
  // Add ruined buildings
  for (let y = 5; y < 10; y++) {
    for (let x = 5; x < 12; x++) {
      if (Math.random() < 0.7) {
        tiles[y][x] = createTile(x, y, 'building', false);
      }
    }
  }
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 12 * 32, y: 0 },
      toPosition: { x: 15 * 32, y: 29 * 32 }
    }
  ];
  
  return {
    id: 'southern_ruins',
    width,
    height,
    tiles,
    name: 'Southern Ruins',
    bgMusic: 'ruins_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'southern_ruins'),
    enemies: enemies.filter(enemy => enemy.mapId === 'southern_ruins').slice(0, 3),
    lootables: createLootables(width, height, 0.025),
    connections
  };
};

// EASTERN DISTRICTS - Commercial area (25x25)
export const createEasternDistricts = (): GameMap => {
  const width = 25;
  const height = 25;
  const tiles: Tile[][] = [];
  
  // Initialize with stone as base (developed area)
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      let tileType = 'stone';
      
      const random = Math.random();
      if (random < 0.15) {
        tileType = 'dirt';
      } else if (random < 0.2) {
        tileType = 'grass';
      }
      
      row.push(createTile(x, y, tileType, true));
    }
    tiles.push(row);
  }
  
  // Add commercial buildings
  for (let y = 10; y < 15; y++) {
    for (let x = 10; x < 20; x++) {
      tiles[y][x] = createTile(x, y, 'building', false);
    }
  }
  
  const connections: MapConnection[] = [
    {
      direction: 'west',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 0, y: 12 * 32 },
      toPosition: { x: 29 * 32, y: 15 * 32 }
    }
  ];
  
  return {
    id: 'eastern_districts',
    width,
    height,
    tiles,
    name: 'Eastern Districts',
    bgMusic: 'city_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'eastern_districts'),
    enemies: enemies.filter(enemy => enemy.mapId === 'eastern_districts').slice(0, 2),
    lootables: createLootables(width, height, 0.015),
    connections
  };
};

// WESTERN OUTSKIRTS - Wilderness (25x25)
export const createWesternOutskirts = (): GameMap => {
  const width = 25;
  const height = 25;
  const tiles: Tile[][] = [];
  
  // Initialize with grass as base
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      let tileType = 'grass';
      
      const random = Math.random();
      if (random < 0.25) {
        tileType = 'dirt';
      } else if (random < 0.35) {
        tileType = 'stone';
      } else if (random < 0.05) {
        tileType = 'water';
      }
      
      row.push(createTile(x, y, tileType, tileType !== 'water'));
    }
    tiles.push(row);
  }
  
  // Add small outpost
  tiles[12][12] = createTile(12, 12, 'building', false);
  tiles[12][13] = createTile(12, 13, 'building', false);
  tiles[13][12] = createTile(13, 12, 'building', false);
  tiles[13][13] = createTile(13, 13, 'building', false);
  
  const connections: MapConnection[] = [
    {
      direction: 'east',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 24 * 32, y: 12 * 32 },
      toPosition: { x: 0, y: 15 * 32 }
    }
  ];
  
  return {
    id: 'western_outskirts',
    width,
    height,
    tiles,
    name: 'Western Outskirts',
    bgMusic: 'wilderness_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'western_outskirts'),
    enemies: enemies.filter(enemy => enemy.mapId === 'western_outskirts').slice(0, 2),
    lootables: createLootables(width, height, 0.01),
    connections
  };
};

export const createLootables = (width: number, height: number, density: number = 0.02): LootableItem[] => {
  const lootables: LootableItem[] = [];
  const count = Math.floor(width * height * density);
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    
    const lootTypes = ['container', 'corpse', 'cache'];
    const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
    
    // Simple loot - mostly scrap and basic items
    const lootItems = [];
    const numItems = Math.random() < 0.7 ? 1 : 2;
    
    for (let j = 0; j < numItems; j++) {
      const commonItems = items.filter(i => i.rarity === 'common');
      const randomItem = commonItems[Math.floor(Math.random() * commonItems.length)];
      
      if (randomItem) {
        lootItems.push({
          ...randomItem,
          quantity: randomItem.stackable ? Math.floor(Math.random() * 3) + 1 : 1
        });
      }
    }
    
    lootables.push({
      id: `loot_${i}`,
      position: { x: x * 32 + 16, y: y * 32 + 16 },
      items: lootItems,
      type: lootType as any,
      sprite: lootType,
      discovered: false,
      looted: false
    });
  }
  
  return lootables;
};

export const maps = {
  capital_wasteland: createCapitalWasteland,
  northern_wasteland: createNorthernWasteland,
  southern_ruins: createSouthernRuins,
  eastern_districts: createEasternDistricts,
  western_outskirts: createWesternOutskirts
};

export const createAllMaps = (): { [key: string]: GameMap } => {
  const allMaps: { [key: string]: GameMap } = {};
  
  Object.entries(maps).forEach(([key, createMapFn]) => {
    allMaps[key] = createMapFn();
  });
  
  return allMaps;
};