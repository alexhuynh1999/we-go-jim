import { createContext, useContext, type ReactNode } from 'react';
import { useRestTimer } from '@/hooks/useRestTimer';

type RestTimerContextValue = ReturnType<typeof useRestTimer>;

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export const RestTimerProvider = ({ children }: { children: ReactNode }) => {
  const timer = useRestTimer();
  return (
    <RestTimerContext.Provider value={timer}>
      {children}
    </RestTimerContext.Provider>
  );
};

export const useRestTimerContext = (): RestTimerContextValue => {
  const ctx = useContext(RestTimerContext);
  if (!ctx) {
    throw new Error(
      'useRestTimerContext must be used within a RestTimerProvider',
    );
  }
  return ctx;
};
