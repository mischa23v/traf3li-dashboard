import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { checkAuth } = useAuthStore.getState()

    // Always verify authentication with backend, even if localStorage says authenticated
    // This prevents showing authenticated UI with stale/expired sessions
    try {
      await checkAuth()
      const isAuthenticated = useAuthStore.getState().isAuthenticated

      if (!isAuthenticated) {
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }

      // No firm check needed - lawyers without firm are treated as solo lawyers
      // The auth store's checkAuth() already handles setting solo lawyer permissions
    } catch (error) {
      // Check if this is a redirect (not an actual error)
      if (error && typeof error === 'object' && 'to' in error) {
        throw error
      }

      // Clear any stale auth state
      useAuthStore.getState().logout()
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})