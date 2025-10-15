import React, { useState } from 'react';
import type { LearningType, EmblematicActivity, LearningTypeEnum } from '../types';

interface DraggableItemProps {
  children: React.ReactNode;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  className?: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ children, onDragStart, onDragEnd, className }) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    className={`cursor-grab active:cursor-grabbing transition-transform transform hover:scale-105 ${className}`}
  >
    {children}
  </div>
);

interface PaletteProps {
    learningTypes: LearningType[];
    onDragStart: () => void;
    onDragEnd: () => void;
    onAddCustomActivity: (typeId: LearningTypeEnum, title: string) => void;
    onDeleteCustomActivity: (typeId: LearningTypeEnum, title: string) => void;
}

const Palette: React.FC<PaletteProps> = ({ learningTypes, onDragStart, onDragEnd, onAddCustomActivity, onDeleteCustomActivity }) => {
  const [expandedType, setExpandedType] = useState<LearningTypeEnum | null>(null);
  const [newActivityTitles, setNewActivityTitles] = useState<Record<string, string>>({});

  const handleTypeClick = (typeId: LearningTypeEnum) => {
    setExpandedType(prev => (prev === typeId ? null : typeId));
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: LearningType, activity?: EmblematicActivity) => {
    e.dataTransfer.setData('learningType', type.id);
    if (activity) {
      e.dataTransfer.setData('activityType', 'emblematic');
      e.dataTransfer.setData('activityData', JSON.stringify(activity));
    } else {
      e.dataTransfer.setData('activityType', 'blank');
    }
    onDragStart();
  };

  const handleNewActivityChange = (typeId: LearningTypeEnum, value: string) => {
      setNewActivityTitles(prev => ({ ...prev, [typeId]: value }));
  };

  const handleAddActivity = (typeId: LearningTypeEnum) => {
      const title = newActivityTitles[typeId];
      if (title && title.trim()) {
          onAddCustomActivity(typeId, title.trim());
          handleNewActivityChange(typeId, '');
      }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Types d'Apprentissage</h2>
      <div className="space-y-3">
        {learningTypes.map(type => (
          <div key={type.id} className={`p-3 rounded-lg shadow-md text-white ${type.color}`}>
            <DraggableItem
              onDragStart={(e) => handleDragStart(e, type)}
              onDragEnd={onDragEnd}
            >
              <div className="flex items-center gap-3" onClick={() => handleTypeClick(type.id)}>
                <div className="flex-shrink-0">{type.icon}</div>
                <div className="flex-grow">
                  <h4 className="font-bold">{type.name}</h4>
                  <p className="text-sm opacity-90">{type.description}</p>
                </div>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedType === type.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </DraggableItem>

            {expandedType === type.id && (
              <div className="mt-3 pt-3 border-t border-white border-opacity-30 space-y-2">
                <h5 className="text-xs font-bold opacity-80">ACTIVITÉS EMBLÉMATIQUES</h5>
                {type.emblematicActivities.map((act, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <DraggableItem
                          onDragStart={(e) => handleDragStart(e, type, act)}
                          onDragEnd={onDragEnd}
                          className="flex-grow p-2 rounded-md bg-black bg-opacity-20 hover:bg-opacity-30"
                      >
                          <p className="font-semibold text-sm">{act.title}</p>
                      </DraggableItem>
                      {act.isCustom && (
                        <button
                            onClick={() => onDeleteCustomActivity(type.id, act.title)}
                            className="p-1 rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Supprimer l'activité personnalisée"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                      )}
                    </div>
                ))}

                 <div className="mt-2 pt-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Ajouter une activité..."
                            value={newActivityTitles[type.id] || ''}
                            onChange={(e) => handleNewActivityChange(type.id, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddActivity(type.id)}
                            className="flex-grow bg-transparent text-white placeholder-white placeholder-opacity-70 text-sm border-b border-white border-opacity-50 focus:border-opacity-100 focus:outline-none py-1"
                        />
                        <button
                            onClick={() => handleAddActivity(type.id)}
                            className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition"
                            aria-label="Ajouter"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Palette;