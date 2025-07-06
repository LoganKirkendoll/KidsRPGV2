import React, { useState, useEffect } from 'react';
import { DevMode as DevModeType, Quest, NPC, Item } from '../types/game';
import { Settings, Plus, Save, Upload, Download, Map, Users, Package, Scroll } from 'lucide-react';

interface DevModeProps {
  devMode: DevModeType;
  onUpdateDevMode: (devMode: DevModeType) => void;
  onCreateQuest: (quest: Quest) => void;
  onCreateNPC: (npc: NPC) => void;
  onCreateItem: (item: Item) => void;
}

const DevMode: React.FC<DevModeProps> = ({
  devMode,
  onUpdateDevMode,
  onCreateQuest,
  onCreateNPC,
  onCreateItem
}) => {
  const [activeTab, setActiveTab] = useState<'quest' | 'npc' | 'item' | 'terrain'>('quest');
  
  // Prevent hotkeys when dev mode is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (devMode.enabled) {
        // Allow F1 to close dev mode, but prevent other hotkeys
        if (e.key !== 'F1') {
          e.stopPropagation();
        }
      }
    };
    
    if (devMode.enabled) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [devMode.enabled]);

  const handleQuestCreate = () => {
    const quest: Quest = {
      id: devMode.questEditor.id || `quest_${Date.now()}`,
      title: devMode.questEditor.title || 'New Quest',
      description: devMode.questEditor.description || 'Quest description',
      objectives: devMode.questEditor.objectives.length > 0 ? devMode.questEditor.objectives : [
        {
          id: 'objective_1',
          description: 'Complete objective',
          type: 'kill',
          target: 'enemy',
          current: 0,
          required: 1,
          completed: false
        }
      ],
      rewards: devMode.questEditor.rewards.length > 0 ? devMode.questEditor.rewards : [
        { type: 'experience', value: 100 }
      ],
      status: 'available',
      requiredLevel: devMode.questEditor.requiredLevel || 1
    };
    
    onCreateQuest(quest);
    
    // Reset editor
    onUpdateDevMode({
      ...devMode,
      questEditor: {
        id: '',
        title: '',
        description: '',
        objectives: [],
        rewards: [],
        requiredLevel: 1
      }
    });
  };

  const handleNPCCreate = () => {
    const npc: NPC = {
      id: devMode.npcEditor.id || `npc_${Date.now()}`,
      name: devMode.npcEditor.name || 'New NPC',
      type: devMode.npcEditor.type || 'neutral',
      position: devMode.npcEditor.position || { x: 400, y: 400 },
      sprite: 'npc_placeholder',
      dialogue: devMode.npcEditor.dialogue.length > 0 ? devMode.npcEditor.dialogue : [
        {
          id: 'greeting',
          text: 'Hello, traveler!',
          choices: [
            { id: 'goodbye', text: 'Goodbye', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Safe travels!',
          choices: []
        }
      ],
      inventory: devMode.npcEditor.inventory || [],
      faction: devMode.npcEditor.faction || 'neutral',
      isHostile: devMode.npcEditor.isHostile || false
    };
    
    onCreateNPC(npc);
    
    // Reset editor
    onUpdateDevMode({
      ...devMode,
      npcEditor: {
        id: '',
        name: '',
        type: 'neutral',
        position: { x: 400, y: 400 },
        dialogue: [],
        inventory: [],
        faction: 'neutral',
        isHostile: false
      }
    });
  };

  const handleItemCreate = () => {
    const item: Item = {
      id: devMode.itemEditor.id || `item_${Date.now()}`,
      name: devMode.itemEditor.name || 'New Item',
      type: devMode.itemEditor.type || 'material',
      rarity: devMode.itemEditor.rarity || 'common',
      description: devMode.itemEditor.description || 'Item description',
      stats: devMode.itemEditor.stats || {},
      value: devMode.itemEditor.value || 10,
      sprite: 'item_placeholder',
      stackable: devMode.itemEditor.stackable || false
    };
    
    onCreateItem(item);
    
    // Reset editor
    onUpdateDevMode({
      ...devMode,
      itemEditor: {
        id: '',
        name: '',
        type: 'material',
        rarity: 'common',
        description: '',
        stats: {},
        value: 10,
        stackable: false
      }
    });
  };

  if (!devMode.enabled) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => onUpdateDevMode({ ...devMode, enabled: true })}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
          title="Enable Dev Mode"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-400 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Developer Mode
          </h2>
          <button
            onClick={() => onUpdateDevMode({ ...devMode, enabled: false })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Close Dev Mode
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'quest', label: 'Quests', icon: Scroll },
            { id: 'npc', label: 'NPCs', icon: Users },
            { id: 'item', label: 'Items', icon: Package },
            { id: 'terrain', label: 'Terrain', icon: Map }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${activeTab === tab.id ? 
                  'bg-purple-600 text-white' : 
                  'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* Quest Editor */}
          {activeTab === 'quest' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-yellow-400">Quest Editor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quest ID</label>
                  <input
                    type="text"
                    value={devMode.questEditor.id}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      questEditor: { ...devMode.questEditor, id: e.target.value }
                    })}
                    placeholder="quest_id"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={devMode.questEditor.title}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      questEditor: { ...devMode.questEditor, title: e.target.value }
                    })}
                    placeholder="Quest Title"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={devMode.questEditor.description}
                  onChange={(e) => onUpdateDevMode({
                    ...devMode,
                    questEditor: { ...devMode.questEditor, description: e.target.value }
                  })}
                  placeholder="Quest description..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Required Level</label>
                <input
                  type="number"
                  value={devMode.questEditor.requiredLevel}
                  onChange={(e) => onUpdateDevMode({
                    ...devMode,
                    questEditor: { ...devMode.questEditor, requiredLevel: parseInt(e.target.value) || 1 }
                  })}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <button
                onClick={handleQuestCreate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Quest
              </button>
            </div>
          )}

          {/* NPC Editor */}
          {activeTab === 'npc' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-yellow-400">NPC Editor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">NPC ID</label>
                  <input
                    type="text"
                    value={devMode.npcEditor.id}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      npcEditor: { ...devMode.npcEditor, id: e.target.value }
                    })}
                    placeholder="npc_id"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={devMode.npcEditor.name}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      npcEditor: { ...devMode.npcEditor, name: e.target.value }
                    })}
                    placeholder="NPC Name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={devMode.npcEditor.type}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      npcEditor: { ...devMode.npcEditor, type: e.target.value as any }
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="trader">Trader</option>
                    <option value="quest_giver">Quest Giver</option>
                    <option value="recruitable">Recruitable</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Faction</label>
                  <input
                    type="text"
                    value={devMode.npcEditor.faction}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      npcEditor: { ...devMode.npcEditor, faction: e.target.value }
                    })}
                    placeholder="Faction"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={devMode.npcEditor.isHostile}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      npcEditor: { ...devMode.npcEditor, isHostile: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-gray-300">Hostile</span>
                </label>
              </div>
              
              <button
                onClick={handleNPCCreate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create NPC
              </button>
            </div>
          )}

          {/* Item Editor */}
          {activeTab === 'item' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-yellow-400">Item Editor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Item ID</label>
                  <input
                    type="text"
                    value={devMode.itemEditor.id}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      itemEditor: { ...devMode.itemEditor, id: e.target.value }
                    })}
                    placeholder="item_id"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={devMode.itemEditor.name}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      itemEditor: { ...devMode.itemEditor, name: e.target.value }
                    })}
                    placeholder="Item Name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={devMode.itemEditor.type}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      itemEditor: { ...devMode.itemEditor, type: e.target.value as any }
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="helmet">Helmet</option>
                    <option value="boots">Boots</option>
                    <option value="accessory">Accessory</option>
                    <option value="consumable">Consumable</option>
                    <option value="material">Material</option>
                    <option value="quest">Quest Item</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                  <select
                    value={devMode.itemEditor.rarity}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      itemEditor: { ...devMode.itemEditor, rarity: e.target.value as any }
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
                  <input
                    type="number"
                    value={devMode.itemEditor.value}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      itemEditor: { ...devMode.itemEditor, value: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={devMode.itemEditor.description}
                  onChange={(e) => onUpdateDevMode({
                    ...devMode,
                    itemEditor: { ...devMode.itemEditor, description: e.target.value }
                  })}
                  placeholder="Item description..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={devMode.itemEditor.stackable}
                    onChange={(e) => onUpdateDevMode({
                      ...devMode,
                      itemEditor: { ...devMode.itemEditor, stackable: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-gray-300">Stackable</span>
                </label>
              </div>
              
              <button
                onClick={handleItemCreate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Item
              </button>
            </div>
          )}

          {/* Terrain Editor */}
          {activeTab === 'terrain' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-yellow-400">Terrain Editor</h3>
              <p className="text-gray-400">Terrain editing tools coming soon...</p>
            </div>
          )}
        </div>

        {/* Import/Export Tools */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-bold text-gray-300 mb-4">Import/Export Tools</h4>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevMode;