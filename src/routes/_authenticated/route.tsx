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
    } catch (error) {
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