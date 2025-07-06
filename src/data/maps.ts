import { GameMap, Tile, NPC, Enemy, LootableItem, MapConnection } from '../types/game';
import { items } from './items_data';
import { npcs } from './npcs_data';
import { enemies } from './enemies';
import { buildings } from './buildings';

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

export const createBuilding = (tiles: Tile[][], x: number, y: number, width: number, height: number, type: string, name: string, buildingId?: string) => {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const tileX = x + dx;
      const tileY = y + dy;
      if (tileX < tiles[0].length && tileY < tiles.length) {
        tiles[tileY][tileX] = {
          ...tiles[tileY][tileX],
          type: 'building' as any,
          walkable: false,
          buildingType: type,
          buildingName: name,
          buildingId: buildingId,
          isEnterable: !!buildingId,
          description: `${name} - ${type}`
        };
        
        // Create entrance
        if (dx === Math.floor(width / 2) && dy === height - 1) {
          tiles[tileY][tileX].walkable = true;
          tiles[tileY][tileX].isEntrance = true;
        }
      }
    }
  }
};

// Create a path between two points
const createPath = (tiles: Tile[][], startX: number, startY: number, endX: number, endY: number, pathType: string = 'dirt') => {
  const width = tiles[0].length;
  const height = tiles.length;
  
  let currentX = startX;
  let currentY = startY;
  
  // Create L-shaped path (horizontal first, then vertical)
  while (currentX !== endX) {
    if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
      if (tiles[currentY][currentX].type !== 'building' && tiles[currentY][currentX].type !== 'water') {
        tiles[currentY][currentX] = createTile(currentX, currentY, pathType, true);
      }
    }
    currentX += currentX < endX ? 1 : -1;
  }
  
  while (currentY !== endY) {
    if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
      if (tiles[currentY][currentX].type !== 'building' && tiles[currentY][currentX].type !== 'water') {
        tiles[currentY][currentX] = createTile(currentX, currentY, pathType, true);
      }
    }
    currentY += currentY < endY ? 1 : -1;
  }
};

// Create a main road across the map
const createMainRoad = (tiles: Tile[][], direction: 'horizontal' | 'vertical', position: number, roadType: string = 'stone') => {
  const width = tiles[0].length;
  const height = tiles.length;
  
  if (direction === 'horizontal' && position >= 0 && position < height) {
    for (let x = 0; x < width; x++) {
      if (tiles[position][x].type !== 'building' && tiles[position][x].type !== 'water') {
        tiles[position][x] = createTile(x, position, roadType, true);
      }
    }
  } else if (direction === 'vertical' && position >= 0 && position < width) {
    for (let y = 0; y < height; y++) {
      if (tiles[y][position].type !== 'building' && tiles[y][position].type !== 'water') {
        tiles[y][position] = createTile(position, y, roadType, true);
      }
    }
  }
};

// Create area around building with appropriate terrain
const createBuildingArea = (tiles: Tile[][], centerX: number, centerY: number, radius: number, terrainType: string) => {
  const width = tiles[0].length;
  const height = tiles.length;
  
  for (let y = Math.max(0, centerY - radius); y <= Math.min(height - 1, centerY + radius); y++) {
    for (let x = Math.max(0, centerX - radius); x <= Math.min(width - 1, centerX + radius); x++) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distance <= radius && tiles[y][x].type !== 'building' && tiles[y][x].type !== 'water') {
        tiles[y][x] = createTile(x, y, terrainType, true);
      }
    }
  }
};

