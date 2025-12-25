/**
 * usePasswordless Hook
 * Hook for passwordless authentication (OTP, Magic Link)
 */

import { useCallback, useState } from 'react';
import { SendOtpData, VerifyOtpData, MagicLinkData, OtpResult, MagicLinkResult, AuthResult } from '@traf3li/auth-core';
import { useTrafAuthContext } from '../provider';

export interface UsePasswordlessReturn {
  isLoading: boolean;
  error: Error | null;

  // OTP
  sendOtp: (data: SendOtpData) => Promise<OtpResult>;
  verifyOtp: (data: VerifyOtpData) => Promise<AuthResult>;
  resendOtp: (data: SendOtpData) => Promise<OtpResult>;

  // Magic Link
  sendMagicLink: (data: MagicLinkData) => Promise<MagicLinkResult>;
  verifyMagicLink: (token: string) => Promise<AuthResult>;

  // Utilities
  clearError: () => void;
}

/**
 * Passwordless authentication hook
 */
export function usePasswordless(): UsePasswordlessReturn {
  const { client, setError } = useTrafAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<Error | null>(null);

  // Send OTP
  const sendOtp = useCallback(
    async (data: SendOtpData): Promise<OtpResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.sendOtp(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Verify OTP
  const verifyOtp = useCallback(
    async (data: VerifyOtpData): Promise<AuthResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.verifyOtp(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Resend OTP
  const resendOtp = useCallback(
    async (data: SendOtpData): Promise<OtpResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.resendOtp(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Send Magic Link
  const sendMagicLink = useCallback(
    async (data: MagicLinkData): Promise<MagicLinkResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.sendMagicLink(data);
      } catch (err) {
        setLocalError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  // Verify Magic Link
  const verifyMagicLink = useCallback(
    async (token: string): Promise<AuthResult> => {
      setIsLoading(true);
      setLocalError(null);
      try {
        return await client.verifyMagicLink(token);
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
    sendOtp,
    verifyOtp,
    resendOtp,
    sendMagicLink,
    verifyMagicLink,
    clearError,
  };
}
