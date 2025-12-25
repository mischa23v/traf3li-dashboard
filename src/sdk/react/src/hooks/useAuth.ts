/**
 * useAuth Hook
 * Main authentication hook for login, logout, and auth state
 */

import { useCallback, useState } from 'react';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResult,
  OAuthProvider,
} from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPending: boolean;
  error: Error | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // OAuth
  loginWithGoogle: () => void;
  loginWithMicrosoft: () => void;
  loginWithProvider: (provider: OAuthProvider) => void;
  handleGoogleOneTap: (credential: string) => Promise<AuthResult>;

  // Utilities
  clearError: () => void;
  checkAvailability: (
    field: 'email' | 'username' | 'phone',
    value: string
  ) => Promise<{ available: boolean; message?: string }>;
}

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const { client, user, isAuthenticated, isLoading, mfaPending, error, setError } =
    useTrafAuthContext();

  const [localLoading, setLocalLoading] = useState(false);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResult> => {
      setLocalLoading(true);
      setError(null);
      try {
        return await client.login(credentials);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLocalLoading(false);
      }
    },
    [client, setError]
  );

  // Register
  const register = useCallback(
    async (data: RegisterData): Promise<AuthResult> => {
      setLocalLoading(true);
      setError(null);
      try {
        return await client.register(data);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLocalLoading(false);
      }
    },
    [client, setError]
  );

  // Logout
  const logout = useCallback(async () => {
    setLocalLoading(true);
    try {
      await client.logout();
    } finally {
      setLocalLoading(false);
    }
  }, [client]);

  // Logout all devices
  const logoutAll = useCallback(async () => {
    setLocalLoading(true);
    try {
      await client.logoutAll();
    } finally {
      setLocalLoading(false);
    }
  }, [client]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    await client.refreshToken();
  }, [client]);

  // OAuth methods
  const loginWithGoogle = useCallback(() => {
    client.loginWithOAuth('google');
  }, [client]);

  const loginWithMicrosoft = useCallback(() => {
    client.loginWithOAuth('microsoft');
  }, [client]);

  const loginWithProvider = useCallback(
    (provider: OAuthProvider) => {
      client.loginWithOAuth(provider);
    },
    [client]
  );

  // Google One Tap
  const handleGoogleOneTap = useCallback(
    async (credential: string): Promise<AuthResult> => {
      setLocalLoading(true);
      setError(null);
      try {
        return await client.handleGoogleOneTap(credential);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLocalLoading(false);
      }
    },
    [client, setError]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Check availability
  const checkAvailability = useCallback(
    async (field: 'email' | 'username' | 'phone', value: string) => {
      return client.checkAvailability(field, value);
    },
    [client]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || localLoading,
    mfaPending,
    error,

    // Actions
    login,
    register,
    logout,
    logoutAll,
    refreshToken,

    // OAuth
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithProvider,
    handleGoogleOneTap,

    // Utilities
    clearError,
    checkAvailability,
  };
}
