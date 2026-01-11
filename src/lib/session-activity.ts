/**
 * Session Activity Tracker - Rolling Sessions & Activity-Based Extension
 *
 * ENTERPRISE PATTERN: Activity-based session management (nextjs-auth0 pattern)
 * Extends user sessions based on activity, preventing unexpected logouts for active users.
 *
 * Features:
 * 1. Rolling Sessions - Extend session on user activity
 * 2. Activity Detection - Mouse, keyboard, scroll, touch events
 * 3. Idle Detection - Detect when user is inactive
 * 4. Cross-tab Activity Sync - Share activity state across tabs
 * 5. Debounced Updates - Prevent excessive API calls
 *
 * Usage:
 *   import { sessionActivity } from '@/lib/session-activity'
 *
 *   // Start tracking (call once on app init when user is logged in)
 *   sessionActivity.startTracking()
 *
 *   // Stop tracking (call on logout)
 *   sessionActivity.stopTracking()
 *
 *   // Check if user is idle
 *   const isIdle = sessionActivity.isUserIdle()
 */

import { authBroadcast } from './auth-broadcast'

// ==================== CONFIGURATION ====================

/**
 * Session activity configuration
 * Tuned for enterprise UX - not too aggressive, not too passive
 */
const CONFIG = {
  /**
   * Time of inactivity before user is considered idle (5 minutes)
   * After this, we won't extend the session automatically
   */
  IDLE_THRESHOLD_MS: 5 * 60 * 1000,

  /**
   * Minimum time between session extension API calls (2 minutes)
   * Prevents hammering the server with extend requests
   */
  EXTEND_DEBOUNCE_MS: 2 * 60 * 1000,

  /**
   * Minimum time between activity broadcasts (30 seconds)
   * Prevents flooding the broadcast channel
   */
  ACTIVITY_BROADCAST_DEBOUNCE_MS: 30 * 1000,

  /**
   * Time before token expiry to trigger extension (5 minutes)
   * Gives enough buffer for network delays
   */
  EXTEND_BEFORE_EXPIRY_MS: 5 * 60 * 1000,

  /**
   * Activity events to track
   */
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'click',
    'focus',
  ] as const,
}

// ==================== TYPES ====================

interface ActivityState {
  lastActivity: number
  lastExtendRequest: number
  lastBroadcast: number
  isTracking: boolean
  expiresAt: number | null
}

type SessionExtendCallback = (newExpiresAt: number) => void

// ==================== IMPLEMENTATION ====================

/**
 * Session Activity Manager class
 */
class SessionActivityManager {
  private state: ActivityState = {
    lastActivity: Date.now(),
    lastExtendRequest: 0,
    lastBroadcast: 0,
    isTracking: false,
    expiresAt: null,
  }

  private activityHandler: (() => void) | null = null
  private checkIntervalId: ReturnType<typeof setInterval> | null = null
  private extendCallbacks = new Set<SessionExtendCallback>()
  private broadcastUnsubscribe: (() => void) | null = null

