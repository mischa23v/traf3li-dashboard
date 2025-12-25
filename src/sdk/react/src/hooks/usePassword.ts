/**
 * usePassword Hook
 * Hook for password management (forgot, reset, change, strength)
 */

import { useCallback, useState } from 'react';
import { PasswordStrength, ForgotPasswordData, ResetPasswordData, ChangePasswordData } from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UsePasswordReturn {
  isLoading: boolean;
  error: Error | null;
  passwordStrength: PasswordStrength | null;

  // Actions
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  checkStrength: (password: string) => Promise<PasswordStrength>;

  // Utilities
  clearError: () => void;
}

/**
 * Password management hook
 */
export function usePassword(): UsePasswordReturn {
  const { client, setError } = useTrafAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<Error | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  // Forgot password
  const forgotPassword = useCallback(
    async (data: ForgotPasswordData): Promise<void> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        await client.forgotPassword(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Reset password
  const resetPassword = useCallback(
    async (data: ResetPasswordData): Promise<void> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        await client.resetPassword(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Change password
  const changePassword = useCallback(
    async (data: ChangePasswordData): Promise<void> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        await client.changePassword(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Check password strength
  const checkStrength = useCallback(
    async (password: string): Promise<PasswordStrength> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        const strength = await client.checkPasswordStrength(password);
        setPasswordStrength(strength);
        return strength;
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
    passwordStrength,
    forgotPassword,
    resetPassword,
    changePassword,
    checkStrength,
    clearError,
  };
}
