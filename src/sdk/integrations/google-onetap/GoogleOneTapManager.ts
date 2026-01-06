/**
 * Google One Tap Manager
 * Manages Google One Tap initialization and credential handling
 */

import type {
  GoogleOneTapConfig,
  GoogleCredentialResponse,
  GoogleOneTapResult,
  GoogleOneTapCallbacks,
  GoogleOneTapNotification,
  DecodedGoogleToken,
} from './types';

export class GoogleOneTapManager {
  private config: GoogleOneTapConfig;
  private callbacks: GoogleOneTapCallbacks;
  private initialized: boolean = false;
  private scriptLoaded: boolean = false;

  constructor(config: GoogleOneTapConfig, callbacks: GoogleOneTapCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
  }

  /**
   * Initialize Google One Tap
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.loadScript();

    if (!window.google) {
      throw new Error('Google Identity Services failed to load');
    }

    window.google.accounts.id.initialize({
      client_id: this.config.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: this.config.autoSelect ?? true,
      cancel_on_tap_outside: this.config.cancelOnTapOutside ?? true,
      context: this.config.context ?? 'signin',
      itp_support: this.config.itpSupport ?? true,
      nonce: this.config.nonce,
      state: this.config.state,
    });

    this.initialized = true;
  }

  /**
   * Load Google Identity Services script
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded || window.google) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () =>
          reject(new Error('Failed to load Google Identity Services'))
        );
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(new Error('Failed to load Google Identity Services'));
      document.body.appendChild(script);
    });
  }

  /**
   * Show the One Tap prompt
   */
  prompt(): void {
    if (!this.initialized || !window.google) {
      console.warn('Google One Tap not initialized. Call initialize() first.');
      return;
    }

    window.google.accounts.id.prompt((notification: GoogleOneTapNotification) => {
      this.callbacks.onPromptMoment?.(notification);

      if (notification.isNotDisplayed()) {
        console.log('Google One Tap not displayed:', notification.getNotDisplayedReason());
      } else if (notification.isSkippedMoment()) {
        console.log('Google One Tap skipped:', notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        console.log('Google One Tap dismissed:', notification.getDismissedReason());
      }
    });
  }

  /**
   * Cancel the One Tap prompt
   */
  cancel(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }

  /**
   * Render a sign-in button
   */
  renderButton(
    element: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number | string;
      locale?: string;
    } = {}
  ): void {
    if (!this.initialized || !window.google) {
      console.warn('Google One Tap not initialized. Call initialize() first.');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: options.theme ?? 'outline',
      size: options.size ?? 'large',
      text: options.text ?? 'signin_with',
      shape: options.shape ?? 'rectangular',
      width: options.width,
      locale: options.locale,
    });
  }

  /**
   * Revoke access for a user
   */
  revoke(email: string): Promise<void> {
    return new Promise((resolve) => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.revoke(email, () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Disable auto-select
   */
  disableAutoSelect(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Handle credential response from Google
   */
  private async handleCredentialResponse(
    response: GoogleCredentialResponse
  ): Promise<void> {
    try {
      // Decode the JWT to get user info
      const decodedToken = this.decodeJWT(response.credential);

      // Send credential to backend for verification
      const result = await this.verifyWithBackend(response.credential);

      if (result.success) {
        this.callbacks.onSuccess?.(result);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Decode Google JWT token
   */
  private decodeJWT(token: string): DecodedGoogleToken {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Failed to decode Google token');
    }
  }

  /**
   * Verify credential with backend
   */
  private async verifyWithBackend(credential: string): Promise<GoogleOneTapResult> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/google/one-tap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential,
        firmId: this.config.firmId,
        nonce: this.config.nonce,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Authentication failed',
      };
    }

    const data = await response.json();

    // Support both OAuth 2.0 (snake_case) and legacy (camelCase) token formats
    return {
      success: true,
      user: data.user,
      accessToken: data.access_token || data.accessToken,
      refreshToken: data.refresh_token || data.refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  /**
   * Get decoded user info from credential
   */
  static decodeCredential(credential: string): DecodedGoogleToken {
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Failed to decode Google credential');
    }
  }
}

export default GoogleOneTapManager;
