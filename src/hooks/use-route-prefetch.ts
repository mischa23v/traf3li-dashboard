import { useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'

/**
 * Hook for manually prefetching routes for better navigation performance
 *
 * @example
 * ```tsx
 * const prefetch = useRoutePrefetch()
 *
 * <Link
 *   to="/dashboard"
 *   onMouseEnter={() => prefetch('/dashboard')}
 * >
 *   Dashboard
 * </Link>
 * ```
 */
export function useRoutePrefetch() {
  const router = useRouter()

  const prefetch = useCallback(
    (to: string) => {
      try {
        // Prefetch the route with all its loaders and components
        router.preloadRoute({ to } as any)
      } catch (error) {
        // Silently fail - prefetching is an optimization, not critical
        console.debug('Route prefetch failed for:', to, error)
      }
    },
    [router]
  )

  return prefetch
}

/**
 * Batch prefetch multiple routes at once
 *
 * @example
 * ```tsx
 * const prefetchRoutes = useBatchRoutePrefetch()
 *
 * // Prefetch all dashboard routes on mount
 * useEffect(() => {
 *   prefetchRoutes(['/dashboard/cases', '/dashboard/clients', '/dashboard/contacts'])
 * }, [])
 * ```
 */
export function useBatchRoutePrefetch() {
  const router = useRouter()

  const prefetchRoutes = useCallback(
    (routes: string[]) => {
      routes.forEach((to) => {
        try {
          router.preloadRoute({ to } as any)
        } catch (error) {
          console.debug('Route prefetch failed for:', to, error)
        }
      })
    },
    [router]
  )

  return prefetchRoutes
}
