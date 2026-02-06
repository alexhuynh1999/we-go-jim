import { useNavigate } from 'react-router-dom';
import type { Template } from '@/types/template';

const TYPE_COLORS: Record<string, string> = {
  barbell: 'text-indigo-400',
  dumbbell: 'text-amber-400',
  bodyweight: 'text-green-400',
  machine: 'text-slate-400',
};

interface TemplateListProps {
  templates: Template[];
  loading: boolean;
  onDelete: (id: string) => void;
  onStartWorkout: (template: Template) => void;
}

export const TemplateList = ({
  templates,
  loading,
  onDelete,
  onStartWorkout,
}: TemplateListProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col px-4 pb-20 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Templates</h1>
        <button
          onClick={() => navigate('/templates/new')}
          className="flex min-h-11 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.97]"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
            />
          </svg>
          <p className="text-sm text-slate-500">
            Create a template to save your favorite routines.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-base font-semibold text-white">
                  {template.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/templates/edit/${template.id}`)}
                    className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-500 transition-colors active:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(template.id)}
                    className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-500 transition-colors active:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Exercise Summary */}
              <div className="mb-3 flex flex-col gap-1">
                {template.exercises.map((ex, i) => (
                  <p
                    key={`${ex.name}-${i}`}
                    className={`text-sm ${TYPE_COLORS[ex.type] ?? 'text-slate-400'}`}
                  >
                    {ex.name}{' '}
                    <span className="text-slate-600">
                      {ex.defaultSets}x{ex.defaultReps}
                    </span>
                  </p>
                ))}
              </div>

              {/* Start Workout Button */}
              <button
                onClick={() => onStartWorkout(template)}
                className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600/15 text-sm font-semibold text-indigo-400 transition-all active:bg-indigo-600/25"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                Start Workout
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
