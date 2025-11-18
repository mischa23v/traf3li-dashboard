import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  // Authentication disabled for development - skip directly to dashboard
  // beforeLoad: async ({ location }) => {
  //   const { isAuthenticated, checkAuth } = useAuthStore.getState()

  //   if (!isAuthenticated) {
  //     try {
  //       await checkAuth()
  //       const stillNotAuthenticated = !useAuthStore.getState().isAuthenticated
  //
  //       if (stillNotAuthenticated) {
  //         throw redirect({
  //           to: '/sign-in',
  //           search: {
  //             redirect: location.href,
  //           },
  //         })
  //       }
  //     } catch (error) {
  //       throw redirect({
  //         to: '/sign-in',
  //         search: {
  //           redirect: location.href,
  //         },
  //       })
  //     }
  //   }
  // },
  component: AuthenticatedLayout,
})