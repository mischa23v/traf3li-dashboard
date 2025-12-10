import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    console.log('[AUTH DEBUG] _authenticated beforeLoad called for:', location.pathname)
    const { checkAuth } = useAuthStore.getState()

    // Always verify authentication with backend, even if localStorage says authenticated
    // This prevents showing authenticated UI with stale/expired sessions
    try {
      await checkAuth()
    } catch (error) {
      // checkAuth() shouldn't throw, but if it does, log it and continue
      // We'll check isAuthenticated below
      console.error('[AUTH DEBUG] checkAuth threw error:', error)
    }

    const isAuthenticated = useAuthStore.getState().isAuthenticated
    console.log('[AUTH DEBUG] After checkAuth, isAuthenticated:', isAuthenticated)

    if (!isAuthenticated) {
      console.log('[AUTH DEBUG] NOT authenticated - redirecting to sign-in')
      // Clear any stale auth state
      useAuthStore.getState().logout()
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    console.log('[AUTH DEBUG] Authenticated - proceeding')
    // No firm check needed - lawyers without firm are treated as solo lawyers
    // The auth store's checkAuth() already handles setting solo lawyer permissions
  },
  component: AuthenticatedLayout,
})