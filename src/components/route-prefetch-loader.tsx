import { useIdlePrefetch } from '@/hooks/use-idle-prefetch'

/**
 * Component that handles route prefetching strategies
 *
 * This component should be mounted at the root level of your app
 * to enable automatic route prefetching during idle time.
 *
 * @example
 * ```tsx
 * <App>
 *   <RoutePrefetchLoader />
 *   <RouterProvider router={router} />
 * </App>
 * ```
 */
export function RoutePrefetchLoader() {
  // Prefetch common routes when browser is idle
  // Adjust delays based on your app's needs:
  // - highPriorityDelay: How long to wait before prefetching critical routes (default: 2s)
  // - lowPriorityDelay: How long to wait before prefetching less critical routes (default: 5s)
  useIdlePrefetch(
    true, // enabled
    2000, // highPriorityDelay - prefetch after 2 seconds
    5000  // lowPriorityDelay - prefetch after 5 seconds
  )

  // This component doesn't render anything
  return null
}
