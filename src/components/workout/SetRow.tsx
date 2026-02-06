import type { WorkoutSet } from '@/types/workout';

interface SetRowProps {
  setIndex: number;
  set: WorkoutSet;
  isBodyweight: boolean;
  onUpdate: (update: Partial<WorkoutSet>) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
  previousSet?: WorkoutSet;
}

export const SetRow = ({
  setIndex,
  set,
  isBodyweight,
  onUpdate,
  onToggleComplete,
  onRemove,
  previousSet,
}: SetRowProps) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
        set.completed ? 'bg-green-500/10' : 'bg-slate-800/50'
      }`}
    >
      {/* Set Number */}
      <span className="w-6 text-center text-sm font-medium text-slate-500">
        {setIndex + 1}
      </span>

      {/* Weight Input */}
      {!isBodyweight && (
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            value={set.weight || ''}
            placeholder={previousSet ? String(previousSet.weight) : '0'}
            onChange={(e) =>
              onUpdate({ weight: parseFloat(e.target.value) || 0 })
            }
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none ${
              set.completed ? 'border-green-500/30' : 'border-slate-700'
            }`}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600">
            lbs
          </span>
        </div>
      )}

      {/* Separator */}
      {!isBodyweight && (
        <span className="text-sm text-slate-600">x</span>
      )}

      {/* Reps Input */}
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          placeholder={previousSet ? String(previousSet.reps) : '0'}
          onChange={(e) =>
            onUpdate({ reps: parseInt(e.target.value, 10) || 0 })
          }
          className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none ${
            set.completed ? 'border-green-500/30' : 'border-slate-700'
          }`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600">
          reps
        </span>
      </div>

      {/* Complete Toggle */}
      <button
        onClick={onToggleComplete}
        className={`flex min-h-9 min-w-9 items-center justify-center rounded-lg transition-all ${
          set.completed
            ? 'bg-green-500 text-white'
            : 'border border-slate-700 text-slate-600 active:border-green-500'
        }`}
      >
        <svg
          className="h-4 w-4"
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
      </button>

      {/* Remove Set */}
      <button
        onClick={onRemove}
        className="flex min-h-9 min-w-6 items-center justify-center text-slate-700 transition-colors active:text-red-500"
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
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
