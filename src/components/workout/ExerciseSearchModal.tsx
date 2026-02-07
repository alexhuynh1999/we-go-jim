import { useState, useCallback, useMemo } from 'react';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { useCustomExercises } from '@/hooks/useCustomExercises';
import { inferExerciseType, isExerciseApiConfigured } from '@/services/exerciseApi';
import type { ApiExercise } from '@/services/exerciseApi';
import { AddExerciseModal } from './AddExerciseModal';
import type { ExerciseType } from '@/types/workout';

const TYPE_LABELS: Record<ExerciseType, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  bodyweight: 'Bodyweight',
  machine: 'Machine',
};

interface ExerciseSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string, type: ExerciseType) => void;
  uid?: string;
}

export const ExerciseSearchModal = ({
  open,
  onClose,
  onSelect,
  uid,
}: ExerciseSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const { results: apiResults, loading: apiLoading, error: apiError } = useExerciseSearch(query);
  const { customExercises, addCustomExercise } = useCustomExercises(uid);

  // Merge custom exercises (filtered by query) with API results
  const { results, loading, error } = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const hasQuery = trimmed.length >= 2;

    if (!hasQuery) {
      return { results: [] as ApiExercise[], loading: false, error: null as string | null };
    }

    // Filter custom exercises by name match and convert to ApiExercise shape
    const matchingCustom: ApiExercise[] = customExercises
      .filter((e) => e.name.toLowerCase().includes(trimmed))
      .map((e) => ({
        name: e.name,
        type: 'strength',
        muscle: 'Custom exercise',
        difficulty: '',
        instructions: '',
        equipments: e.type === 'bodyweight' ? [] : [e.type],
        safety_info: '',
      }));

    // Deduplicate: custom entries take precedence over API results
    const customNames = new Set(matchingCustom.map((e) => e.name.toLowerCase()));
    const dedupedApi = apiResults.filter(
      (e) => !customNames.has(e.name.toLowerCase()),
    );

    return {
      results: [...matchingCustom, ...dedupedApi],
      loading: apiLoading,
      error: apiError,
    };
  }, [query, apiResults, apiLoading, apiError, customExercises]);

  const handleSelect = useCallback(
    (name: string, equipments: string[]) => {
      const type = inferExerciseType(equipments);
      onSelect(name, type);
      setQuery('');
      onClose();
    },
    [onSelect, onClose],
  );

  const handleCustomAdd = useCallback(
    (name: string, type: ExerciseType) => {
      addCustomExercise(name, type);
      onSelect(name, type);
      setShowCustomAdd(false);
      setQuery('');
      onClose();
    },
    [onSelect, onClose, addCustomExercise],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    setShowCustomAdd(false);
    onClose();
  }, [onClose]);

  if (!open) return null;

  // If custom add modal is open, show it instead
  if (showCustomAdd) {
    return (
      <AddExerciseModal
        open
        onClose={() => setShowCustomAdd(false)}
        onAdd={handleCustomAdd}
      />
    );
  }

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;
  const showResults = hasQuery && !loading && results.length > 0;
  const showEmpty = hasQuery && !loading && results.length === 0 && !error;
  const showError = hasQuery && !loading && !!error;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-md flex-col rounded-t-2xl bg-slate-900 sm:rounded-2xl"
        style={{ maxHeight: '80dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-white">Add Exercise</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors active:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500"
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
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              autoFocus
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-base text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {!isExerciseApiConfigured && (
            <p className="mt-2 text-xs text-amber-500/80">
              Exercise search API is not configured. Add VITE_API_NINJAS_KEY to your .env file.
            </p>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-500" />
            </div>
          )}

          {/* Results */}
          {showResults && (
            <ul className="flex flex-col gap-1.5">
              {results.map((exercise) => {
                const exerciseType = inferExerciseType(exercise.equipments);
                return (
                  <li key={exercise.name}>
                    <button
                      onClick={() => handleSelect(exercise.name, exercise.equipments)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all active:bg-slate-800"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {exercise.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {exercise.muscle}
                          {exercise.difficulty ? ` \u00b7 ${exercise.difficulty}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                        {TYPE_LABELS[exerciseType]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* API Error */}
          {showError && (
            <div className="py-6 text-center">
              <p className="mb-1 text-sm text-amber-500/90">{error}</p>
              <p className="text-xs text-slate-500">
                Use &ldquo;Add custom exercise&rdquo; below to add it manually.
              </p>
            </div>
          )}

          {/* Empty State */}
          {showEmpty && (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-500">
                No exercises found for &ldquo;{trimmedQuery}&rdquo;
              </p>
            </div>
          )}

          {/* Hint when no query */}
          {!hasQuery && !loading && (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-500">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>

        {/* Add Custom Exercise -- always visible at bottom */}
        <div className="border-t border-slate-800 px-5 py-3">
          <button
            onClick={() => setShowCustomAdd(true)}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-semibold text-indigo-400 transition-all active:bg-slate-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add custom exercise
          </button>
        </div>
      </div>
    </div>
  );
};
