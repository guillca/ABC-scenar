import type { ReactNode } from 'react';

export enum LearningTypeEnum {
  ACQUISITION = 'Acquisition',
  INVESTIGATION = 'Investigation',
  PRACTICE = 'Practice',
  DISCUSSION = 'Discussion',
  COLLABORATION = 'Collaboration',
  PRODUCTION = 'Production',
}

export interface EmblematicActivity {
  title: string;
  description: string;
  isCustom?: boolean;
}

export interface LearningType {
  id: LearningTypeEnum;
  name: string;
  description: string;
  color: string;
  icon: ReactNode;
  emblematicActivities: EmblematicActivity[];
}

export interface StoryboardActivity {
  id: string;
  type: LearningTypeEnum;
  title: string;
  description: string;
  duration: number; // in minutes
  isOnline: boolean;
  isExisting: boolean;
  expert: string;
}

export interface Sequence {
  id: string;
  title: string;
  objectives: string;
  activities: StoryboardActivity[];
}

export interface ModuleDetails {
  title: string;
  objectives: string;
}