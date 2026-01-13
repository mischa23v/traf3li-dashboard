/**
 * Email Verification Guard Component
 * Blocks access to protected routes when user's email is not verified
 * Redirects to email verification page with return URL
 *
 * Follows the PasswordChangeGuard pattern for consistency.
 *
 * Note: This component now uses useFeatureAccess which provides
 * unified feature access control based on user state (verification + subscription).
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { UserState } from '@/types/featureAccess'
import { ROUTES } from '@/constants/routes'

// Paths that are always allowed even when email is not verified
// Using ROUTES constants for maintainability
const ALWAYS_ALLOWED_PATHS = [
  // Auth pages
  ROUTES.auth.verifyEmail,
  ROUTES.auth.verifyEmailRequired,
  ROUTES.auth.logout,
  ROUTES.auth.authLogout,
  ROUTES.auth.signOut,
  // Allowed dashboard paths (productivity + settings)
  ROUTES.dashboard.home,
  ROUTES.dashboard.overview,
  ROUTES.dashboard.calendar,
  ROUTES.dashboard.appointments,
  ROUTES.dashboard.tasks.list,
  ROUTES.dashboard.tasks.gantt,
  ROUTES.dashboard.tasks.reminders.list,
  ROUTES.dashboard.tasks.events.list,
  ROUTES.dashboard.notifications.list,
  ROUTES.dashboard.settings.profile,
  ROUTES.dashboard.settings.security,
  ROUTES.dashboard.settings.preferences,
  ROUTES.dashboard.help,
]

interface EmailVerificationGuardProps {
  children: React.ReactNode
  /** Optional feature to check access for */
  feature?: string
}

/**
 * Guard component that redirects unverified users from blocked routes
 * to the email verification required page (or other action page based on user state).
 *
 * Usage:
 * ```tsx
 * // In authenticated layout (route-based blocking)
 * <EmailVerificationGuard>
 *   <Outlet />
 * </EmailVerificationGuard>
 *
 * // Feature-specific blocking
 * <EmailVerificationGuard feature="clients">
 *   <ClientsPage />
 * </EmailVerificationGuard>
 * ```
 */
export function EmailVerificationGuard({ children, feature }: EmailVerificationGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isVerified, isRouteBlocked, userState, canAccess, getRequiredAction } = useFeatureAccess()

  // Redirect to verification page if on a blocked route or feature is blocked
  useEffect(() => {
    // Skip if anonymous (will be redirected by auth guard)
    if (userState === UserState.ANONYMOUS) return

    const currentPath = location.pathname

    // If feature is specified, check feature access
    if (feature) {
      if (!canAccess(feature)) {
        const action = getRequiredAction(feature)
        if (action) {
          navigate({
            to: action.redirectTo,
            search: { returnTo: currentPath },
            replace: true,
          })
        }
        return
      }
      // Feature access granted, render children
      return
    }

    // Route-based blocking (backwards compatibility)

    // Skip if verified
    if (isVerified) return

    // Check if current path is always allowed
    const isAlwaysAllowed = ALWAYS_ALLOWED_PATHS.some(
      (path) => currentPath === path || currentPath.startsWith(path + '/')
    )

    if (isAlwaysAllowed) return

    // Check if route is blocked
    if (isRouteBlocked(currentPath)) {
      // Redirect to verification page with return URL
      navigate({
        to: ROUTES.auth.verifyEmailRequired,
        search: { returnTo: currentPath },
        replace: true,
      })
    }
  }, [isVerified, userState, location.pathname, isRouteBlocked, feature, canAccess, getRequiredAction, navigate])

  // If feature specified and no access, don't render children
  // (The useEffect will redirect, but this prevents flash of content)
  if (feature && !canAccess(feature)) {
    return null
  }

  return <>{children}</>
}

export default EmailVerificationGuard
