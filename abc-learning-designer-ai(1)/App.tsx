import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { StoryboardActivity, ModuleDetails, LearningTypeEnum, Sequence, EmblematicActivity, LearningType } from './types';
import { LEARNING_TYPES, LEARNING_TYPES_LIST } from './constants';
import Palette from './components/Palette';
import Storyboard from './components/Storyboard';
import DetailsPanel from './components/DetailsPanel';
import AnalyticsChart from './components/AnalyticsChart';
import { LogoIcon, ExportIcon, JsonIcon, PdfIcon, AILoaderIcon, ImportIcon, ClockIcon } from './components/icons/LearningIcons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CUSTOM_ACTIVITIES_STORAGE_KEY = 'abc-custom-emblematic-activities';

const App: React.FC = () => {
  const [moduleDetails, setModuleDetails] = useState<ModuleDetails>({
    title: 'Introduction au Marketing Digital',
    objectives: 'À la fin de ce module, les apprenants seront capables de définir les concepts clés du marketing digital et d\'identifier les principaux canaux d\'acquisition.',
  });
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<{ sequenceId: string; activityId: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [learningTypes, setLearningTypes] = useState<Record<LearningTypeEnum, LearningType>>(LEARNING_TYPES);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
        const storedCustomActivitiesRaw = localStorage.getItem(CUSTOM_ACTIVITIES_STORAGE_KEY);
        if (storedCustomActivitiesRaw) {
            const storedCustomActivities = JSON.parse(storedCustomActivitiesRaw) as Record<LearningTypeEnum, EmblematicActivity[]>;
            const newLearningTypes = JSON.parse(JSON.stringify(LEARNING_TYPES));

            for (const typeId in storedCustomActivities) {
                if (newLearningTypes[typeId]) {
                    const uniqueCustomActivities = storedCustomActivities[typeId as LearningTypeEnum].filter(customAct => 
                        !newLearningTypes[typeId].emblematicActivities.some((defaultAct: EmblematicActivity) => defaultAct.title === customAct.title)
                    );
                    newLearningTypes[typeId].emblematicActivities.push(...uniqueCustomActivities);
                }
            }
            setLearningTypes(newLearningTypes);
        }
    } catch (error) {
        console.error("Failed to load custom activities from local storage:", error);
    }
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveCustomActivitiesToStorage = (currentLearningTypes: Record<LearningTypeEnum, LearningType>) => {
      const customActivitiesToStore: Partial<Record<LearningTypeEnum, EmblematicActivity[]>> = {};
      for (const typeId in currentLearningTypes) {
          const customActivities = currentLearningTypes[typeId as LearningTypeEnum].emblematicActivities.filter(act => act.isCustom);
          if (customActivities.length > 0) {
              customActivitiesToStore[typeId as LearningTypeEnum] = customActivities;
          }
      }
      localStorage.setItem(CUSTOM_ACTIVITIES_STORAGE_KEY, JSON.stringify(customActivitiesToStore));
  };

  const handleAddCustomActivity = useCallback((typeId: LearningTypeEnum, title: string) => {
    if (!title.trim()) return;

    setLearningTypes(prev => {
        const newLearningTypes = { ...prev };
        const targetType = { ...newLearningTypes[typeId] };
        
        if (targetType.emblematicActivities.some(act => act.title.toLowerCase() === title.toLowerCase().trim())) {
            return prev;
        }

        const newActivity: EmblematicActivity = {
            title: title.trim(),
            description: 'Activité personnalisée',
            isCustom: true,
        };

        targetType.emblematicActivities = [...targetType.emblematicActivities, newActivity];
        newLearningTypes[typeId] = targetType;
        
        saveCustomActivitiesToStorage(newLearningTypes);
        return newLearningTypes;
    });
  }, []);

  const handleDeleteCustomActivity = useCallback((typeId: LearningTypeEnum, title: string) => {
    setLearningTypes(prev => {
        const newLearningTypes = { ...prev };
        const targetType = { ...newLearningTypes[typeId] };
        
        targetType.emblematicActivities = targetType.emblematicActivities.filter(act => act.title !== title || !act.isCustom);
        
        newLearningTypes[typeId] = targetType;

        saveCustomActivitiesToStorage(newLearningTypes);
        return newLearningTypes;
    });
  }, []);


  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleAddSequence = () => {
    const newSequence: Sequence = {
      id: `seq_${Date.now()}`,
      title: `Nouvelle Séquence ${sequences.length + 1}`,
      objectives: '',
      activities: [],
    };
    setSequences(prev => [...prev, newSequence]);
  };

  const handleUpdateSequence = (updatedSequence: Sequence) => {
    setSequences(prev => prev.map(s => s.id === updatedSequence.id ? updatedSequence : s));
  };
  
  const handleAddActivity = (sequenceId: string, type: LearningTypeEnum, emblematicActivity?: EmblematicActivity) => {
    const newActivity: StoryboardActivity = {
      id: `activity_${Date.now()}`,
      type: type,
      title: emblematicActivity?.title || `Nouvelle activité: ${LEARNING_TYPES[type].name}`,
      description: emblematicActivity?.description || '',
      duration: 15,
      isOnline: true,
      isExisting: false,
      expert: '',
    };
    setSequences(prev => prev.map(s => {
      if (s.id === sequenceId) {
        return { ...s, activities: [...s.activities, newActivity] };
      }
      return s;
    }));
    setSelectedActivityId({ sequenceId, activityId: newActivity.id });
  };


  const handleUpdateActivity = (sequenceId: string, updatedActivity: StoryboardActivity) => {
    setSequences(prev =>
      prev.map(seq => {
        if (seq.id === sequenceId) {
          return {
            ...seq,
            activities: seq.activities.map(act =>
              act.id === updatedActivity.id ? updatedActivity : act
            ),
          };
        }
        return seq;
      })
    );
  };
  
  const handleDeleteActivity = (sequenceId: string, activityId: string) => {
    setSequences(prev => prev.map(seq => {
      if (seq.id === sequenceId) {
        return { ...seq, activities: seq.activities.filter(act => act.id !== activityId) };
      }
      return seq;
    }));

    if (selectedActivityId?.activityId === activityId) {
      setSelectedActivityId(null);
    }
  };

  const handleReorderActivity = (sequenceId: string, draggedId: string, targetId: string) => {
    setSequences(prev =>
      prev.map(seq => {
        if (seq.id === sequenceId) {
          const activities = [...seq.activities];
          const draggedIndex = activities.findIndex(a => a.id === draggedId);
          const targetIndex = activities.findIndex(a => a.id === targetId);

          if (draggedIndex === -1 || targetIndex === -1) return seq;

          // Remove dragged item and insert it before target item
          const [draggedItem] = activities.splice(draggedIndex, 1);
          activities.splice(targetIndex, 0, draggedItem);
          
          return { ...seq, activities };
        }
        return seq;
      })
    );
  };

  const handleExportJson = () => {
    setIsExportMenuOpen(false);
    const dataToExport = {
        moduleDetails,
        sequences,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    
    const safeTitle = (moduleDetails.title || 'scenario')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w.-]+/g, '');
    
    link.download = `${safeTitle}.json`;

    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

 const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setIsExportMenuOpen(false);

    const contentToExport = document.getElementById('export-container');
    if (!contentToExport) {
        console.error("Export container not found");
        setIsExportingPdf(false);
        return;
    }
    
    // The main container has `overflow-hidden` which clips the content.
    // We need to temporarily make it visible to capture the full storyboard.
    const mainContainer = contentToExport.parentElement;
    let originalMainOverflow = '';
    if (mainContainer) {
        originalMainOverflow = mainContainer.style.overflow;
        mainContainer.style.overflow = 'visible';
    }

    try {
        const canvas = await html2canvas(contentToExport, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasHeight / canvasWidth;
        
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth * canvasAspectRatio;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        const safeTitle = (moduleDetails.title || 'scenario')
          .toLowerCase()
          .replace(/\s+/g, '-') 
          .replace(/[^\w.-]+/g, ''); 
        
        pdf.save(`${safeTitle}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
    } finally {
        // Restore the original overflow style to prevent breaking the UI layout
        if (mainContainer) {
            mainContainer.style.overflow = originalMainOverflow;
        }
        setIsExportingPdf(false);
    }
  };
  
  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("Le contenu du fichier n'est pas une chaîne de caractères.");
            }
            const data = JSON.parse(text);

            if (data && data.moduleDetails && Array.isArray(data.sequences)) {
                setModuleDetails(data.moduleDetails);
                setSequences(data.sequences);
                setSelectedActivityId(null);
            } else {
                alert("Fichier JSON invalide ou mal formaté.");
            }
        } catch (error) {
            console.error("Error importing file:", error);
            alert("Erreur lors de l'importation du fichier. Assurez-vous que le fichier JSON est valide.");
        }
    };
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        alert("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(file);

    if (event.target) {
        event.target.value = '';
    }
  };


  const allActivities = useMemo(() => sequences.flatMap(s => s.activities), [sequences]);

  const totalDuration = useMemo(() => {
    return allActivities.reduce((total, activity) => total + (activity.duration || 0), 0);
  }, [allActivities]);

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let result = '';
    if (hours > 0) {
        result += `${hours} h `;
    }
    if (remainingMinutes > 0) {
        result += `${remainingMinutes} min`;
    }
    return result.trim();
  };

  const selectedActivityData = useMemo(() => {
    if (!selectedActivityId) return { activity: null, sequence: null };
    const sequence = sequences.find(s => s.id === selectedActivityId.sequenceId);
    if (!sequence) return { activity: null, sequence: null };
    const activity = sequence.activities.find(a => a.id === selectedActivityId.activityId);
    return { activity: activity || null, sequence };
  }, [sequences, selectedActivityId]);

  const { activity: selectedActivity, sequence: containingSequence } = selectedActivityData;
  const learningTypesList = useMemo(() => Object.values(learningTypes), [learningTypes]);


  return (
    <div className="flex flex-col h-screen font-sans text-gray-800">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between z-20">
         <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">ABC Learning Designer AI</h1>
        </div>
        <div className="flex items-center gap-4">
             <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
                <ImportIcon className="w-5 h-5" />
                Importer
            </button>
            <input
                type="file"
                ref={importInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
            <div className="relative" ref={exportMenuRef}>
                <button
                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition shadow-sm"
                >
                    <ExportIcon className="w-5 h-5" />
                    Exporter
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <button
                        onClick={handleExportJson}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                        <JsonIcon className="w-5 h-5 text-gray-500" />
                        <span>Export JSON</span>
                    </button>
                    <button
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isExportingPdf ? <AILoaderIcon className="w-5 h-5 text-gray-500" /> : <PdfIcon className="w-5 h-5 text-gray-500" />}
                        <span>{isExportingPdf ? 'Génération...' : 'Export PDF'}</span>
                    </button>
                  </div>
                )}
            </div>
        </div>
      </header>
      
      <main className="flex-grow flex overflow-hidden">
        <div className="w-72 bg-gray-100 p-4 overflow-y-auto border-r border-gray-200">
            <Palette
              learningTypes={learningTypesList}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onAddCustomActivity={handleAddCustomActivity}
              onDeleteCustomActivity={handleDeleteCustomActivity}
            />
        </div>
        
        <div 
          className="flex-1 flex flex-col p-6 overflow-y-auto"
          id="export-container"
        >
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
             <h2 className="text-xl font-semibold mb-2">Titre du Module</h2>
             <input
                type="text"
                value={moduleDetails.title}
                onChange={(e) => setModuleDetails(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                placeholder="Entrez le titre du module..."
            />
            <h2 className="text-xl font-semibold mt-4 mb-2">Objectifs Pédagogiques du Module</h2>
            <textarea
                value={moduleDetails.objectives}
                onChange={(e) => setModuleDetails(prev => ({ ...prev, objectives: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md h-24 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                placeholder="Décrivez les objectifs pédagogiques globaux..."
            />
          </div>

          <Storyboard 
            sequences={sequences}
            onUpdateSequence={handleUpdateSequence}
            onAddActivity={handleAddActivity}
            onSelectActivity={setSelectedActivityId}
            selectedActivitySelection={selectedActivityId}
            isDragging={isDragging}
            onDeleteActivity={handleDeleteActivity}
            onAddSequence={handleAddSequence}
            onUpdateActivity={handleUpdateActivity}
            onReorderActivity={handleReorderActivity}
          />

          {!sequences.length && !isDragging && (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8 mt-8">
                <p className="text-lg">Commencez par ajouter une séquence pour organiser vos activités.</p>
            </div>
          )}

        </div>
        
        <div className="w-1/3 max-w-md bg-white p-6 border-l border-gray-200 overflow-y-auto">
          {selectedActivity && containingSequence ? (
            <DetailsPanel
              key={selectedActivity.id}
              activity={selectedActivity}
              sequence={containingSequence}
              moduleDetails={moduleDetails}
              onUpdate={(updatedActivity) => handleUpdateActivity(containingSequence.id, updatedActivity)}
              onClose={() => setSelectedActivityId(null)}
            />
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Analyse du Scénario</h3>
               <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                <div className="flex items-center text-gray-600">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider">Durée Totale Estimée</h4>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{formatDuration(totalDuration)}</p>
              </div>
              <p className="text-gray-600 mb-6">
                Voici la répartition des types d'activités dans votre scénario. Visez un mélange équilibré pour un apprentissage engageant.
              </p>
              <div className="h-64">
                 <AnalyticsChart activities={allActivities} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;