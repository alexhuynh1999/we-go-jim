import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { ExerciseType } from '@/types/workout';

export interface CustomExercise {
  id: string;
  name: string;
  type: ExerciseType;
  createdAt: Timestamp;
}

export type CustomExerciseData = Omit<CustomExercise, 'id'>;

const customExercisesCollection = (uid: string) => {
  if (!db) throw new Error('Firebase is not configured');
  return collection(db, 'users', uid, 'customExercises');
};

export const getCustomExercises = async (
  uid: string,
): Promise<CustomExercise[]> => {
  if (!db) return [];
  const q = query(
    customExercisesCollection(uid),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as CustomExercise[];
};

/**
 * Save a custom exercise to Firestore.
 * The caller should deduplicate before calling this function.
 */
export const saveCustomExercise = async (
  uid: string,
  name: string,
  type: ExerciseType,
): Promise<string> => {
  const docRef = await addDoc(customExercisesCollection(uid), {
    name,
    type,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};
