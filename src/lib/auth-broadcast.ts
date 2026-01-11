/**
 * Auth Broadcast Channel - Cross-Tab Authentication Sync
 *
 * ENTERPRISE PATTERN: BroadcastChannel API for reliable cross-tab communication
 * This is the industry-standard approach used by Auth0, Azure AD, and enterprise applications.
 *
 * Why BroadcastChannel over localStorage events:
 * 1. More reliable - localStorage events don't fire in the same tab
 * 2. More efficient - No need to serialize/deserialize data to localStorage
 * 3. Better semantics - Designed specifically for inter-tab communication
 * 4. Cleaner API - No need to manage storage keys for communication
 *
 * Fallback: Uses localStorage events for browsers that don't support BroadcastChannel
 * (IE11, older Safari - though our app doesn't support IE11)
 *
 * Usage:
 *   import { authBroadcast } from '@/lib/auth-broadcast'
 *
 *   // Broadcast logout to all tabs
 *   authBroadcast.broadcastLogout('session_expired')
 *
 *   // Subscribe to auth events
 *   const unsubscribe = authBroadcast.subscribe((message) => {
 *     if (message.type === 'logout') {
 *       // Handle logout from other tab
 *     }
 *   })
 */

// ==================== TYPES ====================

/**
 * Auth broadcast message types
 */
export type AuthBroadcastType =
  | 'logout'           // User logged out (manual or session expired)
  | 'login'            // User logged in
  | 'token_refresh'    // Token was refreshed
  | 'session_extend'   // Session was extended (activity-based)
  | 'activity_ping'    // User activity detected (for rolling sessions)

/**
 * Base message structure
 */
interface AuthBroadcastMessageBase {
  type: AuthBroadcastType
  timestamp: number
  tabId: string
}

/**
 * Logout message
 */
export interface LogoutMessage extends AuthBroadcastMessageBase {
  type: 'logout'
  reason: string // 'manual' | 'session_expired' | 'token_refresh_failed' | 'cross_tab' | etc.
}

/**
 * Login message
 */
export interface LoginMessage extends AuthBroadcastMessageBase {
  type: 'login'
  userId?: string
  expiresAt?: number
}

/**
 * Token refresh message
 */
export interface TokenRefreshMessage extends AuthBroadcastMessageBase {
  type: 'token_refresh'
  expiresAt: number
  expiresIn: number // seconds
}

/**
 * Session extend message (activity-based)
 */
export interface SessionExtendMessage extends AuthBroadcastMessageBase {
  type: 'session_extend'
  expiresAt: number
  extendedBy: number // seconds added
}

/**
 * Activity ping message (for rolling sessions)
 */
export interface ActivityPingMessage extends AuthBroadcastMessageBase {
  type: 'activity_ping'
  lastActivity: number
}

/**
 * Union type for all message types
 */
export type AuthBroadcastMessage =
  | LogoutMessage
  | LoginMessage
  | TokenRefreshMessage
  | SessionExtendMessage
  | ActivityPingMessage

/**
 * Subscriber callback type
 */
type AuthBroadcastSubscriber = (message: AuthBroadcastMessage) => void

// ==================== IMPLEMENTATION ====================

/**
 * Channel name for auth communication
 * Namespaced to prevent conflicts with other apps on same origin
 */
const CHANNEL_NAME = 'traf3li_auth_channel'

/**
 * Storage key for fallback localStorage-based communication
 */
const STORAGE_FALLBACK_KEY = 'traf3li_auth_broadcast'

/**
 * Generate unique tab identifier
 * Used to identify the source tab for messages
 */
const generateTabId = (): string => {
  const id = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  return id
}

/**
 * Current tab's unique ID
 */
const TAB_ID = generateTabId()

/**
 * Check if BroadcastChannel is supported
 */
const isBroadcastChannelSupported = typeof BroadcastChannel !== 'undefined'

/**
 * AuthBroadcast class - handles cross-tab auth communication
 */
