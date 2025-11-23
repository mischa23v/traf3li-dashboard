import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, checkAuth } = useAuthStore.getState()

    if (!isAuthenticated) {
      try {
        await checkAuth()
        const stillNotAuthenticated = !useAuthStore.getState().isAuthenticated

        if (stillNotAuthenticated) {
          throw redirect({
            to: '/sign-in',
            search: {
              redirect: location.href,
            },
          })
        }
      } catch (error) {
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})