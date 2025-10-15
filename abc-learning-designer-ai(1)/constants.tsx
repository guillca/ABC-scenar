import type { LearningType } from './types';
import { LearningTypeEnum } from './types';
import { AcquisitionIcon, InvestigationIcon, PracticeIcon, DiscussionIcon, CollaborationIcon, ProductionIcon } from './components/icons/LearningIcons';

export const LEARNING_TYPES: Record<LearningTypeEnum, LearningType> = {
  [LearningTypeEnum.ACQUISITION]: {
    id: LearningTypeEnum.ACQUISITION,
    name: 'Acquisition',
    description: 'Apprendre en lisant, regardant ou écoutant.',
    color: 'bg-blue-500',
    icon: <AcquisitionIcon className="w-6 h-6" />,
    emblematicActivities: [
      { title: 'Lire un article / chapitre', description: 'Lecture d\'un texte fondamental pour le cours.' },
      { title: 'Regarder une vidéo de cours', description: 'Visionnage d\'une capsule vidéo explicative.' },
      { title: 'Écouter un podcast expert', description: 'Écoute d\'une interview ou d\'une discussion thématique.' },
    ],
  },
  [LearningTypeEnum.INVESTIGATION]: {
    id: LearningTypeEnum.INVESTIGATION,
    name: 'Investigation',
    description: 'Explorer, comparer et critiquer des ressources.',
    color: 'bg-green-500',
    icon: <InvestigationIcon className="w-6 h-6" />,
    emblematicActivities: [
      { title: 'Recherche documentaire', description: 'Trouver et synthétiser des informations sur un sujet donné.' },
      { title: 'Analyse comparative', description: 'Comparer deux ou plusieurs sources, théories ou études de cas.' },
      { title: 'Enquête de terrain', description: 'Recueillir des données par l\'observation ou des entretiens.' },
    ],
  },
  [LearningTypeEnum.PRACTICE]: {
    id: LearningTypeEnum.PRACTICE,
    name: 'Pratique',
    description: 'Appliquer ses connaissances et recevoir du feedback.',
    color: 'bg-orange-500',
    icon: <PracticeIcon className="w-6 h-6" />,
    emblematicActivities: [
      { title: 'Exercices d\'application', description: 'Résoudre des problèmes ou répondre à des questions ciblées.' },
      { title: 'Simulation / Jeu de rôle', description: 'Mettre en pratique des compétences dans un environnement contrôlé.' },
      { title: 'Quiz formatif', description: 'Tester sa compréhension et identifier les points à améliorer.' },
    ],
  },
  [LearningTypeEnum.DISCUSSION]: {
    id: LearningTypeEnum.DISCUSSION,
    name: 'Discussion',
    description: 'Apprendre par la conversation et le débat.',
    color: 'bg-purple-500',
    icon: <DiscussionIcon className="w-6 h-6" />,
    emblematicActivities: [
      { title: 'Débat argumenté', description: 'Défendre un point de vue sur une question controversée.' },
      { title: 'Discussion sur forum', description: 'Échanger de manière asynchrone sur une question de cours.' },
      { title: 'Session de questions-réponses', description: 'Interagir avec l\'enseignant ou un expert invité.' },
    ],
  },
  [LearningTypeEnum.COLLABORATION]: {
    id: LearningTypeEnum.COLLABORATION,
    name: 'Collaboration',
    description: 'Travailler avec d\'autres pour produire un résultat commun.',
    color: 'bg-yellow-500',
    icon: <CollaborationIcon className="w-6 h-6" />,
    emblematicActivities: [
      { title: 'Projet de groupe', description: 'Réaliser une production collective (rapport, présentation, etc.).' },
      { title: 'Rédaction d\'un wiki', description: 'Construire collaborativement une ressource de connaissances.' },
      { title: 'Peer-review (évaluation par les pairs)', description: 'Donner et recevoir du feedback constructif sur un travail.' },
    ],
  },
  [LearningTypeEnum.PRODUCTION]: {
    id: LearningTypeEnum.PRODUCTION,
    name: 'Production',
    description: 'Créer quelque chose de nouveau pour articuler sa compréhension.',
    color: 'bg-red-500',
    icon: <ProductionIcon className="w-6 h-6" />,
    emblematicActivities: [
      { title: 'Rédiger un essai / article de blog', description: 'Articuler une pensée complexe et personnelle par écrit.' },
      { title: 'Créer une présentation / vidéo', description: 'Synthétiser et présenter des connaissances de manière visuelle.' },
      { title: 'Développer un prototype / portfolio', description: 'Concevoir une solution concrète à un problème.' },
    ],
  },
};

export const LEARNING_TYPES_LIST = Object.values(LEARNING_TYPES);
