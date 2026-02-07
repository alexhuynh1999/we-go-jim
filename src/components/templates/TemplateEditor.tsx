import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { ExerciseType } from '@/types/workout';
import type { TemplateExercise, Template, TemplateData } from '@/types/template';
import { ExerciseSearchModal } from '../workout/ExerciseSearchModal';

const TYPE_LABELS: Record<ExerciseType, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
};

interface TemplateEditorProps {
  template?: Template;
  onSave: (data: TemplateData) => Promise<void>;
  onCancel: () => void;
  uid?: string;
}

export const TemplateEditor = ({
  template,
  onSave,
  onCancel,
  uid,
}: TemplateEditorProps) => {
  const [name, setName] = useState(template?.name ?? '');
  const [exercises, setExercises] = useState<TemplateExercise[]>(
    template?.exercises ?? [],
  );
  const [saving, setSaving] = useState(false);

  // New exercise form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ExerciseType>('barbell');
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState(10);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);

  const addExercise = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setExercises((prev) => [
      ...prev,
      { name: trimmed, type: newType, defaultSets: newSets, defaultReps: newReps },
    ]);
    setNewName('');
    setNewSets(3);
    setNewReps(10);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    const updated = [...exercises];
    const temp = updated[target]!;
    updated[target] = updated[index]!;
    updated[index] = temp;
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim() || exercises.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        createdAt: template?.createdAt ?? Timestamp.now(),
        exercises,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors active:text-white"
          >
            Cancel
          </button>
          <h1 className="text-base font-bold text-white">
            {template ? 'Edit Template' : 'New Template'}
          </h1>
          <button
            onClick={handleSave}
            disabled={!name.trim() || exercises.length === 0 || saving}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all active:bg-indigo-700 disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {/* Template Name */}
        <div className="mb-5">
          <label
            htmlFor="template-name"
            className="mb-1.5 block text-sm font-medium text-slate-400"
          >
            Template Name
          </label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Exercises List */}
        <div className="mb-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            Exercises ({exercises.length})
          </h2>
          {exercises.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center">
              <p className="text-sm text-slate-500">
                Add exercises to your template below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {exercises.map((ex, i) => (
                <div
                  key={`${ex.name}-${i}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-3"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveExercise(i, -1)}
                      disabled={i === 0}
                      className="text-slate-600 disabled:opacity-20"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveExercise(i, 1)}
                      disabled={i === exercises.length - 1}
                      className="text-slate-600 disabled:opacity-20"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{ex.name}</p>
                    <p className="text-xs text-slate-500">
                      {TYPE_LABELS[ex.type]} &middot; {ex.defaultSets}x{ex.defaultReps}
                    </p>
                  </div>

                  <button
                    onClick={() => removeExercise(i)}
                    className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-600 transition-colors active:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Exercise Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            Add Exercise
          </h3>

          {/* Tappable exercise search field */}
          <button
            type="button"
            onClick={() => setShowExerciseSearch(true)}
            className="mb-3 flex w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-left transition-all active:border-indigo-500"
          >
            <svg
              className="h-4 w-4 shrink-0 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            {newName ? (
              <span className="flex-1 text-base text-white">{newName}</span>
            ) : (
              <span className="flex-1 text-base text-slate-600">Search for an exercise...</span>
            )}
            {newName && (
              <span className="shrink-0 rounded-lg bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                {TYPE_LABELS[newType]}
              </span>
            )}
          </button>

          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">Sets</label>
              <input
                type="number"
                inputMode="numeric"
                value={newSets}
                onChange={(e) => setNewSets(parseInt(e.target.value, 10) || 1)}
                min={1}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">Reps</label>
              <input
                type="number"
                inputMode="numeric"
                value={newReps}
                onChange={(e) => setNewReps(parseInt(e.target.value, 10) || 1)}
                min={1}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={addExercise}
            disabled={!newName.trim()}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-semibold text-indigo-400 transition-all active:bg-slate-700 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Template
          </button>
        </div>
      </div>

      {/* Exercise Search Modal */}
      <ExerciseSearchModal
        open={showExerciseSearch}
        onClose={() => setShowExerciseSearch(false)}
        onSelect={(selectedName, selectedType) => {
          setNewName(selectedName);
          setNewType(selectedType);
          setShowExerciseSearch(false);
        }}
        uid={uid}
      />
    </div>
  );
};
