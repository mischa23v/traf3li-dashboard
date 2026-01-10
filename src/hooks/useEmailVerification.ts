/**
 * Email Verification Hook
 *
 * Centralized hook for email verification access control.
 * Follows the usePlanFeatures.tsx pattern for consistency.
 *
 * Usage:
 * ```tsx
 * const { isVerified, isNavGroupBlocked, isRouteBlocked } = useEmailVerification()
 *
 * if (!isVerified && isRouteBlocked('/dashboard/cases')) {
 *   // Redirect to verification page
 * }
 * ```
 */

import { useMemo, useCallback } from 'react'
import { useAuthStore, selectEmailVerification, selectIsEmailVerified } from '@/stores/auth-store'
import type { EmailVerificationState } from '@/stores/auth-store'

/**
 * Navigation groups that are blocked for unverified users
 * These correspond to the nav group keys in use-sidebar-data.ts
 */
const BLOCKED_NAV_GROUPS = [
  'sidebar.nav.messagesGroup',
  'sidebar.nav.clientsGroup',
  'sidebar.nav.salesGroup',
  'sidebar.nav.businessGroup',
  'sidebar.nav.financeGroup',
  'sidebar.nav.operationsGroup',
  'sidebar.nav.assetsGroup',
  'sidebar.nav.supportGroup',
  'sidebar.nav.hrGroup',
  'sidebar.nav.libraryGroup',
  'sidebar.nav.excellenceGroup',
] as const

/**
 * Route patterns that are blocked for unverified users
 * Any route starting with these patterns will be blocked
 */
const BLOCKED_ROUTE_PATTERNS = [
  '/dashboard/messages',
  '/dashboard/clients',
  '/dashboard/contacts',
  '/dashboard/organizations',
  '/dashboard/crm',
  '/dashboard/cases',
  '/dashboard/documents',
  '/dashboard/finance',
  '/dashboard/inventory',
  '/dashboard/buying',
  '/dashboard/assets',
  '/dashboard/support',
  '/dashboard/hr',
  '/dashboard/knowledge',
  '/dashboard/reputation',
  '/dashboard/staff',
  '/dashboard/jobs',
  '/dashboard/apps',
  '/dashboard/data-export',
  '/dashboard/notion',
] as const

/**
 * Return type for the useEmailVerification hook
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
 * Hook for email verification access control
 *
 * @returns Object with verification status, nav group blocking, and route blocking functions
 *
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { isNavGroupBlocked } = useEmailVerification()
 *
 *   // Filter nav groups
 *   const filteredGroups = navGroups.filter(
 *     group => !isNavGroupBlocked(group.title)
 *   )
 * }
 * ```
 */
export function useEmailVerification(): UseEmailVerificationReturn {
  const emailVerification = useAuthStore(selectEmailVerification)
  const isEmailVerified = useAuthStore(selectIsEmailVerified)

  // User is verified if either:
  // 1. user.isEmailVerified is true, OR
  // 2. emailVerification.isVerified is true
  const isVerified = useMemo(() => {
    if (isEmailVerified) return true
    if (emailVerification?.isVerified) return true
    return false
  }, [isEmailVerified, emailVerification])

  // Requires verification if:
  // 1. Not verified AND
  // 2. Either emailVerification doesn't exist (default to not requiring) OR requiresVerification is true
  const requiresVerification = useMemo(() => {
    if (isVerified) return false
    // If no emailVerification state yet, default to NOT requiring (safe fallback)
    if (!emailVerification) return false
    return emailVerification.requiresVerification === true
  }, [isVerified, emailVerification])

  /**
   * Check if a navigation group is blocked for unverified users
   */
  const isNavGroupBlocked = useCallback(
    (navGroupKey: string): boolean => {
      // If verified, nothing is blocked
      if (isVerified) return false

      // If no emailVerification state yet, default to NOT blocking (safe fallback during loading)
      if (!emailVerification) return false

      // Check if nav group is in blocked list
      return BLOCKED_NAV_GROUPS.includes(navGroupKey as typeof BLOCKED_NAV_GROUPS[number])
    },
    [isVerified, emailVerification]
  )

  /**
   * Check if a route path is blocked for unverified users
   */
  const isRouteBlocked = useCallback(
    (routePath: string): boolean => {
      // If verified, nothing is blocked
      if (isVerified) return false

      // If no emailVerification state yet, default to NOT blocking (safe fallback during loading)
      if (!emailVerification) return false

      // Check if route matches any blocked pattern
      return BLOCKED_ROUTE_PATTERNS.some((pattern) => routePath.startsWith(pattern))
    },
    [isVerified, emailVerification]
  )

  return {
    isVerified,
    requiresVerification,
    emailVerification,
    isNavGroupBlocked,
    blockedNavGroups: BLOCKED_NAV_GROUPS,
    isRouteBlocked,
    blockedRoutePatterns: BLOCKED_ROUTE_PATTERNS,
  }
}

// Export constants for external use if needed
export { BLOCKED_NAV_GROUPS, BLOCKED_ROUTE_PATTERNS }
