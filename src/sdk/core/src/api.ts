/**
 * Auth API for Traf3li Auth SDK
 * Low-level API methods for authentication
 */

import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResult,
  AuthTokens,
  MfaSetupResult,
  MfaVerifyResult,
  MfaChallengeData,
  Session,
  SSODetectionResult,
  OtpResult,
  SendOtpData,
  VerifyOtpData,
  MagicLinkData,
  MagicLinkResult,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  PasswordStrength,
  ApiResponse,
  AuthError,
  TrafAuthConfig,
} from './types';
import { AUTH_ENDPOINTS, ERROR_CODES } from './constants';
import { createAuthError, retryWithBackoff } from './utils';
import { TokenManager } from './token-manager';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  retryOnError?: boolean;
}

/**
 * Auth API Class
 */
export class AuthAPI {
  private baseUrl: string;
  private tokenManager: TokenManager;
  private deviceId: string;
  private onError?: (error: AuthError) => void;

  constructor(config: TrafAuthConfig, tokenManager: TokenManager) {
    // Remove trailing slash from baseUrl
    this.baseUrl = config.apiUrl.replace(/\/+$/, '');
    this.tokenManager = tokenManager;
    this.deviceId = tokenManager.getDeviceId();
    this.onError = config.onError;
  }

  /**
   * Make an authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      skipAuth = false,
      retryOnError = false,
    } = options;

    const url = `${this.baseUrl}/api${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Device-ID': this.deviceId,
      ...headers,
    };

    // Add auth token if available and not skipping auth
    if (!skipAuth) {
      const accessToken = this.tokenManager.getAccessToken();
      if (accessToken) {
        requestHeaders['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const makeRequest = async (): Promise<T> => {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = createAuthError({
          status: response.status,
          message: data.message || data.error || 'Request failed',
          code: data.code || ERROR_CODES.UNKNOWN_ERROR,
          details: data.details,
        });

        this.onError?.(error);
        throw error;
      }

      return data as T;
    };

    if (retryOnError) {
      return retryWithBackoff(makeRequest);
    }

    return makeRequest();
  }

  // ============================================
  // Authentication Methods
  // ============================================

  /**
   * Login with email/username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await this.request<
      ApiResponse<AuthResult> & { user?: User; accessToken?: string; refreshToken?: string }
    >(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: credentials,
      skipAuth: true,
    });

    // Handle dual token response
    if (response.accessToken && response.refreshToken) {
      this.tokenManager.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    // Handle MFA requirement
    if (response.data?.mfaRequired || (response.user as any)?.mfaPending) {
      this.tokenManager.setMfaPending(true);
    }

    return response.data || {
      user: response.user!,
      mfaRequired: (response.user as any)?.mfaPending,
    };
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    const response = await this.request<ApiResponse<AuthResult>>(
      AUTH_ENDPOINTS.REGISTER,
      {
        method: 'POST',
        body: data,
        skipAuth: true,
      }
    );

    return response.data!;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await this.request(AUTH_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch {
      // Ignore logout errors
    } finally {
      this.tokenManager.clearTokens();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<ApiResponse<User> & { user?: User }>(
        AUTH_ENDPOINTS.ME
      );
      return response.data || response.user || null;
    } catch {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new AuthError('No refresh token available', ERROR_CODES.TOKEN_INVALID);
    }

    const response = await this.request<
      ApiResponse<AuthTokens> & { accessToken?: string; refreshToken?: string }
    >(AUTH_ENDPOINTS.REFRESH, {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    });

    const tokens = response.data || {
      accessToken: response.accessToken!,
      refreshToken: response.refreshToken!,
    };

    this.tokenManager.setTokens(tokens);
    return tokens;
  }

  /**
   * Check availability of email, username, or phone
   */
  async checkAvailability(
    field: 'email' | 'username' | 'phone',
    value: string
  ): Promise<{ available: boolean; message?: string }> {
    const response = await this.request<ApiResponse<{ available: boolean; message?: string }>>(
      AUTH_ENDPOINTS.CHECK_AVAILABILITY,
      {
        method: 'POST',
        body: { field, value },
        skipAuth: true,
      }
    );

    return response.data || { available: true };
  }

  // ============================================
  // MFA Methods
  // ============================================

  /**
   * Setup MFA (get QR code and secret)
   */
  async setupMfa(): Promise<MfaSetupResult> {
    const response = await this.request<ApiResponse<MfaSetupResult>>(
      AUTH_ENDPOINTS.MFA_SETUP,
      { method: 'POST' }
    );
    return response.data!;
  }

  /**
   * Verify MFA setup with code
   */
  async verifyMfaSetup(code: string): Promise<MfaVerifyResult> {
    const response = await this.request<ApiResponse<MfaVerifyResult>>(
      AUTH_ENDPOINTS.MFA_VERIFY_SETUP,
      {
        method: 'POST',
        body: { code },
      }
    );
    return response.data!;
  }

