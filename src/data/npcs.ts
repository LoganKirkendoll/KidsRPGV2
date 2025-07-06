import { NPC, DialogueNode } from '../types/game';
import { items } from './items_data';

export const npcs: NPC[] = [
  // CAPITAL WASTELAND NPCs
  {
    id: 'overseer_almodovar',
    name: 'Overseer Almodovar',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 19 * 32 + 16, y: 18 * 32 + 16 },
    sprite: 'overseer',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Vault 101, the jewel of Vault-Tec! I am Overseer Almodovar. The outside world is a dangerous place, but you seem to have survived it.',
        choices: [
          { id: 'main_quest', text: 'I need to find my father', nextNode: 'main_quest' },
          { id: 'vault_info', text: 'Tell me about Vault 101', nextNode: 'vault_info' },
          { id: 'leave', text: 'I should go', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'main_quest',
        text: 'Your father... James? He left the vault recently, breaking our most sacred rule. He spoke of Project Purity - some foolish dream about purifying the wasteland\'s water. You might find answers in Megaton.',
        choices: [
          { id: 'accept_main', text: 'I\'ll find him and bring him back', action: 'give_quest' },
          { id: 'vault_info', text: 'First, tell me about this place', nextNode: 'vault_info' },
          { id: 'leave', text: 'Thank you for the information', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'vault_info',
        text: 'Vault 101 was designed as a control vault - meant to stay sealed forever. We have maintained order for 200 years, but your father\'s departure has... complicated things.',
        choices: [
          { id: 'main_quest', text: 'About my father...', nextNode: 'main_quest' },
          { id: 'leave', text: 'I understand', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Remember, the outside world is harsh and unforgiving. Trust no one completely, and always be prepared.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'escape_vault_101',
        title: 'Escape!',
        description: 'Escape from Vault 101 and find your father in the Capital Wasteland.',
        objectives: [
          {
            id: 'leave_vault',
            description: 'Exit Vault 101',
            type: 'explore',
            target: 'vault_exit',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'reach_megaton',
            description: 'Travel to Megaton',
            type: 'explore',
            target: 'megaton',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'pip_boy') }
        ],
        status: 'available',
        requiredLevel: 1
      }
    ],
    faction: 'vault_101',
    isHostile: false
  },

  {
    id: 'sheriff_lucas',
    name: 'Sheriff Lucas Simms',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 44 * 32 + 16, y: 22 * 32 + 16 },
    sprite: 'sheriff',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Megaton, stranger. I\'m Sheriff Lucas Simms. We don\'t get many vault dwellers around here. You looking for someone?',
        choices: [
          { id: 'father_search', text: 'I\'m looking for my father, James', nextNode: 'father_search' },
          { id: 'megaton_bomb', text: 'What\'s with the bomb in the center of town?', nextNode: 'megaton_bomb' },
          { id: 'town_info', text: 'Tell me about Megaton', nextNode: 'town_info' },
          { id: 'leave', text: 'Just passing through', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'father_search',
        text: 'James? Yeah, I remember him. Middle-aged fellow, talked about clean water and science. He was asking about Galaxy News Radio and Three Dog. You might want to check there.',
        choices: [
          { id: 'gnr_location', text: 'Where can I find Galaxy News Radio?', nextNode: 'gnr_location' },
          { id: 'megaton_bomb', text: 'About that bomb...', nextNode: 'megaton_bomb' },
          { id: 'leave', text: 'Thanks for the information', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'gnr_location',
        text: 'Galaxy News Radio broadcasts from downtown D.C. It\'s dangerous territory - super mutants, raiders, worse things. But Three Dog knows everything that happens in the wasteland.',
        choices: [
          { id: 'accept_gnr_quest', text: 'I\'ll head to Galaxy News Radio', action: 'give_quest' },
          { id: 'megaton_bomb', text: 'First, about that bomb...', nextNode: 'megaton_bomb' },
          { id: 'leave', text: 'I\'ll consider it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'megaton_bomb',
        text: 'That old thing? It\'s been here since before the town was built. Some folks worship it, others want it disarmed. I just want to keep the peace. If you\'re technically minded, maybe you could take a look?',
        choices: [
          { id: 'accept_bomb_quest', text: 'I\'ll see what I can do about the bomb', action: 'give_quest' },
          { id: 'father_search', text: 'About my father...', nextNode: 'father_search' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'town_info',
        text: 'Megaton was built around that old bomb crater. We\'re a trading hub - relatively safe, good water, decent folk. We look out for each other here.',
        choices: [
          { id: 'father_search', text: 'I\'m looking for someone', nextNode: 'father_search' },
          { id: 'megaton_bomb', text: 'About the bomb...', nextNode: 'megaton_bomb' },
          { id: 'leave', text: 'Sounds like a good place', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Stay safe out there, vault dweller. The wasteland\'s got teeth.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'power_of_atom',
        title: 'The Power of the Atom',
        description: 'Decide the fate of Megaton\'s unexploded atomic bomb.',
        objectives: [
          {
            id: 'examine_bomb',
            description: 'Examine the atomic bomb in Megaton',
            type: 'explore',
            target: 'megaton_bomb',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'make_choice',
            description: 'Decide whether to disarm or detonate the bomb',
            type: 'talk',
            target: 'bomb_choice',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'gold', value: 500 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 3
      },
      {
        id: 'following_in_his_footsteps',
        title: 'Following in His Footsteps',
        description: 'Track down your father by visiting Galaxy News Radio.',
        objectives: [
          {
            id: 'reach_gnr',
            description: 'Travel to Galaxy News Radio',
            type: 'explore',
            target: 'galaxy_news_radio',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'talk_three_dog',
            description: 'Speak with Three Dog',
            type: 'talk',
            target: 'three_dog',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 250 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'assault_rifle') }
        ],
        status: 'available',
        requiredLevel: 2
      }
    ],
    faction: 'megaton',
    isHostile: false
  },

  {
    id: 'three_dog',
    name: 'Three Dog',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 85 * 32 + 16, y: 45 * 32 + 16 },
    sprite: 'three_dog',
    dialogue: [
      {
        id: 'greeting',
        text: 'Well, well, well! If it isn\'t the kid from Vault 101! Three Dog here, and you\'re listening to Galaxy News Radio. Your daddy was here, kid. Had some big plans.',
        choices: [
          { id: 'father_info', text: 'Tell me about my father', nextNode: 'father_info' },
          { id: 'project_purity', text: 'What\'s Project Purity?', nextNode: 'project_purity' },
          { id: 'radio_station', text: 'How do you know so much?', nextNode: 'radio_station' },
          { id: 'leave', text: 'I need to go', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'father_info',
        text: 'Your old man James is trying to get Project Purity running again. Clean water for everyone in the wasteland - noble goal. Last I heard, he was heading to Rivet City to find Dr. Li.',
        choices: [
          { id: 'rivet_city_location', text: 'Where\'s Rivet City?', nextNode: 'rivet_city_location' },
          { id: 'project_purity', text: 'What exactly is Project Purity?', nextNode: 'project_purity' },
          { id: 'radio_favor', text: 'What can I do for you?', nextNode: 'radio_favor' },
          { id: 'leave', text: 'Thanks for the info', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'rivet_city_location',
        text: 'Rivet City\'s built in an old aircraft carrier on the Potomac. Big settlement, lots of smart folks. Dr. Li runs the science lab there. But first, how about doing old Three Dog a favor?',
        choices: [
          { id: 'accept_radio_quest', text: 'What do you need?', action: 'give_quest' },
          { id: 'project_purity', text: 'Tell me more about Project Purity', nextNode: 'project_purity' },
          { id: 'leave', text: 'I\'ll head to Rivet City', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'project_purity',
        text: 'Project Purity was your daddy\'s dream - a water purifier that could clean the entire Potomac River. The Brotherhood of Steel shut it down years ago, but James thinks he can get it running.',
        choices: [
          { id: 'father_info', text: 'Where is my father now?', nextNode: 'father_info' },
          { id: 'radio_favor', text: 'What do you need from me?', nextNode: 'radio_favor' },
          { id: 'leave', text: 'I need to find him', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'radio_favor',
        text: 'My radio signal\'s been getting jammed. There\'s a relay dish that needs fixing, but it\'s in super mutant territory. Fix it, and I\'ll tell everyone in the wasteland what a hero you are.',
        choices: [
          { id: 'accept_radio_quest', text: 'I\'ll fix your relay dish', action: 'give_quest' },
          { id: 'father_info', text: 'First, about my father...', nextNode: 'father_info' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'radio_station',
        text: 'Information is power, kid. I\'ve got contacts all over the wasteland. Traders, scavengers, even some Brotherhood folks. They tell me things, I tell the wasteland.',
        choices: [
          { id: 'father_info', text: 'What did they tell you about my father?', nextNode: 'father_info' },
          { id: 'radio_favor', text: 'Maybe I can help you', nextNode: 'radio_favor' },
          { id: 'leave', text: 'Keep up the good work', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Keep fighting the good fight, kid. And remember - Galaxy News Radio is always here for you!',
        choices: []
      }
    ],
    quests: [
      {
        id: 'galaxy_news_radio',
        title: 'Galaxy News Radio',
        description: 'Help Three Dog by repairing the GNR radio relay.',
        objectives: [
          {
            id: 'find_relay_dish',
            description: 'Locate the GNR radio relay dish',
            type: 'explore',
            target: 'radio_relay',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'clear_super_mutants',
            description: 'Clear super mutants from the relay station',
            type: 'kill',
            target: 'super_mutant',
            current: 0,
            required: 5,
            completed: false
          },
          {
            id: 'repair_relay',
            description: 'Repair the radio relay dish',
            type: 'collect',
            target: 'relay_parts',
            current: 0,
            required: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 400 },
          { type: 'gold', value: 300 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
        ],
        status: 'available',
        requiredLevel: 4
      }
    ],
    faction: 'gnr',
    isHostile: false
  },

  {
    id: 'dr_li',
    name: 'Dr. Madison Li',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 84 * 32 + 16, y: 82 * 32 + 16 },
    sprite: 'scientist',
    dialogue: [
      {
        id: 'greeting',
        text: 'You must be James\'s child. I\'m Dr. Madison Li. Your father and I worked together on Project Purity before... before everything went wrong.',
        choices: [
          { id: 'father_location', text: 'Where is my father now?', nextNode: 'father_location' },
          { id: 'project_purity_history', text: 'What happened to Project Purity?', nextNode: 'project_purity_history' },
          { id: 'rivet_city', text: 'Tell me about Rivet City', nextNode: 'rivet_city' },
          { id: 'leave', text: 'I should go', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'father_location',
        text: 'James went to the Jefferson Memorial - that\'s where Project Purity is located. But it\'s dangerous there. Super mutants have overrun the area, and the Brotherhood... they have their own agenda.',
        choices: [
          { id: 'jefferson_memorial', text: 'How do I get to the Jefferson Memorial?', nextNode: 'jefferson_memorial' },
          { id: 'brotherhood_agenda', text: 'What\'s the Brotherhood\'s agenda?', nextNode: 'brotherhood_agenda' },
          { id: 'project_purity_history', text: 'Why did Project Purity fail before?', nextNode: 'project_purity_history' },
          { id: 'leave', text: 'I need to find him', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'jefferson_memorial',
        text: 'The Memorial is in the heart of D.C., surrounded by super mutant territory. You\'ll need to go through the metro tunnels or fight your way across the surface. Neither option is safe.',
        choices: [
          { id: 'accept_memorial_quest', text: 'I\'ll find a way to reach him', action: 'give_quest' },
          { id: 'brotherhood_agenda', text: 'What about the Brotherhood?', nextNode: 'brotherhood_agenda' },
          { id: 'leave', text: 'I\'ll be careful', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'project_purity_history',
        text: 'Twenty years ago, we were so close to success. But the super mutants attacked, and people died. Your mother... Catherine... she died protecting the project. James blamed himself and left.',
        choices: [
          { id: 'mother_info', text: 'Tell me about my mother', nextNode: 'mother_info' },
          { id: 'father_location', text: 'And now James is back?', nextNode: 'father_location' },
          { id: 'leave', text: 'I understand', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'mother_info',
        text: 'Catherine was brilliant, compassionate, and brave. She believed in Project Purity as much as James did. You have her eyes, you know. She would be proud of what you\'re doing.',
        choices: [
          { id: 'father_location', text: 'I need to find my father', nextNode: 'father_location' },
          { id: 'project_purity_history', text: 'What happened after she died?', nextNode: 'project_purity_history' },
          { id: 'leave', text: 'Thank you for telling me', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'brotherhood_agenda',
        text: 'The Brotherhood of Steel wants to control advanced technology. They see Project Purity as too dangerous for civilians. Elder Lyons might be reasonable, but some of his people... they\'re not.',
        choices: [
          { id: 'elder_lyons', text: 'Where can I find Elder Lyons?', nextNode: 'elder_lyons' },
          { id: 'father_location', text: 'I still need to reach my father', nextNode: 'father_location' },
          { id: 'leave', text: 'I\'ll keep that in mind', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'elder_lyons',
        text: 'Elder Lyons is at the Citadel - the Brotherhood\'s fortress. He\'s more reasonable than most, but he\'s under pressure from his own people. Approach carefully.',
        choices: [
          { id: 'father_location', text: 'First, I need to find my father', nextNode: 'father_location' },
          { id: 'leave', text: 'I\'ll remember that', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'rivet_city',
        text: 'Rivet City is one of the largest settlements in the wasteland. We have a functioning science lab, a marketplace, and relative safety. It\'s not perfect, but it\'s home.',
        choices: [
          { id: 'father_location', text: 'About my father...', nextNode: 'father_location' },
          { id: 'project_purity_history', text: 'About Project Purity...', nextNode: 'project_purity_history' },
          { id: 'leave', text: 'It seems like a good place', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Be careful out there. The wasteland has already taken too much from your family.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'scientific_pursuits',
        title: 'Scientific Pursuits',
        description: 'Travel to the Jefferson Memorial to find your father.',
        objectives: [
          {
            id: 'reach_jefferson_memorial',
            description: 'Travel to the Jefferson Memorial',
            type: 'explore',
            target: 'jefferson_memorial',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'find_james',
            description: 'Locate James at Project Purity',
            type: 'talk',
            target: 'james',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 350 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'rad_away') }
        ],
        status: 'available',
        requiredLevel: 5
      }
    ],
    faction: 'rivet_city',
    isHostile: false
  },

  // THE PITT NPCs
  {
    id: 'werner',
    name: 'Werner',
    type: 'quest_giver',
    mapId: 'the_pitt',
    position: { x: 25 * 32 + 16, y: 25 * 32 + 16 },
    sprite: 'worker',
    dialogue: [
      {
        id: 'greeting',
        text: 'Another slave for the Mill? No... you\'re different. You\'re not from here. I\'m Werner, and I\'ve been working these furnaces longer than I care to remember.',
        choices: [
          { id: 'the_pitt_info', text: 'Tell me about The Pitt', nextNode: 'the_pitt_info' },
          { id: 'ashur_info', text: 'Who runs this place?', nextNode: 'ashur_info' },
          { id: 'escape_plan', text: 'Is there a way out of here?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'I should get back to work', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'the_pitt_info',
        text: 'The Pitt used to be Pittsburgh, before the bombs. Now it\'s a slave city built around steel production. Lord Ashur rules from Uptown while we workers toil in the mills.',
        choices: [
          { id: 'ashur_info', text: 'Tell me about Lord Ashur', nextNode: 'ashur_info' },
          { id: 'steel_production', text: 'What do you produce here?', nextNode: 'steel_production' },
          { id: 'escape_plan', text: 'How do people survive here?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'I see', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'ashur_info',
        text: 'Ashur was a Brotherhood Paladin who conquered this place. He rules with an iron fist, but he\'s not entirely unreasonable. Some say he\'s planning something big.',
        choices: [
          { id: 'brotherhood_connection', text: 'He was Brotherhood of Steel?', nextNode: 'brotherhood_connection' },
          { id: 'ashur_plans', text: 'What kind of plans?', nextNode: 'ashur_plans' },
          { id: 'escape_plan', text: 'Is there any hope for the workers?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'Interesting', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'brotherhood_connection',
        text: 'Aye, he was. Came here with the Brotherhood years ago, but something changed him. Now he sees The Pitt as his kingdom, and us as his subjects.',
        choices: [
          { id: 'ashur_plans', text: 'What are his plans for The Pitt?', nextNode: 'ashur_plans' },
          { id: 'escape_plan', text: 'Is there any resistance?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'Power corrupts', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'ashur_plans',
        text: 'Word is he\'s found a cure for the Trog Degenerative Contagion. If true, it could change everything. But at what cost? And who decides who gets cured?',
        choices: [
          { id: 'trog_disease', text: 'What\'s the Trog disease?', nextNode: 'trog_disease' },
          { id: 'cure_details', text: 'Tell me about this cure', nextNode: 'cure_details' },
          { id: 'escape_plan', text: 'What about the workers?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'That\'s... significant', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'trog_disease',
        text: 'The Trogs are what happens when the radiation and industrial toxins get to you. They become mindless, violent creatures. Most workers here are slowly turning into them.',
        choices: [
          { id: 'cure_details', text: 'And Ashur has a cure?', nextNode: 'cure_details' },
          { id: 'worker_fate', text: 'What happens to infected workers?', nextNode: 'worker_fate' },
          { id: 'leave', text: 'That\'s horrible', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'cure_details',
        text: 'His baby daughter, Marie, seems to be immune. The scientists think her blood might hold the key. But there\'s talk of... experiments. Dark things.',
        choices: [
          { id: 'accept_pitt_quest', text: 'Someone needs to investigate this', action: 'give_quest' },
          { id: 'escape_plan', text: 'What about getting people out?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'This is bigger than I thought', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'escape_plan',
        text: 'There\'s a group of us planning something. We call ourselves the Underground. If you\'re interested in helping workers escape, find Wernher in the steelyard after dark.',
        choices: [
          { id: 'accept_underground_quest', text: 'I want to help', action: 'give_quest' },
          { id: 'ashur_info', text: 'What about working with Ashur?', nextNode: 'ashur_info' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'steel_production',
        text: 'We make steel ingots, weapons, ammunition. The Pitt supplies half the wasteland with metal goods. It\'s profitable... for Ashur.',
        choices: [
          { id: 'ashur_info', text: 'Ashur controls all of this?', nextNode: 'ashur_info' },
          { id: 'escape_plan', text: 'What about the workers?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'I understand', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'worker_fate',
        text: 'They\'re sent to the steelyard to die fighting Trogs, or they become Trogs themselves. Either way, Ashur gets rid of the \'problem.\'',
        choices: [
          { id: 'cure_details', text: 'And this cure could change that?', nextNode: 'cure_details' },
          { id: 'escape_plan', text: 'There has to be another way', nextNode: 'escape_plan' },
          { id: 'leave', text: 'That\'s monstrous', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Keep your head down and your eyes open. The Pitt has a way of changing people.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'into_the_pitt',
        title: 'Into the Pitt',
        description: 'Investigate the situation in The Pitt and decide who to support.',
        objectives: [
          {
            id: 'meet_ashur',
            description: 'Meet with Lord Ashur in Uptown',
            type: 'talk',
            target: 'ashur',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'investigate_cure',
            description: 'Learn about the cure for Trog Degenerative Contagion',
            type: 'explore',
            target: 'pitt_laboratory',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'choose_side',
            description: 'Decide between supporting Ashur or the Underground',
            type: 'talk',
            target: 'faction_choice',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'gold', value: 400 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 8
      }
    ],
    faction: 'pitt_workers',
    isHostile: false
  },

  {
    id: 'ashur',
    name: 'Lord Ashur',
    type: 'quest_giver',
    mapId: 'the_pitt',
    position: { x: 82 * 32 + 16, y: 52 * 32 + 16 },
    sprite: 'lord',
    dialogue: [
      {
        id: 'greeting',
        text: 'So, you\'re the outsider I\'ve been hearing about. I am Ashur, Lord of The Pitt. You\'ve seen my domain - what do you think of what I\'ve built here?',
        choices: [
          { id: 'pitt_opinion', text: 'It\'s impressive, but built on slavery', nextNode: 'pitt_opinion' },
          { id: 'cure_inquiry', text: 'I\'ve heard you have a cure for the Trog disease', nextNode: 'cure_inquiry' },
          { id: 'brotherhood_past', text: 'You were Brotherhood of Steel?', nextNode: 'brotherhood_past' },
          { id: 'leave', text: 'I\'m just passing through', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'pitt_opinion',
        text: 'Slavery? No, you misunderstand. These people have purpose, direction, hope for a better future. Before I came, this was a radioactive wasteland. Now it\'s a functioning society.',
        choices: [
          { id: 'society_question', text: 'A society where people are forced to work?', nextNode: 'society_question' },
          { id: 'cure_inquiry', text: 'What about the cure you\'re developing?', nextNode: 'cure_inquiry' },
          { id: 'future_plans', text: 'What\'s your vision for the future?', nextNode: 'future_plans' },
          { id: 'leave', text: 'I see your point', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'society_question',
        text: 'Freedom without purpose is chaos. I provide structure, protection, and most importantly - hope. My cure will free them from the Trog Degenerative Contagion. Then they\'ll truly be free.',
        choices: [
          { id: 'cure_inquiry', text: 'Tell me about this cure', nextNode: 'cure_inquiry' },
          { id: 'underground_threat', text: 'What about the Underground resistance?', nextNode: 'underground_threat' },
          { id: 'leave', text: 'An interesting perspective', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'cure_inquiry',
        text: 'My daughter Marie is immune to the contagion. Her blood holds the key to curing everyone in The Pitt. But the research takes time, and some... don\'t understand the necessity.',
        choices: [
          { id: 'marie_safety', text: 'Is your daughter safe during these experiments?', nextNode: 'marie_safety' },
          { id: 'cure_timeline', text: 'How long until the cure is ready?', nextNode: 'cure_timeline' },
          { id: 'underground_threat', text: 'The Underground wants to stop you?', nextNode: 'underground_threat' },
          { id: 'leave', text: 'That\'s a heavy burden', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'marie_safety',
        text: 'Marie is perfectly safe. We only take small blood samples, and she\'s monitored constantly. I would never harm my own daughter. The Underground spreads lies about \'experiments.\'',
        choices: [
          { id: 'accept_ashur_quest', text: 'I\'ll help you protect the cure research', action: 'give_quest' },
          { id: 'underground_threat', text: 'What exactly does the Underground want?', nextNode: 'underground_threat' },
          { id: 'leave', text: 'I believe you care for her', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'cure_timeline',
        text: 'Soon. Very soon. But the Underground threatens everything. They want to steal Marie, thinking they\'re \'rescuing\' her. They don\'t understand what\'s at stake.',
        choices: [
          { id: 'underground_threat', text: 'Why do they oppose you?', nextNode: 'underground_threat' },
          { id: 'accept_ashur_quest', text: 'I won\'t let them destroy this opportunity', action: 'give_quest' },
          { id: 'leave', text: 'The cure must be protected', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'underground_threat',
        text: 'They\'re short-sighted fools who would rather see everyone remain diseased than accept temporary hardship for permanent freedom. They must be stopped.',
        choices: [
          { id: 'accept_ashur_quest', text: 'I\'ll deal with the Underground', action: 'give_quest' },
          { id: 'peaceful_solution', text: 'Isn\'t there a peaceful solution?', nextNode: 'peaceful_solution' },
          { id: 'leave', text: 'This is a complex situation', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'peaceful_solution',
        text: 'I\'ve tried reasoning with them. They refuse to see the bigger picture. Sometimes, difficult decisions must be made for the greater good.',
        choices: [
          { id: 'accept_ashur_quest', text: 'I understand. I\'ll help you', action: 'give_quest' },
          { id: 'leave', text: 'I need to think about this', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'brotherhood_past',
        text: 'I was a Paladin, yes. But the Brotherhood\'s rigid thinking couldn\'t adapt to the wasteland\'s realities. Here, I can actually make a difference.',
        choices: [
          { id: 'pitt_opinion', text: 'By ruling over slaves?', nextNode: 'pitt_opinion' },
          { id: 'cure_inquiry', text: 'Through your cure research?', nextNode: 'cure_inquiry' },
          { id: 'leave', text: 'Power changes people', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'future_plans',
        text: 'Once the cure is complete, The Pitt will become the greatest city in the wasteland. Free from disease, strong from industry, united under wise leadership.',
        choices: [
          { id: 'cure_inquiry', text: 'The cure is that important?', nextNode: 'cure_inquiry' },
          { id: 'underground_threat', text: 'What about those who oppose you?', nextNode: 'underground_threat' },
          { id: 'leave', text: 'An ambitious vision', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Think carefully about what you\'ve seen here. The future of The Pitt - and everyone in it - hangs in the balance.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'unsafe_working_conditions',
        title: 'Unsafe Working Conditions',
        description: 'Help Lord Ashur protect the cure research from Underground sabotage.',
        objectives: [
          {
            id: 'eliminate_underground',
            description: 'Stop the Underground resistance',
            type: 'kill',
            target: 'underground_member',
            current: 0,
            required: 8,
            completed: false
          },
          {
            id: 'secure_laboratory',
            description: 'Secure the research laboratory',
            type: 'explore',
            target: 'pitt_lab_security',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'protect_marie',
            description: 'Ensure Marie\'s safety',
            type: 'talk',
            target: 'marie_protection',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 600 },
          { type: 'gold', value: 800 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 10
      }
    ],
    faction: 'pitt_rulers',
    isHostile: false
  },

  // POINT LOOKOUT NPCs
  {
    id: 'desmond',
    name: 'Desmond Lockheart',
    type: 'quest_giver',
    mapId: 'point_lookout',
    position: { x: 19 * 32 + 16, y: 18 * 32 + 16 },
    sprite: 'gentleman',
    dialogue: [
      {
        id: 'greeting',
        text: 'Well, well! A visitor from the mainland. How delightfully unexpected. I am Desmond Lockheart, and you, my dear fellow, have stumbled into quite the interesting situation.',
        choices: [
          { id: 'situation_inquiry', text: 'What kind of situation?', nextNode: 'situation_inquiry' },
          { id: 'point_lookout_info', text: 'Tell me about Point Lookout', nextNode: 'point_lookout_info' },
          { id: 'desmond_background', text: 'Who are you exactly?', nextNode: 'desmond_background' },
          { id: 'leave', text: 'I should be going', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'situation_inquiry',
        text: 'There\'s a war brewing, my friend. An old war between old enemies. Professor Calvert and I have been... disagreeing... for over two centuries now.',
        choices: [
          { id: 'calvert_info', text: 'Who is Professor Calvert?', nextNode: 'calvert_info' },
          { id: 'old_war', text: 'Two centuries? How is that possible?', nextNode: 'old_war' },
          { id: 'choose_side', text: 'What do you want from me?', nextNode: 'choose_side' },
          { id: 'leave', text: 'This sounds dangerous', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'calvert_info',
        text: 'Calvert is a pre-war scientist who\'s been playing god with the locals. He\'s got them convinced he\'s some kind of benevolent protector, but I know better.',
        choices: [
          { id: 'calvert_crimes', text: 'What has he done?', nextNode: 'calvert_crimes' },
          { id: 'old_war', text: 'How long have you two been fighting?', nextNode: 'old_war' },
          { id: 'choose_side', text: 'Why should I believe you?', nextNode: 'choose_side' },
          { id: 'leave', text: 'I need to hear both sides', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'calvert_crimes',
        text: 'Experiments on the locals, mind control, genetic manipulation. He\'s turned Point Lookout into his personal laboratory, and the tribals are his test subjects.',
        choices: [
          { id: 'accept_desmond_quest', text: 'That\'s monstrous. I\'ll help you stop him', action: 'give_quest' },
          { id: 'proof_request', text: 'Do you have proof of these accusations?', nextNode: 'proof_request' },
          { id: 'old_war', text: 'How do you know all this?', nextNode: 'old_war' },
          { id: 'leave', text: 'I need to investigate this myself', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'old_war',
        text: 'We\'re both pre-war, enhanced by science and circumstance. We\'ve been playing this game of chess for decades, using the wasteland as our board.',
        choices: [
          { id: 'enhancement_details', text: 'What kind of enhancements?', nextNode: 'enhancement_details' },
          { id: 'chess_game', text: 'And the people here are just pawns?', nextNode: 'chess_game' },
          { id: 'choose_side', text: 'Why should I get involved?', nextNode: 'choose_side' },
          { id: 'leave', text: 'This is beyond me', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'enhancement_details',
        text: 'Let\'s just say we\'ve both found ways to extend our lives and enhance our capabilities. The details are... complicated.',
        choices: [
          { id: 'chess_game', text: 'And you\'ve been fighting ever since?', nextNode: 'chess_game' },
          { id: 'choose_side', text: 'What do you need from me?', nextNode: 'choose_side' },
          { id: 'leave', text: 'Some secrets are better left buried', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'chess_game',
        text: 'Unfortunately, yes. But you could be the piece that finally ends this stalemate. Help me, and I\'ll make it worth your while.',
        choices: [
          { id: 'accept_desmond_quest', text: 'What do you need me to do?', action: 'give_quest' },
          { id: 'calvert_meeting', text: 'I want to meet Calvert first', nextNode: 'calvert_meeting' },
          { id: 'leave', text: 'I don\'t want to be anyone\'s pawn', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'choose_side',
        text: 'Because, my dear fellow, neutrality is not an option. Calvert will try to use you just as he uses everyone else. At least I\'m honest about my intentions.',
        choices: [
          { id: 'accept_desmond_quest', text: 'Alright, I\'ll help you', action: 'give_quest' },
          { id: 'calvert_meeting', text: 'I still want to hear Calvert\'s side', nextNode: 'calvert_meeting' },
          { id: 'leave', text: 'I need time to think', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'calvert_meeting',
        text: 'By all means, go to him. But be warned - Calvert is persuasive, and he\'s had centuries to perfect his manipulation techniques.',
        choices: [
          { id: 'calvert_location', text: 'Where can I find him?', nextNode: 'calvert_location' },
          { id: 'accept_desmond_quest', text: 'On second thought, I trust you', action: 'give_quest' },
          { id: 'leave', text: 'I\'ll be careful', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'calvert_location',
        text: 'He\'s holed up in the old mansion, surrounded by his tribal \'protectors.\' Just remember - everything he tells you will be designed to serve his purposes.',
        choices: [
          { id: 'accept_desmond_quest', text: 'I\'ve heard enough. I\'ll help you', action: 'give_quest' },
          { id: 'leave', text: 'I\'ll keep that in mind', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'proof_request',
        text: 'Proof? My dear fellow, the proof is all around you. Look at the locals - the mutations, the strange behavior, the unnatural loyalty to Calvert.',
        choices: [
          { id: 'accept_desmond_quest', text: 'You\'re right. I\'ll help you', action: 'give_quest' },
          { id: 'calvert_meeting', text: 'I still want to hear his side', nextNode: 'calvert_meeting' },
          { id: 'leave', text: 'I need to see for myself', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'point_lookout_info',
        text: 'Point Lookout is a fascinating place - pre-war history, post-war mysteries, and enough radiation to make things... interesting.',
        choices: [
          { id: 'situation_inquiry', text: 'What kind of mysteries?', nextNode: 'situation_inquiry' },
          { id: 'desmond_background', text: 'And you\'ve been here how long?', nextNode: 'desmond_background' },
          { id: 'leave', text: 'Sounds intriguing', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'desmond_background',
        text: 'I\'m a man of science, a student of human nature, and a survivor of circumstances most extraordinary. Let\'s leave it at that for now.',
        choices: [
          { id: 'situation_inquiry', text: 'What\'s this situation you mentioned?', nextNode: 'situation_inquiry' },
          { id: 'old_war', text: 'You mentioned an old war?', nextNode: 'old_war' },
          { id: 'leave', text: 'Fair enough', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Do think about what I\'ve said. The future of Point Lookout may well depend on the choices you make.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'the_local_flavor',
        title: 'The Local Flavor',
        description: 'Help Desmond Lockheart in his war against Professor Calvert.',
        objectives: [
          {
            id: 'investigate_calvert',
            description: 'Investigate Professor Calvert\'s activities',
            type: 'explore',
            target: 'calvert_mansion',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'gather_evidence',
            description: 'Collect evidence of Calvert\'s experiments',
            type: 'collect',
            target: 'experiment_data',
            current: 0,
            required: 3,
            completed: false
          },
          {
            id: 'confront_calvert',
            description: 'Confront Professor Calvert',
            type: 'talk',
            target: 'calvert',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 450 },
          { type: 'gold', value: 600 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
        ],
        status: 'available',
        requiredLevel: 12
      }
    ],
    faction: 'lockheart',
    isHostile: false
  },

  // MOTHERSHIP ZETA NPCs
  {
    id: 'somah',
    name: 'Somah',
    type: 'quest_giver',
    mapId: 'mothership_zeta',
    position: { x: 30 * 32 + 16, y: 20 * 32 + 16 },
    sprite: 'alien_prisoner',
    dialogue: [
      {
        id: 'greeting',
        text: 'Another human! Thank the ancestors. I am Somah, and I have been prisoner on this ship for... too long. You must help us escape before they complete their experiments.',
        choices: [
          { id: 'escape_plan', text: 'How do we get out of here?', nextNode: 'escape_plan' },
          { id: 'alien_experiments', text: 'What kind of experiments?', nextNode: 'alien_experiments' },
          { id: 'other_prisoners', text: 'Are there other prisoners?', nextNode: 'other_prisoners' },
          { id: 'leave', text: 'I need to explore first', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'escape_plan',
        text: 'We need to reach the bridge and take control of the ship. But first, we must free the other prisoners and gather weapons from the armory.',
        choices: [
          { id: 'bridge_location', text: 'Where is the bridge?', nextNode: 'bridge_location' },
          { id: 'armory_location', text: 'Where\'s the armory?', nextNode: 'armory_location' },
          { id: 'other_prisoners', text: 'Who are the other prisoners?', nextNode: 'other_prisoners' },
          { id: 'accept_escape_quest', text: 'I\'ll help you escape', action: 'give_quest' }
        ]
      },
      {
        id: 'alien_experiments',
        text: 'They study us, probe our minds, test our bodies. They\'re trying to understand human psychology and physiology. Some prisoners... they don\'t survive.',
        choices: [
          { id: 'experiment_purpose', text: 'Why are they studying humans?', nextNode: 'experiment_purpose' },
          { id: 'escape_plan', text: 'We need to get out of here', nextNode: 'escape_plan' },
          { id: 'other_prisoners', text: 'How many prisoners are there?', nextNode: 'other_prisoners' },
          { id: 'leave', text: 'This is horrifying', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'experiment_purpose',
        text: 'I believe they\'re planning an invasion of Earth. They need to understand their enemy - us. Every test brings them closer to that goal.',
        choices: [
          { id: 'invasion_timeline', text: 'How soon?', nextNode: 'invasion_timeline' },
          { id: 'escape_plan', text: 'Then we must stop them', nextNode: 'escape_plan' },
          { id: 'alien_weaknesses', text: 'Do you know their weaknesses?', nextNode: 'alien_weaknesses' },
          { id: 'leave', text: 'Earth is in danger', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'invasion_timeline',
        text: 'Soon. Very soon. They\'ve been accelerating their experiments. We may be among the last test subjects before they begin.',
        choices: [
          { id: 'accept_escape_quest', text: 'We have to escape and warn Earth', action: 'give_quest' },
          { id: 'escape_plan', text: 'What\'s the plan?', nextNode: 'escape_plan' },
          { id: 'alien_weaknesses', text: 'How do we fight them?', nextNode: 'alien_weaknesses' },
          { id: 'leave', text: 'Time is running out', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'other_prisoners',
        text: 'There\'s Sally, a little girl from before the war. Paulson, a soldier. Elliott, a cowboy from the old west. And others... if they\'re still alive.',
        choices: [
          { id: 'prisoner_locations', text: 'Where are they being held?', nextNode: 'prisoner_locations' },
          { id: 'escape_plan', text: 'We need to free them all', nextNode: 'escape_plan' },
          { id: 'sally_info', text: 'A girl from before the war?', nextNode: 'sally_info' },
          { id: 'leave', text: 'We can\'t leave anyone behind', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'prisoner_locations',
        text: 'They\'re scattered throughout the ship in different holding areas. The aliens like to keep us separated to prevent cooperation.',
        choices: [
          { id: 'accept_escape_quest', text: 'I\'ll find them all', action: 'give_quest' },
          { id: 'escape_plan', text: 'Once we\'re together, then what?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'This won\'t be easy', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'sally_info',
        text: 'The aliens have been taking humans for centuries. Sally was taken just before the Great War. She\'s... she\'s been here longer than any of us.',
        choices: [
          { id: 'time_effects', text: 'How has she survived so long?', nextNode: 'time_effects' },
          { id: 'escape_plan', text: 'We have to get her out', nextNode: 'escape_plan' },
          { id: 'leave', text: 'That poor child', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'time_effects',
        text: 'The aliens have ways of... preserving their subjects. But the psychological effects... Sally is not the same child she once was.',
        choices: [
          { id: 'accept_escape_quest', text: 'All the more reason to escape', action: 'give_quest' },
          { id: 'escape_plan', text: 'How do we help her?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'This is monstrous', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'bridge_location',
        text: 'The bridge is at the top of the ship, heavily guarded. We\'ll need to fight our way through multiple levels of alien security.',
        choices: [
          { id: 'armory_location', text: 'We\'ll need weapons first', nextNode: 'armory_location' },
          { id: 'alien_weaknesses', text: 'How do we fight the aliens?', nextNode: 'alien_weaknesses' },
          { id: 'accept_escape_quest', text: 'I\'m ready to try', action: 'give_quest' },
          { id: 'leave', text: 'This sounds impossible', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'armory_location',
        text: 'There\'s an armory on the lower levels where they store confiscated weapons and their own alien technology. If we can reach it...',
        choices: [
          { id: 'alien_weapons', text: 'Can we use their weapons?', nextNode: 'alien_weapons' },
          { id: 'accept_escape_quest', text: 'Let\'s do this', action: 'give_quest' },
          { id: 'leave', text: 'It\'s worth a try', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'alien_weapons',
        text: 'Their energy weapons are powerful, but they require special power cells. Still, they\'re our best chance against their technology.',
        choices: [
          { id: 'accept_escape_quest', text: 'Then that\'s our first stop', action: 'give_quest' },
          { id: 'escape_plan', text: 'What\'s the full plan?', nextNode: 'escape_plan' },
          { id: 'leave', text: 'We\'ll need every advantage', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'alien_weaknesses',
        text: 'They\'re physically weaker than humans, but their technology gives them a huge advantage. Their shields can be overloaded with sustained fire.',
        choices: [
          { id: 'armory_location', text: 'We need better weapons', nextNode: 'armory_location' },
          { id: 'accept_escape_quest', text: 'Knowledge is power. Let\'s go', action: 'give_quest' },
          { id: 'leave', text: 'Good to know', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Please, don\'t abandon us here. We\'ve been waiting so long for someone like you.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'not_of_this_world',
        title: 'Not of This World',
        description: 'Escape from the alien mothership and prevent an invasion of Earth.',
        objectives: [
          {
            id: 'free_prisoners',
            description: 'Free all human prisoners',
            type: 'talk',
            target: 'prisoner',
            current: 0,
            required: 4,
            completed: false
          },
          {
            id: 'reach_armory',
            description: 'Reach the alien armory',
            type: 'explore',
            target: 'alien_armory',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'take_bridge',
            description: 'Capture the ship\'s bridge',
            type: 'kill',
            target: 'alien_captain',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'destroy_mothership',
            description: 'Destroy the alien mothership',
            type: 'explore',
            target: 'ship_destruction',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 800 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'alien_blaster') },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 15
      }
    ],
    faction: 'human_prisoners',
    isHostile: false
  },

  // CITADEL NPCs
  {
    id: 'elder_lyons',
    name: 'Elder Owyn Lyons',
    type: 'quest_giver',
    mapId: 'citadel',
    position: { x: 40 * 32 + 16, y: 37 * 32 + 16 },
    sprite: 'elder',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to the Citadel, child. I am Elder Owyn Lyons of the Brotherhood of Steel. Your arrival is... fortuitous. We have great need of someone with your unique background.',
        choices: [
          { id: 'brotherhood_mission', text: 'What does the Brotherhood need?', nextNode: 'brotherhood_mission' },
          { id: 'project_purity_brotherhood', text: 'I\'m here about Project Purity', nextNode: 'project_purity_brotherhood' },
          { id: 'citadel_info', text: 'Tell me about the Citadel', nextNode: 'citadel_info' },
          { id: 'leave', text: 'I\'m just visiting', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'brotherhood_mission',
        text: 'The Brotherhood\'s mission here is to protect the people of the Capital Wasteland from the super mutant threat. But we face challenges from within and without.',
        choices: [
          { id: 'super_mutant_threat', text: 'Tell me about the super mutants', nextNode: 'super_mutant_threat' },
          { id: 'internal_challenges', text: 'What internal challenges?', nextNode: 'internal_challenges' },
          { id: 'project_purity_brotherhood', text: 'How does Project Purity fit in?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'A noble mission', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'super_mutant_threat',
        text: 'The super mutants are growing stronger and more organized. They\'re led by something they call the Master, and they\'re converting humans into more of their kind.',
        choices: [
          { id: 'master_info', text: 'Who is this Master?', nextNode: 'master_info' },
          { id: 'conversion_process', text: 'How do they convert humans?', nextNode: 'conversion_process' },
          { id: 'accept_brotherhood_quest', text: 'How can I help fight them?', action: 'give_quest' },
          { id: 'leave', text: 'That\'s terrifying', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'master_info',
        text: 'We know little about this Master, only that it commands absolute loyalty from the super mutants. Our scouts report it may be located in Vault 87.',
        choices: [
          { id: 'vault_87_mission', text: 'I could investigate Vault 87', nextNode: 'vault_87_mission' },
          { id: 'conversion_process', text: 'How are they making more super mutants?', nextNode: 'conversion_process' },
          { id: 'project_purity_brotherhood', text: 'What about Project Purity?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'Vault 87 sounds dangerous', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'vault_87_mission',
        text: 'Vault 87 is heavily irradiated and well-defended. It would be a suicide mission for most, but someone with your... unique background... might have a chance.',
        choices: [
          { id: 'accept_brotherhood_quest', text: 'I\'ll investigate Vault 87', action: 'give_quest' },
          { id: 'radiation_protection', text: 'How do I survive the radiation?', nextNode: 'radiation_protection' },
          { id: 'project_purity_brotherhood', text: 'First, about Project Purity...', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'I need to prepare first', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'radiation_protection',
        text: 'We have advanced radiation suits and Rad-Away supplies. Our scribes have also developed some experimental protection methods.',
        choices: [
          { id: 'accept_brotherhood_quest', text: 'Then I\'ll do it', action: 'give_quest' },
          { id: 'project_purity_brotherhood', text: 'What about Project Purity?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'I\'ll consider it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'conversion_process',
        text: 'They use something called FEV - Forced Evolutionary Virus. It transforms humans into super mutants, but the process is... horrific.',
        choices: [
          { id: 'fev_source', text: 'Where do they get this FEV?', nextNode: 'fev_source' },
          { id: 'accept_brotherhood_quest', text: 'We have to stop this', action: 'give_quest' },
          { id: 'project_purity_brotherhood', text: 'Could Project Purity help?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'That\'s monstrous', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'fev_source',
        text: 'We believe the source is in Vault 87. If we could destroy it, we could stop the super mutant threat permanently.',
        choices: [
          { id: 'accept_brotherhood_quest', text: 'I\'ll destroy the FEV source', action: 'give_quest' },
          { id: 'vault_87_mission', text: 'Tell me more about Vault 87', nextNode: 'vault_87_mission' },
          { id: 'leave', text: 'That\'s a big responsibility', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'internal_challenges',
        text: 'Some of my people believe we should focus on technology acquisition rather than protecting wastelanders. The Outcasts have already split from us over this.',
        choices: [
          { id: 'outcast_info', text: 'Tell me about the Outcasts', nextNode: 'outcast_info' },
          { id: 'lyons_philosophy', text: 'Why do you help the wastelanders?', nextNode: 'lyons_philosophy' },
          { id: 'project_purity_brotherhood', text: 'Is Project Purity part of this conflict?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'Division weakens everyone', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'outcast_info',
        text: 'The Outcasts follow the traditional Brotherhood doctrine - acquire technology, preserve knowledge, ignore the suffering of others. I believe we must do better.',
        choices: [
          { id: 'lyons_philosophy', text: 'What\'s your philosophy?', nextNode: 'lyons_philosophy' },
          { id: 'reconciliation', text: 'Could you reconcile with them?', nextNode: 'reconciliation' },
          { id: 'project_purity_brotherhood', text: 'How does this affect Project Purity?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'I understand the conflict', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'lyons_philosophy',
        text: 'The Brotherhood\'s technology means nothing if there\'s no one left to protect. We must use our power to help rebuild civilization, not just hoard knowledge.',
        choices: [
          { id: 'project_purity_brotherhood', text: 'Is that why you support Project Purity?', nextNode: 'project_purity_brotherhood' },
          { id: 'accept_brotherhood_quest', text: 'I agree. How can I help?', action: 'give_quest' },
          { id: 'reconciliation', text: 'Could this philosophy reunite the Brotherhood?', nextNode: 'reconciliation' },
          { id: 'leave', text: 'A noble vision', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'reconciliation',
        text: 'Perhaps, in time. But first we must prove that our way works. Project Purity could be that proof - technology used to help everyone.',
        choices: [
          { id: 'project_purity_brotherhood', text: 'Tell me about the Brotherhood\'s role in Project Purity', nextNode: 'project_purity_brotherhood' },
          { id: 'accept_brotherhood_quest', text: 'I want to help make that happen', action: 'give_quest' },
          { id: 'leave', text: 'Hope for the future', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'project_purity_brotherhood',
        text: 'Project Purity represents everything I believe the Brotherhood should be - using advanced technology to help humanity. But it\'s dangerous, and we need someone we can trust.',
        choices: [
          { id: 'purity_dangers', text: 'What makes it dangerous?', nextNode: 'purity_dangers' },
          { id: 'trust_question', text: 'Why do you trust me?', nextNode: 'trust_question' },
          { id: 'accept_purity_quest', text: 'I\'ll help with Project Purity', action: 'give_quest' },
          { id: 'leave', text: 'It sounds important', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'purity_dangers',
        text: 'The Enclave wants to control it for their own purposes. Super mutants see it as a threat. And some in my own Brotherhood question whether civilians can be trusted with such power.',
        choices: [
          { id: 'enclave_threat', text: 'What does the Enclave want?', nextNode: 'enclave_threat' },
          { id: 'accept_purity_quest', text: 'Then we need to protect it', action: 'give_quest' },
          { id: 'leave', text: 'Everyone wants to control it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'enclave_threat',
        text: 'The Enclave believes they are the true government of America. They want to use Project Purity to control the wasteland\'s water supply - and through it, control everyone.',
        choices: [
          { id: 'accept_purity_quest', text: 'We can\'t let that happen', action: 'give_quest' },
          { id: 'enclave_strength', text: 'How strong is the Enclave?', nextNode: 'enclave_strength' },
          { id: 'leave', text: 'That\'s a terrifying prospect', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'enclave_strength',
        text: 'They have advanced technology, vertibirds, and power armor that rivals our own. But they\'re few in number, and their ideology is their weakness.',
        choices: [
          { id: 'accept_purity_quest', text: 'I\'ll help you stop them', action: 'give_quest' },
          { id: 'leave', text: 'A dangerous enemy', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'trust_question',
        text: 'You\'re not bound by faction loyalty or political agenda. You seek your father out of love, not power. That makes you someone we can work with.',
        choices: [
          { id: 'accept_purity_quest', text: 'I won\'t let you down', action: 'give_quest' },
          { id: 'purity_dangers', text: 'What are we up against?', nextNode: 'purity_dangers' },
          { id: 'leave', text: 'I appreciate your trust', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'citadel_info',
        text: 'The Citadel was built in the ruins of the Pentagon. It serves as our fortress, laboratory, and symbol of the Brotherhood\'s commitment to the Capital Wasteland.',
        choices: [
          { id: 'brotherhood_mission', text: 'What is that commitment?', nextNode: 'brotherhood_mission' },
          { id: 'project_purity_brotherhood', text: 'How does Project Purity fit in?', nextNode: 'project_purity_brotherhood' },
          { id: 'leave', text: 'Impressive fortress', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Ad Victoriam, child. May your path lead to victory for all humanity.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'the_waters_of_life',
        title: 'The Waters of Life',
        description: 'Help the Brotherhood of Steel protect Project Purity from the Enclave.',
        objectives: [
          {
            id: 'secure_project_purity',
            description: 'Secure the Project Purity facility',
            type: 'explore',
            target: 'project_purity_facility',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'defend_against_enclave',
            description: 'Defend against Enclave assault',
            type: 'kill',
            target: 'enclave_soldier',
            current: 0,
            required: 10,
            completed: false
          },
          {
            id: 'activate_purifier',
            description: 'Activate the water purifier',
            type: 'explore',
            target: 'purifier_activation',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 1000 },
          { type: 'gold', value: 1000 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 18
      },
      {
        id: 'finding_the_garden_of_eden',
        title: 'Finding the Garden of Eden',
        description: 'Investigate Vault 87 and stop the super mutant threat.',
        objectives: [
          {
            id: 'enter_vault_87',
            description: 'Enter Vault 87',
            type: 'explore',
            target: 'vault_87_entrance',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'find_fev_source',
            description: 'Locate the FEV laboratory',
            type: 'explore',
            target: 'fev_lab',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'destroy_fev',
            description: 'Destroy the FEV source',
            type: 'explore',
            target: 'fev_destruction',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'defeat_master',
            description: 'Defeat the Master',
            type: 'kill',
            target: 'super_mutant_master',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 750 },
          { type: 'gold', value: 800 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
        ],
        status: 'available',
        requiredLevel: 12
      }
    ],
    faction: 'brotherhood_of_steel',
    isHostile: false
  }
];