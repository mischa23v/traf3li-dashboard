/**
 * Feature Access Hook
 *
 * Unified hook for feature access control based on user state machine.
 * Replaces useEmailVerification.ts with a more comprehensive approach.
 *
 * User State Machine:
 * - ANONYMOUS: Not logged in
 * - UNVERIFIED_FREE: Logged in, email not verified, no subscription
 * - UNVERIFIED_TRIAL: Logged in, email not verified, trial subscription
 * - VERIFIED_FREE: Logged in, email verified, no subscription
 * - VERIFIED_TRIAL: Logged in, email verified, trial subscription
 * - VERIFIED_PAID: Logged in, email verified, active paid subscription
 * - PAST_DUE: Logged in, subscription payment failed
 *
 * Usage:
 * ```tsx
 * const { canAccess, isNavGroupBlocked, userState } = useFeatureAccess()
 *
 * if (!canAccess('clients')) {
 *   const action = getRequiredAction('clients')
 *   // Redirect to action.redirectTo
 * }
 * ```
 */

import { useMemo, useCallback } from 'react'
import { useAuthStore, selectUser, selectEmailVerification } from '@/stores/auth-store'
import { ROUTES } from '@/constants/routes'
import {
  UserState,
  RequiredActionType,
  FEATURE_ACCESS,
  BLOCKED_NAV_GROUPS_UNVERIFIED,
  BLOCKED_NAV_GROUPS_UNSUBSCRIBED,
  BLOCKED_ROUTE_PATTERNS,
  type RequiredAction,
  type BlockedNavGroupUnverified,
  type BlockedNavGroupUnsubscribed,
} from '@/types/featureAccess'

/**
 * Return type for the useFeatureAccess hook
 */
export interface UseFeatureAccessReturn {
  // User state
  userState: UserState

  // Computed booleans
  isEmailVerified: boolean
  isPaid: boolean
  requiresVerification: boolean
  requiresSubscription: boolean

  // Access control functions
  canAccess: (feature: string) => boolean
  isNavGroupBlocked: (navGroupKey: string) => boolean
  getRequiredAction: (feature: string) => RequiredAction | null

  // Backwards compatibility with useEmailVerification
  isVerified: boolean
  isRouteBlocked: (routePath: string) => boolean
  blockedNavGroups: readonly string[]
  blockedRoutePatterns: readonly string[]
  emailVerification: ReturnType<typeof selectEmailVerification>
}

/**
 * Hook for unified feature access control
 *
 * @returns Object with user state, access control functions, and backwards-compatible properties
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { canAccess, getRequiredAction } = useFeatureAccess()
 *
 *   if (!canAccess('clients')) {
 *     const action = getRequiredAction('clients')
 *     navigate(action?.redirectTo || ROUTES.auth.signIn)
 *     return null
 *   }
 *
 *   return <ClientsPage />
 * }
 * ```
 */
