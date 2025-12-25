/**
 * useAccountLinking Hook
 * Link/unlink OAuth providers and identities
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export interface LinkedAccount {
  provider: string;
  providerId: string;
  email?: string;
  name?: string;
  picture?: string;
  linkedAt: Date;
}

export interface UseAccountLinkingReturn {
  /** Linked accounts */
  linkedAccounts: LinkedAccount[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Get all linked accounts */
  getLinkedAccounts: () => Promise<LinkedAccount[]>;
  /** Link a new OAuth provider */
  linkProvider: (provider: string, redirectUri?: string) => Promise<void>;
  /** Unlink an OAuth provider */
  unlinkProvider: (provider: string) => Promise<void>;
  /** Check if a provider is linked */
  isProviderLinked: (provider: string) => boolean;
}

export function useAccountLinking(): UseAccountLinkingReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all linked accounts
  const getLinkedAccounts = useCallback(async (): Promise<LinkedAccount[]> => {
    if (!isAuthenticated) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/auth/oauth/linked`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch linked accounts');
      }

      const data = await response.json();
      const accounts = data.linkedAccounts || data.accounts || [];
      setLinkedAccounts(accounts);
      return accounts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Link a new OAuth provider
  const linkProvider = useCallback(
    async (provider: string, redirectUri?: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        // Get the OAuth authorization URL for linking
        const response = await fetch(`${client['config'].apiUrl}/api/auth/oauth/link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify({
            provider,
            redirectUri: redirectUri || window.location.href,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to initiate ${provider} linking`);
        }

        const data = await response.json();

        // Redirect to OAuth provider
        if (data.authorizationUrl || data.redirectUrl) {
          window.location.href = data.authorizationUrl || data.redirectUrl;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to link provider';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAuthenticated]
  );

  // Unlink an OAuth provider
  const unlinkProvider = useCallback(
    async (provider: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/oauth/unlink/${provider}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Failed to unlink ${provider}`);
        }

        // Remove from local state
        setLinkedAccounts((prev) => prev.filter((acc) => acc.provider !== provider));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlink provider';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAuthenticated]
  );

  // Check if a provider is linked
  const isProviderLinked = useCallback(
    (provider: string): boolean => {
      return linkedAccounts.some(
        (acc) => acc.provider.toLowerCase() === provider.toLowerCase()
      );
    },
    [linkedAccounts]
  );

  return {
    linkedAccounts,
    loading,
    error,
    getLinkedAccounts,
    linkProvider,
    unlinkProvider,
    isProviderLinked,
  };
}

export default useAccountLinking;
