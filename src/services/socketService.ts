/**
 * Socket Service
 * Handles all Socket.IO real-time communication
 * Includes authentication error handling and session management
 * Optimized with throttling for high-frequency events
 */

import { io, Socket } from 'socket.io-client'
import type { SocketSessionExpiredEvent, SocketForceLogoutEvent } from '@/types/api'
import { sanitizeUrlParam } from '@/utils/redirectValidation'

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'https://traf3li-backend.onrender.com'

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
   */
  private setupAuthEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0
      // Join user session
      if (this.userId) {
        this.socket?.emit('user:join', this.userId)
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

      // Handle authentication errors
      if (
        error.message.includes('Authentication') ||
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      ) {
        // Redirect to login
        window.location.href = '/sign-in?reason=socket_auth_failed'
      }
    })

    this.socket.on('error', (error) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Error:', error)
      }
    })

    // Handle session expiry via socket
    this.socket.on('session:expired', (data: SocketSessionExpiredEvent) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Session expired:', data.reason)
      }
      const sanitizedReason = sanitizeUrlParam(data.reason || 'session_expired')
      window.location.href = `/sign-in?reason=${sanitizedReason}`
    })

    // Handle forced logout (e.g., account locked, permission revoked)
    this.socket.on('force:logout', (data: SocketForceLogoutEvent) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Forced logout:', data.reason)
      }
      const sanitizedReason = sanitizeUrlParam(data.reason || 'forced')
      window.location.href = `/sign-in?reason=${sanitizedReason}`
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
