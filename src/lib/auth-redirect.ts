/**
 * Auth Redirect Utilities
 *
 * ENTERPRISE PATTERN: Centralized navigation
 * All auth-related redirects go through this module.
 * Prevents duplicate redirects, handles edge cases.
 */

import { ROUTES } from '@/constants/routes'
import { AUTH_TIMING } from '@/constants/storage-keys'
import { showErrorToast, showInfoToast, showWarningToast } from './toast-utils'

/**
 * Redirect reasons for analytics and debugging
 * These match the reasons passed to clearTokens() for consistency
 */
export type RedirectReason =
  | 'session_expired'
  | 'session_idle_timeout'
  | 'session_absolute_timeout'
  | 'csrf_failed'
  | 'logout_other_tab'
  | 'token_refresh_failed'
  | 'token_refresh_error'
  | 'unauthorized'
  | 'manual'
  | 'cross_tab_sync'

/**
 * Track pending redirect to prevent duplicates
 */
let pendingRedirectTimeoutId: ReturnType<typeof setTimeout> | null = null
let isRedirectPending = false

/**
 * Cancel any pending redirect
 */
export const cancelPendingRedirect = (): void => {
  if (pendingRedirectTimeoutId) {
    clearTimeout(pendingRedirectTimeoutId)
    pendingRedirectTimeoutId = null
  }
  isRedirectPending = false
}

/**
 * Check if we're already on the sign-in page
 */
const isOnSignInPage = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/sign-in') ||
         window.location.pathname.startsWith(ROUTES.auth.signIn)
}

/**
 * Schedule redirect to sign-in page
 * Debounced - only one redirect can be pending at a time
 *
 * @param reason - Reason for redirect (for analytics)
 * @param delay - Delay before redirect (ms)
 * @returns true if redirect was scheduled, false if already pending or on sign-in page
 */
export const scheduleSignInRedirect = (
  reason: RedirectReason,
  delay: number = AUTH_TIMING.REDIRECT_DELAY_AFTER_TOAST
): boolean => {
  // Don't redirect if already on sign-in page
  if (isOnSignInPage()) {
    return false
  }

  // Don't schedule if redirect already pending
  if (isRedirectPending) {
    return false
  }

  isRedirectPending = true
  pendingRedirectTimeoutId = setTimeout(() => {
    pendingRedirectTimeoutId = null
    isRedirectPending = false

    // Double-check we're not on sign-in page (user might have navigated)
    if (!isOnSignInPage()) {
      window.location.href = `${ROUTES.auth.signIn}?reason=${reason}`
    }
  }, delay)

  return true
}

/**
 * Redirect immediately to sign-in page
 */
export const redirectToSignIn = (reason: RedirectReason): void => {
  cancelPendingRedirect()
  if (!isOnSignInPage()) {
    window.location.href = `${ROUTES.auth.signIn}?reason=${reason}`
  }
}

/**
 * Handle session expired with toast and redirect
 *
 * ENTERPRISE PATTERN: Error-resilient handler
 * Even if toast fails, we still attempt the redirect.
 */
export const handleSessionExpired = async (
  reason: RedirectReason = 'session_expired'
): Promise<void> => {
  try {
    await showErrorToast(
      'انتهت صلاحية الجلسة | Session expired',
      'يرجى تسجيل الدخول مرة أخرى | Please log in again'
    )
  } catch (error) {
    // Toast failed but we still want to redirect
    console.error('[AUTH_REDIRECT] Toast failed in handleSessionExpired:', error)
  }
  scheduleSignInRedirect(reason, AUTH_TIMING.REDIRECT_DELAY_AFTER_ERROR)
}

/**
 * Handle session timeout (idle or absolute)
 */
export const handleSessionTimeout = async (isIdleTimeout: boolean): Promise<void> => {
  const message = isIdleTimeout
    ? 'انتهت جلستك بسبب عدم النشاط'
    : 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى'

  try {
    await showWarningToast(message, 'جارٍ إعادة التوجيه إلى صفحة تسجيل الدخول...')
  } catch (error) {
    console.error('[AUTH_REDIRECT] Toast failed in handleSessionTimeout:', error)
  }

  const reason: RedirectReason = isIdleTimeout ? 'session_idle_timeout' : 'session_absolute_timeout'
  scheduleSignInRedirect(reason, AUTH_TIMING.REDIRECT_DELAY_AFTER_ERROR)
}

/**
 * Handle cross-tab logout notification
 */
export const handleCrossTabLogout = async (): Promise<void> => {
  try {
    await showInfoToast(
      'تم تسجيل الخروج من جلسة أخرى | Logged out from another session'
    )
  } catch (error) {
    console.error('[AUTH_REDIRECT] Toast failed in handleCrossTabLogout:', error)
  }
  scheduleSignInRedirect('logout_other_tab', AUTH_TIMING.REDIRECT_DELAY_AFTER_TOAST)
}

/**
 * Handle CSRF failure with redirect
 */
export const handleCsrfFailure = async (): Promise<void> => {
  try {
    await showErrorToast(
      'انتهت صلاحية الجلسة | Session expired',
      'يرجى تسجيل الدخول مرة أخرى | Please log in again'
    )
  } catch (error) {
    console.error('[AUTH_REDIRECT] Toast failed in handleCsrfFailure:', error)
  }
  scheduleSignInRedirect('csrf_failed', AUTH_TIMING.REDIRECT_DELAY_AFTER_ERROR)
}
