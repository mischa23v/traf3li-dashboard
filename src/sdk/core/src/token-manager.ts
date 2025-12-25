/**
 * Token Manager for Traf3li Auth SDK
 * Handles storage, retrieval, and refresh of authentication tokens
 */

import { AuthTokens, TrafAuthConfig } from './types';
import { STORAGE_KEYS, DEFAULT_CONFIG } from './constants';
import { isTokenExpired, generateDeviceId } from './utils';

type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

interface TokenStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/**
 * In-memory storage for SSR and non-browser environments
 */
class MemoryStorage implements TokenStorage {
  private store: Map<string, string> = new Map();

  get(key: string): string | null {
    return this.store.get(key) || null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}

/**
 * Browser storage wrapper
 */
class BrowserStorage implements TokenStorage {
  constructor(private storage: Storage) {}

  get(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch {
      // Storage quota exceeded or not available
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Token Manager Class
 */
export class TokenManager {
  private storage: TokenStorage;
  private refreshThresholdSeconds: number;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private onTokenRefresh?: (tokens: AuthTokens) => void;

  constructor(
    storageType: StorageType = 'localStorage',
    options?: {
      refreshThresholdSeconds?: number;
      onTokenRefresh?: (tokens: AuthTokens) => void;
    }
  ) {
    this.storage = this.createStorage(storageType);
    this.refreshThresholdSeconds =
      options?.refreshThresholdSeconds || DEFAULT_CONFIG.refreshThresholdSeconds;
    this.onTokenRefresh = options?.onTokenRefresh;
  }

  private createStorage(type: StorageType): TokenStorage {
    if (typeof window === 'undefined') {
      return new MemoryStorage();
    }

    switch (type) {
      case 'localStorage':
        return new BrowserStorage(window.localStorage);
      case 'sessionStorage':
        return new BrowserStorage(window.sessionStorage);
      case 'memory':
      default:
        return new MemoryStorage();
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.get(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get both tokens
   */
  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  /**
   * Store tokens
   */
  setTokens(tokens: AuthTokens): void {
    this.storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    this.storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.storage.remove(STORAGE_KEYS.MFA_PENDING);
  }

  /**
   * Check if access token needs refresh
   */
  needsRefresh(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    return isTokenExpired(accessToken, this.refreshThresholdSeconds);
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return false;
    }

    // If access token is expired, check if refresh token is still valid
    if (isTokenExpired(accessToken, 0)) {
      return !isTokenExpired(refreshToken, 0);
    }

    return true;
  }

  /**
   * Get device ID (generates one if not exists)
   */
  getDeviceId(): string {
    let deviceId = this.storage.get(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      deviceId = generateDeviceId();
      this.storage.set(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    return deviceId;
  }

  /**
   * Set MFA pending state
   */
  setMfaPending(pending: boolean): void {
    if (pending) {
      this.storage.set(STORAGE_KEYS.MFA_PENDING, 'true');
    } else {
      this.storage.remove(STORAGE_KEYS.MFA_PENDING);
    }
  }

  /**
   * Check if MFA verification is pending
   */
  isMfaPending(): boolean {
    return this.storage.get(STORAGE_KEYS.MFA_PENDING) === 'true';
  }

  /**
   * Refresh tokens using the refresh token
   * Uses deduplication to prevent multiple simultaneous refresh requests
   */
  async refreshTokens(
    refreshFn: (refreshToken: string) => Promise<AuthTokens>
  ): Promise<AuthTokens | null> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    // Check if refresh token is expired
    if (isTokenExpired(refreshToken, 0)) {
      this.clearTokens();
      return null;
    }

    try {
      this.refreshPromise = refreshFn(refreshToken);
      const newTokens = await this.refreshPromise;

      this.setTokens(newTokens);
      this.onTokenRefresh?.(newTokens);

      return newTokens;
    } catch (error) {
      // If refresh fails, clear tokens
      this.clearTokens();
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }
}

/**
 * Create a TokenManager instance
 */
export function createTokenManager(
  config?: Partial<TrafAuthConfig>
): TokenManager {
  return new TokenManager(config?.storage || 'localStorage', {
    refreshThresholdSeconds: config?.refreshThresholdSeconds,
    onTokenRefresh: config?.onTokenRefresh,
  });
}
