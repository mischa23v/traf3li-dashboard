/**
 * useMFA Hook
 * Hook for Multi-Factor Authentication management
 */

import { useCallback, useState } from 'react';
import { MfaSetupResult, MfaVerifyResult, MfaChallengeData, AuthResult } from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UseMFAReturn {
  // State
  isEnabled: boolean;
  isLoading: boolean;
  error: Error | null;
  backupCodes: string[];

  // Setup
  setupMFA: () => Promise<MfaSetupResult>;
  verifySetup: (code: string) => Promise<MfaVerifyResult>;

  // Challenge
  verifyMFA: (data: MfaChallengeData) => Promise<AuthResult>;

  // Management
  disable: (code: string) => Promise<void>;
  getBackupCodes: () => Promise<string[]>;
  regenerateBackupCodes: () => Promise<string[]>;

  // Utilities
  clearError: () => void;
}

/**
 * MFA management hook
 */
export function useMFA(): UseMFAReturn {
  const { client, user, setError } = useTrafAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<Error | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const isEnabled = user?.isMfaEnabled ?? false;

  // Setup MFA
  const setupMFA = useCallback(async (): Promise<MfaSetupResult> => {
    setIsLoading(true);
    setLocalError(null);
    try {
      return await client.setupMfa();
    } catch (err) {
      setLocalError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Verify MFA setup
  const verifySetup = useCallback(
    async (code: string): Promise<MfaVerifyResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        const result = await client.verifyMfaSetup(code);
        if (result.backupCodes) {
          setBackupCodes(result.backupCodes);
        }
        return result;
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Verify MFA during login
  const verifyMFA = useCallback(
    async (data: MfaChallengeData): Promise<AuthResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.verifyMfa(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Disable MFA
  const disable = useCallback(
    async (code: string): Promise<void> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        await client.disableMfa(code);
        setBackupCodes([]);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Get backup codes
  const getBackupCodes = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setLocalError(null);
    try {
      const codes = await client.getBackupCodes();
      setBackupCodes(codes);
      return codes;
    } catch (err) {
      setLocalError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Regenerate backup codes
  const regenerateBackupCodes = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setLocalError(null);
    try {
      const codes = await client.regenerateBackupCodes();
      setBackupCodes(codes);
      return codes;
    } catch (err) {
      setLocalError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Clear error
  const clearError = useCallback(() => {
    setLocalError(null);
    setError(null);
  }, [setError]);

  return {
    isEnabled,
    isLoading,
    error,
    backupCodes,
    setupMFA,
    verifySetup,
    verifyMFA,
    disable,
    getBackupCodes,
    regenerateBackupCodes,
    clearError,
  };
}
