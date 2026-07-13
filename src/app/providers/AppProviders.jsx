import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { restoreSession } from '@/shared/api';
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
