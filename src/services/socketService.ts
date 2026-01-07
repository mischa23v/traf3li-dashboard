/**
 * Socket Service
 * Handles all Socket.IO real-time communication
 * Includes authentication error handling and session management
 * Optimized with throttling for high-frequency events
 *
 * WebSocket Token Expiry Feature:
 * - Listens for auth:token_expired and auth:token_invalid events
 * - Provides method to refresh socket token via auth:refresh_token emit
 * - Handles connection errors with specific auth error codes
 * - Integrates with HTTP token refresh mechanism
 */

import { io, Socket } from 'socket.io-client'
import type {
  SocketSessionExpiredEvent,
  SocketForceLogoutEvent,
  SocketAuthTokenExpiredPayload,
  SocketAuthTokenInvalidPayload,
  SocketAuthRefreshTokenResponse,
  SocketAuthErrorCode,
} from '@/types/api'

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '').replace('https://', 'wss://') ||
  'wss://api.traf3li.com'

/**
 * Callback types for token expiry events
 */
export interface SocketTokenExpiryCallbacks {
  /** Called when token expires (recoverable via refresh) */
  onTokenExpired?: (payload: SocketAuthTokenExpiredPayload) => void
  /** Called when token is invalid/revoked (must re-authenticate) */
  onTokenInvalid?: (payload: SocketAuthTokenInvalidPayload) => void
  /** Called when token refresh succeeds */
  onTokenRefreshSuccess?: (expiresAt: string) => void
  /** Called when token refresh fails */
  onTokenRefreshFailed?: (error: string) => void
}

class SocketService {
  private socket: Socket | null = null
  private userId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  // Throttling for high-frequency events
  private typingThrottleMap = new Map<string, number>()
  private readonly TYPING_THROTTLE_MS = 1000 // Max once per second per conversation

  // Event handler references for proper cleanup
  private eventHandlers = new Map<string, (...args: any[]) => void>()

  // Token expiry callbacks
  private tokenExpiryCallbacks: SocketTokenExpiryCallbacks = {}

  // Track if we're currently refreshing token to prevent duplicate attempts
  private isRefreshingToken = false

  // Track last token refresh time for proactive refresh scheduling
  private lastTokenRefresh: Date | null = null
  private tokenExpiresAt: Date | null = null

