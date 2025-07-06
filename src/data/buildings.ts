import { GameMap, Position } from '../types/game';
import { buildingTemplates, createBuildingFromTemplate } from './buildingTemplates';

export interface Building {
  id: string;
  name: string;
  type: string;
  description: string;
  interiorMap: GameMap;
  entrancePosition: Position;
  exitPosition: Position;
}

// Create buildings using templates
export const buildings: Building[] = [
  // MEGATON BUILDINGS
  {
    id: 'craterside_supply',
    name: 'Craterside Supply',
    type: 'trader_post',
    description: 'Moira Brown\'s general store in Megaton',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.general_store,
      'craterside_supply',
      'Craterside Supply',
      'capital_wasteland',
      { x: 35 * 32 + 16, y: 25 * 32 + 16 }
    ),
    entrancePosition: { x: 37 * 32 + 16, y: 27 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'megaton_clinic',
    name: 'Megaton Clinic',
    type: 'clinic',
    description: 'Doc Church\'s medical clinic in Megaton',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.clinic,
      'megaton_clinic',
      'Megaton Clinic',
      'capital_wasteland',
      { x: 40 * 32 + 16, y: 35 * 32 + 16 }
    ),
    entrancePosition: { x: 42 * 32 + 16, y: 37 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'megaton_armory',
    name: 'Megaton Armory',
    type: 'weapon_shop',
    description: 'Weapons and armor shop in Megaton',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.weapon_shop,
      'megaton_armory',
      'Megaton Armory',
      'capital_wasteland',
      { x: 45 * 32 + 16, y: 40 * 32 + 16 }
    ),
    entrancePosition: { x: 47 * 32 + 16, y: 42 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 11 * 32 + 16 }
  },
  {
    id: 'megaton_saloon',
    name: 'Megaton Saloon',
    type: 'tavern',
    description: 'The local watering hole in Megaton',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.tavern,
      'megaton_saloon',
      'Megaton Saloon',
      'capital_wasteland',
      { x: 28 * 32 + 16, y: 35 * 32 + 16 }
    ),
    entrancePosition: { x: 30 * 32 + 16, y: 37 * 32 + 16 },
    exitPosition: { x: 9 * 32 + 16, y: 13 * 32 + 16 }
  },
  {
    id: 'megaton_security',
    name: 'Megaton Security Office',
    type: 'security',
    description: 'Sheriff Simms\' security office',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.security_office,
      'megaton_security',
      'Megaton Security Office',
      'capital_wasteland',
      { x: 32 * 32 + 16, y: 28 * 32 + 16 }
    ),
    entrancePosition: { x: 34 * 32 + 16, y: 30 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 7 * 32 + 16 }
  },

  // RIVET CITY BUILDINGS
  {
    id: 'rivet_city_market',
    name: 'Rivet City Market',
    type: 'market',
    description: 'The bustling marketplace of Rivet City',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.general_store,
      'rivet_city_market',
      'Rivet City Market',
      'capital_wasteland',
      { x: 80 * 32 + 16, y: 65 * 32 + 16 }
    ),
    entrancePosition: { x: 84 * 32 + 16, y: 67 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'rivet_city_clinic',
    name: 'Rivet City Medical Bay',
    type: 'clinic',
    description: 'Advanced medical facility in Rivet City',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.clinic,
      'rivet_city_clinic',
      'Rivet City Medical Bay',
      'capital_wasteland',
      { x: 95 * 32 + 16, y: 60 * 32 + 16 }
    ),
    entrancePosition: { x: 97 * 32 + 16, y: 62 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'rivet_city_armory',
    name: 'Rivet City Armory',
    type: 'weapon_shop',
    description: 'High-quality weapons and armor',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.weapon_shop,
      'rivet_city_armory',
      'Rivet City Armory',
      'capital_wasteland',
      { x: 75 * 32 + 16, y: 45 * 32 + 16 }
    ),
    entrancePosition: { x: 77 * 32 + 16, y: 47 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 11 * 32 + 16 }
  },
  {
    id: 'rivet_city_bar',
    name: 'Rivet City Bar',
    type: 'tavern',
    description: 'The Muddy Rudder - Rivet City\'s finest establishment',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.tavern,
      'rivet_city_bar',
      'The Muddy Rudder',
      'capital_wasteland',
      { x: 88 * 32 + 16, y: 55 * 32 + 16 }
    ),
    entrancePosition: { x: 90 * 32 + 16, y: 57 * 32 + 16 },
    exitPosition: { x: 9 * 32 + 16, y: 13 * 32 + 16 }
  },
  {
    id: 'rivet_city_security',
    name: 'Rivet City Security',
    type: 'security',
    description: 'Rivet City security headquarters',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.security_office,
      'rivet_city_security',
      'Rivet City Security',
      'capital_wasteland',
      { x: 100 * 32 + 16, y: 45 * 32 + 16 }
    ),
    entrancePosition: { x: 102 * 32 + 16, y: 47 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 7 * 32 + 16 }
  },

  // CANTERBURY COMMONS BUILDINGS
  {
    id: 'canterbury_trading_post',
    name: 'Canterbury Commons Trading Post',
    type: 'trader_post',
    description: 'Uncle Roe\'s caravan trading headquarters',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.general_store,
      'canterbury_trading_post',
      'Canterbury Commons Trading Post',
      'capital_wasteland',
      { x: 65 * 32 + 16, y: 80 * 32 + 16 }
    ),
    entrancePosition: { x: 67 * 32 + 16, y: 82 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'canterbury_clinic',
    name: 'Canterbury Medical',
    type: 'clinic',
    description: 'Small medical clinic in Canterbury Commons',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.clinic,
      'canterbury_clinic',
      'Canterbury Medical',
      'capital_wasteland',
      { x: 50 * 32 + 16, y: 85 * 32 + 16 }
    ),
    entrancePosition: { x: 52 * 32 + 16, y: 87 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'canterbury_inn',
    name: 'Canterbury Inn',
    type: 'tavern',
    description: 'Rest stop for weary travelers',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.tavern,
      'canterbury_inn',
      'Canterbury Inn',
      'capital_wasteland',
      { x: 58 * 32 + 16, y: 78 * 32 + 16 }
    ),
    entrancePosition: { x: 60 * 32 + 16, y: 80 * 32 + 16 },
    exitPosition: { x: 9 * 32 + 16, y: 13 * 32 + 16 }
  },

  // TENPENNY TOWER BUILDINGS
  {
    id: 'tenpenny_lobby',
    name: 'Tenpenny Tower Lobby',
    type: 'luxury',
    description: 'Luxurious lobby of Tenpenny Tower',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.tavern,
      'tenpenny_lobby',
      'Tenpenny Tower Lobby',
      'capital_wasteland',
      { x: 15 * 32 + 16, y: 80 * 32 + 16 }
    ),
    entrancePosition: { x: 19 * 32 + 16, y: 85 * 32 + 16 },
    exitPosition: { x: 9 * 32 + 16, y: 13 * 32 + 16 }
  },
  {
    id: 'tenpenny_shop',
    name: 'Tenpenny Tower Shop',
    type: 'luxury_store',
    description: 'High-end goods for the wealthy',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.general_store,
      'tenpenny_shop',
      'Tenpenny Tower Shop',
      'capital_wasteland',
      { x: 10 * 32 + 16, y: 95 * 32 + 16 }
    ),
    entrancePosition: { x: 12 * 32 + 16, y: 97 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'tenpenny_clinic',
    name: 'Tenpenny Medical Suite',
    type: 'luxury_clinic',
    description: 'Premium medical care for tower residents',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.clinic,
      'tenpenny_clinic',
      'Tenpenny Medical Suite',
      'capital_wasteland',
      { x: 25 * 32 + 16, y: 92 * 32 + 16 }
    ),
    entrancePosition: { x: 27 * 32 + 16, y: 94 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 9 * 32 + 16 }
  },

  // AREFU BUILDINGS
  {
    id: 'arefu_store',
    name: 'Arefu General Store',
    type: 'general_store',
    description: 'Small general store in Arefu',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.general_store,
      'arefu_store',
      'Arefu General Store',
      'capital_wasteland',
      { x: 85 * 32 + 16, y: 25 * 32 + 16 }
    ),
    entrancePosition: { x: 87 * 32 + 16, y: 27 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'arefu_clinic',
    name: 'Arefu Medical',
    type: 'clinic',
    description: 'Basic medical care in Arefu',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.clinic,
      'arefu_clinic',
      'Arefu Medical',
      'capital_wasteland',
      { x: 95 * 32 + 16, y: 20 * 32 + 16 }
    ),
    entrancePosition: { x: 97 * 32 + 16, y: 22 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 9 * 32 + 16 }
  },

  // SCATTERED BUILDINGS
  {
    id: 'scrapyard_shop',
    name: 'Scrapyard Trading Post',
    type: 'scrap_dealer',
    description: 'Dealing in salvage and scrap',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.general_store,
      'scrapyard_shop',
      'Scrapyard Trading Post',
      'capital_wasteland',
      { x: 70 * 32 + 16, y: 25 * 32 + 16 }
    ),
    entrancePosition: { x: 72 * 32 + 16, y: 27 * 32 + 16 },
    exitPosition: { x: 6 * 32 + 16, y: 9 * 32 + 16 }
  },
  {
    id: 'lone_wanderer_clinic',
    name: 'Wasteland Medical',
    type: 'field_clinic',
    description: 'Mobile medical services',
    interiorMap: createBuildingFromTemplate(
      buildingTemplates.clinic,
      'lone_wanderer_clinic',
      'Wasteland Medical',
      'capital_wasteland',
      { x: 105 * 32 + 16, y: 85 * 32 + 16 }
    ),
    entrancePosition: { x: 107 * 32 + 16, y: 87 * 32 + 16 },
    exitPosition: { x: 7 * 32 + 16, y: 9 * 32 + 16 }
  }
];

export const getBuildingById = (id: string): Building | undefined => {
  return buildings.find(building => building.id === id);
};

export const getBuildingByPosition = (position: Position, tolerance: number = 48): Building | undefined => {
  return buildings.find(building => {
    const distance = Math.sqrt(
      Math.pow(building.entrancePosition.x - position.x, 2) + 
      Math.pow(building.entrancePosition.y - position.y, 2)
    );
    return distance <= tolerance;
  });
};