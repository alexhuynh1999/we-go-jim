import { useCallback, useEffect, useRef, useState } from 'react';

export const REST_PRESETS = [30, 60, 90, 120, 180, 300] as const;

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface UseRestTimerReturn {
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
  start: (duration: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const useRestTimer = (): UseRestTimerReturn => {
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const playAlert = useCallback(() => {
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play custom sound file if available, fall back to generated beep
    try {
      const soundUrl = `${import.meta.env.BASE_URL}sounds/timer-done.mp3`;
      const audio = new Audio(soundUrl);
      audio.play().catch(() => {
        // Custom sound failed (file missing or blocked) -- generate a beep
        try {
          const ctx = new AudioContext();
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.frequency.value = 880;
          oscillator.type = 'sine';
          gain.gain.value = 0.3;
          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            ctx.close();
          }, 500);
        } catch {
          // Audio completely blocked; fail silently
        }
      });
    } catch {
      // Audio may be blocked; fail silently
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (duration: number) => {
      clearTimer();
      setTotalSeconds(duration);
      setSeconds(duration);
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            playAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer, playAlert],
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (seconds <= 0) return;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          playAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds, clearTimer, playAlert]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSeconds(0);
    setTotalSeconds(0);
  }, [clearTimer]);

  return { seconds, totalSeconds, isRunning, start, pause, resume, reset };
};
