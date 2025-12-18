import { useEffect } from 'react'
import { useBatchRoutePrefetch } from './use-route-prefetch'
import { HIGH_PRIORITY_ROUTES, LOW_PRIORITY_ROUTES } from '@/utils/route-prefetch-config'

/**
 * Hook that prefetches routes when the browser is idle
 *
 * Uses requestIdleCallback to prefetch routes during idle time,
 * ensuring prefetching doesn't interfere with critical rendering.
 *
 * @param enabled - Whether prefetching is enabled (default: true)
 * @param highPriorityDelay - Delay before prefetching high priority routes (ms, default: 2000)
 * @param lowPriorityDelay - Delay before prefetching low priority routes (ms, default: 5000)
 *
 * @example
 * ```tsx
 * function App() {
 *   // Prefetch common routes after the app has loaded
 *   useIdlePrefetch()
 *   return <RouterProvider router={router} />
 * }
 * ```
 */
export function useIdlePrefetch(
  enabled = true,
  highPriorityDelay = 2000,
  lowPriorityDelay = 5000
) {
  const prefetchRoutes = useBatchRoutePrefetch()

  useEffect(() => {
    if (!enabled) return

    // Prefetch high priority routes after a short delay
    const highPriorityTimer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          prefetchRoutes([...HIGH_PRIORITY_ROUTES])
        })
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        prefetchRoutes([...HIGH_PRIORITY_ROUTES])
      }
    }, highPriorityDelay)

    // Prefetch low priority routes after a longer delay
    const lowPriorityTimer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            prefetchRoutes([...LOW_PRIORITY_ROUTES])
          },
          { timeout: 10000 } // Give up after 10 seconds if browser never idles
        )
      } else {
        prefetchRoutes([...LOW_PRIORITY_ROUTES])
      }
    }, lowPriorityDelay)

    return () => {
      clearTimeout(highPriorityTimer)
      clearTimeout(lowPriorityTimer)
    }
  }, [enabled, highPriorityDelay, lowPriorityDelay, prefetchRoutes])
}
