/**
 * useUser Hook
 * Hook for user profile management
 */

import { useCallback, useState } from 'react';
import { User } from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * User profile hook
 */
export function useUser(): UseUserReturn {
  const { client, user, error, setError } = useTrafAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  // Refetch user data
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.initialize();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, setError]);

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}
