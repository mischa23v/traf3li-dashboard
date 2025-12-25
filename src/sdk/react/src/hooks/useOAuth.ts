/**
 * useOAuth Hook
 * Hook for OAuth and SSO authentication
 */

import { useCallback, useState } from 'react';
import { OAuthProvider, SSODetectionResult, AuthResult } from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UseOAuthReturn {
  isLoading: boolean;
  error: Error | null;
  availableProviders: OAuthProvider[];

  // OAuth
  loginWithProvider: (provider: OAuthProvider) => void;
  handleCallback: () => Promise<AuthResult>;

  // SSO
  detectSSO: (email: string, returnUrl?: string) => Promise<SSODetectionResult>;

  // Google One Tap
  handleGoogleOneTap: (credential: string) => Promise<AuthResult>;

  // Utilities
  clearError: () => void;
}

/**
 * OAuth and SSO hook
 */
export function useOAuth(): UseOAuthReturn {
  const { client, setError } = useTrafAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<Error | null>(null);

  // Available providers (can be fetched from backend or configured)
  const availableProviders: OAuthProvider[] = ['google', 'microsoft'];

  // Login with OAuth provider
  const loginWithProvider = useCallback(
    (provider: OAuthProvider) => {
      client.loginWithOAuth(provider);
    },
    [client]
  );

  // Handle OAuth callback (for custom callback handling)
  const handleCallback = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    setLocalError(null);
    try {
      // Parse callback URL parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code) {
        throw new Error('No authorization code in callback');
      }

      // The actual callback handling would be done by the API
      // This is a placeholder for custom handling
      throw new Error('OAuth callback should be handled by the API');
    } catch (err) {
      setLocalError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Detect SSO provider for email domain
  const detectSSO = useCallback(
    async (email: string, returnUrl?: string): Promise<SSODetectionResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.detectSSO(email, returnUrl);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Handle Google One Tap
  const handleGoogleOneTap = useCallback(
    async (credential: string): Promise<AuthResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.handleGoogleOneTap(credential);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Clear error
  const clearError = useCallback(() => {
    setLocalError(null);
    setError(null);
  }, [setError]);

  return {
    isLoading,
    error,
    availableProviders,
    loginWithProvider,
    handleCallback,
    detectSSO,
    handleGoogleOneTap,
    clearError,
  };
}
