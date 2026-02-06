import { useEffect, useState, useCallback } from 'react';
import { getWorkouts, deleteWorkout } from '@/services/firebase/workouts';
import type { Workout } from '@/types/workout';

export const useWorkouts = (uid: string | undefined) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) return;
    try {
      setLoading(true);
      const data = await getWorkouts(uid);
      setWorkouts(data);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load workouts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (workoutId: string) => {
      if (!uid) return;
      await deleteWorkout(uid, workoutId);
      await refresh();
    },
    [uid, refresh],
  );

  return { workouts, loading, error, refresh, remove };
};
