/**
 * Auth Events - Extensible Event System
 *
 * ENTERPRISE PATTERN: Pub/Sub for auth state changes
 * Multiple modules can subscribe to auth events without coupling.
 *
 * Usage:
 *   import { authEvents } from '@/lib/auth-events'
 *
 *   // Subscribe
 *   const unsubscribe = authEvents.onTokensCleared.subscribe(() => {
 *     console.log('Tokens cleared!')
 *   })
 *
 *   // Later: cleanup
 *   unsubscribe()
 *
 *   // Emit (internal use)
 *   authEvents.onTokensCleared.emit()
 */

type Listener<T = void> = T extends void ? () => void : (data: T) => void
type Unsubscribe = () => void

/**
 * Create a typed event emitter
 */
function createEvent<T = void>() {
  const listeners = new Set<Listener<T>>()

  return {
    /**
     * Subscribe to this event
     * @returns Unsubscribe function for cleanup
     */
    subscribe(listener: Listener<T>): Unsubscribe {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    /**
     * Emit event to all subscribers
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
     * Clear all subscribers (for cleanup/testing)
     */
    clear(): void {
      listeners.clear()
    },
  }
}

/**
 * Auth events that other modules can subscribe to
 */
export const authEvents = {
  /**
   * Emitted when tokens are cleared (logout, session expired, etc.)
   * Use this to clean up auth-dependent state
   */
  onTokensCleared: createEvent<{ reason: string }>(),

  /**
   * Emitted when tokens are refreshed successfully
   * Use this to update WebSocket auth, etc.
   */
  onTokensRefreshed: createEvent<{ accessToken: string; expiresIn?: number }>(),

  /**
   * Emitted when logout is triggered from another tab
   * Use this for cross-tab cleanup
   */
  onCrossTabLogout: createEvent<{ sourceTab: 'other' }>(),

  /**
   * Emitted when auth state changes (login/logout)
   */
  onAuthStateChange: createEvent<{ isAuthenticated: boolean }>(),
}

/**
 * Clear all auth event listeners
 * Call this on app unmount or in tests
 */
export const clearAllAuthEventListeners = (): void => {
  authEvents.onTokensCleared.clear()
  authEvents.onTokensRefreshed.clear()
  authEvents.onCrossTabLogout.clear()
  authEvents.onAuthStateChange.clear()
}

export default authEvents
