import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Workout, WorkoutSet } from '@/types/workout';

/**
 * For each exercise name in the current workout, finds the most recent
 * completed workout that contains that exercise and returns its sets.
 */
export const usePreviousWorkout = (
  uid: string | undefined,
  exerciseNames: string[],
) => {
  const [previousSets, setPreviousSets] = useState<
    Record<string, WorkoutSet[]>
  >({});

  useEffect(() => {
    if (!uid || exerciseNames.length === 0) {
      setPreviousSets({});
      return;
    }

    let cancelled = false;

    const fetchPrevious = async () => {
      if (!db) return;
      // Fetch recent workouts (grab last 20 to search through)
      const q = query(
        collection(db, 'users', uid, 'workouts'),
        orderBy('completedAt', 'desc'),
        limit(20),
      );
      const snapshot = await getDocs(q);
      const workouts = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Workout,
      );

      if (cancelled) return;

      // For each exercise name, find the most recent workout containing it
      const result: Record<string, WorkoutSet[]> = {};
      for (const name of exerciseNames) {
        for (const workout of workouts) {
          const match = workout.exercises.find(
            (ex) => ex.name.toLowerCase() === name.toLowerCase(),
          );
          if (match) {
            result[name] = match.sets;
            break;
          }
        }
      }

      setPreviousSets(result);
    };

    void fetchPrevious();

    return () => {
      cancelled = true;
    };
  }, [uid, exerciseNames.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return previousSets;
};