export const createLootables = (width: number, height: number, density: number = 0.005): LootableItem[] => {
  const lootables: LootableItem[] = [];
  const count = Math.floor(width * height * density);
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    
    const lootTypes = ['container', 'corpse', 'cache'];
    const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
    
    // Most lootables have 1 item, rarely 2, very rarely 3
    const rand = Math.random();
    const numItems = rand < 0.7 ? 1 : rand < 0.95 ? 2 : 3;
    const lootItems = [];
    
    for (let j = 0; j < numItems; j++) {
      // Heavily weight towards common/poor items
      const lootTable = generateLootTable();
      const randomItem = selectFromLootTable(lootTable);
      
      lootItems.push({
        ...randomItem,
        quantity: randomItem.stackable ? (Math.random() < 0.3 ? 2 : 1) : 1
      });
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

// Generate weighted loot table favoring poor quality items
const generateLootTable = () => {
  const commonItems = items.filter(i => i.rarity === 'common');
  const uncommonItems = items.filter(i => i.rarity === 'uncommon');
  const rareItems = items.filter(i => i.rarity === 'rare');
  const epicItems = items.filter(i => i.rarity === 'epic');
  const legendaryItems = items.filter(i => i.rarity === 'legendary');
  
  // Create weighted loot table
  const lootTable = [];
  
  // 70% chance for common items (mostly scrap and basic materials)
  for (let i = 0; i < 70; i++) {
    lootTable.push(...commonItems.filter(item => 
      item.type === 'material' || 
      (item.type === 'consumable' && item.value <= 20)
    ));
  }
  
  // 20% chance for slightly better common items
  for (let i = 0; i < 20; i++) {
    lootTable.push(...commonItems);
  }
  
  // 7% chance for uncommon items
  for (let i = 0; i < 7; i++) {
    lootTable.push(...uncommonItems);
  }
  
  // 2.5% chance for rare items
  for (let i = 0; i < 2; i++) {
    lootTable.push(...rareItems);
  }
  
  // 0.4% chance for epic items
  if (Math.random() < 0.004) {
    lootTable.push(...epicItems);
  }
  
  // 0.1% chance for legendary items
  if (Math.random() < 0.001) {
    lootTable.push(...legendaryItems);
  }
  
  return lootTable;
};

const selectFromLootTable = (lootTable: any[]) => {
  if (lootTable.length === 0) {
    // Fallback to scrap metal if table is empty
    return items.find(i => i.id === 'scrap_metal') || items[0];
  }
  return lootTable[Math.floor(Math.random() * lootTable.length)];
};

// CAPITAL WASTELAND - Starting area with proper paths
export const createCapitalWasteland = (): GameMap => {
  const width = 120;
  const height = 120;
  const tiles: Tile[][] = [];
  
  // Initialize with grass as base terrain
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'grass', true));
    }
    tiles.push(row);
  }
  
  // Add some natural variation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      if (random < 0.15) {
        tiles[y][x] = createTile(x, y, 'dirt', true);
      } else if (random < 0.2) {
        tiles[y][x] = createTile(x, y, 'stone', true);
      }
    }
  }
  
  // Add water features (small ponds)
  const waterAreas = [
    { x: 20, y: 20, radius: 4 },
    { x: 90, y: 70, radius: 3 },
    { x: 50, y: 100, radius: 3 },
    { x: 80, y: 30, radius: 2 }
  ];
  
  waterAreas.forEach(area => {
    for (let y = Math.max(0, area.y - area.radius); y <= Math.min(height - 1, area.y + area.radius); y++) {
      for (let x = Math.max(0, area.x - area.radius); x <= Math.min(width - 1, area.x + area.radius); x++) {
        const distance = Math.sqrt((x - area.x) ** 2 + (y - area.y) ** 2);
        if (distance <= area.radius) {
          tiles[y][x] = createTile(x, y, 'water', false);
        }
      }
    }
  });
  
  // Create main roads
  createMainRoad(tiles, 'horizontal', 60, 'stone'); // Main east-west road
  createMainRoad(tiles, 'vertical', 60, 'stone');   // Main north-south road
  
  // Create multiple cities and settlements
  const buildings = [
    // MEGATON CITY - Main settlement
    { x: 30, y: 30, width: 8, height: 6, type: 'settlement', name: 'Megaton City Hall' },
    { x: 25, y: 40, width: 6, height: 4, type: 'market', name: 'Megaton Market', buildingId: 'megaton_saloon' },
    { x: 40, y: 35, width: 5, height: 4, type: 'clinic', name: 'Megaton Medical', buildingId: 'megaton_clinic' },
    { x: 35, y: 25, width: 4, height: 3, type: 'trader_post', name: 'Craterside Supply', buildingId: 'craterside_supply' },
    { x: 45, y: 40, width: 4, height: 3, type: 'workshop', name: 'Megaton Armory', buildingId: 'megaton_armory' },
    { x: 28, y: 35, width: 4, height: 3, type: 'tavern', name: 'Megaton Saloon', buildingId: 'megaton_saloon' },
    { x: 32, y: 28, width: 4, height: 3, type: 'security', name: 'Security Office', buildingId: 'megaton_security' },
    
    // RIVET CITY - Eastern settlement
    { x: 85, y: 50, width: 12, height: 8, type: 'city_hall', name: 'Rivet City Council', buildingId: 'rivet_city_bar' },
    { x: 80, y: 65, width: 8, height: 5, type: 'market', name: 'Rivet City Market', buildingId: 'rivet_city_market' },
    { x: 95, y: 60, width: 6, height: 4, type: 'clinic', name: 'Rivet City Medical', buildingId: 'rivet_city_clinic' },
    { x: 75, y: 45, width: 5, height: 4, type: 'trader_post', name: 'Rivet City Armory', buildingId: 'rivet_city_armory' },
    { x: 100, y: 45, width: 4, height: 3, type: 'workshop', name: 'Rivet City Security', buildingId: 'rivet_city_security' },
    
    // CANTERBURY COMMONS - Central trading hub
    { x: 55, y: 75, width: 6, height: 4, type: 'market', name: 'Canterbury Inn', buildingId: 'canterbury_inn' },
    { x: 65, y: 80, width: 5, height: 3, type: 'trader_post', name: 'Uncle Roe\'s Trading', buildingId: 'canterbury_trading_post' },
    { x: 50, y: 85, width: 4, height: 3, type: 'clinic', name: 'Canterbury Medical', buildingId: 'canterbury_clinic' },
    
    // TENPENNY TOWER - Luxury settlement
    { x: 15, y: 80, width: 8, height: 10, type: 'luxury_tower', name: 'Tenpenny Tower', buildingId: 'tenpenny_lobby' },
    { x: 10, y: 95, width: 5, height: 3, type: 'market', name: 'Tenpenny Shop', buildingId: 'tenpenny_shop' },
    { x: 25, y: 92, width: 4, height: 3, type: 'clinic', name: 'Tenpenny Medical', buildingId: 'tenpenny_clinic' },
    
    // AREFU - Small settlement
    { x: 90, y: 15, width: 5, height: 4, type: 'settlement', name: 'Arefu Town Hall', buildingId: 'arefu_store' },
    { x: 85, y: 25, width: 4, height: 3, type: 'trader_post', name: 'Arefu Store', buildingId: 'arefu_store' },
    { x: 95, y: 20, width: 3, height: 2, type: 'clinic', name: 'Arefu Medical', buildingId: 'arefu_clinic' },
    
    // VAULT 101
    { x: 15, y: 15, width: 8, height: 6, type: 'vault', name: 'Vault 101' },
    
    // Scattered buildings
    { x: 70, y: 25, width: 4, height: 3, type: 'workshop', name: 'Scrapyard Shop', buildingId: 'scrapyard_shop' },
    { x: 25, y: 70, width: 3, height: 2, type: 'trader_post', name: 'Lone Wanderer Trading' },
    { x: 105, y: 85, width: 4, height: 3, type: 'clinic', name: 'Wasteland Medical', buildingId: 'lone_wanderer_clinic' }
  ];
  
  buildings.forEach(building => {
    // Create building area with dirt/stone
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 8, 'dirt');
    
    // Create the building
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name, building.buildingId);
    
    // Connect to main roads
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    const buildingCenterY = building.y + Math.floor(building.height / 2);
    createPath(tiles, buildingCenterX, buildingCenterY, 60, 60, 'dirt');
  });
  
  // Add some ruins scattered around
  const ruinAreas = [
    { x: 10, y: 50, radius: 5 },
    { x: 100, y: 20, radius: 4 },
    { x: 70, y: 100, radius: 4 },
    { x: 40, y: 10, radius: 3 },
    { x: 110, y: 110, radius: 3 }
  ];
  
  ruinAreas.forEach(area => {
    createBuildingArea(tiles, area.x, area.y, area.radius, 'ruins');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'northern_wasteland',
      fromPosition: { x: 60 * 32, y: 0 },
      toPosition: { x: 60 * 32, y: 119 * 32 }
    },
    {
      direction: 'south',
      targetMapId: 'southern_ruins',
      fromPosition: { x: 60 * 32, y: 119 * 32 },
      toPosition: { x: 60 * 32, y: 0 }
    },
    {
      direction: 'east',
      targetMapId: 'eastern_districts',
      fromPosition: { x: 119 * 32, y: 60 * 32 },
      toPosition: { x: 0, y: 60 * 32 }
    },
    {
      direction: 'west',
      targetMapId: 'western_outskirts',
      fromPosition: { x: 0, y: 60 * 32 },
      toPosition: { x: 119 * 32, y: 60 * 32 }
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
    enemies: enemies.filter(enemy => !enemy.mapId || enemy.mapId === 'capital_wasteland'),
    lootables: createLootables(width, height, 0.003), // Very rare lootables
    connections
  };
};

