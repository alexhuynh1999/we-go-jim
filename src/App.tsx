import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates } from '@/hooks/useTemplates';
import { useWorkouts } from '@/hooks/useWorkouts';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { WorkoutHistory } from '@/components/history/WorkoutHistory';
import { TemplateList } from '@/components/templates/TemplateList';
import { TemplateEditorRoute } from '@/components/templates/TemplateEditorRoute';
import { ActiveWorkout } from '@/components/workout/ActiveWorkout';
import { BottomNav } from '@/components/ui/BottomNav';
import type { Template, TemplateData } from '@/types/template';
import type { WorkoutExercise } from '@/types/workout';

const HIDDEN_NAV_PREFIXES = ['/workout', '/templates/new', '/templates/edit'];

/** Wrapper that extracts the :id param for deep-linking into WorkoutHistory. */
const WorkoutHistoryWithId = (props: {
  workouts: import('@/types/workout').Workout[];
  loading: boolean;
  onDelete: (id: string) => void;
}) => {
  const { id } = useParams<{ id: string }>();
  return <WorkoutHistory {...props} initialWorkoutId={id} />;
};

const AppRoutes = () => {
  const { user, loading, error, login, logout } = useAuth();
  const {
    templates,
    loading: templatesLoading,
    create,
    update,
    remove: removeTemplate,
  } = useTemplates(user?.uid);
  const {
    workouts,
    loading: workoutsLoading,
    remove: removeWorkout,
    refresh: refreshWorkouts,
  } = useWorkouts(user?.uid);

  const location = useLocation();
  const navigate = useNavigate();

  const hideNav = HIDDEN_NAV_PREFIXES.some((p) =>
    location.pathname.startsWith(p),
  );

  const handleStartFromTemplate = useCallback(
    (template: Template) => {
      const exercises: WorkoutExercise[] = template.exercises.map((ex) => ({
        name: ex.name,
        type: ex.type,
        sets: Array.from({ length: ex.defaultSets }, () => ({
          weight: 0,
          reps: 0,
          completed: false,
        })),
      }));

      navigate('/workout', {
        state: { exercises, templateId: template.id },
      });
    },
    [navigate],
  );

  const handleCreateTemplate = useCallback(
    async (data: TemplateData) => {
      await create(data);
      navigate('/templates');
    },
    [create, navigate],
  );

  const handleUpdateTemplate = useCallback(
    async (templateId: string, data: TemplateData) => {
      await update(templateId, data);
      navigate('/templates');
    },
    [update, navigate],
  );

  return (
    <AuthGuard user={user} loading={loading} error={error} onLogin={login}>
      <div className="flex min-h-dvh flex-col bg-slate-950 pt-[env(safe-area-inset-top,0px)]">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Dashboard
                  user={user}
                  onLogout={logout}
                  recentWorkouts={workouts.slice(0, 5)}
                  workoutsLoading={workoutsLoading}
                />
              ) : null
            }
          />
          <Route
            path="/history"
            element={
              <WorkoutHistory
                workouts={workouts}
                loading={workoutsLoading}
                onDelete={removeWorkout}
              />
            }
          />
          <Route
            path="/history/:id"
            element={
              <WorkoutHistoryWithId
                workouts={workouts}
                loading={workoutsLoading}
                onDelete={removeWorkout}
              />
            }
          />
          <Route
            path="/templates"
            element={
              <TemplateList
                templates={templates}
                loading={templatesLoading}
                onDelete={removeTemplate}
                onStartWorkout={handleStartFromTemplate}
              />
            }
          />
          <Route
            path="/templates/new"
            element={
              <TemplateEditorRoute
                onSave={handleCreateTemplate}
                onCancel={() => navigate('/templates')}
                uid={user?.uid}
              />
            }
          />
          <Route
            path="/templates/edit/:id"
            element={
              <TemplateEditorRoute
                templates={templates}
                onUpdate={handleUpdateTemplate}
                onCancel={() => navigate('/templates')}
                uid={user?.uid}
              />
            }
          />
          <Route
            path="/workout"
            element={
              user ? (
                <ActiveWorkout
                  uid={user.uid}
                  onWorkoutSaved={refreshWorkouts}
                />
              ) : null
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!hideNav && <BottomNav />}
      </div>
    </AuthGuard>
  );
};

export const App = () => <AppRoutes />;
