import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import type { Workout, WorkoutData } from '@/types/workout';

const workoutsCollection = (uid: string) => {
  if (!db) throw new Error('Firebase is not configured');
  return collection(db, 'users', uid, 'workouts');
};

export const saveWorkout = async (
  uid: string,
  workout: WorkoutData,
): Promise<string> => {
  const docRef = await addDoc(workoutsCollection(uid), {
    ...workout,
    completedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getWorkouts = async (
  uid: string,
  maxResults = 50,
): Promise<Workout[]> => {
  if (!db) return [];
  const q = query(
    workoutsCollection(uid),
    orderBy('completedAt', 'desc'),
    limit(maxResults),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Workout[];
};

export const deleteWorkout = async (
  uid: string,
  workoutId: string,
): Promise<void> => {
  if (!db) throw new Error('Firebase is not configured');
  await deleteDoc(doc(db, 'users', uid, 'workouts', workoutId));
};
