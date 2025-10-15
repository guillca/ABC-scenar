import React, { useState } from 'react';
import type { StoryboardActivity, Sequence, LearningTypeEnum, EmblematicActivity } from '../types';
import { LEARNING_TYPES } from '../constants';
import { UserIcon, PlusIcon } from './icons/LearningIcons';

interface ActivityCardProps {
    activity: StoryboardActivity;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onUpdate: (activity: StoryboardActivity) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    isBeingDragged: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isSelected, onSelect, onDelete, onUpdate, onDragStart, onDragEnd, onDrop, onDragOver, isBeingDragged }) => {
    const typeInfo = LEARNING_TYPES[activity.type];

    return (
        <div 
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={onSelect}
            className={`w-full p-4 rounded-lg shadow-md border-2 transition-all relative ${
                isSelected ? 'border-blue-500 scale-102 shadow-xl' : 'border-transparent hover:border-blue-300'
            } ${typeInfo.color} ${isBeingDragged ? 'opacity-50 cursor-grabbing' : 'cursor-pointer'}`}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-white pt-1">{typeInfo.icon}</div>
                <div className="flex-grow text-white">
                    <h4 className="font-bold text-lg">{activity.title}</h4>
                    <p className="text-sm opacity-90">{activity.duration} min | {activity.isOnline ? 'En ligne' : 'Présentiel'}</p>
                    <div className="flex justify-between items-center text-xs opacity-80 mt-3 gap-4">
                        <div className="flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4" />
                            <span>{activity.expert || 'Aucun expert'}</span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={activity.isExisting}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onUpdate({ ...activity, isExisting: e.target.checked })
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Existant</span>
                        </label>
                    </div>
                </div>
            </div>
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-20 text-white hover:bg-opacity-40 transition-colors"
                aria-label="Supprimer l'activité"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};


interface StoryboardProps {
    sequences: Sequence[];
    onUpdateSequence: (sequence: Sequence) => void;
    onAddActivity: (sequenceId: string, type: LearningTypeEnum, emblematicActivity?: EmblematicActivity) => void;
    onSelectActivity: (selection: { sequenceId: string; activityId: string } | null) => void;
    selectedActivitySelection: { sequenceId: string; activityId: string } | null;
    isDragging: boolean;
    onDeleteActivity: (sequenceId: string, activityId: string) => void;
    onAddSequence: () => void;
    onUpdateActivity: (sequenceId: string, activity: StoryboardActivity) => void;
    onReorderActivity: (sequenceId: string, draggedId: string, targetId: string) => void;
}

const Storyboard: React.FC<StoryboardProps> = (props) => {
  const { sequences, onUpdateSequence, onAddActivity, onSelectActivity, selectedActivitySelection, isDragging, onDeleteActivity, onAddSequence, onUpdateActivity, onReorderActivity } = props;
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);

  const handleDropFromPalette = (e: React.DragEvent<HTMLDivElement>, sequenceId: string) => {
    e.preventDefault();
    // Check if we are dragging a new activity from palette
    const type = e.dataTransfer.getData('learningType') as LearningTypeEnum;
    if (type && LEARNING_TYPES[type]) {
        const activityType = e.dataTransfer.getData('activityType');
        if (activityType === 'emblematic') {
            const activityData = JSON.parse(e.dataTransfer.getData('activityData')) as EmblematicActivity;
            onAddActivity(sequenceId, type, activityData);
        } else {
            onAddActivity(sequenceId, type);
        }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleActivityDragStart = (e: React.DragEvent<HTMLDivElement>, activityId: string, sequenceId: string) => {
    e.dataTransfer.setData('reorderingActivityId', activityId);
    e.dataTransfer.setData('sourceSequenceId', sequenceId);
    setDraggedActivityId(activityId);
  };

  const handleActivityDragEnd = () => {
    setDraggedActivityId(null);
  };
  
  const handleActivityDrop = (e: React.DragEvent<HTMLDivElement>, targetSequenceId: string, targetActivityId: string) => {
    e.preventDefault();
    e.stopPropagation(); // prevent sequence drop handler from firing
    
    const reorderingActivityId = e.dataTransfer.getData('reorderingActivityId');
    const sourceSequenceId = e.dataTransfer.getData('sourceSequenceId');

    if (reorderingActivityId && sourceSequenceId === targetSequenceId && reorderingActivityId !== targetActivityId) {
        onReorderActivity(targetSequenceId, reorderingActivityId, targetActivityId);
    }
  };


  return (
    <div className="space-y-6">
        {sequences.map(sequence => (
            <div 
                key={sequence.id}
                onDrop={(e) => handleDropFromPalette(e, sequence.id)}
                onDragOver={handleDragOver}
                className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all ${isDragging && !draggedActivityId ? 'border-dashed border-2 border-blue-500 bg-blue-50' : ''}`}
            >
                <input
                    type="text"
                    value={sequence.title}
                    onChange={(e) => onUpdateSequence({ ...sequence, title: e.target.value })}
                    className="text-xl font-semibold mb-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                />
                 <textarea
                    value={sequence.objectives}
                    onChange={(e) => onUpdateSequence({ ...sequence, objectives: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-md h-20 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm bg-white text-gray-900"
                    placeholder="Objectifs pédagogiques de la séquence..."
                />
                <div className="space-y-4 mt-4">
                    {sequence.activities.map(activity => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        isSelected={selectedActivitySelection?.activityId === activity.id}
                        onSelect={() => onSelectActivity({ sequenceId: sequence.id, activityId: activity.id })}
                        onDelete={() => onDeleteActivity(sequence.id, activity.id)}
                        onUpdate={(updated) => onUpdateActivity(sequence.id, updated)}
                        onDragStart={(e) => handleActivityDragStart(e, activity.id, sequence.id)}
                        onDragEnd={handleActivityDragEnd}
                        onDrop={(e) => handleActivityDrop(e, sequence.id, activity.id)}
                        onDragOver={handleDragOver}
                        isBeingDragged={draggedActivityId === activity.id}
                    />
                    ))}
                    {isDragging && !draggedActivityId && (
                        <div className="h-24 flex items-center justify-center text-blue-500 font-semibold bg-blue-100 rounded-lg border-2 border-dashed border-blue-500">
                            Déposez ici pour ajouter à "{sequence.title}"
                        </div>
                    )}
                </div>
            </div>
        ))}
        <button 
            onClick={onAddSequence}
            className="w-full flex items-center justify-center gap-2 text-blue-600 font-semibold py-3 px-4 rounded-lg border-2 border-dashed border-blue-400 hover:bg-blue-50 hover:border-blue-600 transition"
        >
            <PlusIcon className="w-5 h-5" />
            Ajouter une séquence
        </button>
    </div>
  );
};

export default Storyboard;