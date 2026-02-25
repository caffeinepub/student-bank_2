import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import DashboardLayout from './components/DashboardLayout';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

function AppInner() {
  const { identity, login, loginStatus, clear, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest'>('guest');
  const [roleLoading, setRoleLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (!actor || actorFetching || !isAuthenticated) {
      if (!isAuthenticated) setUserRole('guest');
      return;
    }
    setRoleLoading(true);
    actor.getCallerUserRole()
      .then((role) => {
        if (role === 'admin') setUserRole('admin');
        else if (role === 'user') setUserRole('user');
        else setUserRole('guest');
      })
      .catch(() => setUserRole('guest'))
      .finally(() => setRoleLoading(false));
  }, [actor, actorFetching, isAuthenticated]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setUserRole('guest');
    setCurrentPage('dashboard');
  };

  if (isInitializing || actorFetching || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <img src="/assets/generated/logo.dim_256x256.png" alt="Student Bank" className="w-20 h-20 rounded-2xl shadow-md" />
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Student Bank</h1>
              <p className="text-muted-foreground text-sm text-center">Sign in to access your account</p>
            </div>
            <button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole={userRole}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
      identity={identity}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster />
    </QueryClientProvider>
  );
}
