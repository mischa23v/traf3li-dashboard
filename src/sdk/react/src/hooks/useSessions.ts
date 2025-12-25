/**
 * useSessions Hook
 * Hook for session management
 */

import { useCallback, useState, useEffect } from 'react';
import { Session } from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UseSessionsReturn {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllOther: () => Promise<void>;

  // Utilities
  refetch: () => Promise<void>;
}

/**
 * Session management hook
 */
export function useSessions(): UseSessionsReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const [allSessions, current] = await Promise.all([
        client.getSessions(),
        client.getCurrentSession(),
      ]);
      setSessions(allSessions);
      setCurrentSession(current);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated]);

  // Revoke a specific session
  const revokeSession = useCallback(
    async (sessionId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await client.revokeSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Revoke all other sessions
  const revokeAllOther = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.revokeOtherSessions();
      // Keep only current session
      if (currentSession) {
        setSessions([currentSession]);
      } else {
        await fetchSessions();
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, currentSession, fetchSessions]);

  // Auto-fetch on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    fetchSessions,
    revokeSession,
    revokeAllOther,
    refetch: fetchSessions,
  };
}
