import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Workout } from '@/types/workout';
import { formatDuration } from '@/utils/formatDuration';

const TYPE_COLORS: Record<string, string> = {
  barbell: 'text-indigo-400',
  dumbbell: 'text-amber-400',
  bodyweight: 'text-green-400',
  machine: 'text-slate-400',
};

interface DashboardProps {
  user: User;
  onLogout: () => void;
  recentWorkouts: Workout[];
  workoutsLoading: boolean;
}

export const Dashboard = ({
  user,
  onLogout,
  recentWorkouts,
  workoutsLoading,
}: DashboardProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col px-4 pb-20 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <h1 className="text-xl font-bold text-white">
            {user.displayName?.split(' ')[0] ?? 'Athlete'}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <button
            onClick={onLogout}
            className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            Sign out
          </button>
          <span className="pr-3 text-[10px] text-slate-600">
            v{__APP_VERSION__}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/workout')}
          className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.97]"
        >
          <svg
            className="h-7 w-7"
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
          <span className="text-sm font-semibold">Quick Start</span>
        </button>

        <button
          onClick={() => navigate('/templates')}
          className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-4 text-slate-200 transition-all active:scale-[0.97]"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <span className="text-sm font-semibold">From Template</span>
        </button>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent Workouts
          </h2>
          {recentWorkouts.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-indigo-400 transition-colors active:text-indigo-300"
            >
              View all
            </button>
          )}
        </div>

        {workoutsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
          </div>
        ) : recentWorkouts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="text-sm text-slate-500">
              No workouts yet. Tap Quick Start to begin!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentWorkouts.map((workout) => {
              const totalSets = workout.exercises.reduce(
                (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
                0,
              );
              return (
                <button
                  key={workout.id}
                  onClick={() => navigate(`/history/${workout.id}`)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition-all active:bg-slate-800"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {format(workout.completedAt.toDate(), 'EEE, MMM d · h:mm a')}
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
        )}
      </div>
    </div>
  );
};
