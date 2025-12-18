/**
 * Session Monitor
 * Monitors response headers for session warnings and triggers callbacks
 * Integrates with backend session timeout headers
 */

export interface SessionWarning {
  type: 'idle' | 'absolute'
  remainingSeconds: number
}

type WarningCallback = (warning: SessionWarning) => void

class SessionMonitor {
  private warningCallbacks: WarningCallback[] = []
  private warningShown = false
  private warningTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Check response headers for session warnings
   * Call this on every API response
   */
  checkResponseHeaders(headers: Headers | Record<string, string>): void {
    const getHeader = (name: string): string | null => {
      if (headers instanceof Headers) {
        return headers.get(name)
      }
      // Handle axios-style lowercase headers
      return headers[name] || headers[name.toLowerCase()] || null
    }

    // Check for idle timeout warning
    if (getHeader('X-Session-Idle-Warning') === 'true' || getHeader('x-session-idle-warning') === 'true') {
      const remaining = parseInt(
        getHeader('X-Session-Idle-Remaining') || getHeader('x-session-idle-remaining') || '0',
        10
      )
      this.triggerWarning({ type: 'idle', remainingSeconds: remaining })
    }

    // Check for absolute timeout warning
    if (getHeader('X-Session-Absolute-Warning') === 'true' || getHeader('x-session-absolute-warning') === 'true') {
      const remaining = parseInt(
        getHeader('X-Session-Absolute-Remaining') || getHeader('x-session-absolute-remaining') || '0',
        10
      )
      this.triggerWarning({ type: 'absolute', remainingSeconds: remaining })
    }
  }

  /**
   * Register a callback for session warnings
   * @returns Unsubscribe function
   */
  onWarning(callback: WarningCallback): () => void {
    this.warningCallbacks.push(callback)
    return () => {
      this.warningCallbacks = this.warningCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Trigger warning to all registered callbacks
   */
  private triggerWarning(warning: SessionWarning): void {
    // Prevent duplicate warnings within short time
    if (this.warningShown) return

    this.warningShown = true
    this.warningCallbacks.forEach((cb) => cb(warning))

    // Also dispatch custom event for components that prefer event-based approach
    window.dispatchEvent(
      new CustomEvent('session-expiry-warning', {
        detail: {
          remainingSeconds: warning.remainingSeconds,
          isIdleWarning: warning.type === 'idle',
          isAbsoluteWarning: warning.type === 'absolute',
        },
      })
    )

    // Reset after 60 seconds to allow new warning
    this.warningTimeout = setTimeout(() => {
      this.warningShown = false
    }, 60000)
  }

  /**
   * Reset warning state (call when user performs activity)
   */
  resetWarning(): void {
    this.warningShown = false
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout)
      this.warningTimeout = null
    }
  }

  /**
   * Cleanup - call on unmount
   */
  cleanup(): void {
    this.warningCallbacks = []
    this.resetWarning()
  }
}

// Export singleton instance
export const sessionMonitor = new SessionMonitor()

/**
 * React hook for session warnings
 * Usage: useSessionWarning((warning) => { ... })
 */
export function useSessionWarningListener(callback: WarningCallback): void {
  // This is called in component - use useEffect
  // Note: This is a helper for the pattern, actual hook implementation
  // would need React imports which we keep separate
  if (typeof window !== 'undefined') {
    const unsubscribe = sessionMonitor.onWarning(callback)
    // Return cleanup in the calling component's useEffect
    return unsubscribe as unknown as void
  }
}

export default sessionMonitor
