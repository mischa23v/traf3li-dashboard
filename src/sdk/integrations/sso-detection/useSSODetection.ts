/**
 * useSSODetection Hook
 * React hook for domain-based SSO detection
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SSODetector } from './SSODetector';
import type {
  SSODetectionConfig,
  SSODetectionResult,
  SSOLoginOptions,
} from './types';

export interface UseSSODetectionOptions extends SSODetectionConfig {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

export interface UseSSODetectionReturn {
  /** Detection result */
  result: SSODetectionResult | null;
  /** Whether detection is in progress */
  detecting: boolean;
  /** Error if detection failed */
  error: Error | null;
  /** Detect SSO for email */
  detect: (email: string) => Promise<SSODetectionResult>;
  /** Initiate SSO login */
  login: (options: SSOLoginOptions) => Promise<void>;
  /** Clear detection result */
  clear: () => void;
  /** Clear cache */
  clearCache: (domain?: string) => void;
}

export function useSSODetection(options: UseSSODetectionOptions): UseSSODetectionReturn {
  const { debounceMs = 300, ...config } = options;

  const [result, setResult] = useState<SSODetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detectorRef = useRef<SSODetector | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmailRef = useRef<string>('');

  // Initialize detector
  useEffect(() => {
    detectorRef.current = new SSODetector(config);
  }, [config.apiUrl]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Detect function with debouncing
  const detect = useCallback(
    async (email: string): Promise<SSODetectionResult> => {
      if (!detectorRef.current) {
        throw new Error('SSO detector not initialized');
      }

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Don't re-detect for same email
      if (email === lastEmailRef.current && result) {
        return result;
      }

      lastEmailRef.current = email;

      // Extract domain
      const domain = SSODetector.extractDomain(email);
      if (!domain) {
        const noSsoResult: SSODetectionResult = {
          hasSso: false,
          allowPassword: true,
        };
        setResult(noSsoResult);
        return noSsoResult;
      }

      return new Promise((resolve, reject) => {
        debounceTimerRef.current = setTimeout(async () => {
          setDetecting(true);
          setError(null);

          try {
            const detectionResult = await detectorRef.current!.detect(email);
            setResult(detectionResult);
            resolve(detectionResult);
          } catch (err) {
            const error = err as Error;
            setError(error);
            reject(error);
          } finally {
            setDetecting(false);
          }
        }, debounceMs);
      });
    },
    [debounceMs, result]
  );

  // Login function
  const login = useCallback(async (loginOptions: SSOLoginOptions): Promise<void> => {
    if (!detectorRef.current) {
      throw new Error('SSO detector not initialized');
    }

    try {
      const redirectUrl = await detectorRef.current.login(loginOptions);

      // Redirect to SSO provider
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Clear result
  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    lastEmailRef.current = '';
  }, []);

  // Clear cache
  const clearCache = useCallback((domain?: string) => {
    detectorRef.current?.clearCache(domain);
  }, []);

  return {
    result,
    detecting,
    error,
    detect,
    login,
    clear,
    clearCache,
  };
}

export default useSSODetection;
