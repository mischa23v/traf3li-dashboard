/**
 * useWebAuthn Hook
 * WebAuthn/Passkeys authentication management
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export interface WebAuthnCredential {
  id: string;
  name: string;
  deviceType: 'platform' | 'cross-platform';
  lastUsed?: Date;
  createdAt: Date;
  transports?: AuthenticatorTransport[];
}

export interface WebAuthnRegistrationOptions {
  name?: string;
  authenticatorType?: 'platform' | 'cross-platform' | 'any';
}

export interface UseWebAuthnReturn {
  /** List of registered credentials */
  credentials: WebAuthnCredential[];
  /** Whether WebAuthn is loading */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether WebAuthn is supported */
  isSupported: boolean;
  /** Whether platform authenticator is available */
  isPlatformAuthenticatorAvailable: boolean;
  /** Start registration of new credential */
  startRegistration: (options?: WebAuthnRegistrationOptions) => Promise<WebAuthnCredential>;
  /** Authenticate with WebAuthn */
  authenticate: (email?: string) => Promise<void>;
  /** Get all credentials */
  getCredentials: () => Promise<WebAuthnCredential[]>;
  /** Update credential name */
  updateCredentialName: (id: string, name: string) => Promise<void>;
  /** Delete a credential */
  deleteCredential: (id: string) => Promise<void>;
  /** Check if WebAuthn is available */
  checkSupport: () => Promise<boolean>;
}

export function useWebAuthn(): UseWebAuthnReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(
    typeof window !== 'undefined' && !!window.PublicKeyCredential
  );
  const [isPlatformAuthenticatorAvailable, setIsPlatformAuthenticatorAvailable] = useState(false);

  // Check WebAuthn support
  const checkSupport = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setIsSupported(false);
      return false;
    }

    setIsSupported(true);

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsPlatformAuthenticatorAvailable(available);
    } catch {
      setIsPlatformAuthenticatorAvailable(false);
    }

    return true;
  }, []);

  // Start registration
  const startRegistration = useCallback(
    async (options?: WebAuthnRegistrationOptions): Promise<WebAuthnCredential> => {
      if (!isSupported) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      setLoading(true);
      setError(null);

      try {
        // Get registration options from server
        const response = await fetch(`${client['config'].apiUrl}/api/auth/webauthn/register/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify({
            name: options?.name,
            authenticatorType: options?.authenticatorType || 'any',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start registration');
        }

        const registrationOptions = await response.json();

        // Create credential
        const credential = await navigator.credentials.create({
          publicKey: {
            ...registrationOptions.options,
            challenge: base64ToArrayBuffer(registrationOptions.options.challenge),
            user: {
              ...registrationOptions.options.user,
              id: base64ToArrayBuffer(registrationOptions.options.user.id),
            },
            excludeCredentials: registrationOptions.options.excludeCredentials?.map(
              (cred: { id: string; type: string; transports?: string[] }) => ({
                ...cred,
                id: base64ToArrayBuffer(cred.id),
              })
            ),
          },
        }) as PublicKeyCredential;

        if (!credential) {
          throw new Error('Credential creation failed');
        }

        const attestationResponse = credential.response as AuthenticatorAttestationResponse;

        // Send to server for verification
        const finishResponse = await fetch(
          `${client['config'].apiUrl}/api/auth/webauthn/register/finish`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
            body: JSON.stringify({
              id: credential.id,
              rawId: arrayBufferToBase64(credential.rawId),
              type: credential.type,
              response: {
                clientDataJSON: arrayBufferToBase64(attestationResponse.clientDataJSON),
                attestationObject: arrayBufferToBase64(attestationResponse.attestationObject),
                transports: attestationResponse.getTransports?.() || [],
              },
              name: options?.name,
            }),
          }
        );

        if (!finishResponse.ok) {
          throw new Error('Failed to verify registration');
        }

        const newCredential = await finishResponse.json();
        setCredentials((prev) => [...prev, newCredential.credential]);
        return newCredential.credential;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isSupported]
  );

  // Authenticate with WebAuthn
  const authenticate = useCallback(
    async (email?: string): Promise<void> => {
      if (!isSupported) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      setLoading(true);
      setError(null);

      try {
        // Get authentication options from server
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/webauthn/authenticate/start`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to start authentication');
        }

        const authOptions = await response.json();

        // Get assertion
        const credential = await navigator.credentials.get({
          publicKey: {
            ...authOptions.options,
            challenge: base64ToArrayBuffer(authOptions.options.challenge),
            allowCredentials: authOptions.options.allowCredentials?.map(
              (cred: { id: string; type: string; transports?: string[] }) => ({
                ...cred,
                id: base64ToArrayBuffer(cred.id),
              })
            ),
          },
        }) as PublicKeyCredential;

        if (!credential) {
          throw new Error('Authentication failed');
        }

        const assertionResponse = credential.response as AuthenticatorAssertionResponse;

        // Send to server for verification
        const finishResponse = await fetch(
          `${client['config'].apiUrl}/api/auth/webauthn/authenticate/finish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              id: credential.id,
              rawId: arrayBufferToBase64(credential.rawId),
              type: credential.type,
              response: {
                clientDataJSON: arrayBufferToBase64(assertionResponse.clientDataJSON),
                authenticatorData: arrayBufferToBase64(assertionResponse.authenticatorData),
                signature: arrayBufferToBase64(assertionResponse.signature),
                userHandle: assertionResponse.userHandle
                  ? arrayBufferToBase64(assertionResponse.userHandle)
                  : null,
              },
            }),
          }
        );

        if (!finishResponse.ok) {
          throw new Error('Failed to verify authentication');
        }

        const result = await finishResponse.json();

        // Store tokens
        if (result.accessToken) {
          client['tokenManager'].setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
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
    [client, isSupported]
  );

  // Get all credentials
  const getCredentials = useCallback(async (): Promise<WebAuthnCredential[]> => {
    if (!isAuthenticated) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/auth/webauthn/credentials`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }

      const data = await response.json();
      setCredentials(data.credentials || []);
      return data.credentials || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch credentials';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Update credential name
  const updateCredentialName = useCallback(
    async (id: string, name: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/webauthn/credentials/${id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
            body: JSON.stringify({ name }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update credential');
        }

        setCredentials((prev) =>
          prev.map((cred) => (cred.id === id ? { ...cred, name } : cred))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update credential';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Delete credential
  const deleteCredential = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/webauthn/credentials/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete credential');
        }

        setCredentials((prev) => prev.filter((cred) => cred.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete credential';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    credentials,
    loading,
    error,
    isSupported,
    isPlatformAuthenticatorAvailable,
    startRegistration,
    authenticate,
    getCredentials,
    updateCredentialName,
    deleteCredential,
    checkSupport,
  };
}

// Utility functions
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default useWebAuthn;
