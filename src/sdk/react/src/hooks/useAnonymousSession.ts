/**
 * useAnonymousSession Hook
 * Guest/anonymous session management
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export interface AnonymousSession {
  id: string;
  isAnonymous: true;
  createdAt: Date;
  expiresAt?: Date;
  data?: Record<string, unknown>;
}

export interface ConvertToAccountData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UseAnonymousSessionReturn {
  /** Current anonymous session */
  session: AnonymousSession | null;
  /** Whether currently in anonymous session */
  isAnonymous: boolean;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Create an anonymous session */
  createSession: (data?: Record<string, unknown>) => Promise<AnonymousSession>;
  /** Convert anonymous session to full account */
  convertToAccount: (data: ConvertToAccountData) => Promise<void>;
  /** End anonymous session */
  endSession: () => Promise<void>;
  /** Save data to anonymous session */
  saveData: (data: Record<string, unknown>) => Promise<void>;
  /** Get data from anonymous session */
  getData: () => Record<string, unknown> | undefined;
}

export function useAnonymousSession(): UseAnonymousSessionReturn {
  const { client, user, isAuthenticated } = useTrafAuthContext();
  const [session, setSession] = useState<AnonymousSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnonymous = session?.isAnonymous || (user as any)?.isAnonymous || false;

  // Create an anonymous session
  const createSession = useCallback(
    async (data?: Record<string, unknown>): Promise<AnonymousSession> => {
      if (isAuthenticated && !isAnonymous) {
        throw new Error('Already authenticated with a regular account');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/auth/anonymous`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ data }),
        });

        if (!response.ok) {
          throw new Error('Failed to create anonymous session');
        }

        const result = await response.json();

        const anonymousSession: AnonymousSession = {
          id: result.sessionId || result.id,
          isAnonymous: true,
          createdAt: new Date(result.createdAt || Date.now()),
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
          data: data || result.data,
        };

        // Store tokens if provided
        if (result.accessToken) {
          client['tokenManager'].setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
        }

        setSession(anonymousSession);
        return anonymousSession;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create session';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAuthenticated, isAnonymous]
  );

  // Convert anonymous session to full account
  const convertToAccount = useCallback(
    async (data: ConvertToAccountData): Promise<void> => {
      if (!isAnonymous) {
        throw new Error('Not in an anonymous session');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/auth/anonymous/convert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to convert account');
        }

        const result = await response.json();

        // Store new tokens
        if (result.accessToken) {
          client['tokenManager'].setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
        }

        // Clear anonymous session
        setSession(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to convert account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAnonymous]
  );

  // End anonymous session
  const endSession = useCallback(async (): Promise<void> => {
    if (!isAnonymous) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetch(`${client['config'].apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
        credentials: 'include',
      });

      client['tokenManager'].clearTokens();
      setSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAnonymous]);

  // Save data to anonymous session
  const saveData = useCallback(
    async (data: Record<string, unknown>): Promise<void> => {
      if (!session) {
        throw new Error('No anonymous session');
      }

      setSession({
        ...session,
        data: { ...session.data, ...data },
      });

      // Optionally sync to server
      try {
        await fetch(`${client['config'].apiUrl}/api/auth/anonymous/data`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify({ data }),
        });
      } catch {
        // Silent fail - data is saved locally
      }
    },
    [client, session]
  );

  // Get data from anonymous session
  const getData = useCallback((): Record<string, unknown> | undefined => {
    return session?.data;
  }, [session]);

  return {
    session,
    isAnonymous,
    loading,
    error,
    createSession,
    convertToAccount,
    endSession,
    saveData,
    getData,
  };
}

export default useAnonymousSession;
