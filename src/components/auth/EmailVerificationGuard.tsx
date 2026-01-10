/**
 * Email Verification Guard Component
 * Blocks access to protected routes when user's email is not verified
 * Redirects to email verification page with return URL
 *
 * Follows the PasswordChangeGuard pattern for consistency.
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useEmailVerification } from '@/hooks/useEmailVerification'
import { ROUTES } from '@/constants/routes'

// Paths that are always allowed even when email is not verified
// Using ROUTES constants for maintainability
const ALWAYS_ALLOWED_PATHS = [
  // Auth pages
  ROUTES.auth.verifyEmail,
  ROUTES.auth.verifyEmailRequired,
  '/logout', // Legacy logout paths
  '/auth/logout',
  '/sign-out',
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
}

/**
 * Guard component that redirects unverified users from blocked routes
 * to the email verification required page.
 *
 * Usage:
 * ```tsx
 * // In authenticated layout
 * <EmailVerificationGuard>
 *   <Outlet />
 * </EmailVerificationGuard>
 * ```
 */
export function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isVerified, isRouteBlocked, emailVerification } = useEmailVerification()

  // Redirect to verification page if on a blocked route
  useEffect(() => {
    // Skip if verified
    if (isVerified) return

    // Skip if no emailVerification state (loading or not required)
    if (!emailVerification) return

    const currentPath = location.pathname

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
  }, [isVerified, emailVerification, location.pathname, isRouteBlocked, navigate])

  return <>{children}</>
}

export default EmailVerificationGuard
