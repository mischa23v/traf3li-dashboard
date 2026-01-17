/**
 * Recents Tracker
 * Tracks recently visited pages using localStorage with useSyncExternalStore pattern
 *
 * Features:
 * - Max 5 recent items
 * - Deduplication by path
 * - SSR-safe (returns empty array on server)
 * - Graceful localStorage fallback
 * - Type-safe RecentItem interface
 */

import type { RecentItem } from '@/types/sidebar'

//
// CONSTANTS
//

const STORAGE_KEY = 'sidebar-recents'
const MAX_RECENTS = 5

//
// HELPER FUNCTIONS
//

/**
 * Check if localStorage is available
 * Handles cases where localStorage is disabled or unavailable
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Safely read recents from localStorage
 * Returns empty array if unavailable or invalid
 */
function readFromStorage(): RecentItem[] {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    // Validate array structure
    if (!Array.isArray(parsed)) {
      if (import.meta.env.DEV) {
        console.warn('[RecentsTracker] Invalid storage format, resetting')
      }
      window.localStorage.removeItem(STORAGE_KEY)
      return []
    }

    // Validate and filter items
    const validItems = parsed.filter(
      (item): item is RecentItem =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.path === 'string' &&
        typeof item.icon === 'string' &&
        typeof item.visitedAt === 'number'
    )

    // If some items were invalid, update storage
    if (validItems.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems))
    }

    return validItems
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[RecentsTracker] Failed to read from localStorage:', error)
    }
    return []
  }
}

/**
 * Safely write recents to localStorage
 */
function writeToStorage(items: RecentItem[]): boolean {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return false
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[RecentsTracker] Failed to write to localStorage:', error)
    }
    return false
  }
}

//
// RECENTS TRACKER CLASS
//

/**
 * RecentsTracker - Singleton class for tracking recent page visits
 *
 * Uses useSyncExternalStore pattern for React 18+ compatibility:
 * - getSnapshot(): Returns current recents array
 * - getServerSnapshot(): Returns empty array for SSR
 * - subscribe(): Registers listeners for state changes
 *
 * Usage with React:
 * ```tsx
 * const recents = useSyncExternalStore(
 *   recentsTracker.subscribe,
 *   recentsTracker.getSnapshot,
 *   recentsTracker.getServerSnapshot
 * )
 * ```
 */
class RecentsTracker {
  /** Set of subscriber functions to notify on changes */
  private listeners = new Set<() => void>()

  /** Cached recents to avoid repeated localStorage reads */
  private cache: RecentItem[] | null = null

  /**
   * Get current snapshot of recents
   * Used by useSyncExternalStore
   */
  getSnapshot = (): RecentItem[] => {
    if (this.cache === null) {
      this.cache = readFromStorage()
    }
    return this.cache
  }

  /**
   * Get server-side snapshot (always empty)
   * Used by useSyncExternalStore for SSR
   */
  getServerSnapshot = (): RecentItem[] => {
    return []
  }

  /**
   * Subscribe to recents changes
   * Used by useSyncExternalStore
   *
   * @param listener - Callback to invoke on changes
   * @returns Unsubscribe function
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)

    // Also listen to storage events from other tabs
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        this.invalidateCache()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent)
    }

    return () => {
      this.listeners.delete(listener)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent)
      }
    }
  }

  /**
   * Track a page visit
   * Adds or updates the item in recents, maintaining max 5 items
   *
   * @param item - The item to track (without visitedAt timestamp)
   */
  trackVisit = (item: Omit<RecentItem, 'visitedAt'>): void => {
    // Validate required fields
    if (!item.id || !item.title || !item.path || !item.icon) {
      if (import.meta.env.DEV) {
        console.warn('[RecentsTracker] Invalid item, missing required fields:', item)
      }
      return
    }

    const currentRecents = this.getSnapshot()

    // Create new item with timestamp
    const newItem: RecentItem = {
      ...item,
      visitedAt: Date.now(),
    }

    // Remove existing item with same path (deduplication)
    const filteredRecents = currentRecents.filter(
      (existing) => existing.path !== item.path
    )

    // Add new item at the beginning
    const updatedRecents = [newItem, ...filteredRecents]

    // Trim to max items
    const trimmedRecents = updatedRecents.slice(0, MAX_RECENTS)

    // Persist to storage
    const success = writeToStorage(trimmedRecents)

    if (success) {
      // Update cache and notify listeners
      this.cache = trimmedRecents
      this.notifyListeners()
    }
  }

  /**
   * Clear all recents
   * Useful for logout or user preference reset
   */
  clearRecents = (): void => {
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore errors on clear
      }
    }

    this.cache = []
    this.notifyListeners()
  }

  /**
   * Remove a specific item from recents
   *
   * @param path - The path of the item to remove
   */
  removeItem = (path: string): void => {
    const currentRecents = this.getSnapshot()
    const filteredRecents = currentRecents.filter((item) => item.path !== path)

    if (filteredRecents.length !== currentRecents.length) {
      writeToStorage(filteredRecents)
      this.cache = filteredRecents
      this.notifyListeners()
    }
  }

  /**
   * Invalidate cache and refresh from storage
   * Called when storage event detected from another tab
   */
  private invalidateCache = (): void => {
    this.cache = null
    this.notifyListeners()
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners = (): void => {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[RecentsTracker] Listener error:', error)
        }
      }
    })
  }
}

//
// SINGLETON EXPORT
//

/**
 * Singleton instance of RecentsTracker
 * Use this instance throughout the application
 */
export const recentsTracker = new RecentsTracker()

//
// TYPE EXPORTS
//

export type { RecentItem }
