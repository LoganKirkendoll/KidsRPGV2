import React, { useEffect } from 'react';
import { DialogueState, NPC, DialogueChoice } from '../types/game';
import { X, MessageCircle } from 'lucide-react';

interface DialogueScreenProps {
  dialogue: DialogueState;
  npcs: NPC[];
  onChoice: (choiceId: string) => void;
  onOpenTrading: (npc: NPC) => void;
  onClose: () => void;
}

const DialogueScreen: React.FC<DialogueScreenProps> = ({
  dialogue,
  npcs,
  onChoice,
  onOpenTrading,
  onClose
}) => {
  // Disable hotkeys during dialogue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close dialogue, but prevent other hotkeys
      if (e.key === 'Escape') {
        onClose();
      } else {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);
  
  const npc = npcs.find(n => n.id === dialogue.npcId);
  const currentNode = npc?.dialogue.find(d => d.id === dialogue.currentNode);

  if (!npc || !currentNode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center text-white">
            <p>Dialogue error - NPC not found</p>
            <button onClick={onClose} className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 border-2 border-yellow-600">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-yellow-400">{npc.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NPC Portrait */}
        <div className="flex gap-6 mb-6">
          <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-full"></div>
          </div>
          
          {/* Dialogue Text */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-white text-lg leading-relaxed">{currentNode.text}</p>
            </div>
          </div>
        </div>

        {/* Dialogue Choices */}
        {currentNode.choices.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Choose your response:</h3>
            {currentNode.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => {
                  if (choice.action === 'open_trade') {
                    onOpenTrading(npc);
                  } else {
                    onChoice(choice.id);
                  }
                }}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-yellow-400 rounded-lg p-4 transition-all"
              >
                <span className="text-yellow-400 font-bold mr-2">{index + 1}.</span>
                <span className="text-white">{choice.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              End Conversation
            </button>
          </div>
        )}

        {/* Dialogue History */}
        {dialogue.history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Conversation History:</h4>
            <div className="max-h-32 overflow-y-auto">
              {dialogue.history.map((entry, index) => (
                <p key={index} className="text-xs text-gray-500 mb-1">{entry}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogueScreen;