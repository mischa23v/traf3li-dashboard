/**
 * Google One Tap Button Component
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';

export interface GoogleOneTapButtonProps {
  /** Google OAuth Client ID */
  clientId: string;
  /** Callback when credential is received */
  onCredentialResponse: (credential: string) => Promise<void>;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Auto-prompt One Tap */
  autoPrompt?: boolean;
  /** Show the button (otherwise just One Tap) */
  showButton?: boolean;
  /** Button theme */
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  /** Button size */
  size?: 'large' | 'medium' | 'small';
  /** Button text */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  /** Button shape */
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  /** Button width */
  width?: number | string;
  /** Locale */
  locale?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** One Tap context */
  context?: 'signin' | 'signup' | 'use';
  /** ITP support for Safari */
  itpSupport?: boolean;
  /** Cancel on tap outside */
  cancelOnTapOutside?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            itp_support?: boolean;
          }) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
          }) => void) => void;
          cancel: () => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number | string;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export function GoogleOneTapButton({
  clientId,
  onCredentialResponse,
  onError,
  autoPrompt = true,
  showButton = true,
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  shape = 'rectangular',
  width,
  locale,
  loading = false,
  disabled = false,
  className,
  context = 'signin',
  itpSupport = true,
  cancelOnTapOutside = true,
}: GoogleOneTapButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const initialized = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        await onCredentialResponse(response.credential);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [onCredentialResponse, onError]
  );

  // Load Google Identity Services script
  useEffect(() => {
    if (disabled || scriptLoaded.current) return;

    const loadScript = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        onError?.(new Error('Failed to load Google Identity Services'));
      };
      document.body.appendChild(script);
      scriptLoaded.current = true;
    };

    const initializeGoogle = () => {
      if (!window.google || initialized.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: cancelOnTapOutside,
          context,
          itp_support: itpSupport,
        });

        // Render button if ref exists
        if (showButton && buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme,
            size,
            text,
            shape,
            width,
            locale,
          });
        }

        // Show One Tap prompt
        if (autoPrompt) {
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log('Google One Tap not displayed:', notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
              console.log('Google One Tap skipped:', notification.getSkippedReason());
            }
          });
        }

        initialized.current = true;
      } catch (error) {
        onError?.(error as Error);
      }
    };

    if (window.google) {
      initializeGoogle();
    } else {
      loadScript();
    }

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [
    clientId,
    disabled,
    autoPrompt,
    showButton,
    theme,
    size,
    text,
    shape,
    width,
    locale,
    context,
    itpSupport,
    cancelOnTapOutside,
    handleCredentialResponse,
    onError,
  ]);

  if (!showButton) {
    return null;
  }

  // Show loading state or fallback button when Google SDK is loading
  if (loading || !initialized.current) {
    return (
      <Button
        variant="outline"
        fullWidth
        disabled
        loading={loading}
        className={cn(
          'bg-white hover:bg-gray-50 border-gray-300 text-gray-700',
          'dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
          className
        )}
        leftIcon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        }
      >
        Sign in with Google
      </Button>
    );
  }

  // Render the Google button
  return (
    <div
      ref={buttonRef}
      className={cn('flex justify-center', className)}
      style={{ minHeight: size === 'large' ? 44 : size === 'medium' ? 36 : 28 }}
    />
  );
}

export default GoogleOneTapButton;
