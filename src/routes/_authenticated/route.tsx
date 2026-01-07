import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { ROUTES } from '@/constants/routes'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, user, checkAuth } = useAuthStore.getState()

    // PERFORMANCE FIX: Trust cached auth state for immediate render
    // Don't block on API call - verify in background instead
    if (!isAuthenticated) {
      // No cached auth - must redirect to sign in
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Check if user has MFA pending verification
    // Redirect to MFA challenge page if MFA verification is required
    if (user?.mfaPending) {
      throw redirect({
        to: '/mfa-challenge',
        search: {
          redirect: location.href,
        },
      })
    }

    // Check if user must change password (due to breach or admin requirement)
    // Redirect to security settings if password change is required
    // Allow access to security settings page to actually change the password
    const mustChangePassword = user?.mustChangePassword || user?.passwordBreached
    const isSecurityPage = location.pathname.startsWith(ROUTES.dashboard.settings.security)
    const isLogoutPage = location.pathname.includes('logout')

    if (mustChangePassword && !isSecurityPage && !isLogoutPage) {
      throw redirect({
        to: ROUTES.dashboard.settings.security,
        search: {
          action: 'change-password',
          reason: user?.passwordBreached ? 'breach' : 'required',
        },
      })
    }

    // Verify auth in background (non-blocking)
    // This will update state if session expired, triggering re-render
    checkAuth().catch(() => {
      // If verification fails and user is actually logged out,
      // the next navigation will redirect to sign-in
    })
  },
  component: AuthenticatedLayout,
})