// NORTHERN WASTELAND - Industrial area with proper road network
export const createNorthernWasteland = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  // Initialize with dirt as base (industrial wasteland)
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'dirt', true));
    }
    tiles.push(row);
  }
  
  // Add industrial terrain variation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      if (random < 0.3) {
        tiles[y][x] = createTile(x, y, 'stone', true);
      } else if (random < 0.4) {
        tiles[y][x] = createTile(x, y, 'ruins', true);
      }
    }
  }
  
  // Create industrial road network
  createMainRoad(tiles, 'horizontal', 20, 'stone');
  createMainRoad(tiles, 'horizontal', 40, 'stone');
  createMainRoad(tiles, 'vertical', 25, 'stone');
  createMainRoad(tiles, 'vertical', 45, 'stone');
  
  // Industrial buildings with proper connections
  const buildings = [
    { x: 20, y: 20, width: 12, height: 8, type: 'factory', name: 'Old Factory' },
    { x: 40, y: 35, width: 8, height: 6, type: 'power_plant', name: 'Power Station' },
    { x: 10, y: 45, width: 6, height: 4, type: 'warehouse', name: 'Supply Depot' }
  ];
  
  buildings.forEach(building => {
    // Create industrial area around building
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 6, 'stone');
    
    // Create the building
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to nearest main road
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    const buildingCenterY = building.y + Math.floor(building.height / 2);
    
    // Find nearest road
    let nearestRoadY = 20;
    if (Math.abs(buildingCenterY - 40) < Math.abs(buildingCenterY - 20)) {
      nearestRoadY = 40;
    }
    
    createPath(tiles, buildingCenterX, buildingCenterY, buildingCenterX, nearestRoadY, 'stone');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'south',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 30 * 32, y: 59 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
    },
    {
      direction: 'north',
      targetMapId: 'the_pitt',
      fromPosition: { x: 30 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
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
    enemies: enemies.filter(enemy => enemy.mapId === 'northern_wasteland'),
    lootables: createLootables(width, height, 0.008), // Slightly more in industrial areas
    connections
  };
};

