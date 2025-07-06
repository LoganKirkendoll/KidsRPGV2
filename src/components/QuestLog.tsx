import React, { useState, useEffect } from 'react';
import { Quest } from '../types/game';
import { Scroll, X, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';

interface QuestLogProps {
  quests: Quest[];
  completedQuests: string[];
  onClose: () => void;
  onTrackQuest?: (questId: string) => void;
}

const QuestLog: React.FC<QuestLogProps> = ({
  quests,
  completedQuests,
  onClose,
  onTrackQuest
}) => {
  // Disable hotkeys in quest log
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close quest log
      if (e.key === 'Escape') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const activeQuests = quests.filter(q => q.status === 'active' || q.status === 'available');
  const finishedQuests = quests.filter(q => q.status === 'completed');

  const getQuestIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed': return <X className="w-5 h-5 text-red-400" />;
      case 'available': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Scroll className="w-5 h-5 text-gray-400" />;
    }
  };

  const getObjectiveProgress = (quest: Quest) => {
    const completed = quest.objectives.filter(obj => obj.completed).length;
    const total = quest.objectives.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <Scroll className="w-8 h-8" />
            Quest Log
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedTab('active')}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all
              ${selectedTab === 'active' ? 
                'bg-blue-600 text-white' : 
                'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            Active Quests ({activeQuests.length})
          </button>
          <button
            onClick={() => setSelectedTab('completed')}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all
              ${selectedTab === 'completed' ? 
                'bg-green-600 text-white' : 
                'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            Completed ({finishedQuests.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
          {/* Quest List */}
          <div className="overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-white">
              {selectedTab === 'active' ? 'Active Quests' : 'Completed Quests'}
            </h3>
            
            <div className="space-y-3">
              {(selectedTab === 'active' ? activeQuests : finishedQuests).map((quest) => {
                const progress = getObjectiveProgress(quest);
                const isSelected = selectedQuest?.id === quest.id;
                
                return (
                  <div
                    key={quest.id}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected ? 
                        'border-yellow-400 bg-yellow-900/20' : 
                        'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }
                    `}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getQuestIcon(quest.status)}
                        <h4 className="font-bold text-yellow-400">{quest.title}</h4>
                      </div>
                      <div className="text-xs text-gray-400">
                        Level {quest.requiredLevel}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progress.completed}/{progress.total}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Rewards Preview */}
                    <div className="flex items-center gap-4 text-xs">
                      {quest.rewards.map((reward, index) => (
                        <span key={index} className="text-green-400">
                          {reward.type === 'experience' && `${reward.value} XP`}
                          {reward.type === 'gold' && `${reward.value} Caps`}
                          {reward.type === 'item' && reward.item?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {(selectedTab === 'active' ? activeQuests : finishedQuests).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Scroll className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>
                    {selectedTab === 'active' ? 
                      'No active quests. Explore the world to find new adventures!' : 
                      'No completed quests yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quest Details */}
          <div className="overflow-y-auto">
            {selectedQuest ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  {getQuestIcon(selectedQuest.status)}
                  <h3 className="text-xl font-bold text-yellow-400">{selectedQuest.title}</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">{selectedQuest.description}</p>
                
                {/* Objectives */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">Objectives:</h4>
                  <div className="space-y-3">
                    {selectedQuest.objectives.map((objective) => (
                      <div
                        key={objective.id}
                        className={`
                          p-3 rounded-lg border-l-4
                          ${objective.completed ? 
                            'border-green-400 bg-green-900/20' : 
                            'border-blue-400 bg-blue-900/20'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${objective.completed ? 'text-green-400' : 'text-blue-400'}`}>
                            {objective.completed ? '✓' : '○'} {objective.description}
                          </span>
                          <span className="text-sm text-gray-400">
                            {objective.current}/{objective.required}
                          </span>
                        </div>
                        
                        {!objective.completed && (
                          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                            <div 
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${(objective.current / objective.required) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rewards */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">Rewards:</h4>
                  <div className="space-y-2">
                    {selectedQuest.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center gap-2 text-green-400">
                        <Star className="w-4 h-4" />
                        <span>
                          {reward.type === 'experience' && `${reward.value} Experience Points`}
                          {reward.type === 'gold' && `${reward.value} Bottle Caps`}
                          {reward.type === 'item' && `${reward.item?.name || 'Unknown Item'}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quest Actions */}
                {selectedQuest.status === 'active' && onTrackQuest && (
                  <button
                    onClick={() => onTrackQuest(selectedQuest.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold"
                  >
                    Track Quest
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a quest to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestLog;