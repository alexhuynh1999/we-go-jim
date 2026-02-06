import { format } from 'date-fns';
import type { Workout } from '@/types/workout';

const TYPE_COLORS: Record<string, string> = {
  barbell: 'bg-indigo-500/15 text-indigo-400',
  dumbbell: 'bg-amber-500/15 text-amber-400',
  bodyweight: 'bg-green-500/15 text-green-400',
  machine: 'bg-slate-500/15 text-slate-400',
};

const TYPE_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
};

interface WorkoutDetailProps {
  workout: Workout;
  onBack: () => void;
  onDelete: () => void;
}

export const WorkoutDetail = ({
  workout,
  onBack,
  onDelete,
}: WorkoutDetailProps) => {
  const completedDate = workout.completedAt.toDate();
  const startedDate = workout.startedAt.toDate();
  const durationMinutes = Math.round(
    (completedDate.getTime() - startedDate.getTime()) / 60000,
  );

  return (
    <div className="flex flex-1 flex-col px-4 pb-20 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex min-h-11 items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-400 transition-colors active:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </button>
        <button
          onClick={onDelete}
          className="flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors active:text-red-400"
        >
          Delete
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">
          {format(completedDate, 'EEEE, MMM d')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {format(startedDate, 'h:mm a')} &ndash;{' '}
          {format(completedDate, 'h:mm a')}
          {durationMinutes > 0 && (
            <span className="text-slate-500">
              {' '}
              &middot; {durationMinutes} min
            </span>
          )}
        </p>
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-4">
        {workout.exercises.map((exercise, i) => (
          <div
            key={`${exercise.name}-${i}`}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="mb-2">
              <h3 className="text-base font-semibold text-white">
                {exercise.name}
              </h3>
              <span
                className={`mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                  TYPE_COLORS[exercise.type] ?? 'bg-slate-700 text-slate-300'
                }`}
              >
                {TYPE_LABELS[exercise.type] ?? exercise.type}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {exercise.sets.map((set, si) => (
                <div
                  key={si}
                  className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm ${
                    set.completed ? 'text-white' : 'text-slate-600 line-through'
                  }`}
                >
                  <span className="w-6 text-center text-slate-500">
                    {si + 1}
                  </span>
                  {exercise.type !== 'bodyweight' && (
                    <>
                      <span className="font-medium">{set.weight} lbs</span>
                      <span className="text-slate-600">x</span>
                    </>
                  )}
                  <span className="font-medium">{set.reps} reps</span>
                  {set.completed && (
                    <svg
                      className="ml-auto h-4 w-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