export function useFeatureAccess(): UseFeatureAccessReturn {
  const user = useAuthStore(selectUser)
  const emailVerification = useAuthStore(selectEmailVerification)

  /**
   * Calculate user state from user object and email verification
   * This mirrors the backend logic in featureAccess.middleware.js
   */
  const userState = useMemo((): UserState => {
    if (!user) return UserState.ANONYMOUS

    // Check email verification status from multiple sources
    const isEmailVerified = user.isEmailVerified === true || emailVerification?.isVerified === true

    // Get subscription status - check both user and firm subscription
    type FirmWithSub = { subscription?: { status?: string } }
    const firm = (user as { firm?: FirmWithSub }).firm
    const subStatus = user.subscription?.status || firm?.subscription?.status || 'none'

    // Determine state based on subscription and verification status
    // Order matters: check past_due first, then paid, then trial, then free
    if (subStatus === 'past_due') {
      return UserState.PAST_DUE
    }

    if (subStatus === 'active') {
      // CRITICAL: Active subscription users should always get VERIFIED_PAID access
      // even if email is not verified (rare edge case during signup)
      // Business rule: Don't block paying customers from their paid features
      if (!isEmailVerified && import.meta.env.DEV) {
        console.warn('[useFeatureAccess] Active subscription with unverified email - granting paid access')
      }
      return UserState.VERIFIED_PAID
    }

    if (subStatus === 'trial' || subStatus === 'trialing') {
      return isEmailVerified ? UserState.VERIFIED_TRIAL : UserState.UNVERIFIED_TRIAL
    }

    // Free tier (no subscription or canceled)
    return isEmailVerified ? UserState.VERIFIED_FREE : UserState.UNVERIFIED_FREE
  }, [user, emailVerification])

  // Derived state booleans - no useMemo needed for simple computations
  // These are cheaper to compute inline than to memoize
  const isEmailVerified = ![UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.ANONYMOUS].includes(
    userState
  )
  const isPaid = userState === UserState.VERIFIED_PAID
  const requiresVerification = [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL].includes(userState)
  const requiresSubscription = [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL].includes(userState)

  /**
   * Check if user can access a specific feature
   * @param feature - Feature name from FEATURE_ACCESS matrix
   * @returns true if user can access, false otherwise
   *
   * SECURITY: Fail-closed for unknown features (deny by default)
   * This prevents accidentally allowing access to new features
   * before they are explicitly added to the FEATURE_ACCESS matrix.
   */
  const canAccess = useCallback(
    (feature: string): boolean => {
      const allowedStates = FEATURE_ACCESS[feature]

      // SECURITY: Unknown feature = DENY access (fail-closed)
      // Backend will return proper FEATURE_ACCESS_DENIED error if needed
      // This prevents accidental access to unregistered features
      if (!allowedStates) {
        if (import.meta.env.DEV) {
          console.warn(
            `[useFeatureAccess] Unknown feature "${feature}" - access denied (fail-closed). ` +
            `Add this feature to FEATURE_ACCESS in src/types/featureAccess.ts if it should be accessible.`
          )
        }
        return false
      }

      return allowedStates.includes(userState)
    },
    [userState]
  )

  /**
   * Check if a navigation group is blocked for the current user
   * @param navGroupKey - Translation key for the nav group
   * @returns true if blocked, false if accessible
   */
  const isNavGroupBlocked = useCallback(
    (navGroupKey: string): boolean => {
      // Anonymous users can't see anything
      if (userState === UserState.ANONYMOUS) return true

      // Check if blocked for unverified users
      if ([UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL].includes(userState)) {
        return (BLOCKED_NAV_GROUPS_UNVERIFIED as readonly string[]).includes(navGroupKey as BlockedNavGroupUnverified)
      }

      // Check if blocked for unsubscribed users (knowledge center only)
      if ([UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL].includes(userState)) {
        return (BLOCKED_NAV_GROUPS_UNSUBSCRIBED as readonly string[]).includes(
          navGroupKey as BlockedNavGroupUnsubscribed
        )
      }

      // PAST_DUE and VERIFIED_PAID users can access everything
      return false
    },
    [userState]
  )

  /**
   * Get the required action to access a feature
   * @param feature - Feature name from FEATURE_ACCESS matrix
   * @returns RequiredAction object or null if already has access
   */
  const getRequiredAction = useCallback(
    (feature: string): RequiredAction | null => {
      // If already has access, no action needed
      if (canAccess(feature)) return null

      // Determine action based on user state
      switch (userState) {
        case UserState.ANONYMOUS:
          return { type: RequiredActionType.LOGIN, redirectTo: ROUTES.auth.signIn }

        case UserState.UNVERIFIED_FREE:
        case UserState.UNVERIFIED_TRIAL:
          return { type: RequiredActionType.VERIFY_EMAIL, redirectTo: ROUTES.auth.verifyEmailRequired }

        case UserState.VERIFIED_FREE:
        case UserState.VERIFIED_TRIAL:
          return { type: RequiredActionType.SUBSCRIBE, redirectTo: ROUTES.dashboard.settings.billing }

        case UserState.PAST_DUE:
          return { type: RequiredActionType.RETRY_PAYMENT, redirectTo: ROUTES.dashboard.settings.billing }

        default:
          // Shouldn't happen, but fallback to login
          return { type: RequiredActionType.LOGIN, redirectTo: ROUTES.auth.signIn }
      }
    },
    [userState, canAccess]
  )

  /**
   * Check if a route is blocked for unverified users
   * Backwards compatibility with useEmailVerification
   *
   * SECURITY: This function is fail-safe for ANONYMOUS users:
   * - Routes are NOT blocked during loading to prevent flash of blocked content
   * - Auth guards handle the actual protection (redirect to login)
   * - This function only handles EMAIL VERIFICATION blocking, not auth
   */
  const isRouteBlocked = useCallback(
    (routePath: string): boolean => {
      // If verified, nothing is blocked by email verification
      if (isEmailVerified) return false

      // ANONYMOUS users are handled by auth guards, not email verification
      // They will be redirected to login, so don't block here
      if (userState === UserState.ANONYMOUS) return false

      // Check if route matches any blocked pattern
      return BLOCKED_ROUTE_PATTERNS.some((pattern) => routePath.startsWith(pattern))
    },
    [isEmailVerified, userState]
  )

  return {
    // User state
    userState,

    // Computed booleans
    isEmailVerified,
    isPaid,
    requiresVerification,
    requiresSubscription,

    // Access control functions
    canAccess,
    isNavGroupBlocked,
    getRequiredAction,

    // Backwards compatibility with useEmailVerification
    isVerified: isEmailVerified,
    isRouteBlocked,
    blockedNavGroups: BLOCKED_NAV_GROUPS_UNVERIFIED,
    blockedRoutePatterns: BLOCKED_ROUTE_PATTERNS,
    emailVerification,
  }
}

// Re-export types and constants for convenience
export {
  UserState,
  RequiredActionType,
  FEATURE_ACCESS,
  BLOCKED_NAV_GROUPS_UNVERIFIED,
  BLOCKED_NAV_GROUPS_UNSUBSCRIBED,
  BLOCKED_ROUTE_PATTERNS,
}
export type { RequiredAction }
