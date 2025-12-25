/**
 * Utility functions for Traf3li Auth SDK
 */

import { Plan, User, AuthError } from './types';
import { PLAN_HIERARCHY, ERROR_CODES } from './constants';

/**
 * Check if user's plan meets or exceeds the required plan level
 */
export function isPlanAtLeast(
  userPlan: Plan | undefined,
  requiredPlan: Plan
): boolean {
  const currentPlan = userPlan || 'free';
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];
}

/**
 * Get the plan level number for a given plan
 */
export function getPlanLevel(plan: Plan | undefined): number {
  return PLAN_HIERARCHY[plan || 'free'];
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(user: User | null, featureName: string): boolean {
  if (!user) return false;
  return user.features?.includes(featureName) || false;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: User | null,
  module: string,
  level: 'read' | 'write' | 'admin' = 'read'
): boolean {
  if (!user?.permissions?.modules) return false;
  const modulePermission = user.permissions.modules[module];
  if (!modulePermission) return false;

  const levels = ['read', 'write', 'admin'];
  const requiredLevel = levels.indexOf(level);
  const userLevel = levels.indexOf(modulePermission);

  return userLevel >= requiredLevel;
}

/**
 * Check if user has a special permission
 */
export function hasSpecialPermission(
  user: User | null,
  permission: string
): boolean {
  if (!user?.permissions?.special) return false;
  return user.permissions.special[permission] === true;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Saudi format)
 */
export function isValidPhone(phone: string): boolean {
  // Saudi phone: +966 or 05 followed by 8 digits
  const phoneRegex = /^(\+966|00966|0)?5\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Generate a unique device ID
 */
export function generateDeviceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse JWT token without verification
 */
export function parseJwt(token: string): Record<string, unknown> | null {
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
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string, thresholdSeconds = 0): boolean {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;

  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const threshold = thresholdSeconds * 1000;

  return now >= expiryTime - threshold;
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token: string): Date | null {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return new Date(payload.exp * 1000);
}

/**
 * Format time remaining (for lockouts, cooldowns, etc.)
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (error instanceof AuthError && error.status && error.status < 500) {
        throw error;
      }

      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * delay * 0.1;
        await sleep(delay + jitter);
      }
    }
  }

  throw lastError;
}

/**
 * Create an AuthError from an API response
 */
export function createAuthError(
  response: {
    status?: number;
    message?: string;
    code?: string;
    details?: Record<string, unknown>;
  }
): AuthError {
  const message = response.message || 'An error occurred';
  const code = response.code || ERROR_CODES.UNKNOWN_ERROR;

  return new AuthError(message, code, {
    status: response.status,
    details: response.details,
    isRateLimited: response.status === 429,
  });
}

/**
 * Mask email for display (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal =
    localPart.charAt(0) +
    '*'.repeat(Math.max(localPart.length - 1, 2)) +
    (localPart.length > 1 ? localPart.charAt(localPart.length - 1) : '');

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for display (e.g., +966 5** *** **89)
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;

  const lastTwo = digits.slice(-2);
  const firstPart = digits.slice(0, 3);
  const masked = '*'.repeat(digits.length - 5);

  return `+${firstPart} ${masked}${lastTwo}`;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User, isArabic = false): string {
  if (isArabic && user.firstNameAr) {
    return [user.firstNameAr, user.lastNameAr].filter(Boolean).join(' ');
  }
  if (user.firstName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.username || user.email.split('@')[0];
}

/**
 * Get user initials
 */
export function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
}
