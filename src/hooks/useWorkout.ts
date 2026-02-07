import { useReducer, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { ExerciseType, WorkoutExercise, WorkoutSet } from '@/types/workout';

interface WorkoutState {
  exercises: WorkoutExercise[];
  startedAt: Timestamp;
  templateId?: string;
}

type WorkoutAction =
  | { type: 'ADD_EXERCISE'; name: string; exerciseType: ExerciseType }
  | { type: 'REMOVE_EXERCISE'; exerciseIndex: number }
  | { type: 'ADD_SET'; exerciseIndex: number }
  | { type: 'REMOVE_SET'; exerciseIndex: number; setIndex: number }
  | {
      type: 'UPDATE_SET';
      exerciseIndex: number;
      setIndex: number;
      set: Partial<WorkoutSet>;
    }
  | { type: 'TOGGLE_SET_COMPLETE'; exerciseIndex: number; setIndex: number }
  | {
      type: 'INIT_FROM_TEMPLATE';
      exercises: WorkoutExercise[];
      templateId: string;
    }
  | { type: 'RESET' };

const createEmptySet = (): WorkoutSet => ({
  weight: 0,
  reps: 0,
  completed: false,
});

const createInitialState = (): WorkoutState => ({
  exercises: [],
  startedAt: Timestamp.now(),
});

const workoutReducer = (
  state: WorkoutState,
  action: WorkoutAction,
): WorkoutState => {
  switch (action.type) {
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [
          ...state.exercises,
          {
            name: action.name,
            type: action.exerciseType,
            sets: [createEmptySet()],
          },
        ],
      };

    case 'REMOVE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter((_, i) => i !== action.exerciseIndex),
      };

    case 'ADD_SET': {
      const exercises = [...state.exercises];
      const exercise = exercises[action.exerciseIndex];
      if (!exercise) return state;
      exercises[action.exerciseIndex] = {
        ...exercise,
        sets: [...exercise.sets, createEmptySet()],
      };
      return { ...state, exercises };
    }

    case 'REMOVE_SET': {
      const exercises = [...state.exercises];
      const exercise = exercises[action.exerciseIndex];
      if (!exercise || exercise.sets.length <= 1) return state;
      exercises[action.exerciseIndex] = {
        ...exercise,
        sets: exercise.sets.filter((_, i) => i !== action.setIndex),
      };
      return { ...state, exercises };
    }

    case 'UPDATE_SET': {
      const exercises = [...state.exercises];
      const exercise = exercises[action.exerciseIndex];
      if (!exercise) return state;
      const sets = [...exercise.sets];
      const currentSet = sets[action.setIndex];
      if (!currentSet) return state;
      sets[action.setIndex] = { ...currentSet, ...action.set };
      exercises[action.exerciseIndex] = { ...exercise, sets };
      return { ...state, exercises };
    }

    case 'TOGGLE_SET_COMPLETE': {
      const exercises = [...state.exercises];
      const exercise = exercises[action.exerciseIndex];
      if (!exercise) return state;
      const sets = [...exercise.sets];
      const currentSet = sets[action.setIndex];
      if (!currentSet) return state;
      sets[action.setIndex] = {
        ...currentSet,
        completed: !currentSet.completed,
      };
      exercises[action.exerciseIndex] = { ...exercise, sets };
      return { ...state, exercises };
    }

    case 'INIT_FROM_TEMPLATE':
      return {
        exercises: action.exercises,
        startedAt: Timestamp.now(),
        templateId: action.templateId,
      };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
};

export const useWorkout = () => {
  const [state, dispatch] = useReducer(workoutReducer, undefined, createInitialState);

  const addExercise = useCallback(
    (name: string, exerciseType: ExerciseType) => {
      dispatch({ type: 'ADD_EXERCISE', name, exerciseType });
    },
    [],
  );

  const removeExercise = useCallback((exerciseIndex: number) => {
    dispatch({ type: 'REMOVE_EXERCISE', exerciseIndex });
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
    dispatch({ type: 'ADD_SET', exerciseIndex });
  }, []);

  const removeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: 'REMOVE_SET', exerciseIndex, setIndex });
    },
    [],
  );

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, set: Partial<WorkoutSet>) => {
      dispatch({ type: 'UPDATE_SET', exerciseIndex, setIndex, set });
    },
    [],
  );

  const toggleSetComplete = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      dispatch({ type: 'TOGGLE_SET_COMPLETE', exerciseIndex, setIndex });
    },
    [],
  );

  const initFromTemplate = useCallback(
    (exercises: WorkoutExercise[], templateId: string) => {
      dispatch({ type: 'INIT_FROM_TEMPLATE', exercises, templateId });
    },
    [],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    exercises: state.exercises,
    startedAt: state.startedAt,
    templateId: state.templateId,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    initFromTemplate,
    reset,
  };
};
