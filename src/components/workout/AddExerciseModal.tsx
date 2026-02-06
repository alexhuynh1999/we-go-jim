import { useState } from 'react';
import { EXERCISE_TYPES, type ExerciseType } from '@/types/workout';

const TYPE_LABELS: Record<ExerciseType, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
};

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, type: ExerciseType) => void;
}

export const AddExerciseModal = ({
  open,
  onClose,
  onAdd,
}: AddExerciseModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>('barbell');

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, type);
    setName('');
    setType('barbell');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-t-2xl bg-slate-900 p-5 sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-bold text-white">Add Exercise</h2>

        {/* Exercise Name */}
        <div className="mb-4">
          <label
            htmlFor="exercise-name"
            className="mb-1.5 block text-sm font-medium text-slate-400"
          >
            Exercise Name
          </label>
          <input
            id="exercise-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bench Press"
            autoFocus
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>

        {/* Exercise Type */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-400">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  type === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 active:bg-slate-700'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition-all active:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all active:bg-indigo-700 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
