import { Timestamp } from 'firebase/firestore';

export const EXERCISE_TYPES = ['dumbbell', 'barbell', 'bodyweight', 'machine'] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export interface WorkoutSet {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  name: string;
  type: ExerciseType;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  templateId?: string;
  startedAt: Timestamp;
  completedAt: Timestamp;
  exercises: WorkoutExercise[];
}

/** Shape used when creating a new workout (before Firestore assigns an id). */
export type WorkoutData = Omit<Workout, 'id'>;
