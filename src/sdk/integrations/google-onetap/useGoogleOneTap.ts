/**
 * useGoogleOneTap Hook
 * React hook for Google One Tap integration
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleOneTapManager } from './GoogleOneTapManager';
import type {
  GoogleOneTapConfig,
  GoogleOneTapResult,
  GoogleOneTapNotification,
} from './types';

export interface UseGoogleOneTapOptions extends Omit<GoogleOneTapConfig, 'apiUrl' | 'clientId'> {
  /** Google OAuth Client ID */
  clientId: string;
  /** API URL for backend verification */
  apiUrl: string;
  /** Disable the hook */
  disabled?: boolean;
  /** Auto-show prompt on mount */
  autoPrompt?: boolean;
  /** Callback when login succeeds */
  onSuccess?: (result: GoogleOneTapResult) => void;
  /** Callback when login fails */
  onError?: (error: Error) => void;
  /** Callback for prompt moment */
  onPromptMoment?: (notification: GoogleOneTapNotification) => void;
}

export interface UseGoogleOneTapReturn {
  /** Whether One Tap is loading */
  loading: boolean;
  /** Whether One Tap is ready */
  ready: boolean;
  /** Error if initialization failed */
  error: Error | null;
  /** Show the One Tap prompt */
  prompt: () => void;
  /** Cancel the One Tap prompt */
  cancel: () => void;
  /** Render a sign-in button */
  renderButton: (element: HTMLElement, options?: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    width?: number | string;
    locale?: string;
  }) => void;
  /** Revoke access for a user */
  revoke: (email: string) => Promise<void>;
  /** Disable auto-select */
  disableAutoSelect: () => void;
}

export function useGoogleOneTap(options: UseGoogleOneTapOptions): UseGoogleOneTapReturn {
  const {
    clientId,
    apiUrl,
    disabled = false,
    autoPrompt = true,
    onSuccess,
    onError,
    onPromptMoment,
    ...config
  } = options;

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef<GoogleOneTapManager | null>(null);

  // Initialize on mount
  useEffect(() => {
    if (disabled) {
      setLoading(false);
      return;
    }

    const manager = new GoogleOneTapManager(
      {
        clientId,
        apiUrl,
        ...config,
      },
      {
        onSuccess,
        onError: (err) => {
          setError(err);
          onError?.(err);
        },
        onPromptMoment,
      }
    );

    managerRef.current = manager;

    const init = async () => {
      try {
        await manager.initialize();
        setReady(true);
        setError(null);

        if (autoPrompt) {
          manager.prompt();
        }
      } catch (err) {
        setError(err as Error);
        onError?.(err as Error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      manager.cancel();
    };
  }, [clientId, apiUrl, disabled]);

  // Prompt function
  const prompt = useCallback(() => {
    managerRef.current?.prompt();
  }, []);

  // Cancel function
  const cancel = useCallback(() => {
    managerRef.current?.cancel();
  }, []);

  // Render button function
  const renderButton = useCallback(
    (element: HTMLElement, buttonOptions?: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number | string;
      locale?: string;
    }) => {
      managerRef.current?.renderButton(element, buttonOptions);
    },
    []
  );

  // Revoke function
  const revoke = useCallback(async (email: string) => {
    await managerRef.current?.revoke(email);
  }, []);

  // Disable auto-select function
  const disableAutoSelect = useCallback(() => {
    managerRef.current?.disableAutoSelect();
  }, []);

  return {
    loading,
    ready,
    error,
    prompt,
    cancel,
    renderButton,
    revoke,
    disableAutoSelect,
  };
}

export default useGoogleOneTap;
