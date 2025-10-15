import React, { useState, useEffect, useCallback } from 'react';
import type { StoryboardActivity, ModuleDetails, Sequence } from '../types';
import { LEARNING_TYPES } from '../constants';
import { generateActivityIdeas } from '../services/geminiService';
import { AILoaderIcon } from './icons/LearningIcons';


interface DetailsPanelProps {
  activity: StoryboardActivity;
  moduleDetails: ModuleDetails;
  sequence: Sequence;
  onUpdate: (activity: StoryboardActivity) => void;
  onClose: () => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ activity, moduleDetails, sequence, onUpdate, onClose }) => {
  const [localActivity, setLocalActivity] = useState(activity);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalActivity(activity);
  }, [activity]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setLocalActivity(prev => {
        const updated = {
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (name === 'duration' ? parseInt(value, 10) || 0 : value),
        };
        onUpdate(updated); // Update parent state in real-time
        return updated;
    });
  };

  const handleGenerateIdeas = useCallback(async () => {
    setIsLoading(true);
    setSuggestions([]);
    const context = {
        title: moduleDetails.title,
        objectives: sequence.objectives || moduleDetails.objectives
    }
    const ideas = await generateActivityIdeas(context, LEARNING_TYPES[localActivity.type]);
    setSuggestions(ideas);
    setIsLoading(false);
  }, [moduleDetails, sequence, localActivity.type]);

  const applySuggestion = (suggestion: string) => {
    const updated = { ...localActivity, title: suggestion };
    setLocalActivity(updated);
    onUpdate(updated);
  };

  const typeInfo = LEARNING_TYPES[localActivity.type];

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Détails de l'Activité</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      
        <div className={`p-3 mb-4 rounded-lg text-white flex items-center gap-3 ${typeInfo.color}`}>
            {typeInfo.icon}
            <span className="font-bold">{typeInfo.name}</span>
        </div>
      
        <div className="space-y-4 flex-grow">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={localActivity.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    id="description"
                    value={localActivity.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
            </div>
             <div>
                <label htmlFor="expert" className="block text-sm font-medium text-gray-700">Expert à mobiliser</label>
                <input
                    type="text"
                    name="expert"
                    id="expert"
                    value={localActivity.expert}
                    onChange={handleChange}
                    placeholder="Ex: Jean Dupont, expert en SEO"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durée (min)</label>
                    <input
                        type="number"
                        name="duration"
                        id="duration"
                        value={localActivity.duration}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                </div>
                 <div className="flex-1 flex flex-col justify-end">
                     <div className="flex items-center mb-2.5">
                        <input
                            id="isOnline"
                            name="isOnline"
                            type="checkbox"
                            checked={localActivity.isOnline}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-900">
                            En ligne
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <input
                    id="isExisting"
                    name="isExisting"
                    type="checkbox"
                    checked={localActivity.isExisting}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isExisting" className="ml-2 block text-sm text-gray-900">
                    Contenu / Activité existant(e)
                </label>
            </div>

            <div className="border-t pt-4">
                 <button 
                    onClick={handleGenerateIdeas} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                    {isLoading ? <AILoaderIcon /> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    }
                    {isLoading ? 'Génération en cours...' : 'Suggérer des idées avec l\'IA'}
                </button>
                {suggestions.length > 0 && (
                     <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Suggestions :</h4>
                        {suggestions.map((s, i) => (
                             <div key={i} onClick={() => applySuggestion(s)} className="text-sm p-2 bg-gray-100 rounded-md hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition">
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default DetailsPanel;
