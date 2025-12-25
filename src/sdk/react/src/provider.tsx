/**
 * TrafAuth React Provider
 * Provides authentication context to the app
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  TrafAuthClient,
  createTrafAuthClient,
  User,
  TrafAuthConfig,
} from '@traf3li/auth-core';

interface TrafAuthContextValue {
  client: TrafAuthClient;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPending: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
}

const TrafAuthContext = createContext<TrafAuthContextValue | null>(null);

export interface TrafAuthProviderProps {
  children: ReactNode;
  config?: TrafAuthConfig;
  apiUrl?: string;
  firmId?: string;
  autoRefreshToken?: boolean;
  onAuthStateChange?: (user: User | null) => void;
}

/**
 * TrafAuth Provider Component
 */
export function TrafAuthProvider({
  children,
  config,
  apiUrl,
  firmId,
  autoRefreshToken = true,
  onAuthStateChange,
}: TrafAuthProviderProps) {
  // Create client with config
  const client = useMemo(() => {
    const finalConfig: TrafAuthConfig = config || {
      apiUrl: apiUrl || process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || '',
      firmId,
      autoRefreshToken,
      onAuthStateChange,
    };
    return createTrafAuthClient(finalConfig);
  }, [config, apiUrl, firmId, autoRefreshToken, onAuthStateChange]);

  // State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = client.subscribe((state) => {
      setUser(state.user);
      setIsAuthenticated(state.isAuthenticated);
      setIsLoading(state.isLoading);
      setMfaPending(state.mfaPending);
    });

    // Initialize auth state
    client.initialize().catch((err) => {
      setError(err);
    });

    return () => {
      unsubscribe();
      client.destroy();
    };
  }, [client]);

  // Context value
  const value = useMemo(
    () => ({
      client,
      user,
      isAuthenticated,
      isLoading,
      mfaPending,
      error,
      setError,
    }),
    [client, user, isAuthenticated, isLoading, mfaPending, error]
  );

  return (
    <TrafAuthContext.Provider value={value}>
      {children}
    </TrafAuthContext.Provider>
  );
}

/**
 * Hook to access TrafAuth context
 */
export function useTrafAuthContext(): TrafAuthContextValue {
  const context = useContext(TrafAuthContext);
  if (!context) {
    throw new Error('useTrafAuthContext must be used within a TrafAuthProvider');
  }
  return context;
}
