/**
 * useRecents Hook
 * Provides access to recently visited pages with automatic localStorage sync
 *
 * Features:
 * - useSyncExternalStore for React 18 compatibility
 * - Cross-tab synchronization
 * - SSR-safe (returns empty array on server)
 * - Memoized trackVisit callback
 */

import { useSyncExternalStore, useCallback } from 'react'
import { recentsTracker } from '@/lib/recents-tracker'
import type { RecentItem } from '@/types/sidebar'

//
// HOOK RETURN TYPE
//

export interface UseRecentsReturn {
  /** Array of recent items (max 5) */
  recents: RecentItem[]
  /** Track a page visit - memoized callback */
  trackVisit: (item: Omit<RecentItem, 'visitedAt'>) => void
  /** Clear all recents */
  clearRecents: () => void
  /** Remove a specific item by path */
  removeItem: (path: string) => void
  /** Whether there are any recents */
  hasRecents: boolean
}

//
// HOOK IMPLEMENTATION
//

/**
 * Hook to access and manage recently visited pages
 *
 * @returns Object containing recents array and management functions
 *
 * @example
 * ```tsx
 * const { recents, trackVisit, hasRecents } = useRecents()
 *
 * // Track a visit when navigating
 * const handleClick = () => {
 *   trackVisit({
 *     id: 'clients-list',
 *     title: t('sidebar.nav.clients'),
 *     path: '/dashboard/clients',
 *     icon: 'Users',
 *   })
 *   navigate('/dashboard/clients')
 * }
 *
 * // Render recents section only if there are recents
 * {hasRecents && <RecentsSection items={recents} />}
 * ```
 */
export function useRecents(): UseRecentsReturn {
  // Subscribe to recentsTracker using useSyncExternalStore
  // This ensures React re-renders when recents change
  const recents = useSyncExternalStore(
    recentsTracker.subscribe,
    recentsTracker.getSnapshot,
    recentsTracker.getServerSnapshot
  )

  // Memoize trackVisit to prevent unnecessary re-renders
  const trackVisit = useCallback((item: Omit<RecentItem, 'visitedAt'>) => {
    recentsTracker.trackVisit(item)
  }, [])

  // Memoize clearRecents
  const clearRecents = useCallback(() => {
    recentsTracker.clearRecents()
  }, [])

  // Memoize removeItem
  const removeItem = useCallback((path: string) => {
    recentsTracker.removeItem(path)
  }, [])

  return {
    recents,
    trackVisit,
    clearRecents,
    removeItem,
    hasRecents: recents.length > 0,
  }
}

export default useRecents
