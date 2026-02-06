import { useState } from 'react';
import { useRestTimerContext } from '@/contexts/RestTimerContext';
import { REST_PRESETS, formatTime } from '@/hooks/useRestTimer';

const formatPreset = (s: number): string => {
  if (s < 60) return `${s}s`;
  return `${s / 60}m`;
};

export const RestTimerWidget = () => {
  const { seconds, totalSeconds, isRunning, start, pause, resume, reset } =
    useRestTimerContext();
  const [expanded, setExpanded] = useState(false);

  const progress =
    totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const hasTimer = seconds > 0 || isRunning;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setExpanded(true)}
        className={`fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
          hasTimer
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}
      >
        {hasTimer ? (
          <span className="text-xs font-bold">{formatTime(seconds)}</span>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        )}
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
          <div className="relative w-full max-w-md rounded-t-2xl bg-slate-900 p-5 sm:rounded-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Rest Timer</h2>
              <button
                onClick={() => setExpanded(false)}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-500 active:text-white"
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Timer Display */}
            <div className="my-6 text-center">
              <div className="relative mx-auto h-32 w-32">
                {/* Progress Ring */}
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${
                      seconds === 0 && totalSeconds > 0
                        ? 'text-green-500'
                        : 'text-indigo-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-3xl font-bold ${
                      seconds === 0 && totalSeconds > 0
                        ? 'text-green-400'
                        : 'text-white'
                    }`}
                  >
                    {formatTime(seconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            {hasTimer && (
              <div className="mb-4 flex justify-center gap-3">
                {isRunning ? (
                  <button
                    onClick={pause}
                    className="min-h-11 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition-all active:bg-slate-700"
                  >
                    Pause
                  </button>
                ) : seconds > 0 ? (
                  <button
                    onClick={resume}
                    className="min-h-11 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all active:bg-indigo-700"
                  >
                    Resume
                  </button>
                ) : null}
                <button
                  onClick={reset}
                  className="min-h-11 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-400 transition-all active:bg-slate-700"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {REST_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    start(preset);
                  }}
                  className={`min-h-11 rounded-xl text-sm font-semibold transition-all ${
                    totalSeconds === preset && (isRunning || seconds > 0)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 active:bg-slate-700'
                  }`}
                >
                  {formatPreset(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
