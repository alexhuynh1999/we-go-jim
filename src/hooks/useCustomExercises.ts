import { useEffect, useState, useCallback } from 'react';
import {
  getCustomExercises,
  saveCustomExercise,
  type CustomExercise,
} from '@/services/firebase/customExercises';
import type { ExerciseType } from '@/types/workout';

interface UseCustomExercisesResult {
  customExercises: CustomExercise[];
  loading: boolean;
  addCustomExercise: (name: string, type: ExerciseType) => Promise<void>;
}

/**
 * Loads the user's custom exercises from Firestore and provides a function to
 * add new ones. Deduplicates by name (case-insensitive) before writing.
 */
export const useCustomExercises = (
  uid: string | undefined,
): UseCustomExercisesResult => {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      setCustomExercises([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getCustomExercises(uid)
      .then((data) => {
        if (!cancelled) setCustomExercises(data);
      })
      .catch((err) => {
        console.warn('Failed to load custom exercises:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const addCustomExercise = useCallback(
    async (name: string, type: ExerciseType) => {
      if (!uid) return;

      // Deduplicate by name (case-insensitive)
      const exists = customExercises.some(
        (e) => e.name.toLowerCase() === name.toLowerCase(),
      );
      if (exists) return;

      try {
        const id = await saveCustomExercise(uid, name, type);
        // Optimistically add to local state
        setCustomExercises((prev) => [
          {
            id,
            name,
            type,
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
          } as CustomExercise,
          ...prev,
        ]);
      } catch (err) {
        console.warn('Failed to save custom exercise:', err);
      }
    },
    [uid, customExercises],
  );

  return { customExercises, loading, addCustomExercise };
};