// SOUTHERN RUINS - Urban decay with street grid
export const createSouthernRuins = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  // Initialize with ruins as base
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'ruins', true));
    }
    tiles.push(row);
  }
  
  // Create city street grid
  for (let i = 10; i < width; i += 10) {
    createMainRoad(tiles, 'vertical', i, 'stone');
  }
  for (let i = 10; i < height; i += 10) {
    createMainRoad(tiles, 'horizontal', i, 'stone');
  }
  
  // Add building variation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiles[y][x].type === 'ruins') {
        const random = Math.random();
        if (random < 0.2) {
          tiles[y][x] = createTile(x, y, 'dirt', true);
        } else if (random < 0.3) {
          tiles[y][x] = createTile(x, y, 'stone', true);
        }
      }
    }
  }
  
  // Urban buildings
  const buildings = [
    { x: 15, y: 15, width: 10, height: 8, type: 'city_hall', name: 'Ruined City Hall' },
    { x: 35, y: 25, width: 8, height: 6, type: 'hospital', name: 'Abandoned Hospital' },
    { x: 45, y: 45, width: 6, height: 4, type: 'school', name: 'Old School' }
  ];
  
  buildings.forEach(building => {
    // Create urban area around building
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 5, 'stone');
    
    // Create the building
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 30 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
    },
    {
      direction: 'south',
      targetMapId: 'point_lookout',
      fromPosition: { x: 30 * 32, y: 59 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
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
    enemies: enemies.filter(enemy => enemy.mapId === 'southern_ruins'),
    lootables: createLootables(width, height, 0.006), // Moderate in ruins
    connections
  };
};

