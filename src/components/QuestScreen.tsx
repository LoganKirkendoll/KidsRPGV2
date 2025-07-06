import React, { useEffect } from 'react';
import { Quest } from '../types/game';
import { X, Target, CheckCircle, Clock, Star } from 'lucide-react';

interface QuestScreenProps {
  quests: Quest[];
  completedQuests: string[];
  onClose: () => void;
}

const QuestScreen: React.FC<QuestScreenProps> = ({
  quests,
  completedQuests,
  onClose
}) => {
  // Disable hotkeys in quest screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape and 'q' to close quest screen
      if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const activeQuests = quests.filter(q => q.status === 'active');
  const availableQuests = quests.filter(q => q.status === 'available');
  const completed = quests.filter(q => q.status === 'completed');

  const getQuestIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'available': return <Star className="w-5 h-5 text-blue-400" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressPercentage = (quest: Quest) => {
    const totalObjectives = quest.objectives.length;
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    return totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400">Quest Log</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Active Quests */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Active Quests ({activeQuests.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeQuests.map(quest => (
                <div key={quest.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-400">
                  <div className="flex items-start gap-3 mb-3">
                    {getQuestIcon(quest.status)}
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{quest.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{quest.description}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(getProgressPercentage(quest))}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(quest)}%` }}
                      />
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="space-y-2">
                    {quest.objectives.map(objective => (
                      <div key={objective.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          objective.completed ? 'bg-green-600 border-green-600' : 'border-gray-400'
                        }`}>
                          {objective.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={objective.completed ? 'text-green-400 line-through' : 'text-gray-300'}>
                          {objective.description}
                        </span>
                        <span className="text-gray-500 ml-auto">
                          {objective.current}/{objective.required}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rewards */}
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <h5 className="text-xs font-semibold text-gray-400 mb-1">Rewards:</h5>
                    <div className="flex flex-wrap gap-2">
                      {quest.rewards.map((reward, index) => (
                        <span key={index} className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {reward.type === 'experience' && `${reward.value} XP`}
                          {reward.type === 'gold' && `${reward.value} Gold`}
                          {reward.type === 'item' && reward.item?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {activeQuests.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No active quests</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Quests */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Available Quests ({availableQuests.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableQuests.map(quest => (
                <div key={quest.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="flex items-start gap-3 mb-3">
                    {getQuestIcon(quest.status)}
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{quest.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{quest.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Required Level: {quest.requiredLevel}</p>
                    </div>
                  </div>

                  {/* Rewards Preview */}
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <h5 className="text-xs font-semibold text-gray-400 mb-1">Rewards:</h5>
                    <div className="flex flex-wrap gap-2">
                      {quest.rewards.map((reward, index) => (
                        <span key={index} className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {reward.type === 'experience' && `${reward.value} XP`}
                          {reward.type === 'gold' && `${reward.value} Gold`}
                          {reward.type === 'item' && reward.item?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {availableQuests.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No available quests</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Quests */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Completed Quests ({completed.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {completed.map(quest => (
                <div key={quest.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-400 opacity-75">
                  <div className="flex items-start gap-3">
                    {getQuestIcon(quest.status)}
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{quest.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{quest.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {completed.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No completed quests yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestScreen;