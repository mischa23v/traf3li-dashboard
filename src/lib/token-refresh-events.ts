/**
 * Token Refresh Event System
 * Coordinates token refresh between HTTP and WebSocket layers
 *
 * When HTTP access token is refreshed, this module notifies listeners
 * (like the WebSocket provider) so they can update their tokens too.
 *
 * This ensures the WebSocket connection stays authenticated after
 * HTTP token refresh, preventing disconnection on the next server check.
 */

type TokenRefreshListener = (newToken: string, expiresIn?: number) => void | Promise<void>

/**
 * Token refresh event emitter
 * Simple pub/sub for token refresh events
 */
class TokenRefreshEvents {
  private listeners: Set<TokenRefreshListener> = new Set()
  private lastToken: string | null = null
  private lastExpiresIn: number | undefined = undefined

  /**
   * Subscribe to token refresh events
   *
   * @param listener - Callback function called when token is refreshed
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = tokenRefreshEvents.subscribe((newToken) => {
   *   socketService.refreshSocketToken(newToken);
   * });
   *
   * // Later, when component unmounts
   * unsubscribe();
   */
  subscribe(listener: TokenRefreshListener): () => void {
    this.listeners.add(listener)

    // If a token was recently refreshed, notify the new listener immediately
    // This handles race conditions where listener subscribes just after refresh
    if (this.lastToken) {
      // Use setTimeout to ensure async consistency
      setTimeout(() => {
        listener(this.lastToken!, this.lastExpiresIn)
      }, 0)
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Emit token refresh event
   * Called by HTTP layer when access token is refreshed
   *
   * @param newToken - The new access token
   * @param expiresIn - Optional: seconds until token expires
   */
  emit(newToken: string, expiresIn?: number): void {
    if (!newToken) {
      console.warn('[TokenRefreshEvents] Attempted to emit with empty token')
      return
    }

    // Cache the token for late subscribers
    this.lastToken = newToken
    this.lastExpiresIn = expiresIn

    // Clear cached token after 5 seconds (prevent stale notifications)
    setTimeout(() => {
      if (this.lastToken === newToken) {
        this.lastToken = null
        this.lastExpiresIn = undefined
      }
    }, 5000)

    // Notify all listeners
    this.listeners.forEach(async (listener) => {
      try {
        await listener(newToken, expiresIn)
      } catch (error) {
        console.error('[TokenRefreshEvents] Listener error:', error)
      }
    })

    if (import.meta.env.DEV) {
      console.log('[TokenRefreshEvents] Token refresh emitted, notified', this.listeners.size, 'listeners')
    }
  }

  /**
   * Clear all listeners
   * Call on logout to prevent stale callbacks
   */
  clear(): void {
    this.listeners.clear()
    this.lastToken = null
    this.lastExpiresIn = undefined
  }

  /**
   * Get current listener count (for debugging)
   */
  getListenerCount(): number {
    return this.listeners.size
  }
}

// Singleton instance
export const tokenRefreshEvents = new TokenRefreshEvents()

export default tokenRefreshEvents
