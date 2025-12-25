/**
 * useApiKeys Hook
 * API key management
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateApiKeyData {
  name: string;
  scopes?: string[];
  expiresIn?: number; // days
}

export interface CreateApiKeyResult extends ApiKey {
  /** Full API key (only shown once) */
  key: string;
}

export interface UseApiKeysReturn {
  /** List of API keys */
  apiKeys: ApiKey[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Fetch all API keys */
  getApiKeys: () => Promise<ApiKey[]>;
  /** Create a new API key */
  createApiKey: (data: CreateApiKeyData) => Promise<CreateApiKeyResult>;
  /** Revoke an API key */
  revokeApiKey: (id: string) => Promise<void>;
  /** Regenerate an API key */
  regenerateApiKey: (id: string) => Promise<CreateApiKeyResult>;
  /** Update API key */
  updateApiKey: (id: string, data: Partial<CreateApiKeyData>) => Promise<ApiKey>;
  /** Get API key statistics */
  getStats: () => Promise<{ total: number; active: number; expired: number }>;
}

export function useApiKeys(): UseApiKeysReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all API keys
  const getApiKeys = useCallback(async (): Promise<ApiKey[]> => {
    if (!isAuthenticated) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/api-keys`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      const keys = (data.apiKeys || data.keys || []).map((key: any) => ({
        id: key.id || key._id,
        name: key.name,
        prefix: key.prefix || key.key?.substring(0, 8),
        scopes: key.scopes || key.permissions || [],
        lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
        expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
        createdAt: new Date(key.createdAt),
        isActive: key.isActive !== false && key.status !== 'revoked',
      }));

      setApiKeys(keys);
      return keys;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch keys';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Create a new API key
  const createApiKey = useCallback(
    async (data: CreateApiKeyData): Promise<CreateApiKeyResult> => {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/api-keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create API key');
        }

        const result = await response.json();
        const newKey: CreateApiKeyResult = {
          id: result.id || result._id,
          name: result.name,
          prefix: result.prefix || result.key?.substring(0, 8),
          scopes: result.scopes || [],
          createdAt: new Date(result.createdAt),
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
          isActive: true,
          key: result.key || result.apiKey,
        };

        setApiKeys((prev) => [...prev, newKey]);
        return newKey;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create key';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAuthenticated]
  );

  // Revoke an API key
  const revokeApiKey = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/api-keys/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to revoke API key');
        }

        setApiKeys((prev) => prev.filter((key) => key.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to revoke key';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Regenerate an API key
  const regenerateApiKey = useCallback(
    async (id: string): Promise<CreateApiKeyResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/api-keys/${id}/regenerate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to regenerate API key');
        }

        const result = await response.json();
        const regeneratedKey: CreateApiKeyResult = {
          id: result.id || result._id,
          name: result.name,
          prefix: result.prefix || result.key?.substring(0, 8),
          scopes: result.scopes || [],
          createdAt: new Date(result.createdAt),
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
          isActive: true,
          key: result.key || result.apiKey,
        };

        setApiKeys((prev) =>
          prev.map((key) => (key.id === id ? regeneratedKey : key))
        );

        return regeneratedKey;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to regenerate key';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Update API key
  const updateApiKey = useCallback(
    async (id: string, data: Partial<CreateApiKeyData>): Promise<ApiKey> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/api-keys/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update API key');
        }

        const result = await response.json();
        const updatedKey: ApiKey = {
          id: result.id || result._id,
          name: result.name,
          prefix: result.prefix,
          scopes: result.scopes || [],
          createdAt: new Date(result.createdAt),
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
          lastUsed: result.lastUsed ? new Date(result.lastUsed) : undefined,
          isActive: result.isActive !== false,
        };

        setApiKeys((prev) =>
          prev.map((key) => (key.id === id ? updatedKey : key))
        );

        return updatedKey;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update key';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Get stats
  const getStats = useCallback(async () => {
    if (!isAuthenticated) {
      return { total: 0, active: 0, expired: 0 };
    }

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/api-keys/stats`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      return response.json();
    } catch {
      return { total: apiKeys.length, active: apiKeys.filter((k) => k.isActive).length, expired: 0 };
    }
  }, [client, isAuthenticated, apiKeys]);

  return {
    apiKeys,
    loading,
    error,
    getApiKeys,
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    updateApiKey,
    getStats,
  };
}

export default useApiKeys;