class AuthBroadcastManager {
  private channel: BroadcastChannel | null = null
  private subscribers = new Set<AuthBroadcastSubscriber>()
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the broadcast channel
   */
  private initialize(): void {
    if (this.isInitialized) return
    this.isInitialized = true

    if (isBroadcastChannelSupported) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME)
        this.channel.onmessage = this.handleMessage.bind(this)
        this.channel.onmessageerror = (event) => {
          console.error('[AUTH_BROADCAST] Message error:', event)
        }
        console.log('[AUTH_BROADCAST] Initialized with BroadcastChannel API', { tabId: TAB_ID })
      } catch (error) {
        console.warn('[AUTH_BROADCAST] BroadcastChannel failed, falling back to localStorage:', error)
        this.setupLocalStorageFallback()
      }
    } else {
      console.log('[AUTH_BROADCAST] BroadcastChannel not supported, using localStorage fallback')
      this.setupLocalStorageFallback()
    }
  }

  /**
   * Setup localStorage event listener as fallback
   */
  private setupLocalStorageFallback(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_FALLBACK_KEY && event.newValue) {
        try {
          const message = JSON.parse(event.newValue) as AuthBroadcastMessage
          // Don't process our own messages
          if (message.tabId !== TAB_ID) {
            this.notifySubscribers(message)
          }
        } catch (error) {
          console.error('[AUTH_BROADCAST] Failed to parse localStorage message:', error)
        }
      }
    })
  }

  /**
   * Handle incoming broadcast message
   */
  private handleMessage(event: MessageEvent<AuthBroadcastMessage>): void {
    const message = event.data

    // Ignore messages from this tab
    if (message.tabId === TAB_ID) {
      return
    }

    console.log('[AUTH_BROADCAST] Received message:', {
      type: message.type,
      fromTab: message.tabId,
      timestamp: new Date(message.timestamp).toISOString(),
    })

    this.notifySubscribers(message)
  }

  /**
   * Notify all subscribers of a message
   */
  private notifySubscribers(message: AuthBroadcastMessage): void {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(message)
      } catch (error) {
        console.error('[AUTH_BROADCAST] Subscriber error:', error)
      }
    })
  }

  /**
   * Post a message to all tabs
   */
  private postMessage(message: Omit<AuthBroadcastMessage, 'timestamp' | 'tabId'>): void {
    const fullMessage: AuthBroadcastMessage = {
      ...message,
      timestamp: Date.now(),
      tabId: TAB_ID,
    } as AuthBroadcastMessage

    console.log('[AUTH_BROADCAST] Broadcasting message:', {
      type: message.type,
      tabId: TAB_ID,
    })

    if (this.channel) {
      try {
        this.channel.postMessage(fullMessage)
      } catch (error) {
        console.error('[AUTH_BROADCAST] Failed to post message:', error)
        // Try localStorage fallback
        this.postViaLocalStorage(fullMessage)
      }
    } else {
      this.postViaLocalStorage(fullMessage)
    }
  }

  /**
   * Post message via localStorage (fallback)
   */
  private postViaLocalStorage(message: AuthBroadcastMessage): void {
    try {
      // Write then immediately remove to trigger storage event in other tabs
      localStorage.setItem(STORAGE_FALLBACK_KEY, JSON.stringify(message))
      // Small delay before removing to ensure other tabs receive it
      setTimeout(() => {
        localStorage.removeItem(STORAGE_FALLBACK_KEY)
      }, 100)
    } catch (error) {
      console.error('[AUTH_BROADCAST] localStorage fallback failed:', error)
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Subscribe to auth broadcast messages
   * @returns Unsubscribe function
   */
  subscribe(callback: AuthBroadcastSubscriber): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Broadcast logout to all tabs
   */
  broadcastLogout(reason: string): void {
    this.postMessage({
      type: 'logout',
      reason,
    })
  }

  /**
   * Broadcast login to all tabs
   */
  broadcastLogin(userId?: string, expiresAt?: number): void {
    this.postMessage({
      type: 'login',
      userId,
      expiresAt,
    })
  }

  /**
   * Broadcast token refresh to all tabs
   */
  broadcastTokenRefresh(expiresAt: number, expiresIn: number): void {
    this.postMessage({
      type: 'token_refresh',
      expiresAt,
      expiresIn,
    })
  }

  /**
   * Broadcast session extension to all tabs
   */
  broadcastSessionExtend(expiresAt: number, extendedBy: number): void {
    this.postMessage({
      type: 'session_extend',
      expiresAt,
      extendedBy,
    })
  }

  /**
   * Broadcast activity ping to all tabs (for rolling sessions)
   */
  broadcastActivityPing(): void {
    this.postMessage({
      type: 'activity_ping',
      lastActivity: Date.now(),
    })
  }

  /**
   * Get current tab ID
   */
  getTabId(): string {
    return TAB_ID
  }

  /**
   * Get subscriber count (for debugging)
   */
  getSubscriberCount(): number {
    return this.subscribers.size
  }

  /**
   * Check if using BroadcastChannel or localStorage fallback
   */
  isUsingBroadcastChannel(): boolean {
    return this.channel !== null
  }

  /**
   * Close the broadcast channel
   * Call this on app unmount
   */
  close(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.subscribers.clear()
    this.isInitialized = false
    console.log('[AUTH_BROADCAST] Closed')
  }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Singleton instance of AuthBroadcastManager
 * Exported for use across the application
 */
export const authBroadcast = new AuthBroadcastManager()

/**
 * Debug info for auth broadcast
 */
export const getAuthBroadcastDebugInfo = () => ({
  tabId: authBroadcast.getTabId(),
  subscriberCount: authBroadcast.getSubscriberCount(),
  usingBroadcastChannel: authBroadcast.isUsingBroadcastChannel(),
  broadcastChannelSupported: isBroadcastChannelSupported,
})

export default authBroadcast