  /**
   * Start tracking user activity
   * Call this when user logs in
   */
  startTracking(expiresAt?: number): void {
    if (this.state.isTracking) {
      console.log('[SESSION_ACTIVITY] Already tracking')
      return
    }

    console.log('[SESSION_ACTIVITY] Starting activity tracking')

    this.state.isTracking = true
    this.state.lastActivity = Date.now()
    this.state.expiresAt = expiresAt || null

    // Create debounced activity handler
    this.activityHandler = this.createDebouncedHandler()

    // Add activity event listeners
    CONFIG.ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, this.activityHandler!, { passive: true })
    })

    // Subscribe to activity broadcasts from other tabs
    this.broadcastUnsubscribe = authBroadcast.subscribe((message) => {
      if (message.type === 'activity_ping') {
        // Update last activity from other tab's ping
        if (message.lastActivity > this.state.lastActivity) {
          this.state.lastActivity = message.lastActivity
          console.log('[SESSION_ACTIVITY] Activity sync from other tab')
        }
      } else if (message.type === 'session_extend') {
        // Another tab extended the session
        this.state.expiresAt = message.expiresAt
        console.log('[SESSION_ACTIVITY] Session extended by other tab:', {
          newExpiresAt: new Date(message.expiresAt).toISOString(),
        })
        this.notifyExtendCallbacks(message.expiresAt)
      } else if (message.type === 'token_refresh') {
        // Token was refreshed in another tab
        this.state.expiresAt = message.expiresAt
        this.state.lastExtendRequest = Date.now() // Reset debounce
      }
    })

    // Start periodic check for session extension
    this.checkIntervalId = setInterval(() => {
      this.checkAndExtendSession()
    }, 60 * 1000) // Check every minute

    console.log('[SESSION_ACTIVITY] Activity tracking started')
  }

  /**
   * Stop tracking user activity
   * Call this on logout
   */
  stopTracking(): void {
    if (!this.state.isTracking) {
      return
    }

    console.log('[SESSION_ACTIVITY] Stopping activity tracking')

    // Remove event listeners
    if (this.activityHandler) {
      CONFIG.ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, this.activityHandler!)
      })
      this.activityHandler = null
    }

    // Clear interval
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }

    // Unsubscribe from broadcasts
    if (this.broadcastUnsubscribe) {
      this.broadcastUnsubscribe()
      this.broadcastUnsubscribe = null
    }

    // Reset state
    this.state = {
      lastActivity: Date.now(),
      lastExtendRequest: 0,
      lastBroadcast: 0,
      isTracking: false,
      expiresAt: null,
    }

    console.log('[SESSION_ACTIVITY] Activity tracking stopped')
  }

  /**
   * Create debounced activity handler
   * Prevents excessive processing of rapid events
   */
  private createDebouncedHandler(): () => void {
    let rafId: number | null = null

    return () => {
      if (rafId !== null) {
        return // Already scheduled
      }

      rafId = requestAnimationFrame(() => {
        rafId = null
        this.handleActivity()
      })
    }
  }

  /**
   * Handle user activity event
   */
  private handleActivity(): void {
    const now = Date.now()
    this.state.lastActivity = now

    // Debounced broadcast to other tabs
    if (now - this.state.lastBroadcast > CONFIG.ACTIVITY_BROADCAST_DEBOUNCE_MS) {
      this.state.lastBroadcast = now
      authBroadcast.broadcastActivityPing()
    }

    // Check if we should extend the session
    this.checkAndExtendSession()
  }

  /**
   * Check if session should be extended and trigger extension
   */
  private checkAndExtendSession(): void {
    if (!this.state.isTracking || !this.state.expiresAt) {
      return
    }

    const now = Date.now()

    // Check if session is expiring soon
    const timeToExpiry = this.state.expiresAt - now
    const shouldExtend = timeToExpiry < CONFIG.EXTEND_BEFORE_EXPIRY_MS && timeToExpiry > 0

    if (!shouldExtend) {
      return
    }

    // Check if user is active (not idle)
    const isActive = !this.isUserIdle()
    if (!isActive) {
      console.log('[SESSION_ACTIVITY] User is idle, skipping session extension')
      return
    }

    // Check debounce
    const timeSinceLastExtend = now - this.state.lastExtendRequest
    if (timeSinceLastExtend < CONFIG.EXTEND_DEBOUNCE_MS) {
      console.log('[SESSION_ACTIVITY] Extension debounced, waiting...')
      return
    }

    // Trigger session extension
    console.log('[SESSION_ACTIVITY] Session expiring soon, triggering extension', {
      expiresIn: Math.round(timeToExpiry / 1000) + 's',
      lastActivity: new Date(this.state.lastActivity).toISOString(),
    })

    this.state.lastExtendRequest = now
    this.triggerSessionExtension()
  }

  /**
   * Trigger session extension
   * This emits an event that api.ts should listen to and call /auth/refresh
   */
  private triggerSessionExtension(): void {
    // Emit custom event that api.ts can listen to
    const event = new CustomEvent('session:extend', {
      detail: {
        reason: 'activity_based',
        lastActivity: this.state.lastActivity,
      },
    })
    window.dispatchEvent(event)
  }

  /**
   * Update session expiration time
   * Called after successful token refresh
   */
  updateExpiresAt(expiresAt: number): void {
    this.state.expiresAt = expiresAt
    this.state.lastExtendRequest = Date.now()

    // Broadcast to other tabs
    const extendedBy = expiresAt - (this.state.expiresAt || Date.now())
    authBroadcast.broadcastSessionExtend(expiresAt, Math.round(extendedBy / 1000))

    this.notifyExtendCallbacks(expiresAt)
  }

  /**
   * Subscribe to session extension events
   */
  onSessionExtend(callback: SessionExtendCallback): () => void {
    this.extendCallbacks.add(callback)
    return () => {
      this.extendCallbacks.delete(callback)
    }
  }

  /**
   * Notify all extension callbacks
   */
  private notifyExtendCallbacks(newExpiresAt: number): void {
    this.extendCallbacks.forEach((callback) => {
      try {
        callback(newExpiresAt)
      } catch (error) {
        console.error('[SESSION_ACTIVITY] Extension callback error:', error)
      }
    })
  }

  /**
   * Check if user is currently idle
   */
  isUserIdle(): boolean {
    const idleTime = Date.now() - this.state.lastActivity
    return idleTime > CONFIG.IDLE_THRESHOLD_MS
  }

  /**
   * Get time since last activity (milliseconds)
   */
  getIdleTime(): number {
    return Date.now() - this.state.lastActivity
  }

  /**
   * Get time until session expires (milliseconds)
   */
  getTimeToExpiry(): number | null {
    if (!this.state.expiresAt) {
      return null
    }
    return Math.max(0, this.state.expiresAt - Date.now())
  }

  /**
   * Check if tracking is active
   */
  isTracking(): boolean {
    return this.state.isTracking
  }

  /**
   * Get debug info
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      isTracking: this.state.isTracking,
      isIdle: this.isUserIdle(),
      idleTime: Math.round(this.getIdleTime() / 1000) + 's',
      timeToExpiry: this.getTimeToExpiry()
        ? Math.round(this.getTimeToExpiry()! / 1000) + 's'
        : 'unknown',
      lastActivity: new Date(this.state.lastActivity).toISOString(),
      expiresAt: this.state.expiresAt
        ? new Date(this.state.expiresAt).toISOString()
        : null,
      config: {
        idleThreshold: CONFIG.IDLE_THRESHOLD_MS / 1000 + 's',
        extendDebounce: CONFIG.EXTEND_DEBOUNCE_MS / 1000 + 's',
        extendBeforeExpiry: CONFIG.EXTEND_BEFORE_EXPIRY_MS / 1000 + 's',
      },
    }
  }

  /**
   * Manually record activity (for programmatic use)
   */
  recordActivity(): void {
    this.state.lastActivity = Date.now()
  }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Singleton instance of SessionActivityManager
 */
export const sessionActivity = new SessionActivityManager()

/**
 * Export configuration for external use
 */
export const SESSION_ACTIVITY_CONFIG = { ...CONFIG }

export default sessionActivity
