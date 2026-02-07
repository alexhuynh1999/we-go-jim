import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import type { Workout } from '@/types/workout';
import { formatDuration } from '@/utils/formatDuration';
import { WorkoutDetail } from './WorkoutDetail';

const TYPE_COLORS: Record<string, string> = {
  barbell: 'text-indigo-400',
  dumbbell: 'text-amber-400',
  bodyweight: 'text-green-400',
  machine: 'text-slate-400',
};

interface WorkoutHistoryProps {
  workouts: Workout[];
  loading: boolean;
  onDelete: (id: string) => void;
  /** When set, auto-selects this workout on mount (deep-link from Dashboard). */
  initialWorkoutId?: string;
}

/** Group workouts by date string */
const groupByDate = (workouts: Workout[]): Record<string, Workout[]> => {
  const groups: Record<string, Workout[]> = {};
  for (const w of workouts) {
    const date = format(w.completedAt.toDate(), 'EEEE, MMM d');
    if (!groups[date]) groups[date] = [];
    groups[date]!.push(w);
  }
  return groups;
};

export const WorkoutHistory = ({
  workouts,
  loading,
  onDelete,
  initialWorkoutId,
}: WorkoutHistoryProps) => {
  const [selected, setSelected] = useState<Workout | null>(null);
  const deepLinkConsumed = useRef(false);

  // Auto-select workout when deep-linked via initialWorkoutId (runs once)
  useEffect(() => {
    if (deepLinkConsumed.current) return;
    if (initialWorkoutId && workouts.length > 0) {
      const match = workouts.find((w) => w.id === initialWorkoutId);
      if (match) {
        deepLinkConsumed.current = true;
        setSelected(match);
      }
    }
  }, [initialWorkoutId, workouts]);

  if (selected) {
    return (
      <WorkoutDetail
        workout={selected}
        onBack={() => setSelected(null)}
        onDelete={() => {
          onDelete(selected.id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-20 pt-6">
      <h1 className="mb-6 text-xl font-bold text-white">History</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm text-slate-500">
            Your completed workouts will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(groupByDate(workouts)).map(([date, group]) => (
            <div key={date}>
              <h2 className="mb-2 text-sm font-semibold text-slate-400">
                {date}
              </h2>
              <div className="flex flex-col gap-2">
                {group.map((workout) => {
                  const totalSets = workout.exercises.reduce(
                    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
                    0,
                  );
                  return (
                    <button
                      key={workout.id}
                      onClick={() => setSelected(workout)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition-all active:bg-slate-800"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {format(workout.completedAt.toDate(), 'h:mm a')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {formatDuration(workout.startedAt, workout.completedAt)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {totalSets} sets
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {workout.exercises.map((ex, i) => (
                          <span
                            key={`${ex.name}-${i}`}
                            className={`text-sm ${TYPE_COLORS[ex.type] ?? 'text-slate-400'}`}
                          >
                            {ex.name}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
