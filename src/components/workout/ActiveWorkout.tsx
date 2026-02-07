import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkout } from '@/hooks/useWorkout';
import { usePreviousWorkout } from '@/hooks/usePreviousWorkout';
import { saveWorkout } from '@/services/firebase/workouts';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseSearchModal } from './ExerciseSearchModal';
import { RestTimerWidget } from './RestTimerWidget';
import type { ExerciseType, WorkoutExercise, WorkoutSet } from '@/types/workout';
import { Timestamp } from 'firebase/firestore';

interface ActiveWorkoutProps {
  uid: string;
  onWorkoutSaved?: () => void;
}

interface LocationState {
  exercises?: WorkoutExercise[];
  templateId?: string;
}

export const ActiveWorkout = ({ uid, onWorkoutSaved }: ActiveWorkoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    exercises,
    startedAt,
    templateId,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    initFromTemplate,
    reset,
  } = useWorkout();

  // Initialize from template if navigated with state
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const state = location.state as LocationState | null;
    if (state?.exercises && state.templateId) {
      initFromTemplate(state.exercises, state.templateId);
      initialized.current = true;
    }
  }, [location.state, initFromTemplate]);

  // Previous workout data for dimmed placeholders
  const exerciseNames = useMemo(
    () => exercises.map((e) => e.name),
    [exercises],
  );
  const previousSets = usePreviousWorkout(uid, exerciseNames);

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleAddExercise = useCallback(
    (name: string, type: ExerciseType) => {
      addExercise(name, type);
    },
    [addExercise],
  );

  const handleFinish = useCallback(async () => {
    if (exercises.length === 0) return;

    setSaving(true);
    try {
      await saveWorkout(uid, {
        exercises,
        startedAt,
        completedAt: Timestamp.now(),
        ...(templateId && { templateId }),
      });
      reset();
      onWorkoutSaved?.();
      navigate('/');
    } catch (err) {
      console.error('Failed to save workout:', err);
      setSaving(false);
    }
  }, [exercises, startedAt, templateId, uid, navigate, reset, onWorkoutSaved]);

  const handleCancel = useCallback(() => {
    if (exercises.length > 0) {
      setShowCancelConfirm(true);
    } else {
      navigate('/');
    }
  }, [exercises.length, navigate]);

  const confirmCancel = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors active:text-white"
          >
            Cancel
          </button>
          <h1 className="text-base font-bold text-white">Workout</h1>
          <button
            onClick={handleFinish}
            disabled={exercises.length === 0 || saving}
            className="min-h-11 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all active:bg-green-700 disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Finish'}
          </button>
        </div>
      </header>

      {/* Exercises */}
      <div className="flex-1 px-4 py-4">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 text-5xl">💪</div>
            <p className="mb-1 text-base font-medium text-slate-300">
              Let&apos;s get to work!
            </p>
            <p className="text-sm text-slate-500">
              Add your first exercise to begin.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {exercises.map((exercise, exerciseIndex) => (
              <ExerciseCard
                key={`${exercise.name}-${exerciseIndex}`}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                previousSets={previousSets[exercise.name]}
                onUpdateSet={(setIndex: number, set: Partial<WorkoutSet>) =>
                  updateSet(exerciseIndex, setIndex, set)
                }
                onToggleSetComplete={(setIndex: number) =>
                  toggleSetComplete(exerciseIndex, setIndex)
                }
                onAddSet={() => addSet(exerciseIndex)}
                onRemoveSet={(setIndex: number) =>
                  removeSet(exerciseIndex, setIndex)
                }
                onRemoveExercise={() => removeExercise(exerciseIndex)}
              />
            ))}
          </div>
        )}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowAddExercise(true)}
          className="mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 py-3 text-sm font-semibold text-indigo-400 transition-all active:border-indigo-500 active:bg-indigo-500/5"
        >
          <svg
            className="h-5 w-5"
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
          Add Exercise
        </button>
      </div>

      {/* Rest Timer */}
      <RestTimerWidget />

      {/* Add Exercise Modal */}
      <ExerciseSearchModal
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onSelect={handleAddExercise}
        uid={uid}
      />

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-slate-900 p-5 text-center">
            <h3 className="mb-2 text-lg font-bold text-white">
              Discard Workout?
            </h3>
            <p className="mb-5 text-sm text-slate-400">
              Your progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-slate-800 text-sm font-semibold text-slate-300 transition-all active:bg-slate-700"
              >
                Keep Going
              </button>
              <button
                onClick={confirmCancel}
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white transition-all active:bg-red-700"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
