/**
 * useBackupCodes Hook
 * Backup codes management for MFA recovery
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export interface BackupCodesStatus {
  hasBackupCodes: boolean;
  remainingCodes: number;
  totalCodes: number;
  generatedAt?: Date;
}

export interface UseBackupCodesReturn {
  /** Backup codes status */
  status: BackupCodesStatus | null;
  /** Generated backup codes (only available once after generation) */
  codes: string[] | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Generate new backup codes */
  generate: () => Promise<string[]>;
  /** Regenerate backup codes (replaces existing) */
  regenerate: () => Promise<string[]>;
  /** Verify a backup code (for MFA) */
  verify: (code: string) => Promise<boolean>;
  /** Get backup codes count */
  getStatus: () => Promise<BackupCodesStatus>;
  /** Clear displayed codes */
  clearCodes: () => void;
}

export function useBackupCodes(): UseBackupCodesReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [status, setStatus] = useState<BackupCodesStatus | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get backup codes status
  const getStatus = useCallback(async (): Promise<BackupCodesStatus> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${client['config'].apiUrl}/api/auth/mfa/backup-codes/count`,
        {
          headers: {
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get backup codes status');
      }

      const data = await response.json();
      const statusData: BackupCodesStatus = {
        hasBackupCodes: data.count > 0,
        remainingCodes: data.count,
        totalCodes: data.total || 10,
        generatedAt: data.generatedAt ? new Date(data.generatedAt) : undefined,
      };

      setStatus(statusData);
      return statusData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get status';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Generate new backup codes
  const generate = useCallback(async (): Promise<string[]> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${client['config'].apiUrl}/api/auth/mfa/backup-codes/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate backup codes');
      }

      const data = await response.json();
      const newCodes = data.codes || data.backupCodes || [];

      setCodes(newCodes);
      setStatus({
        hasBackupCodes: true,
        remainingCodes: newCodes.length,
        totalCodes: newCodes.length,
        generatedAt: new Date(),
      });

      return newCodes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate codes';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Regenerate backup codes
  const regenerate = useCallback(async (): Promise<string[]> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${client['config'].apiUrl}/api/auth/mfa/backup-codes/regenerate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to regenerate backup codes');
      }

      const data = await response.json();
      const newCodes = data.codes || data.backupCodes || [];

      setCodes(newCodes);
      setStatus({
        hasBackupCodes: true,
        remainingCodes: newCodes.length,
        totalCodes: newCodes.length,
        generatedAt: new Date(),
      });

      return newCodes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate codes';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Verify a backup code
  const verify = useCallback(
    async (code: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/auth/mfa/backup-codes/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ code: code.replace(/\s/g, '').toUpperCase() }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Invalid backup code');
        }

        const data = await response.json();

        // Update remaining count
        if (status) {
          setStatus({
            ...status,
            remainingCodes: Math.max(0, status.remainingCodes - 1),
          });
        }

        // Store tokens if provided
        if (data.accessToken) {
          client['tokenManager'].setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client, status]
  );

  // Clear displayed codes (for security)
  const clearCodes = useCallback(() => {
    setCodes(null);
  }, []);

  return {
    status,
    codes,
    loading,
    error,
    generate,
    regenerate,
    verify,
    getStatus,
    clearCodes,
  };
}

export default useBackupCodes;
