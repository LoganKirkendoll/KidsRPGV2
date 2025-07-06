import { NPC } from '../types/game';
import { items } from './items_data';

export const npcs: NPC[] = [
  {
    id: 'trader_joe',
    name: 'Trader Joe',
    type: 'trader',
    mapId: 'capital_wasteland',
    position: { x: 15 * 32 + 16, y: 20 * 32 + 16 },
    sprite: 'trader',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome, survivor! I have goods to trade. What can I do for you?',
        choices: [
          { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
          { id: 'info', text: 'Tell me about this place', nextNode: 'info' },
          { id: 'leave', text: 'Maybe later', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'info',
        text: 'This wasteland is dangerous, but there are opportunities for those brave enough. I travel between settlements, trading supplies.',
        choices: [
          { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
          { id: 'leave', text: 'Thanks for the info', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Safe travels, friend. Watch out for raiders!',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'stimpak')!,
      items.find(i => i.id === 'combat_knife')!,
      items.find(i => i.id === 'combat_armor')!,
      items.find(i => i.id === 'scrap_metal')!
    ],
    faction: 'neutral',
    isHostile: false
  },
  {
    id: 'quest_giver',
    name: 'Captain Sarah',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 30 * 32 + 16, y: 40 * 32 + 16 },
    sprite: 'captain',
    dialogue: [
      {
        id: 'greeting',
        text: 'Survivor! Our settlement is under constant threat from raiders. We need someone skilled to help us.',
        choices: [
          { id: 'accept', text: 'I\'ll help you deal with the raiders', action: 'give_quest' },
          { id: 'info', text: 'Tell me more about these raiders', nextNode: 'raider_info' },
          { id: 'decline', text: 'I\'m not ready for that', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'raider_info',
        text: 'They\'ve set up camp to the north. Heavily armed and dangerous. They\'ve been attacking our supply convoys.',
        choices: [
          { id: 'accept', text: 'I\'ll take care of them', action: 'give_quest' },
          { id: 'decline', text: 'Sounds too dangerous', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'disappointed',
        text: 'I understand. The wasteland is dangerous. Come back when you\'re ready.',
        choices: []
      },
      {
        id: 'quest_given',
        text: 'Thank you! Clear out that raider camp and we\'ll reward you well.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'raider_threat',
        title: 'Clear the Raider Camp',
        description: 'Eliminate the raider threat near the settlement',
        objectives: [
          {
            id: 'kill_raiders',
            description: 'Eliminate the raider threat (Kill 5 raiders)',
            type: 'kill',
            target: 'raider',
            current: 0,
            required: 5,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'gold', value: 100 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
        ],
        status: 'available',
        requiredLevel: 1
      }
    ],
    faction: 'settlement',
    isHostile: false
  },
  {
    id: 'wanderer',
    name: 'Old Pete',
    type: 'neutral',
    mapId: 'capital_wasteland',
    position: { x: 10 * 32 + 16, y: 60 * 32 + 16 },
    sprite: 'wanderer',
    dialogue: [
      {
        id: 'greeting',
        text: 'Been wandering these wastes for decades, I have. Seen things that would make your hair white.',
        choices: [
          { id: 'stories', text: 'Tell me about what you\'ve seen', nextNode: 'stories' },
          { id: 'advice', text: 'Any advice for a fellow wanderer?', nextNode: 'advice' },
          { id: 'leave', text: 'Take care, old timer', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'stories',
        text: 'Raiders, mutants, machines that still work from before the bombs... This land is full of dangers and wonders.',
        choices: [
          { id: 'advice', text: 'Any survival tips?', nextNode: 'advice' },
          { id: 'leave', text: 'Thanks for sharing', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'advice',
        text: 'Always carry water, never trust a raider, and remember - in the wasteland, your reputation matters more than caps.',
        choices: [
          { id: 'leave', text: 'Wise words, thanks', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'May the road rise up to meet you, wanderer.',
        choices: []
      }
    ],
    faction: 'neutral',
    isHostile: false
  },
  {
    id: 'doctor_smith',
    name: 'Dr. Smith',
    type: 'trader',
    mapId: 'eastern_districts',
    position: { x: 70 * 32 + 16, y: 30 * 32 + 16 },
    sprite: 'doctor',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to my clinic! I have medical supplies and can treat your wounds.',
        choices: [
          { id: 'trade', text: 'Show me your medical supplies', action: 'open_trade' },
          { id: 'heal', text: 'I need healing', action: 'heal_player' },
          { id: 'quest', text: 'Do you need any help?', nextNode: 'quest_offer' },
          { id: 'leave', text: 'Maybe later', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'quest_offer',
        text: 'Actually, yes! I\'m running low on medical supplies. If you could bring me some Stimpaks, I\'d be very grateful.',
        choices: [
          { id: 'accept_quest', text: 'I\'ll help you gather supplies', action: 'give_quest' },
          { id: 'trade', text: 'Let me see what you have first', action: 'open_trade' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Stay safe out there. The wasteland is dangerous.',
        choices: []
      }
    ],
    inventory: [
      { ...items.find(i => i.id === 'stimpak')!, quantity: 3 },
      { ...items.find(i => i.id === 'rad_away')!, quantity: 2 },
      items.find(i => i.id === 'mentats')!
    ],
    quests: [
      {
        id: 'medical_supplies',
        title: 'Medical Emergency',
        description: 'Dr. Smith needs medical supplies for his clinic.',
        objectives: [
          {
            id: 'collect_stimpaks',
            description: 'Collect 5 Stimpaks',
            type: 'collect',
            target: 'stimpak',
            current: 0,
            required: 5,
            completed: false
          },
          {
            id: 'deliver_supplies',
            description: 'Deliver the supplies to Dr. Smith',
            type: 'talk',
            target: 'doctor_smith',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 150 },
          { type: 'gold', value: 75 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'rad_away') }
        ],
        status: 'available',
        requiredLevel: 1
      }
    ],
    faction: 'medical',
    isHostile: false
  },
  {
    id: 'mechanic_bob',
    name: 'Mechanic Bob',
    type: 'trader',
    mapId: 'northern_wasteland',
    position: { x: 50 * 32 + 16, y: 80 * 32 + 16 },
    sprite: 'mechanic',
    dialogue: [
      {
        id: 'greeting',
        text: 'Need some gear fixed or looking for quality weapons? You came to the right place!',
        choices: [
          { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
          { id: 'repair', text: 'Can you repair my equipment?', nextNode: 'repair_info' },
          { id: 'quest', text: 'Got any work for me?', nextNode: 'quest_offer' },
          { id: 'leave', text: 'Just browsing', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'repair_info',
        text: 'I can fix most things, but it\'ll cost you. Bring me scrap metal and I\'ll make your gear good as new.',
        choices: [
          { id: 'trade', text: 'Let\'s see what you have', action: 'open_trade' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'quest_offer',
        text: 'I need someone to collect scrap and electronics for my projects. The wasteland is full of useful junk if you know where to look.',
        choices: [
          { id: 'accept_quest', text: 'I\'ll gather materials for you', action: 'give_quest' },
          { id: 'trade', text: 'What can you offer in return?', action: 'open_trade' },
          { id: 'leave', text: 'Not interested', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Come back when you need quality work done!',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'assault_rifle')!,
      items.find(i => i.id === 'combat_armor')!,
      { ...items.find(i => i.id === 'scrap_metal')!, quantity: 10 },
      { ...items.find(i => i.id === 'electronics')!, quantity: 3 }
    ],
    quests: [
      {
        id: 'scavenger_hunt',
        title: 'Scavenger\'s Dream',
        description: 'Collect valuable scrap materials for the settlement.',
        objectives: [
          {
            id: 'collect_scrap',
            description: 'Collect 10 Scrap Metal',
            type: 'collect',
            target: 'scrap_metal',
            current: 0,
            required: 10,
            completed: false
          },
          {
            id: 'collect_electronics',
            description: 'Collect 3 Electronics',
            type: 'collect',
            target: 'electronics',
            current: 0,
            required: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 180 },
          { type: 'gold', value: 120 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'assault_rifle') }
        ],
        status: 'available',
        requiredLevel: 3
      }
    ],
    faction: 'mechanics',
    isHostile: false
  },
  {
    id: 'vault_overseer',
    name: 'Overseer Martinez',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 85 * 32 + 16, y: 15 * 32 + 16 },
    sprite: 'overseer',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Vault 101. We\'ve been monitoring the surface conditions. The situation is... concerning.',
        choices: [
          { id: 'situation', text: 'What kind of situation?', nextNode: 'vault_mission' },
          { id: 'vault_info', text: 'Tell me about this vault', nextNode: 'vault_info' },
          { id: 'leave', text: 'I should go', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'vault_mission',
        text: 'Our water purification system is failing. We need someone to venture into the old tech facility and retrieve a replacement water chip.',
        choices: [
          { id: 'accept_mission', text: 'I\'ll find your water chip', action: 'give_quest' },
          { id: 'vault_info', text: 'First, tell me about this place', nextNode: 'vault_info' },
          { id: 'decline', text: 'That sounds dangerous', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'vault_info',
        text: 'Vault 101 was designed to house 1000 people indefinitely. We\'ve maintained our technology, but some systems are beginning to fail after all these years.',
        choices: [
          { id: 'accept_mission', text: 'I\'ll help with the water chip', action: 'give_quest' },
          { id: 'leave', text: 'Interesting. I\'ll consider it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'disappointed',
        text: 'I understand your hesitation. The facility is heavily guarded by automated defenses. But without that chip, our people will die.',
        choices: [
          { id: 'accept_mission', text: 'Alright, I\'ll do it', action: 'give_quest' },
          { id: 'leave', text: 'I need time to think', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'The vault\'s doors are always open to you, surface dweller.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'water_chip_quest',
        title: 'The Water Chip',
        description: 'Retrieve a water chip from the old tech facility to save Vault 101.',
        objectives: [
          {
            id: 'find_facility',
            description: 'Locate the old tech facility',
            type: 'explore',
            target: 'tech_facility',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'defeat_security',
            description: 'Disable the facility\'s security robots',
            type: 'kill',
            target: 'robot',
            current: 0,
            required: 3,
            completed: false
          },
          {
            id: 'retrieve_chip',
            description: 'Find and retrieve the water chip',
            type: 'collect',
            target: 'water_chip',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'gold', value: 200 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 5
      }
    ],
    faction: 'vault',
    isHostile: false
  }
];