import { Quest } from '../types/game';
import { items } from './items_data';

export const mainQuests: Quest[] = [
  {
    id: 'escape_vault_101',
    title: 'Escape!',
    description: 'Your father has left Vault 101, breaking the most sacred rule. The Overseer wants you gone, and the only way out is through the vault door that has been sealed for 200 years.',
    objectives: [
      {
        id: 'find_father_room',
        description: 'Search your father\'s room for clues',
        type: 'explore',
        target: 'father_room',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'get_pip_boy',
        description: 'Retrieve your Pip-Boy 3000',
        type: 'collect',
        target: 'pip_boy',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'reach_vault_door',
        description: 'Reach the vault entrance',
        type: 'explore',
        target: 'vault_door',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'exit_vault',
        description: 'Step into the Capital Wasteland',
        type: 'explore',
        target: 'wasteland_surface',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 200 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'pip_boy') }
    ],
    status: 'active',
    requiredLevel: 1
  },

  {
    id: 'following_in_his_footsteps',
    title: 'Following in His Footsteps',
    description: 'Your father James has left Vault 101 to continue his work on Project Purity. Track him down by following the trail of people who have seen him.',
    objectives: [
      {
        id: 'talk_to_simms',
        description: 'Speak with Sheriff Simms in Megaton',
        type: 'talk',
        target: 'sheriff_lucas',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'visit_gnr',
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
      },
      {
        id: 'reach_rivet_city',
        description: 'Travel to Rivet City',
        type: 'explore',
        target: 'rivet_city',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'talk_dr_li',
        description: 'Speak with Dr. Madison Li',
        type: 'talk',
        target: 'dr_li',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 300 },
      { type: 'gold', value: 200 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
    ],
    status: 'available',
    requiredLevel: 2
  },

  {
    id: 'scientific_pursuits',
    title: 'Scientific Pursuits',
    description: 'Dr. Li has told you that your father went to the Jefferson Memorial to restart Project Purity. Follow him there, but be prepared for danger.',
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
        id: 'clear_super_mutants',
        description: 'Clear super mutants from Project Purity',
        type: 'kill',
        target: 'super_mutant',
        current: 0,
        required: 8,
        completed: false
      },
      {
        id: 'find_james',
        description: 'Locate your father James',
        type: 'talk',
        target: 'james',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'activate_project_purity',
        description: 'Help activate Project Purity',
        type: 'explore',
        target: 'project_purity_activation',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 400 },
      { type: 'gold', value: 300 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
    ],
    status: 'available',
    requiredLevel: 5
  },

  {
    id: 'the_waters_of_life',
    title: 'The Waters of Life',
    description: 'Project Purity is operational, but the Enclave has arrived to seize control. Work with the Brotherhood of Steel to protect the water purifier and ensure it serves all of humanity.',
    objectives: [
      {
        id: 'escape_enclave',
        description: 'Escape the Enclave assault on Project Purity',
        type: 'explore',
        target: 'enclave_escape',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'reach_citadel',
        description: 'Travel to the Citadel',
        type: 'explore',
        target: 'citadel',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'talk_elder_lyons',
        description: 'Speak with Elder Lyons',
        type: 'talk',
        target: 'elder_lyons',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'retrieve_geck',
        description: 'Retrieve the G.E.C.K. from Vault 87',
        type: 'collect',
        target: 'geck',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'return_project_purity',
        description: 'Return to Project Purity with the G.E.C.K.',
        type: 'explore',
        target: 'project_purity_return',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 600 },
      { type: 'gold', value: 500 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
    ],
    status: 'available',
    requiredLevel: 8
  },

  {
    id: 'take_it_back',
    title: 'Take It Back!',
    description: 'The final battle for Project Purity has begun. Lead the Brotherhood of Steel in an assault on the Jefferson Memorial to reclaim the water purifier from the Enclave.',
    objectives: [
      {
        id: 'assault_memorial',
        description: 'Join the Brotherhood assault on the Memorial',
        type: 'explore',
        target: 'memorial_assault',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'defeat_enclave_forces',
        description: 'Defeat the Enclave forces',
        type: 'kill',
        target: 'enclave_soldier',
        current: 0,
        required: 15,
        completed: false
      },
      {
        id: 'reach_control_room',
        description: 'Reach the Project Purity control room',
        type: 'explore',
        target: 'purity_control_room',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'activate_purifier',
        description: 'Activate the water purifier',
        type: 'explore',
        target: 'purifier_final_activation',
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
    requiredLevel: 15
  }
];

export const sideQuests: Quest[] = [
  {
    id: 'the_power_of_atom',
    title: 'The Power of the Atom',
    description: 'Megaton is built around an unexploded atomic bomb. Sheriff Simms wants it disarmed, but others have different ideas about the bomb\'s fate.',
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
        id: 'talk_burke',
        description: 'Speak with Mr. Burke about the bomb',
        type: 'talk',
        target: 'burke',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'make_bomb_choice',
        description: 'Decide the fate of Megaton\'s bomb',
        type: 'explore',
        target: 'bomb_decision',
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
    id: 'wasteland_survival_guide',
    title: 'The Wasteland Survival Guide',
    description: 'Moira Brown in Megaton wants to write the definitive guide to wasteland survival. She needs someone to test her theories in the field.',
    objectives: [
      {
        id: 'test_radiation',
        description: 'Test the effects of radiation exposure',
        type: 'explore',
        target: 'radiation_test',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'test_injury',
        description: 'Test injury treatment methods',
        type: 'explore',
        target: 'injury_test',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'test_food',
        description: 'Test wasteland food sources',
        type: 'collect',
        target: 'wasteland_food',
        current: 0,
        required: 5,
        completed: false
      },
      {
        id: 'test_combat',
        description: 'Test combat techniques against raiders',
        type: 'kill',
        target: 'raider',
        current: 0,
        required: 10,
        completed: false
      },
      {
        id: 'complete_guide',
        description: 'Return to Moira with your findings',
        type: 'talk',
        target: 'moira_brown',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 400 },
      { type: 'gold', value: 300 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
    ],
    status: 'available',
    requiredLevel: 2
  },

  {
    id: 'blood_ties',
    title: 'Blood Ties',
    description: 'The residents of Arefu are being terrorized by a group calling themselves "The Family." Investigate these mysterious attackers and their connection to a missing boy.',
    objectives: [
      {
        id: 'investigate_arefu',
        description: 'Investigate the attacks in Arefu',
        type: 'explore',
        target: 'arefu_investigation',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'find_ian_west',
        description: 'Find Ian West',
        type: 'talk',
        target: 'ian_west',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'meet_the_family',
        description: 'Meet with The Family',
        type: 'talk',
        target: 'vance',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'resolve_conflict',
        description: 'Resolve the conflict between Arefu and The Family',
        type: 'talk',
        target: 'family_resolution',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 350 },
      { type: 'gold', value: 250 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'combat_knife') }
    ],
    status: 'available',
    requiredLevel: 4
  },

  {
    id: 'the_superhuman_gambit',
    title: 'The Superhuman Gambit',
    description: 'The town of Canterbury Commons is caught in the middle of a battle between two costumed characters: the AntAgonizer and the Mechanist.',
    objectives: [
      {
        id: 'reach_canterbury',
        description: 'Travel to Canterbury Commons',
        type: 'explore',
        target: 'canterbury_commons',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'talk_uncle_roe',
        description: 'Speak with Uncle Roe',
        type: 'talk',
        target: 'uncle_roe',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'investigate_antagonizer',
        description: 'Investigate the AntAgonizer',
        type: 'explore',
        target: 'antagonizer_lair',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'investigate_mechanist',
        description: 'Investigate the Mechanist',
        type: 'explore',
        target: 'mechanist_lair',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'resolve_conflict',
        description: 'End the conflict between the two heroes',
        type: 'talk',
        target: 'hero_resolution',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 300 },
      { type: 'gold', value: 400 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
    ],
    status: 'available',
    requiredLevel: 6
  },

  {
    id: 'stealing_independence',
    title: 'Stealing Independence',
    description: 'Abraham Washington in Rivet City wants you to retrieve the Declaration of Independence from the National Archives, but the building is heavily defended.',
    objectives: [
      {
        id: 'reach_archives',
        description: 'Travel to the National Archives',
        type: 'explore',
        target: 'national_archives',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'clear_super_mutants',
        description: 'Clear super mutants from the Archives',
        type: 'kill',
        target: 'super_mutant',
        current: 0,
        required: 12,
        completed: false
      },
      {
        id: 'find_declaration',
        description: 'Locate the Declaration of Independence',
        type: 'collect',
        target: 'declaration_independence',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'return_washington',
        description: 'Return the Declaration to Abraham Washington',
        type: 'talk',
        target: 'abraham_washington',
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
    requiredLevel: 8
  },

  {
    id: 'reillys_rangers',
    title: 'Reilly\'s Rangers',
    description: 'Reilly\'s Rangers are trapped in the Statesman Hotel, surrounded by super mutants. Mount a rescue mission to save the elite mercenary team.',
    objectives: [
      {
        id: 'find_reilly',
        description: 'Find Reilly in the Underworld',
        type: 'talk',
        target: 'reilly',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'reach_statesman_hotel',
        description: 'Travel to the Statesman Hotel',
        type: 'explore',
        target: 'statesman_hotel',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'rescue_rangers',
        description: 'Rescue the trapped Rangers',
        type: 'talk',
        target: 'trapped_ranger',
        current: 0,
        required: 3,
        completed: false
      },
      {
        id: 'clear_escape_route',
        description: 'Clear an escape route',
        type: 'kill',
        target: 'super_mutant',
        current: 0,
        required: 15,
        completed: false
      },
      {
        id: 'return_reilly',
        description: 'Return to Reilly',
        type: 'talk',
        target: 'reilly',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 500 },
      { type: 'gold', value: 700 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
    ],
    status: 'available',
    requiredLevel: 10
  },

  {
    id: 'the_replicated_man',
    title: 'The Replicated Man',
    description: 'Dr. Zimmer from the Commonwealth is searching for an escaped android. Help him track down the runaway, or help the android escape its pursuers.',
    objectives: [
      {
        id: 'talk_zimmer',
        description: 'Speak with Dr. Zimmer in Rivet City',
        type: 'talk',
        target: 'dr_zimmer',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'investigate_android',
        description: 'Investigate reports of the android',
        type: 'explore',
        target: 'android_clues',
        current: 0,
        required: 3,
        completed: false
      },
      {
        id: 'find_android',
        description: 'Locate the escaped android',
        type: 'talk',
        target: 'android',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'make_choice',
        description: 'Decide the android\'s fate',
        type: 'talk',
        target: 'android_choice',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 400 },
      { type: 'gold', value: 500 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
    ],
    status: 'available',
    requiredLevel: 12
  },

  {
    id: 'trouble_on_the_homefront',
    title: 'Trouble on the Homefront',
    description: 'Vault 101 is in crisis. The Overseer is dead, and the vault is divided between those who want to open to the outside world and those who want to remain sealed.',
    objectives: [
      {
        id: 'return_vault_101',
        description: 'Return to Vault 101',
        type: 'explore',
        target: 'vault_101_return',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'investigate_crisis',
        description: 'Investigate the crisis in the vault',
        type: 'talk',
        target: 'vault_resident',
        current: 0,
        required: 3,
        completed: false
      },
      {
        id: 'resolve_conflict',
        description: 'Resolve the conflict in Vault 101',
        type: 'talk',
        target: 'vault_resolution',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 350 },
      { type: 'gold', value: 300 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
    ],
    status: 'available',
    requiredLevel: 14
  }
];

export const dlcQuests: Quest[] = [
  // THE PITT QUESTS
  {
    id: 'into_the_pitt',
    title: 'Into the Pitt',
    description: 'Travel to the industrial wasteland of The Pitt and discover the dark secrets of this slave city built on steel production.',
    objectives: [
      {
        id: 'reach_the_pitt',
        description: 'Travel to The Pitt',
        type: 'explore',
        target: 'the_pitt_entrance',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'meet_werner',
        description: 'Meet with Werner in the steelyard',
        type: 'talk',
        target: 'werner',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'investigate_situation',
        description: 'Investigate the situation in The Pitt',
        type: 'explore',
        target: 'pitt_investigation',
        current: 0,
        required: 3,
        completed: false
      },
      {
        id: 'meet_ashur',
        description: 'Meet with Lord Ashur',
        type: 'talk',
        target: 'ashur',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 400 },
      { type: 'gold', value: 300 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
    ],
    status: 'available',
    requiredLevel: 8
  },

  {
    id: 'unsafe_working_conditions',
    title: 'Unsafe Working Conditions',
    description: 'Choose between supporting Lord Ashur\'s vision of a cure for the Trog Degenerative Contagion or helping the Underground free the workers.',
    objectives: [
      {
        id: 'choose_faction',
        description: 'Choose between Ashur and the Underground',
        type: 'talk',
        target: 'pitt_faction_choice',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'complete_faction_mission',
        description: 'Complete your chosen faction\'s mission',
        type: 'explore',
        target: 'pitt_faction_mission',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'resolve_pitt_crisis',
        description: 'Resolve the crisis in The Pitt',
        type: 'talk',
        target: 'pitt_resolution',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 600 },
      { type: 'gold', value: 500 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
    ],
    status: 'available',
    requiredLevel: 10
  },

  // POINT LOOKOUT QUESTS
  {
    id: 'the_local_flavor',
    title: 'The Local Flavor',
    description: 'Point Lookout harbors dark secrets and ancient conflicts. Navigate the war between Desmond Lockheart and Professor Calvert.',
    objectives: [
      {
        id: 'reach_point_lookout',
        description: 'Travel to Point Lookout',
        type: 'explore',
        target: 'point_lookout_dock',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'meet_desmond',
        description: 'Meet Desmond Lockheart',
        type: 'talk',
        target: 'desmond',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'investigate_calvert',
        description: 'Investigate Professor Calvert',
        type: 'explore',
        target: 'calvert_mansion',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'choose_side',
        description: 'Choose between Desmond and Calvert',
        type: 'talk',
        target: 'lookout_faction_choice',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'end_ancient_war',
        description: 'End the ancient war',
        type: 'kill',
        target: 'ancient_enemy',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 500 },
      { type: 'gold', value: 600 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
    ],
    status: 'available',
    requiredLevel: 12
  },

  // MOTHERSHIP ZETA QUESTS
  {
    id: 'not_of_this_world',
    title: 'Not of This World',
    description: 'You\'ve been abducted by aliens and taken aboard their mothership. Escape and prevent an invasion of Earth.',
    objectives: [
      {
        id: 'escape_holding_cell',
        description: 'Escape from the alien holding cell',
        type: 'explore',
        target: 'alien_cell_escape',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'free_prisoners',
        description: 'Free the other human prisoners',
        type: 'talk',
        target: 'human_prisoner',
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
  },

  // BROKEN STEEL QUESTS
  {
    id: 'death_from_above',
    title: 'Death From Above',
    description: 'The Enclave has mobile base crawler threatening the Capital Wasteland. Work with the Brotherhood to destroy this massive war machine.',
    objectives: [
      {
        id: 'locate_crawler',
        description: 'Locate the Enclave mobile base crawler',
        type: 'explore',
        target: 'enclave_crawler',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'infiltrate_crawler',
        description: 'Infiltrate the mobile base',
        type: 'explore',
        target: 'crawler_infiltration',
        current: 0,
        required: 1,
        completed: false
      },
      {
        id: 'sabotage_crawler',
        description: 'Sabotage the crawler\'s systems',
        type: 'explore',
        target: 'crawler_sabotage',
        current: 0,
        required: 3,
        completed: false
      },
      {
        id: 'escape_crawler',
        description: 'Escape before the crawler is destroyed',
        type: 'explore',
        target: 'crawler_escape',
        current: 0,
        required: 1,
        completed: false
      }
    ],
    rewards: [
      { type: 'experience', value: 750 },
      { type: 'gold', value: 800 },
      { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
    ],
    status: 'available',
    requiredLevel: 20
  }
];

export const allQuests = [...mainQuests, ...sideQuests, ...dlcQuests];