import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'admin' | 'user' | null;

interface AuthState {
  role: UserRole;
  accountNumber: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  loginAsAdmin: () => void;
  loginAsUser: (accountNumber: string) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'student_bank_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        role: parsed.role || null,
        accountNumber: parsed.accountNumber || null,
        isAuthenticated: !!parsed.role,
      };
    }
  } catch {
    // ignore
  }
  return { role: null, accountNumber: null, isAuthenticated: false };
}

function saveAuthState(state: AuthState) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(loadAuthState);

  useEffect(() => {
    saveAuthState(authState);
  }, [authState]);

  const loginAsAdmin = useCallback(() => {
    const state: AuthState = { role: 'admin', accountNumber: null, isAuthenticated: true };
    setAuthState(state);
  }, []);

  const loginAsUser = useCallback((accountNumber: string) => {
    const state: AuthState = { role: 'user', accountNumber, isAuthenticated: true };
    setAuthState(state);
  }, []);

  const logout = useCallback(() => {
    const state: AuthState = { role: null, accountNumber: null, isAuthenticated: false };
    setAuthState(state);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, loginAsAdmin, loginAsUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