  /**
   * Verify MFA code during login
   */
  async verifyMfa(data: MfaChallengeData): Promise<AuthResult> {
    const response = await this.request<
      ApiResponse<AuthResult> & { user?: User; accessToken?: string; refreshToken?: string }
    >(AUTH_ENDPOINTS.MFA_VERIFY, {
      method: 'POST',
      body: data,
    });

    // Store tokens if provided
    if (response.accessToken && response.refreshToken) {
      this.tokenManager.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    // Clear MFA pending state
    this.tokenManager.setMfaPending(false);

    return response.data || { user: response.user! };
  }

  /**
   * Disable MFA
   */
  async disableMfa(code: string): Promise<void> {
    await this.request(AUTH_ENDPOINTS.MFA_DISABLE, {
      method: 'POST',
      body: { code },
    });
  }

  /**
   * Get backup codes
   */
  async getBackupCodes(): Promise<string[]> {
    const response = await this.request<ApiResponse<{ codes: string[] }>>(
      AUTH_ENDPOINTS.MFA_BACKUP_CODES
    );
    return response.data?.codes || [];
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(): Promise<string[]> {
    const response = await this.request<ApiResponse<{ codes: string[] }>>(
      AUTH_ENDPOINTS.MFA_REGENERATE_BACKUP,
      { method: 'POST' }
    );
    return response.data?.codes || [];
  }

  // ============================================
  // Session Methods
  // ============================================

  /**
   * Get all active sessions
   */
  async getSessions(): Promise<Session[]> {
    const response = await this.request<ApiResponse<{ sessions: Session[] }>>(
      AUTH_ENDPOINTS.SESSIONS_LIST
    );
    return response.data?.sessions || [];
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    const response = await this.request<ApiResponse<{ session: Session }>>(
      AUTH_ENDPOINTS.SESSIONS_CURRENT
    );
    return response.data?.session || null;
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.request(`${AUTH_ENDPOINTS.SESSIONS_REVOKE}/${sessionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<void> {
    await this.request(AUTH_ENDPOINTS.SESSIONS_REVOKE_ALL, {
      method: 'POST',
    });
  }

  // ============================================
  // OTP Methods
  // ============================================

  /**
   * Send OTP code
   */
  async sendOtp(data: SendOtpData): Promise<OtpResult> {
    const response = await this.request<ApiResponse<OtpResult>>(
      AUTH_ENDPOINTS.SEND_OTP,
      {
        method: 'POST',
        body: data,
        skipAuth: true,
      }
    );
    return response.data || { success: true, message: 'OTP sent' };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(data: VerifyOtpData): Promise<AuthResult> {
    const response = await this.request<
      ApiResponse<AuthResult> & { user?: User; accessToken?: string; refreshToken?: string }
    >(AUTH_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: data,
      skipAuth: true,
    });

    // Store tokens if provided
    if (response.accessToken && response.refreshToken) {
      this.tokenManager.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    return response.data || { user: response.user! };
  }

  /**
   * Resend OTP code
   */
  async resendOtp(data: SendOtpData): Promise<OtpResult> {
    const response = await this.request<ApiResponse<OtpResult>>(
      AUTH_ENDPOINTS.RESEND_OTP,
      {
        method: 'POST',
        body: data,
        skipAuth: true,
      }
    );
    return response.data || { success: true, message: 'OTP resent' };
  }

  // ============================================
  // Magic Link Methods
  // ============================================

  /**
   * Send magic link
   */
  async sendMagicLink(data: MagicLinkData): Promise<MagicLinkResult> {
    const response = await this.request<ApiResponse<MagicLinkResult>>(
      AUTH_ENDPOINTS.MAGIC_LINK_SEND,
      {
        method: 'POST',
        body: data,
        skipAuth: true,
      }
    );
    return response.data || { success: true, message: 'Magic link sent' };
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(token: string): Promise<AuthResult> {
    const response = await this.request<
      ApiResponse<AuthResult> & { user?: User; accessToken?: string; refreshToken?: string }
    >(AUTH_ENDPOINTS.MAGIC_LINK_VERIFY, {
      method: 'POST',
      body: { token },
      skipAuth: true,
    });

    // Store tokens if provided
    if (response.accessToken && response.refreshToken) {
      this.tokenManager.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    return response.data || { user: response.user! };
  }

  // ============================================
  // SSO Methods
  // ============================================

  /**
   * Detect SSO provider for email domain
   */
  async detectSSO(email: string, returnUrl?: string): Promise<SSODetectionResult> {
    const response = await this.request<ApiResponse<SSODetectionResult>>(
      AUTH_ENDPOINTS.SSO_DETECT,
      {
        method: 'POST',
        body: { email, returnUrl },
        skipAuth: true,
      }
    );
    return response.data || { detected: false };
  }

  /**
   * Handle Google One Tap credential
   */
  async handleGoogleOneTap(
    credential: string,
    firmId?: string
  ): Promise<AuthResult> {
    const response = await this.request<
      ApiResponse<AuthResult> & { user?: User; accessToken?: string; refreshToken?: string }
    >(AUTH_ENDPOINTS.GOOGLE_ONE_TAP, {
      method: 'POST',
      body: { credential, firmId },
      skipAuth: true,
    });

    // Store tokens if provided
    if (response.accessToken && response.refreshToken) {
      this.tokenManager.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    return response.data || { user: response.user! };
  }

  // ============================================
  // Password Methods
  // ============================================

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await this.request(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: data,
      skipAuth: true,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await this.request(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: data,
      skipAuth: true,
    });
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.request(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Check password strength
   */
  async checkPasswordStrength(password: string): Promise<PasswordStrength> {
    const response = await this.request<ApiResponse<PasswordStrength>>(
      AUTH_ENDPOINTS.CHECK_PASSWORD_STRENGTH,
      {
        method: 'POST',
        body: { password },
        skipAuth: true,
      }
    );
    return response.data || { score: 0, feedback: { suggestions: [] }, isStrong: false };
  }

  // ============================================
  // Email Verification Methods
  // ============================================

  /**
   * Send email verification
   */
  async sendVerificationEmail(): Promise<void> {
    await this.request(AUTH_ENDPOINTS.EMAIL_SEND_VERIFICATION, {
      method: 'POST',
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await this.request(AUTH_ENDPOINTS.EMAIL_VERIFY, {
      method: 'POST',
      body: { token },
    });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await this.request(AUTH_ENDPOINTS.EMAIL_RESEND_VERIFICATION, {
      method: 'POST',
    });
  }
}
