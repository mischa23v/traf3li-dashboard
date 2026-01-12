/**
 * Auth Events - Extensible Event System
 *
 * ENTERPRISE PATTERN: Pub/Sub for auth state changes
 * Multiple modules can subscribe to auth events without coupling.
 *
 * IMPORTANT: Always call the unsubscribe function returned by subscribe()
 * to prevent memory leaks, especially in React components.
 *
 * Usage:
 *   import { authEvents } from '@/lib/auth-events'
 *
 *   // Subscribe (in React useEffect)
 *   useEffect(() => {
 *     const unsubscribe = authEvents.onTokensCleared.subscribe(({ reason }) => {
 *       console.log('Tokens cleared:', reason)
 *     })
 *     return unsubscribe  // CRITICAL: cleanup on unmount
 *   }, [])
 *
 *   // Emit (internal use only - from api.ts)
 *   authEvents.onTokensCleared.emit({ reason: 'manual' })
 */

type Listener<T = void> = T extends void ? () => void : (data: T) => void
type Unsubscribe = () => void

/**
 * Event emitter interface for type safety
 */
interface EventEmitter<T = void> {
  subscribe(listener: Listener<T>): Unsubscribe
  emit(...args: T extends void ? [] : [T]): void
  readonly subscriberCount: number
  clear(): void
}

/**
 * Create a typed event emitter
 * Uses Set for O(1) add/delete and automatic deduplication
 */
function createEvent<T = void>(): EventEmitter<T> {
  const listeners = new Set<Listener<T>>()

  const emitter: EventEmitter<T> = {
    /**
     * Subscribe to this event
     * @returns Unsubscribe function - MUST be called on cleanup to prevent memory leaks
     */
    subscribe(listener: Listener<T>): Unsubscribe {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    /**
     * Emit event to all subscribers synchronously
     * Errors in listeners are caught and logged, not propagated
     */
    emit(...args: T extends void ? [] : [T]): void {
      listeners.forEach((listener) => {
        try {
          // @ts-expect-error - TypeScript can't infer the spread correctly
          listener(...args)
        } catch (error) {
          console.error('[AUTH_EVENTS] Listener error:', error)
        }
      })
    },

    /**
     * Get current subscriber count (for debugging)
     */
    get subscriberCount(): number {
      return listeners.size
    },

    /**
     * Clear all subscribers
     * WARNING: This removes ALL listeners including system ones.
     * Only use in tests or during app teardown.
     */
    clear(): void {
      listeners.clear()
    },
  }

  return emitter
}

/**
 * Auth events that other modules can subscribe to
 *
 * IMMUTABLE: This object is frozen to prevent accidental modification.
 * The individual event emitters are still functional (can subscribe/emit).
 */
const _authEvents = {
  /**
   * Emitted when tokens are cleared (logout, session expired, etc.)
   * Use this to clean up auth-dependent state (memory caches, WebSocket connections, etc.)
   *
   * Subscribers:
   * - authService: clears memory cache
   */
  onTokensCleared: createEvent<{ reason: string }>(),

  /**
   * Emitted when tokens are refreshed successfully
   * Use this to update WebSocket auth, reconnect with new token, etc.
   */
  onTokensRefreshed: createEvent<{ accessToken: string; expiresIn?: number }>(),

  /**
   * Emitted when logout is triggered from another tab
   * Use this for cross-tab cleanup (close modals, clear forms, etc.)
   */
  onCrossTabLogout: createEvent<{ sourceTab: 'other' }>(),

  /**
   * Emitted when auth state changes (login/logout)
   * Use this for UI updates that depend on auth state
   */
  onAuthStateChange: createEvent<{ isAuthenticated: boolean }>(),
} as const

// Freeze to prevent accidental modification like `authEvents.onTokensCleared = null`
export const authEvents = Object.freeze(_authEvents)

/**
 * Clear all auth event listeners
 *
 * WARNING: This is a nuclear option that removes ALL subscribers,
 * including system ones (like authService's memory cache cleaner).
 * Only use in tests or during full app teardown.
 *
 * After calling this, you must re-import authService to restore
 * its subscription, or the auth system will malfunction.
 *
 * @param confirm - Must pass true to confirm you understand the consequences
 */
export const clearAllAuthEventListeners = (confirm: boolean = false): void => {
  if (!confirm) {
    console.warn(
      '[AUTH_EVENTS] clearAllAuthEventListeners called without confirmation. ' +
      'This removes ALL listeners including system ones. ' +
      'Pass true as argument to confirm: clearAllAuthEventListeners(true)'
    )
    return
  }

  console.warn('[AUTH_EVENTS] Clearing all auth event listeners (confirmed)')
  authEvents.onTokensCleared.clear()
  authEvents.onTokensRefreshed.clear()
  authEvents.onCrossTabLogout.clear()
  authEvents.onAuthStateChange.clear()
}

/**
 * Get debug info about current subscriptions
 * Useful for debugging memory leaks
 */
export const getAuthEventsDebugInfo = (): Record<string, number> => {
  return {
    onTokensCleared: authEvents.onTokensCleared.subscriberCount,
    onTokensRefreshed: authEvents.onTokensRefreshed.subscriberCount,
    onCrossTabLogout: authEvents.onCrossTabLogout.subscriberCount,
    onAuthStateChange: authEvents.onAuthStateChange.subscriberCount,
  }
}

export default authEvents