// EASTERN DISTRICTS - Commercial area with organized layout
export const createEasternDistricts = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  // Initialize with stone as base (developed area)
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'stone', true));
    }
    tiles.push(row);
  }
  
  // Add some variation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      if (random < 0.2) {
        tiles[y][x] = createTile(x, y, 'dirt', true);
      } else if (random < 0.3) {
        tiles[y][x] = createTile(x, y, 'grass', true);
      }
    }
  }
  
  // Create main commercial boulevards
  createMainRoad(tiles, 'horizontal', 30, 'stone');
  createMainRoad(tiles, 'vertical', 30, 'stone');
  
  // Commercial buildings
  const buildings = [
    { x: 20, y: 20, width: 15, height: 10, type: 'rivet_city', name: 'Rivet City' },
    { x: 10, y: 40, width: 8, height: 6, type: 'market', name: 'Trading Post' },
    { x: 45, y: 15, width: 6, height: 4, type: 'clinic', name: 'Medical Center' }
  ];
  
  buildings.forEach(building => {
    // Create developed area around building
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 8, 'stone');
    
    // Create the building
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to main roads
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    const buildingCenterY = building.y + Math.floor(building.height / 2);
    createPath(tiles, buildingCenterX, buildingCenterY, 30, 30, 'stone');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'west',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 0, y: 30 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
    },
    {
      direction: 'east',
      targetMapId: 'citadel',
      fromPosition: { x: 59 * 32, y: 30 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
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
    enemies: enemies.filter(enemy => enemy.mapId === 'eastern_districts'),
    lootables: createLootables(width, height, 0.004), // Rare in developed areas
    connections
  };
};

// WESTERN OUTSKIRTS - Wilderness with natural paths
export const createWesternOutskirts = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  // Initialize with grass as base
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'grass', true));
    }
    tiles.push(row);
  }
  
  // Add natural terrain variation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      if (random < 0.3) {
        tiles[y][x] = createTile(x, y, 'dirt', true);
      } else if (random < 0.4) {
        tiles[y][x] = createTile(x, y, 'stone', true);
      }
    }
  }
  
  // Add water features
  const waterAreas = [
    { x: 20, y: 15, radius: 4 },
    { x: 45, y: 40, radius: 3 }
  ];
  
  waterAreas.forEach(area => {
    for (let y = Math.max(0, area.y - area.radius); y <= Math.min(height - 1, area.y + area.radius); y++) {
      for (let x = Math.max(0, area.x - area.radius); x <= Math.min(width - 1, area.x + area.radius); x++) {
        const distance = Math.sqrt((x - area.x) ** 2 + (y - area.y) ** 2);
        if (distance <= area.radius) {
          tiles[y][x] = createTile(x, y, 'water', false);
        }
      }
    }
  });
  
  // Create natural trail
  createPath(tiles, 0, 30, 59, 30, 'dirt');
  
  // Wilderness outposts
  const buildings = [
    { x: 15, y: 25, width: 6, height: 4, type: 'ranger_station', name: 'Ranger Outpost' },
    { x: 40, y: 35, width: 5, height: 3, type: 'cabin', name: 'Survivor\'s Cabin' },
    { x: 25, y: 50, width: 4, height: 3, type: 'bunker', name: 'Hidden Bunker' }
  ];
  
  buildings.forEach(building => {
    // Create cleared area around building
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 4, 'dirt');
    
    // Create the building
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to main trail
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    const buildingCenterY = building.y + Math.floor(building.height / 2);
    createPath(tiles, buildingCenterX, buildingCenterY, buildingCenterX, 30, 'dirt');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'east',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 59 * 32, y: 30 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
    },
    {
      direction: 'west',
      targetMapId: 'metro_tunnels',
      fromPosition: { x: 0, y: 30 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
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
    enemies: enemies.filter(enemy => enemy.mapId === 'western_outskirts'),
    lootables: createLootables(width, height, 0.002), // Very rare in wilderness
    connections
  };
};

