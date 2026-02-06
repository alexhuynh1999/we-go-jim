import { useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut, isFirebaseConfigured } from '@/services/firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setState({
        user,
        loading: false,
        error: !isFirebaseConfigured
          ? 'Firebase is not configured. Create a .env file with your Firebase credentials (see .env.example).'
          : null,
      });
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, loading: true }));
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-out failed';
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
  };
};
