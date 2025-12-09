/**
 * Socket Service
 * Handles all Socket.IO real-time communication
 */

import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'https://traf3li-backend.onrender.com'

class SocketService {
  private socket: Socket | null = null
  private userId: string | null = null

  /**
   * Initialize socket connection
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      return
    }

    this.userId = userId

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      // Join user session
      if (this.userId) {
        this.socket?.emit('user:join', this.userId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Disconnected:', reason)
      }
    })

    this.socket.on('connect_error', (error) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Connection error:', error.message)
      }
    })

    this.socket.on('error', (error) => {
      if (import.meta.env.DEV) {
        console.warn('[Socket] Error:', error)
      }
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
    this.socket.on('message:receive', callback)
  }

  /**
   * Remove message receive listener
   */
  offMessageReceive(): void {
    if (!this.socket) return
    this.socket.off('message:receive')
  }

  /**
   * Send typing indicator
   */
  startTyping(data: {
    conversationId: string
    userId: string
    username: string
  }): void {
    if (!this.socket) return
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
    this.socket.on('typing:show', callback)
  }

  /**
   * Listen for stop typing
   */
  onStopTyping(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return
    this.socket.on('typing:hide', callback)
  }

  /**
   * Remove typing listeners
   */
  offTyping(): void {
    if (!this.socket) return
    this.socket.off('typing:show')
    this.socket.off('typing:hide')
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
    this.socket.on('message:read', callback)
  }

  /**
   * Remove read receipt listener
   */
  offMessageRead(): void {
    if (!this.socket) return
    this.socket.off('message:read')
  }

  // ==================== ONLINE PRESENCE ====================

  /**
   * Listen for user online status
   */
  onUserOnline(callback: (data: { userId: string; socketId: string }) => void): void {
    if (!this.socket) return
    this.socket.on('user:online', callback)
  }

  /**
   * Listen for user offline status
   */
  onUserOffline(callback: (data: { userId: string }) => void): void {
    if (!this.socket) return
    this.socket.on('user:offline', callback)
  }

  /**
   * Remove presence listeners
   */
  offPresence(): void {
    if (!this.socket) return
    this.socket.off('user:online')
    this.socket.off('user:offline')
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Listen for new notifications
   */
  onNotification(callback: (notification: any) => void): void {
    if (!this.socket) return
    this.socket.on('notification:new', callback)
  }

  /**
   * Listen for notification count updates
   */
  onNotificationCount(callback: (data: { count: number }) => void): void {
    if (!this.socket) return
    this.socket.on('notification:count', callback)
  }

  /**
   * Remove notification listeners
   */
  offNotifications(): void {
    if (!this.socket) return
    this.socket.off('notification:new')
    this.socket.off('notification:count')
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
