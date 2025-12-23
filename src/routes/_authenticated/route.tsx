import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { safeRedirect } from '@/utils/redirectValidation'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, user, checkAuth } = useAuthStore.getState()

    // PERFORMANCE FIX: Trust cached auth state for immediate render
    // Don't block on API call - verify in background instead
    if (!isAuthenticated) {
      // No cached auth - must redirect to sign in
      // Validate redirect URL to prevent open redirect attacks
      const validatedRedirect = safeRedirect(location.href, '/')
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: validatedRedirect,
        },
      })
    }

    // Check if user has MFA pending verification
    // Redirect to MFA challenge page if MFA verification is required
    if (user?.mfaPending) {
      // Validate redirect URL to prevent open redirect attacks
      const validatedRedirect = safeRedirect(location.href, '/')
      throw redirect({
        to: '/mfa-challenge',
        search: {
          redirect: validatedRedirect,
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