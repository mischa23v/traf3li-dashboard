import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'

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

      // Check if user has no firm associated after auth check
      // Solo lawyers are allowed to proceed without a firm (they have isSoloLawyer: true)
      // Only redirect to /no-firm if:
      // 1. User is a lawyer (not client or admin)
      // 2. User is NOT a solo lawyer
      // 3. User has no firm
      // 4. Permissions fetch confirmed no firm (noFirmAssociated is true)
      const user = useAuthStore.getState().user
      const { noFirmAssociated, permissions, isLoading, isSoloLawyer } = usePermissionsStore.getState()

      if (
        user?.role === 'lawyer' &&
        !user.isSoloLawyer &&
        !isSoloLawyer &&
        !user.firmId &&
        noFirmAssociated &&
        !permissions &&
        !isLoading
      ) {
        throw redirect({
          to: '/no-firm',
        })
      }
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