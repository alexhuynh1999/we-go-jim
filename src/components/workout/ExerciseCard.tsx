import type { WorkoutExercise, WorkoutSet } from '@/types/workout';
import { SetRow } from './SetRow';

const TYPE_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
};

const TYPE_COLORS: Record<string, string> = {
  barbell: 'bg-indigo-500/15 text-indigo-400',
  dumbbell: 'bg-amber-500/15 text-amber-400',
  bodyweight: 'bg-green-500/15 text-green-400',
  machine: 'bg-slate-500/15 text-slate-400',
};

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  previousSets?: WorkoutSet[];
  onUpdateSet: (setIndex: number, set: Partial<WorkoutSet>) => void;
  onToggleSetComplete: (setIndex: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onRemoveExercise: () => void;
}

export const ExerciseCard = ({
  exercise,
  exerciseIndex,
  previousSets,
  onUpdateSet,
  onToggleSetComplete,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseCardProps) => {
  const isBodyweight = exercise.type === 'bodyweight';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            {exercise.name}
          </h3>
          <span
            className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
              TYPE_COLORS[exercise.type] ?? 'bg-slate-700 text-slate-300'
            }`}
          >
            {TYPE_LABELS[exercise.type] ?? exercise.type}
          </span>
        </div>
        <button
          onClick={onRemoveExercise}
          className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-600 transition-colors active:text-red-500"
          aria-label={`Remove ${exercise.name}`}
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
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>

      {/* Column Headers */}
      <div className="mb-1 flex items-center gap-2 px-3 text-xs font-medium text-slate-500">
        <span className="w-6 text-center">Set</span>
        {!isBodyweight && <span className="flex-1 text-center">Weight</span>}
        {!isBodyweight && <span className="w-3" />}
        <span className="flex-1 text-center">Reps</span>
        <span className="w-9" />
        <span className="w-6" />
      </div>

      {/* Set Rows */}
      <div className="flex flex-col gap-1.5">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={`${exerciseIndex}-${setIndex}`}
            setIndex={setIndex}
            set={set}
            isBodyweight={isBodyweight}
            previousSet={previousSets?.[setIndex]}
            onUpdate={(update) => onUpdateSet(setIndex, update)}
            onToggleComplete={() => onToggleSetComplete(setIndex)}
            onRemove={() => onRemoveSet(setIndex)}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <button
        onClick={onAddSet}
        className="mt-2 flex w-full min-h-10 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-700 py-2 text-sm font-medium text-slate-500 transition-colors active:border-indigo-500 active:text-indigo-400"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add Set
      </button>
    </div>
  );
};