// THE PITT - Industrial wasteland with proper layout
export const createThePitt = (): GameMap => {
  const width = 50;
  const height = 40;
  const tiles: Tile[][] = [];
  
  // Initialize with dirt/ruins
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'dirt', true));
    }
    tiles.push(row);
  }
  
  // Add industrial terrain
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      if (random < 0.4) {
        tiles[y][x] = createTile(x, y, 'ruins', true);
      } else if (random < 0.5) {
        tiles[y][x] = createTile(x, y, 'stone', true);
      }
    }
  }
  
  // Create main industrial road
  createMainRoad(tiles, 'horizontal', 20, 'stone');
  
  // Industrial buildings
  const buildings = [
    { x: 15, y: 15, width: 8, height: 6, type: 'steel_mill', name: 'The Mill' },
    { x: 30, y: 20, width: 6, height: 4, type: 'slave_quarters', name: 'Worker Barracks' }
  ];
  
  buildings.forEach(building => {
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 5, 'stone');
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to main road
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    createPath(tiles, buildingCenterX, building.y + building.height, buildingCenterX, 20, 'stone');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'south',
      targetMapId: 'northern_wasteland',
      fromPosition: { x: 25 * 32, y: 39 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
    }
  ];
  
  return {
    id: 'the_pitt',
    width,
    height,
    tiles,
    name: 'The Pitt',
    bgMusic: 'industrial_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'the_pitt'),
    enemies: enemies.filter(enemy => enemy.mapId === 'the_pitt'),
    lootables: createLootables(width, height, 0.007), // Industrial scrap
    connections
  };
};

// POINT LOOKOUT - Swampland with boardwalks
export const createPointLookout = (): GameMap => {
  const width = 45;
  const height = 45;
  const tiles: Tile[][] = [];
  
  // Initialize with grass/water mix
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      if (random < 0.4) {
        row.push(createTile(x, y, 'water', false));
      } else {
        row.push(createTile(x, y, 'grass', true));
      }
    }
    tiles.push(row);
  }
  
  // Create boardwalk paths over water
  createMainRoad(tiles, 'horizontal', 22, 'stone');
  createMainRoad(tiles, 'vertical', 22, 'stone');
  
  // Make boardwalks walkable even over water
  for (let x = 0; x < width; x++) {
    tiles[22][x].walkable = true;
  }
  for (let y = 0; y < height; y++) {
    tiles[y][22].walkable = true;
  }
  
  // Swamp settlements
  const buildings = [
    { x: 15, y: 15, width: 6, height: 4, type: 'mansion', name: 'Calvert Mansion' },
    { x: 30, y: 25, width: 4, height: 3, type: 'lighthouse', name: 'Point Lookout Lighthouse' }
  ];
  
  buildings.forEach(building => {
    // Create dry land around buildings
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 3, 'dirt');
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to boardwalks
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    const buildingCenterY = building.y + Math.floor(building.height / 2);
    createPath(tiles, buildingCenterX, buildingCenterY, 22, 22, 'stone');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'southern_ruins',
      fromPosition: { x: 22 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
    }
  ];
  
  return {
    id: 'point_lookout',
    width,
    height,
    tiles,
    name: 'Point Lookout',
    bgMusic: 'swamp_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'point_lookout'),
    enemies: enemies.filter(enemy => enemy.mapId === 'point_lookout'),
    lootables: createLootables(width, height, 0.003), // Rare in swampland
    connections
  };
};

