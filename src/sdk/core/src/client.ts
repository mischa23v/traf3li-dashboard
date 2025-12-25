/**
 * Traf3li Auth Client
 * Main client class that provides a unified interface for all auth operations
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
  SendOtpData,
  VerifyOtpData,
  OtpResult,
  MagicLinkData,
  MagicLinkResult,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  PasswordStrength,
  TrafAuthConfig,
  AuthError,
  OAuthProvider,
  GoogleOneTapConfig,
} from './types';
import { TokenManager, createTokenManager } from './token-manager';
import { AuthAPI } from './api';
import { DEFAULT_CONFIG } from './constants';

/**
 * Auth State
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPending: boolean;
}

type AuthStateListener = (state: AuthState) => void;

/**
 * Main Traf3li Auth Client
 */
export class TrafAuthClient {
  private config: TrafAuthConfig;
  private tokenManager: TokenManager;
  private api: AuthAPI;
  private state: AuthState;
  private listeners: Set<AuthStateListener> = new Set();
  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor(config: TrafAuthConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.tokenManager = createTokenManager(this.config);
    this.api = new AuthAPI(this.config, this.tokenManager);

    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      mfaPending: this.tokenManager.isMfaPending(),
    };

    // Start auto-refresh if enabled
    if (this.config.autoRefreshToken) {
      this.startAutoRefresh();
    }
  }

  // ============================================
  // State Management
  // ============================================

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
    this.config.onAuthStateChange?.(this.state.user);
  }

  // ============================================
  // Token Auto-Refresh
  // ============================================

  private startAutoRefresh(): void {
    // Check every minute if token needs refresh
    this.refreshInterval = setInterval(() => {
      if (this.tokenManager.needsRefresh()) {
        this.refreshToken().catch(() => {
          // Ignore refresh errors
        });
      }
    }, 60 * 1000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  // ============================================
  // Authentication Methods
  // ============================================

  /**
   * Initialize auth state from stored tokens
   */
  async initialize(): Promise<User | null> {
    this.setState({ isLoading: true });

    if (!this.tokenManager.isAuthenticated()) {
      this.setState({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }

    try {
      const user = await this.api.getCurrentUser();
      const mfaPending = this.tokenManager.isMfaPending();

      this.setState({
        user,
        isAuthenticated: user !== null && !mfaPending,
        isLoading: false,
        mfaPending,
      });

      return user;
    } catch {
      this.setState({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    this.setState({ isLoading: true });

    try {
      const result = await this.api.login(credentials);

      if (result.mfaRequired) {
        this.setState({
          user: result.user,
          isAuthenticated: false,
          isLoading: false,
          mfaPending: true,
        });
      } else {
        this.setState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          mfaPending: false,
        });
      }

      return result;
    } catch (error) {
      this.setState({ isLoading: false });
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    this.setState({ isLoading: true });

    try {
      const result = await this.api.register(data);

      // Registration may auto-login or require email verification
      if (result.user) {
        this.setState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        this.setState({ isLoading: false });
      }

      return result;
    } catch (error) {
      this.setState({ isLoading: false });
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    this.stopAutoRefresh();

    try {
      await this.api.logout();
    } finally {
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        mfaPending: false,
      });
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    await this.api.revokeAllSessions();
    await this.logout();
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    return this.api.refreshToken();
  }

  /**
   * Check availability
   */
  async checkAvailability(
    field: 'email' | 'username' | 'phone',
    value: string
  ): Promise<{ available: boolean; message?: string }> {
    return this.api.checkAvailability(field, value);
  }

  // ============================================
  // MFA Methods
  // ============================================

  /**
   * Setup MFA
   */
  async setupMfa(): Promise<MfaSetupResult> {
    return this.api.setupMfa();
  }

  /**
   * Verify MFA setup
   */
  async verifyMfaSetup(code: string): Promise<MfaVerifyResult> {
    return this.api.verifyMfaSetup(code);
  }

  /**
   * Verify MFA during login
   */
  async verifyMfa(data: MfaChallengeData): Promise<AuthResult> {
    const result = await this.api.verifyMfa(data);

    this.setState({
      user: result.user,
      isAuthenticated: true,
      mfaPending: false,
    });

    return result;
  }

  /**
   * Disable MFA
   */
  async disableMfa(code: string): Promise<void> {
    return this.api.disableMfa(code);
  }

  /**
   * Get backup codes
   */
  async getBackupCodes(): Promise<string[]> {
    return this.api.getBackupCodes();
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(): Promise<string[]> {
    return this.api.regenerateBackupCodes();
  }

  // ============================================
  // Session Methods
  // ============================================

  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    return this.api.getSessions();
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    return this.api.getCurrentSession();
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    return this.api.revokeSession(sessionId);
  }

  /**
   * Revoke all other sessions
   */
  async revokeOtherSessions(): Promise<void> {
    return this.api.revokeAllSessions();
  }

  // ============================================
  // OTP Methods
  // ============================================

  /**
   * Send OTP
   */
  async sendOtp(data: SendOtpData): Promise<OtpResult> {
    return this.api.sendOtp(data);
  }

  /**
   * Verify OTP
   */
  async verifyOtp(data: VerifyOtpData): Promise<AuthResult> {
    const result = await this.api.verifyOtp(data);

    if (result.user) {
      this.setState({
        user: result.user,
        isAuthenticated: true,
        mfaPending: false,
      });
    }

    return result;
  }

  /**
   * Resend OTP
   */
  async resendOtp(data: SendOtpData): Promise<OtpResult> {
    return this.api.resendOtp(data);
  }

  // ============================================
  // Magic Link Methods
  // ============================================

  /**
   * Send magic link
   */
  async sendMagicLink(data: MagicLinkData): Promise<MagicLinkResult> {
    return this.api.sendMagicLink(data);
  }

  /**
   * Verify magic link
   */
  async verifyMagicLink(token: string): Promise<AuthResult> {
    const result = await this.api.verifyMagicLink(token);

    if (result.user) {
      this.setState({
        user: result.user,
        isAuthenticated: true,
        mfaPending: false,
      });
    }

    return result;
  }

  // ============================================
  // OAuth / SSO Methods
  // ============================================

  /**
   * Get OAuth login URL
   */
  getOAuthUrl(provider: OAuthProvider, redirectUri?: string): string {
    const params = new URLSearchParams({
      provider,
      redirect_uri: redirectUri || window.location.origin + '/auth/callback',
    });
    return `${this.config.apiUrl}/api${'/auth/oauth/' + provider}?${params}`;
  }

  /**
   * Initiate OAuth login
   */
  loginWithOAuth(provider: OAuthProvider, redirectUri?: string): void {
    window.location.href = this.getOAuthUrl(provider, redirectUri);
  }

  /**
   * Detect SSO provider for email
   */
  async detectSSO(email: string, returnUrl?: string): Promise<SSODetectionResult> {
    return this.api.detectSSO(email, returnUrl);
  }

  /**
   * Handle Google One Tap credential
   */
  async handleGoogleOneTap(
    credential: string,
    firmId?: string
  ): Promise<AuthResult> {
    const result = await this.api.handleGoogleOneTap(credential, firmId);

    if (result.user) {
      this.setState({
        user: result.user,
        isAuthenticated: true,
        mfaPending: false,
      });
    }

    return result;
  }

  // ============================================
  // Password Methods
  // ============================================

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    return this.api.forgotPassword(data);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    return this.api.resetPassword(data);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    return this.api.changePassword(data);
  }

  /**
   * Check password strength
   */
  async checkPasswordStrength(password: string): Promise<PasswordStrength> {
    return this.api.checkPasswordStrength(password);
  }

  // ============================================
  // Email Verification Methods
  // ============================================

  /**
   * Send verification email
   */
  async sendVerificationEmail(): Promise<void> {
    return this.api.sendVerificationEmail();
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await this.api.verifyEmail(token);

    // Update user's email verification status
    if (this.state.user) {
      this.setState({
        user: {
          ...this.state.user,
          isEmailVerified: true,
          emailVerifiedAt: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    return this.api.resendVerificationEmail();
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.state.user;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.state.isLoading;
  }

  /**
   * Check if MFA is pending
   */
  isMfaPending(): boolean {
    return this.state.mfaPending;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.tokenManager.getAccessToken();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoRefresh();
    this.listeners.clear();
  }
}

/**
 * Create a TrafAuthClient instance
 */
export function createTrafAuthClient(config: TrafAuthConfig): TrafAuthClient {
  return new TrafAuthClient(config);
}
