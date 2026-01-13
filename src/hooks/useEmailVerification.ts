/**
 * @deprecated Use useFeatureAccess instead
 *
 * This hook is deprecated and will be removed in a future version.
 * Use the new useFeatureAccess hook which provides a unified feature access
 * system based on user state (verification + subscription status).
 *
 * Migration:
 * ```tsx
 * // Before:
 * import { useEmailVerification } from '@/hooks/useEmailVerification'
 * const { isVerified, isNavGroupBlocked } = useEmailVerification()
 *
 * // After:
 * import { useFeatureAccess } from '@/hooks/useFeatureAccess'
 * const { isVerified, isNavGroupBlocked, canAccess, userState } = useFeatureAccess()
 * ```
 *
 * The new hook provides additional features:
 * - User state machine (7 states based on verification + subscription)
 * - Feature-based access control via canAccess()
 * - Action-based redirects via getRequiredAction()
 */

import { useFeatureAccess, BLOCKED_NAV_GROUPS_UNVERIFIED, BLOCKED_ROUTE_PATTERNS } from './useFeatureAccess'
import type { EmailVerificationState } from '@/stores/auth-store'

/**
 * Return type for the useEmailVerification hook (deprecated)
 */
interface UseEmailVerificationReturn {
  // State
  isVerified: boolean
  requiresVerification: boolean
  emailVerification: EmailVerificationState | null

  // Nav group blocking (for sidebar)
  isNavGroupBlocked: (navGroupKey: string) => boolean
  blockedNavGroups: readonly string[]

  // Route blocking (for guard)
  isRouteBlocked: (routePath: string) => boolean
  blockedRoutePatterns: readonly string[]
}

/**
 * @deprecated Use useFeatureAccess instead
 *
 * Hook for email verification access control.
 * This is a backwards-compatible wrapper around useFeatureAccess.
 *
 * @returns Object with verification status, nav group blocking, and route blocking functions
 */
export function useEmailVerification(): UseEmailVerificationReturn {
  const {
    isVerified,
    requiresVerification,
    emailVerification,
    isNavGroupBlocked,
    isRouteBlocked,
  } = useFeatureAccess()

  return {
    isVerified,
    requiresVerification,
    emailVerification,
    isNavGroupBlocked,
    blockedNavGroups: BLOCKED_NAV_GROUPS_UNVERIFIED,
    isRouteBlocked,
    blockedRoutePatterns: BLOCKED_ROUTE_PATTERNS,
  }
}

// Re-export constants for backwards compatibility
const BLOCKED_NAV_GROUPS = BLOCKED_NAV_GROUPS_UNVERIFIED
export { BLOCKED_NAV_GROUPS, BLOCKED_ROUTE_PATTERNS }
