import { Timestamp } from 'firebase/firestore';
import type { ExerciseType } from './workout';

export interface TemplateExercise {
  name: string;
  type: ExerciseType;
  defaultSets: number;
  defaultReps: number;
}

export interface Template {
  id: string;
  name: string;
  createdAt: Timestamp;
  exercises: TemplateExercise[];
}

/** Shape used when creating a new template (before Firestore assigns an id). */
export type TemplateData = Omit<Template, 'id'>;
