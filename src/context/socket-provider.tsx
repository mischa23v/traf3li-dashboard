/**
 * Socket Provider
 * Provides Socket.IO connection and real-time notification handling
 * Optimized with batching and throttling for high-frequency events
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'
import { getWsUrl } from '@/config/api'

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

  // Refs for batching and throttling
  const pendingNotifications = useRef<Notification[]>([])
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCountUpdate = useRef<number>(0)
  const COUNT_THROTTLE_MS = 500 // Throttle count updates to max once per 500ms
  const BATCH_DELAY_MS = 100 // Batch notifications every 100ms

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

    // Register event handlers
    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connect_error', handleConnectError)
    newSocket.on('notification', handleNotification)
    newSocket.on('notificationCount', handleNotificationCount)
    newSocket.on('notificationsRead', handleNotificationsRead)

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
      newSocket.off('connect_error', handleConnectError)
      newSocket.off('notification', handleNotification)
      newSocket.off('notificationCount', handleNotificationCount)
      newSocket.off('notificationsRead', handleNotificationsRead)

      newSocket.disconnect()
    }
  }, [isAuthenticated, user?._id])

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