// CITADEL - Brotherhood stronghold with organized layout
export const createCitadel = (): GameMap => {
  const width = 40;
  const height = 40;
  const tiles: Tile[][] = [];
  
  // Initialize with stone (military base)
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'stone', true));
    }
    tiles.push(row);
  }
  
  // Create organized military layout
  createMainRoad(tiles, 'horizontal', 20, 'stone');
  createMainRoad(tiles, 'vertical', 20, 'stone');
  
  // Brotherhood facilities
  const buildings = [
    { x: 15, y: 15, width: 10, height: 8, type: 'citadel', name: 'The Citadel' },
    { x: 5, y: 5, width: 6, height: 4, type: 'armory', name: 'Brotherhood Armory' }
  ];
  
  buildings.forEach(building => {
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to main roads
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    const buildingCenterY = building.y + Math.floor(building.height / 2);
    createPath(tiles, buildingCenterX, buildingCenterY, 20, 20, 'stone');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'west',
      targetMapId: 'eastern_districts',
      fromPosition: { x: 0, y: 20 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'citadel',
    width,
    height,
    tiles,
    name: 'The Citadel',
    bgMusic: 'brotherhood_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'citadel'),
    enemies: enemies.filter(enemy => enemy.mapId === 'citadel'),
    lootables: createLootables(width, height, 0.001), // Very rare in military base
    connections
  };
};

// METRO TUNNELS - Underground system with rail lines
export const createMetroTunnels = (): GameMap => {
  const width = 80;
  const height = 25;
  const tiles: Tile[][] = [];
  
  // Initialize with ruins (underground)
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'ruins', true));
    }
    tiles.push(row);
  }
  
  // Create main tunnel lines
  createMainRoad(tiles, 'horizontal', 12, 'stone'); // Main tunnel
  createMainRoad(tiles, 'horizontal', 8, 'stone');  // Secondary tunnel
  createMainRoad(tiles, 'horizontal', 16, 'stone'); // Secondary tunnel
  
  // Add water hazards
  for (let x = 30; x < 35; x++) {
    for (let y = 10; y < 15; y++) {
      tiles[y][x] = createTile(x, y, 'water', false);
    }
  }
  
  // Metro stations
  const buildings = [
    { x: 15, y: 10, width: 6, height: 4, type: 'metro_station', name: 'Dupont Circle Station' },
    { x: 40, y: 8, width: 6, height: 4, type: 'metro_station', name: 'Gallery Place Station' },
    { x: 65, y: 12, width: 6, height: 4, type: 'metro_station', name: 'Union Station' }
  ];
  
  buildings.forEach(building => {
    createBuildingArea(tiles, building.x + Math.floor(building.width / 2), building.y + Math.floor(building.height / 2), 3, 'stone');
    createBuilding(tiles, building.x, building.y, building.width, building.height, building.type, building.name);
    
    // Connect to main tunnel
    const buildingCenterX = building.x + Math.floor(building.width / 2);
    createPath(tiles, buildingCenterX, building.y + building.height, buildingCenterX, 12, 'stone');
  });
  
  const connections: MapConnection[] = [
    {
      direction: 'east',
      targetMapId: 'western_outskirts',
      fromPosition: { x: 79 * 32, y: 12 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'metro_tunnels',
    width,
    height,
    tiles,
    name: 'Metro Tunnels',
    bgMusic: 'underground_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'metro_tunnels'),
    enemies: enemies.filter(enemy => enemy.mapId === 'metro_tunnels'),
    lootables: createLootables(width, height, 0.01), // Moderate in abandoned tunnels
    connections
  };
};

export const maps = {
  capital_wasteland: createCapitalWasteland,
  northern_wasteland: createNorthernWasteland,
  southern_ruins: createSouthernRuins,
  eastern_districts: createEasternDistricts,
  western_outskirts: createWesternOutskirts,
  the_pitt: createThePitt,
  point_lookout: createPointLookout,
  citadel: createCitadel,
  metro_tunnels: createMetroTunnels
};

export const createAllMaps = (): { [key: string]: GameMap } => {
  const allMaps: { [key: string]: GameMap } = {};
  
  Object.entries(maps).forEach(([key, createMapFn]) => {
    allMaps[key] = createMapFn();
  });
  
  return allMaps;
};