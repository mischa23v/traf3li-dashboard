/**
 * useEnterpriseSSO Hook
 * LDAP, SAML, and OIDC enterprise authentication
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'ldap';
  enabled: boolean;
  logoUrl?: string;
  domains?: string[];
}

export interface SSOConnection {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'ldap';
  status: 'active' | 'pending' | 'error';
  domain: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  lastUsed?: Date;
}

export interface LDAPConfig {
  serverUrl: string;
  baseDN: string;
  bindDN?: string;
  bindPassword?: string;
  searchFilter?: string;
  useTLS?: boolean;
}

export interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  signRequest?: boolean;
  signatureAlgorithm?: string;
  attributeMapping?: Record<string, string>;
}

export interface UseEnterpriseSSOReturn {
  /** Available SSO providers */
  providers: SSOProvider[];
  /** SSO connections */
  connections: SSOConnection[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Get available SSO providers for domain */
  getProvidersForDomain: (domain: string) => Promise<SSOProvider[]>;
  /** Initiate SSO login */
  initiateSSO: (providerId: string, redirectUri?: string) => Promise<void>;
  /** Authenticate with LDAP */
  authenticateLDAP: (username: string, password: string, domain?: string) => Promise<void>;
  /** Get SSO connections (admin) */
  getConnections: () => Promise<SSOConnection[]>;
  /** Create SAML connection */
  createSAMLConnection: (name: string, config: SAMLConfig) => Promise<SSOConnection>;
  /** Create LDAP connection */
  createLDAPConnection: (name: string, config: LDAPConfig) => Promise<SSOConnection>;
  /** Test connection */
  testConnection: (connectionId: string) => Promise<{ success: boolean; message: string }>;
  /** Delete connection */
  deleteConnection: (connectionId: string) => Promise<void>;
}

export function useEnterpriseSSO(): UseEnterpriseSSOReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [connections, setConnections] = useState<SSOConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get SSO providers for a domain
  const getProvidersForDomain = useCallback(
    async (domain: string): Promise<SSOProvider[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/sso/providers?domain=${encodeURIComponent(domain)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch SSO providers');
        }

        const data = await response.json();
        setProviders(data.providers || []);
        return data.providers || [];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get providers';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Initiate SSO login
  const initiateSSO = useCallback(
    async (providerId: string, redirectUri?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/auth/sso/${providerId}/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            redirectUri: redirectUri || window.location.href,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate SSO');
        }

        const data = await response.json();

        // Redirect to SSO provider
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'SSO initiation failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // LDAP authentication
  const authenticateLDAP = useCallback(
    async (username: string, password: string, domain?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/auth/ldap/authenticate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password, domain }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'LDAP authentication failed');
        }

        const data = await response.json();

        // Store tokens
        if (data.accessToken) {
          client['tokenManager'].setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Get SSO connections (admin)
  const getConnections = useCallback(async (): Promise<SSOConnection[]> => {
    if (!isAuthenticated) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/auth/sso/connections`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data = await response.json();
      const conns = (data.connections || []).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastUsed: c.lastUsed ? new Date(c.lastUsed) : undefined,
      }));

      setConnections(conns);
      return conns;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get connections';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Create SAML connection
  const createSAMLConnection = useCallback(
    async (name: string, config: SAMLConfig): Promise<SSOConnection> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/auth/saml/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify({ name, ...config }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create SAML connection');
        }

        const data = await response.json();
        const newConnection = {
          ...data.connection,
          createdAt: new Date(data.connection.createdAt),
        };

        setConnections((prev) => [...prev, newConnection]);
        return newConnection;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create connection';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Create LDAP connection
  const createLDAPConnection = useCallback(
    async (name: string, config: LDAPConfig): Promise<SSOConnection> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/auth/ldap/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify({ name, ...config }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create LDAP connection');
        }

        const data = await response.json();
        const newConnection = {
          ...data.connection,
          createdAt: new Date(data.connection.createdAt),
        };

        setConnections((prev) => [...prev, newConnection]);
        return newConnection;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create connection';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Test connection
  const testConnection = useCallback(
    async (connectionId: string): Promise<{ success: boolean; message: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/sso/connections/${connectionId}/test`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        const data = await response.json();
        return {
          success: response.ok,
          message: data.message || (response.ok ? 'Connection successful' : 'Connection failed'),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Test failed';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Delete connection
  const deleteConnection = useCallback(
    async (connectionId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/sso/connections/${connectionId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete connection');
        }

        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    providers,
    connections,
    loading,
    error,
    getProvidersForDomain,
    initiateSSO,
    authenticateLDAP,
    getConnections,
    createSAMLConnection,
    createLDAPConnection,
    testConnection,
    deleteConnection,
  };
}

export default useEnterpriseSSO;