  /**
   * Initialize socket connection
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      return
    }

    this.userId = userId

    this.socket = io(SOCKET_URL, {
      withCredentials: true, // Send cookies for authentication
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.setupAuthEventHandlers()
  }

  /**
   * Setup authentication and session event handlers
   * Includes WebSocket Token Expiry handling (auth:token_expired, auth:token_invalid)
   */
  private setupAuthEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0
      // Join user session
      if (this.userId) {
        this.socket?.emit('user:join', this.userId)
      }
      if (import.meta.env.DEV) {
        console.log('[Socket] Connected:', this.socket?.id)
      }
    })

    this.socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Disconnected:', reason)
      }

      // Server forced disconnect - likely auth issue
      if (reason === 'io server disconnect') {
        // Try to reconnect
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Connection error:', error.message)
      }

      // Handle specific authentication error codes
      const errorCode = error.message as SocketAuthErrorCode

      switch (errorCode) {
        case 'AUTHENTICATION_REQUIRED':
          // No token provided - redirect to login
          console.error('[Socket] Authentication required - no token provided')
          window.location.href = '/sign-in?reason=socket_auth_required'
          break

        case 'INVALID_TOKEN':
          // Token failed verification - try to refresh via HTTP then reconnect
          console.warn('[Socket] Invalid token - attempting HTTP token refresh')
          // Don't redirect immediately - let the caller handle refresh
          this.tokenExpiryCallbacks.onTokenInvalid?.({
            message: 'Socket token invalid. Attempting refresh.',
            code: 'TOKEN_INVALID',
          })
          break

        case 'USER_NOT_FOUND':
          // User doesn't exist - redirect to login
          console.error('[Socket] User not found')
          window.location.href = '/sign-in?reason=user_not_found'
          break

        case 'USER_DISABLED':
          // Account is disabled - show message and redirect
          console.error('[Socket] User account is disabled')
          window.location.href = '/sign-in?reason=account_disabled'
          break

        case 'AUTHENTICATION_FAILED':
          // Generic auth failure - redirect to login
          console.error('[Socket] Authentication failed')
          window.location.href = '/sign-in?reason=socket_auth_failed'
          break

        default:
          // Legacy error handling for backwards compatibility
          if (
            error.message.includes('Authentication') ||
            error.message.includes('unauthorized') ||
            error.message.includes('401')
          ) {
            window.location.href = '/sign-in?reason=socket_auth_failed'
          }
      }
    })

    this.socket.on('error', (error) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Error:', error)
      }
    })

    // ═══════════════════════════════════════════════════════════════
    // WEBSOCKET TOKEN EXPIRY EVENTS
    // Server checks token validity every 60 seconds
    // ═══════════════════════════════════════════════════════════════

    /**
     * TOKEN EXPIRED
     * Server detected token TTL exceeded during periodic check (every 60s)
     *
     * Recovery options:
     * 1. Refresh token and update socket (recommended)
     * 2. Redirect to login page
     */
    this.socket.on('auth:token_expired', (payload: SocketAuthTokenExpiredPayload) => {
      console.warn('[Socket] Token expired:', payload.message)

      // Invoke callback if registered
      this.tokenExpiryCallbacks.onTokenExpired?.(payload)
    })

    /**
     * TOKEN INVALID
     * Token was revoked or tampered with
     *
     * Recovery: Must re-authenticate (login again)
     * This happens when:
     * - User logged out from another device
     * - Admin revoked user's sessions
     * - Token was manually invalidated
     */
    this.socket.on('auth:token_invalid', (payload: SocketAuthTokenInvalidPayload) => {
      console.error('[Socket] Token invalid:', payload.message)

      // Invoke callback if registered
      if (this.tokenExpiryCallbacks.onTokenInvalid) {
        this.tokenExpiryCallbacks.onTokenInvalid(payload)
      } else {
        // Default behavior: redirect to login
        window.location.href = '/sign-in?reason=token_invalid'
      }
    })

    // ═══════════════════════════════════════════════════════════════
    // LEGACY SESSION EVENTS (backwards compatibility)
    // ═══════════════════════════════════════════════════════════════

    // Handle session expiry via socket
    this.socket.on('session:expired', (data: SocketSessionExpiredEvent) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Session expired:', data.reason)
      }
      window.location.href = `/sign-in?reason=${data.reason || 'session_expired'}`
    })

    // Handle forced logout (e.g., account locked, permission revoked)
    this.socket.on('force:logout', (data: SocketForceLogoutEvent) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Forced logout:', data.reason)
      }
      window.location.href = `/sign-in?reason=${data.reason || 'forced'}`
    })

    // Handle account locked notification
    this.socket.on('account:locked', (data: { remainingTime?: number }) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Account locked:', data)
      }
      window.location.href = '/sign-in?reason=account_locked'
    })
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.userId = null
    }
    // Clear throttle maps
    this.typingThrottleMap.clear()
    this.eventHandlers.clear()
    // Reset token state
    this.isRefreshingToken = false
    this.lastTokenRefresh = null
    this.tokenExpiresAt = null
  }

  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET TOKEN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Set callbacks for token expiry events
   * Call this before connecting or after connection to handle token expiry
   *
   * @param callbacks - Callback functions for various token events
   *
   * @example
   * socketService.setTokenExpiryCallbacks({
   *   onTokenExpired: async (payload) => {
   *     const newToken = await refreshAccessToken();
   *     await socketService.refreshSocketToken(newToken);
   *   },
   *   onTokenInvalid: () => {
   *     logout();
   *     navigate('/sign-in');
   *   },
   * });
   */
  setTokenExpiryCallbacks(callbacks: SocketTokenExpiryCallbacks): void {
    this.tokenExpiryCallbacks = { ...this.tokenExpiryCallbacks, ...callbacks }
  }

  /**
   * Clear token expiry callbacks
   * Call this on logout to prevent stale callbacks
   */
  clearTokenExpiryCallbacks(): void {
    this.tokenExpiryCallbacks = {}
  }

  /**
   * Refresh socket's authentication token
   * Sends new token to server via auth:refresh_token event
   *
   * @param newToken - Fresh JWT access token
   * @returns Promise resolving to success/failure response
   *
   * Use cases:
   * 1. After HTTP token refresh - keep socket in sync
   * 2. When receiving auth:token_expired event
   * 3. Proactive refresh before token expires
   *
   * @example
   * // After HTTP token refresh
   * const result = await socketService.refreshSocketToken(newAccessToken);
   * if (result.success) {
   *   console.log('Socket token updated, expires:', result.expiresAt);
   * } else {
   *   console.error('Refresh failed:', result.error);
   *   // Reconnect with new token
   *   socketService.reconnectWithToken(newAccessToken);
   * }
   */
  async refreshSocketToken(newToken: string): Promise<SocketAuthRefreshTokenResponse> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.warn('[Socket] Cannot refresh token - socket not connected')
        resolve({ success: false, error: 'Socket not connected' })
        return
      }

      if (this.isRefreshingToken) {
        console.warn('[Socket] Token refresh already in progress')
        resolve({ success: false, error: 'Refresh already in progress' })
        return
      }

      if (!newToken || typeof newToken !== 'string') {
        console.error('[Socket] Invalid token provided for refresh')
        resolve({ success: false, error: 'Invalid token provided' })
        return
      }

      this.isRefreshingToken = true

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        this.isRefreshingToken = false
        console.error('[Socket] Token refresh timed out')
        resolve({ success: false, error: 'Refresh timeout' })
      }, 10000)

      this.socket.emit('auth:refresh_token', newToken, (response: SocketAuthRefreshTokenResponse) => {
        clearTimeout(timeout)
        this.isRefreshingToken = false

        if (response.success) {
          console.log('[Socket] Token refreshed successfully, expires:', response.expiresAt)
          this.lastTokenRefresh = new Date()
          if (response.expiresAt) {
            this.tokenExpiresAt = new Date(response.expiresAt)
          }
          this.tokenExpiryCallbacks.onTokenRefreshSuccess?.(response.expiresAt || '')
        } else {
          console.error('[Socket] Token refresh failed:', response.error)
          this.tokenExpiryCallbacks.onTokenRefreshFailed?.(response.error || 'Unknown error')
        }

        resolve(response)
      })
    })
  }

  /**
   * Reconnect socket with a new token
   * Use this when token refresh fails and you need to re-establish connection
   *
   * @param newToken - Fresh JWT access token
   *
   * @example
   * // After getting new token from HTTP refresh
   * socketService.reconnectWithToken(newAccessToken);
   */
  reconnectWithToken(newToken: string): void {
    if (!newToken || typeof newToken !== 'string') {
      console.error('[Socket] Cannot reconnect - invalid token')
      return
    }

    // Disconnect current socket
    if (this.socket) {
      this.socket.disconnect()
    }

    // Create new connection with fresh token
    // Note: We need to pass token in auth handshake
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      auth: {
        token: newToken,
      },
    })

    this.setupAuthEventHandlers()

    if (import.meta.env.DEV) {
      console.log('[Socket] Reconnecting with new token')
    }
  }

  /**
   * Check if socket token needs refresh
   * Returns true if token is close to expiry (within 2 minutes)
   */
  needsTokenRefresh(): boolean {
    if (!this.tokenExpiresAt) {
      return false // Unknown expiry, assume OK
    }

    const now = new Date()
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000)
    return this.tokenExpiresAt <= twoMinutesFromNow
  }

  /**
   * Get token expiry info
   */
  getTokenExpiryInfo(): { expiresAt: Date | null; lastRefresh: Date | null } {
    return {
      expiresAt: this.tokenExpiresAt,
      lastRefresh: this.lastTokenRefresh,
    }
  }

  /**
   * Throttle helper for high-frequency events
   */
  private shouldThrottle(key: string, throttleMs: number): boolean {
    const now = Date.now()
    const lastCall = this.typingThrottleMap.get(key)

    if (!lastCall || now - lastCall >= throttleMs) {
      this.typingThrottleMap.set(key, now)
      return false // Don't throttle
    }

    return true // Throttle
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // ==================== MESSAGING EVENTS ====================

  /**
   * Join a conversation
   */
  joinConversation(conversationId: string): void {
    if (!this.socket) return
    this.socket.emit('conversation:join', conversationId)
  }

  /**
   * Leave a conversation
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket) return
    this.socket.emit('conversation:leave', conversationId)
  }

  /**
   * Send message via socket
   */
  sendMessage(data: {
    conversationId: string
    content: string
    attachments?: any[]
  }): void {
    if (!this.socket) return
    this.socket.emit('message:send', data)
  }

  /**
   * Listen for new messages
   */
  onMessageReceive(
    callback: (data: { conversationId: string; message: any }) => void
  ): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('message:receive', callback)
    this.socket.on('message:receive', callback)
  }

  /**
   * Remove message receive listener
   */
  offMessageReceive(): void {
    if (!this.socket) return

    const handler = this.eventHandlers.get('message:receive')
    if (handler) {
      this.socket.off('message:receive', handler)
      this.eventHandlers.delete('message:receive')
    } else {
      // Fallback to remove all handlers for this event
      this.socket.off('message:receive')
    }
  }

  /**
   * Send typing indicator (throttled to prevent spam)
   */
  startTyping(data: {
    conversationId: string
    userId: string
    username: string
  }): void {
    if (!this.socket) return

    // Throttle typing indicators per conversation
    const throttleKey = `typing:${data.conversationId}`
    if (this.shouldThrottle(throttleKey, this.TYPING_THROTTLE_MS)) {
      return // Skip if called too frequently
    }

    this.socket.emit('typing:start', data)
  }

  /**
   * Stop typing indicator
   */
  stopTyping(data: { conversationId: string; userId: string }): void {
    if (!this.socket) return
    this.socket.emit('typing:stop', data)
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback: (data: { userId: string; username: string }) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('typing:show', callback)
    this.socket.on('typing:show', callback)
  }

  /**
   * Listen for stop typing
   */
  onStopTyping(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('typing:hide', callback)
    this.socket.on('typing:hide', callback)
  }

  /**
   * Remove typing listeners
   */
  offTyping(): void {
    if (!this.socket) return

    const showHandler = this.eventHandlers.get('typing:show')
    const hideHandler = this.eventHandlers.get('typing:hide')

    if (showHandler) {
      this.socket.off('typing:show', showHandler)
      this.eventHandlers.delete('typing:show')
    } else {
      this.socket.off('typing:show')
    }

    if (hideHandler) {
      this.socket.off('typing:hide', hideHandler)
      this.eventHandlers.delete('typing:hide')
    } else {
      this.socket.off('typing:hide')
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(data: { conversationId: string; userId: string }): void {
    if (!this.socket) return
    this.socket.emit('message:read', data)
  }

  /**
   * Listen for read receipts
   */
  onMessageRead(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('message:read', callback)
    this.socket.on('message:read', callback)
  }

  /**
   * Remove read receipt listener
   */
  offMessageRead(): void {
    if (!this.socket) return

    const handler = this.eventHandlers.get('message:read')
    if (handler) {
      this.socket.off('message:read', handler)
      this.eventHandlers.delete('message:read')
    } else {
      this.socket.off('message:read')
    }
  }

  // ==================== ONLINE PRESENCE ====================

  /**
   * Listen for user online status
   */
  onUserOnline(callback: (data: { userId: string; socketId: string }) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('user:online', callback)
    this.socket.on('user:online', callback)
  }

  /**
   * Listen for user offline status
   */
  onUserOffline(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('user:offline', callback)
    this.socket.on('user:offline', callback)
  }

  /**
   * Remove presence listeners
   */
  offPresence(): void {
    if (!this.socket) return

    const onlineHandler = this.eventHandlers.get('user:online')
    const offlineHandler = this.eventHandlers.get('user:offline')

    if (onlineHandler) {
      this.socket.off('user:online', onlineHandler)
      this.eventHandlers.delete('user:online')
    } else {
      this.socket.off('user:online')
    }

    if (offlineHandler) {
      this.socket.off('user:offline', offlineHandler)
      this.eventHandlers.delete('user:offline')
    } else {
      this.socket.off('user:offline')
    }
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Listen for new notifications
   */
  onNotification(callback: (notification: any) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('notification:new', callback)
    this.socket.on('notification:new', callback)
  }

  /**
   * Listen for notification count updates
   */
  onNotificationCount(callback: (data: { count: number }) => void): void {
    if (!this.socket) return

    // Store reference for proper cleanup
    this.eventHandlers.set('notification:count', callback)
    this.socket.on('notification:count', callback)
  }

  /**
   * Remove notification listeners
   */
  offNotifications(): void {
    if (!this.socket) return

    const newHandler = this.eventHandlers.get('notification:new')
    const countHandler = this.eventHandlers.get('notification:count')

    if (newHandler) {
      this.socket.off('notification:new', newHandler)
      this.eventHandlers.delete('notification:new')
    } else {
      this.socket.off('notification:new')
    }

    if (countHandler) {
      this.socket.off('notification:count', countHandler)
      this.eventHandlers.delete('notification:count')
    } else {
      this.socket.off('notification:count')
    }
  }

  // ==================== CLEANUP ====================

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    if (!this.socket) return
    this.socket.removeAllListeners()
  }
}

// Export singleton instance
export const socketService = new SocketService()
export default socketService
