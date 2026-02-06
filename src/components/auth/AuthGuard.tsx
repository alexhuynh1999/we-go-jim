import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { LoginPage } from './LoginPage';

interface AuthGuardProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  onLogin: () => void;
  children: ReactNode;
}

export const AuthGuard = ({
  user,
  loading,
  error,
  onLogin,
  children,
}: AuthGuardProps) => {
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={onLogin} loading={false} error={error} />;
  }

  return <>{children}</>;
};
