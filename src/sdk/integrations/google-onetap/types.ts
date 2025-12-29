/**
 * Google One Tap Types
 */

export interface GoogleOneTapConfig {
  /** Google OAuth Client ID */
  clientId: string;
  /** API URL for backend verification */
  apiUrl: string;
  /** Auto-select if only one account */
  autoSelect?: boolean;
  /** Cancel when user clicks outside */
  cancelOnTapOutside?: boolean;
  /** Context hint for the prompt */
  context?: 'signin' | 'signup' | 'use';
  /** Enable ITP support for Safari */
  itpSupport?: boolean;
  /** Firm ID for multi-tenancy */
  firmId?: string;
  /** Custom nonce for security */
  nonce?: string;
  /** State parameter for OAuth flow */
  state?: string;
}

export interface GoogleCredentialResponse {
  /** JWT credential from Google */
  credential: string;
  /** How the credential was selected */
  select_by: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'btn_add_session' | 'btn_confirm_add_session';
  /** Client ID used */
  clientId?: string;
}

export interface GoogleOneTapNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

export interface GoogleOneTapResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
  accessToken?: string;
  refreshToken?: string;
  /** Seconds until access token expires (OAuth 2.0 standard) */
  expiresIn?: number;
  /** Token type, typically 'Bearer' (OAuth 2.0 standard) */
  tokenType?: string;
  error?: string;
}

export interface GoogleOneTapCallbacks {
  onSuccess?: (result: GoogleOneTapResult) => void;
  onError?: (error: Error) => void;
  onPromptMoment?: (notification: GoogleOneTapNotification) => void;
}

export interface DecodedGoogleToken {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name: string;
  family_name: string;
  locale?: string;
  iat: number;
  exp: number;
  jti?: string;
  nonce?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            itp_support?: boolean;
            nonce?: string;
            state?: string;
          }) => void;
          prompt: (callback?: (notification: GoogleOneTapNotification) => void) => void;
          cancel: () => void;
          renderButton: (element: HTMLElement, config: {
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
            width?: number | string;
            locale?: string;
          }) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: { id: string; password: string }, callback?: () => void) => void;
          revoke: (email: string, callback?: () => void) => void;
        };
      };
    };
  }
}
