import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { restoreSession, setSessionListener } from '@/shared/api';
import { useUserStore } from '@/entities/user';
import { Spinner } from '@/shared/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function SessionGate({ children }) {
  const setUser = useUserStore((s) => s.setUser);
  const setReady = useUserStore((s) => s.setReady);
  const isReady = useUserStore((s) => s.isReady);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    setStarted(true);
    // Keep the store in sync with silent refreshes; a null user means the
    // refresh token died mid-session, which logs the UI out via route guards.
    setSessionListener((user) => setUser(user));
    restoreSession().then((session) => {
      if (session?.user) setUser(session.user);
      setReady();
    });
  }, [started, setUser, setReady]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return children;
}

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionGate>{children}</SessionGate>
    </QueryClientProvider>
  );
}
