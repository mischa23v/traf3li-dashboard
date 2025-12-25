/**
 * Google One Tap Component for Next.js
 * Implements Google One Tap sign-in
 */

'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@traf3li/auth-react';

export interface GoogleOneTapProps {
  /** Google OAuth Client ID */
  clientId: string;
  /** Callback when login succeeds */
  onSuccess?: (user: any) => void;
  /** Callback when login fails */
  onError?: (error: Error) => void;
  /** Auto-select if only one account */
  autoSelect?: boolean;
  /** Cancel when user clicks outside */
  cancelOnTapOutside?: boolean;
  /** Context hint for the prompt */
  context?: 'signin' | 'signup' | 'use';
  /** Enable ITP support for Safari */
  itp_support?: boolean;
  /** Disable the component */
  disabled?: boolean;
  /** Firm ID for multi-tenancy */
  firmId?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Google One Tap Component
 */
export function GoogleOneTap({
  clientId,
  onSuccess,
  onError,
  autoSelect = true,
  cancelOnTapOutside = true,
  context = 'signin',
  itp_support = true,
  disabled = false,
  firmId,
}: GoogleOneTapProps) {
  const { handleGoogleOneTap, isAuthenticated } = useAuth();
  const initialized = useRef(false);
  const scriptLoaded = useRef(false);

  // Handle credential response
  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        const result = await handleGoogleOneTap(response.credential);
        onSuccess?.(result.user);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [handleGoogleOneTap, onSuccess, onError]
  );

  // Load Google script and initialize
  useEffect(() => {
    if (disabled || isAuthenticated || initialized.current) {
      return;
    }

    // Load Google Identity Services script
    const loadScript = () => {
      if (scriptLoaded.current) return;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleOneTap;
      document.body.appendChild(script);
      scriptLoaded.current = true;
    };

    const initializeGoogleOneTap = () => {
      if (!window.google || initialized.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: autoSelect,
          cancel_on_tap_outside: cancelOnTapOutside,
          context,
          itp_support,
        });

        // Show the One Tap prompt
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('Google One Tap not displayed:', notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.log('Google One Tap skipped:', notification.getSkippedReason());
          }
        });

        initialized.current = true;
      } catch (error) {
        console.error('Failed to initialize Google One Tap:', error);
        onError?.(error as Error);
      }
    };

    // Check if script already loaded
    if (window.google) {
      initializeGoogleOneTap();
    } else {
      loadScript();
    }

    // Cleanup
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [
    clientId,
    disabled,
    isAuthenticated,
    autoSelect,
    cancelOnTapOutside,
    context,
    itp_support,
    handleCredentialResponse,
    onError,
  ]);

  // Cancel prompt when authenticated
  useEffect(() => {
    if (isAuthenticated && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }, [isAuthenticated]);

  // This component doesn't render anything visible
  // Google One Tap renders its own UI
  return null;
}

export default GoogleOneTap;
