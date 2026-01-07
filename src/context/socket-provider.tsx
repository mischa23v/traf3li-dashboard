/**
 * Socket Provider
 * Provides Socket.IO connection and real-time notification handling
 * Optimized with batching and throttling for high-frequency events
 *
 * WebSocket Token Expiry Feature:
 * - Listens for auth:token_expired and auth:token_invalid events
 * - Automatically attempts token refresh when token expires
 * - Handles graceful logout when token is invalid/revoked
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getWsUrl } from '@/config/api'
import { getAccessToken } from '@/lib/api'
import { tokenRefreshEvents } from '@/lib/token-refresh-events'
import type {
  SocketAuthTokenExpiredPayload,
  SocketAuthTokenInvalidPayload,
  SocketAuthRefreshTokenResponse,
  SocketAuthErrorCode,
} from '@/types/api'

const SOCKET_URL = getWsUrl()

// Notification types
export interface Notification {
  _id: string
  title: string
  titleAr?: string
  message: string
  messageAr?: string
  type: 'task_reminder' | 'hearing_reminder' | 'case_update' | 'message' | 'payment' | 'general'
  link?: string
  icon?: string
  read: boolean
  createdAt: string
}

// Socket context type
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  // Token refresh methods
  refreshSocketToken: (newToken: string) => Promise<SocketAuthRefreshTokenResponse>
  reconnectWithToken: (newToken: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  // Refs for batching and throttling
  const pendingNotifications = useRef<Notification[]>([])
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCountUpdate = useRef<number>(0)
  const COUNT_THROTTLE_MS = 500 // Throttle count updates to max once per 500ms
  const BATCH_DELAY_MS = 100 // Batch notifications every 100ms

  // Ref to track if we're currently refreshing token
  const isRefreshingToken = useRef(false)

  /**
   * Helper function to refresh socket token
   * Extracted to be reusable within and outside useEffect
   */
  const refreshSocketTokenImpl = useCallback((
    socketInstance: Socket,
    newToken: string
  ): Promise<SocketAuthRefreshTokenResponse> => {
    return new Promise((resolve) => {
      if (!socketInstance?.connected) {
        resolve({ success: false, error: 'Socket not connected' })
        return
      }

      if (!newToken || typeof newToken !== 'string') {
        resolve({ success: false, error: 'Invalid token provided' })
        return
      }

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Refresh timeout' })
      }, 10000)

      socketInstance.emit('auth:refresh_token', newToken, (response: SocketAuthRefreshTokenResponse) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })
  }, [])

  /**
   * Refresh socket token - exposed to consumers
   */
  const refreshSocketToken = useCallback(async (newToken: string): Promise<SocketAuthRefreshTokenResponse> => {
    if (!socket) {
      return { success: false, error: 'Socket not initialized' }
    }
    return refreshSocketTokenImpl(socket, newToken)
  }, [socket, refreshSocketTokenImpl])

  /**
   * Reconnect socket with a new token
   * Use when token refresh fails and need to re-establish connection
   */
  const reconnectWithToken = useCallback((newToken: string): void => {
    if (!newToken || typeof newToken !== 'string') {
      console.error('[Socket Provider] Cannot reconnect - invalid token')
      return
    }

    // Disconnect current socket
    if (socket) {
      socket.disconnect()
    }

    // The useEffect will handle reconnection when socket state changes
    // We just need to trigger a re-render by setting socket to null
    setSocket(null)
    setIsConnected(false)

    // Note: The new connection will be created automatically by the useEffect
    // when isAuthenticated and user._id are available
    console.log('[Socket Provider] Socket disconnected, will reconnect automatically')
  }, [socket])

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      // Clear any pending batches
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }
      pendingNotifications.current = []
      return
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Flush pending notifications to state
    const flushNotifications = () => {
      if (pendingNotifications.current.length > 0) {
        const toAdd = [...pendingNotifications.current]
        pendingNotifications.current = []

        setNotifications((prev) => [...toAdd, ...prev])
        setUnreadCount((prev) => prev + toAdd.filter(n => !n.read).length)
      }
      batchTimeoutRef.current = null
    }

    // Stable handler for connection
    const handleConnect = () => {
      setIsConnected(true)
      // Join user session
      newSocket.emit('user:join', user._id)
    }

    // Stable handler for disconnect
    const handleDisconnect = () => {
      setIsConnected(false)
    }

    // Stable handler for connection error
    const handleConnectError = () => {
      setIsConnected(false)
    }

    // Stable handler for new notifications (with batching)
    const handleNotification = (notification: Notification) => {
      pendingNotifications.current.push(notification)

      // Schedule batch flush if not already scheduled
      if (!batchTimeoutRef.current) {
        batchTimeoutRef.current = setTimeout(flushNotifications, BATCH_DELAY_MS)
      }
    }

    // Stable handler for notification count (with throttling)
    const handleNotificationCount = (count: number) => {
      const now = Date.now()
      const timeSinceLastUpdate = now - lastCountUpdate.current

      if (timeSinceLastUpdate >= COUNT_THROTTLE_MS) {
        setUnreadCount(count)
        lastCountUpdate.current = now
      } else {
        // Schedule delayed update
        setTimeout(() => {
          setUnreadCount(count)
          lastCountUpdate.current = Date.now()
        }, COUNT_THROTTLE_MS - timeSinceLastUpdate)
      }
    }

    // Stable handler for notifications read
    const handleNotificationsRead = () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    }

    // ═══════════════════════════════════════════════════════════════
    // TOKEN EXPIRY EVENT HANDLERS
    // Server checks token validity every 60 seconds
    // ═══════════════════════════════════════════════════════════════

    /**
     * Handle token expired event
     * Token TTL exceeded - attempt refresh
     */
    const handleTokenExpired = async (payload: SocketAuthTokenExpiredPayload) => {
      console.warn('[Socket Provider] Token expired:', payload.message)

      // Don't attempt refresh if already in progress
      if (isRefreshingToken.current) {
        console.log('[Socket Provider] Token refresh already in progress, skipping')
        return
      }

      isRefreshingToken.current = true

      try {
        // Get current access token - the HTTP layer should have already refreshed it
        // via the automatic token refresh mechanism
        const currentToken = getAccessToken()

        if (currentToken) {
          // Try to update socket with current token
          const result = await refreshSocketTokenImpl(newSocket, currentToken)

          if (result.success) {
            console.log('[Socket Provider] Socket token refreshed successfully')
            toast.success('تم تحديث الجلسة بنجاح', {
              description: 'Session refreshed successfully',
              duration: 2000,
            })
          } else {
            console.warn('[Socket Provider] Socket token refresh failed:', result.error)
            // Token refresh failed - show warning but don't logout yet
            // The user can continue using the app, and next API call may trigger logout
            toast.warning('جلستك على وشك الانتهاء', {
              description: 'Your session is about to expire. Please save your work.',
              duration: 5000,
            })
          }
        } else {
          console.warn('[Socket Provider] No access token available for socket refresh')
          // No token available - this shouldn't happen normally
          // The HTTP layer should handle token refresh
        }
      } catch (error) {
        console.error('[Socket Provider] Error refreshing socket token:', error)
      } finally {
        isRefreshingToken.current = false
      }
    }

    /**
     * Handle token invalid event
     * Token was revoked or tampered with - must re-authenticate
     */
    const handleTokenInvalid = (payload: SocketAuthTokenInvalidPayload) => {
      console.error('[Socket Provider] Token invalid:', payload.message)

      // Token is invalid - must logout
      toast.error('تم إنهاء جلستك', {
        description: 'Your session has been terminated. Please log in again.',
        duration: 5000,
      })

      // Disconnect socket and logout
      newSocket.disconnect()
      logout()

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/sign-in?reason=token_invalid'
      }, 1500)
    }

    /**
     * Handle connection errors with specific auth error codes
     */
    const handleConnectErrorWithAuth = (error: Error) => {
      handleConnectError()

      const errorCode = error.message as SocketAuthErrorCode

      switch (errorCode) {
        case 'AUTHENTICATION_REQUIRED':
        case 'AUTHENTICATION_FAILED':
          console.error('[Socket Provider] Authentication failed:', errorCode)
          toast.error('فشل الاتصال بالخادم', {
            description: 'Authentication failed. Please log in again.',
            duration: 5000,
          })
          break

        case 'INVALID_TOKEN':
          console.warn('[Socket Provider] Invalid token on connect')
          // Token might be expired - HTTP layer should handle refresh
          // Don't logout here, let the HTTP interceptor handle it
          break

        case 'USER_NOT_FOUND':
        case 'USER_DISABLED':
          console.error('[Socket Provider] User issue:', errorCode)
          toast.error('حدثت مشكلة في حسابك', {
            description: errorCode === 'USER_DISABLED'
              ? 'Your account has been disabled.'
              : 'User not found. Please log in again.',
            duration: 5000,
          })
          logout()
          break
      }
    }

    // Register event handlers
    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connect_error', handleConnectErrorWithAuth)
    newSocket.on('notification', handleNotification)
    newSocket.on('notificationCount', handleNotificationCount)
    newSocket.on('notificationsRead', handleNotificationsRead)

    // Register token expiry event handlers
    newSocket.on('auth:token_expired', handleTokenExpired)
    newSocket.on('auth:token_invalid', handleTokenInvalid)

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      // Flush any pending notifications before cleanup
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        flushNotifications()
      }

      // Remove event listeners with stable references
      newSocket.off('connect', handleConnect)
      newSocket.off('disconnect', handleDisconnect)
      newSocket.off('connect_error', handleConnectErrorWithAuth)
      newSocket.off('notification', handleNotification)
      newSocket.off('notificationCount', handleNotificationCount)
      newSocket.off('notificationsRead', handleNotificationsRead)

      // Remove token expiry event listeners
      newSocket.off('auth:token_expired', handleTokenExpired)
      newSocket.off('auth:token_invalid', handleTokenInvalid)

      newSocket.disconnect()
    }
  }, [isAuthenticated, user?._id, logout, refreshSocketTokenImpl])

  // ═══════════════════════════════════════════════════════════════
  // HTTP TOKEN REFRESH SYNCHRONIZATION
  // Automatically update socket token when HTTP token is refreshed
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // Only subscribe if socket is connected
    if (!socket?.connected) {
      return
    }

    // Subscribe to token refresh events from HTTP layer
    const unsubscribe = tokenRefreshEvents.subscribe(async (newToken, expiresIn) => {
      if (!socket?.connected) {
        console.log('[Socket Provider] Received token refresh event but socket not connected')
        return
      }

      console.log('[Socket Provider] HTTP token refreshed, updating socket token...')

      try {
        const result = await refreshSocketTokenImpl(socket, newToken)

        if (result.success) {
          console.log('[Socket Provider] Socket token synchronized with HTTP token')
          if (import.meta.env.DEV) {
            console.log('[Socket Provider] New token expires at:', result.expiresAt)
          }
        } else {
          console.warn('[Socket Provider] Failed to sync socket token:', result.error)
          // Don't show toast for automatic sync failures - it would be noisy
          // The auth:token_expired event will handle graceful recovery
        }
      } catch (error) {
        console.error('[Socket Provider] Error syncing socket token:', error)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [socket, refreshSocketTokenImpl])

  // Add notification manually
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  // Mark single notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    // Emit to server
    socket?.emit('notification:read', notificationId)
  }, [socket])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
    setUnreadCount(0)

    // Emit to server
    socket?.emit('notifications:readAll')
  }, [socket])

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    // Token refresh methods
    refreshSocketToken,
    reconnectWithToken,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook to use socket context
export function useSocket() {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }

  return context
}

// Hook for just notifications
export function useNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSocket()

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }
}

export default SocketProvider
