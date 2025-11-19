import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  // DISABLED FOR TESTING - Authentication check bypassed
  beforeLoad: async ({ location }) => {
    // Set a mock user for testing purposes
    const { setUser } = useAuthStore.getState()
    setUser({
      _id: 'test-user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin', // Change to 'lawyer' or 'client' to test different roles
      country: 'SA',
      phone: '+966123456789',
      isSeller: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    /* ORIGINAL AUTH CHECK - COMMENTED OUT FOR TESTING
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
    */
  },
  component: AuthenticatedLayout,
})