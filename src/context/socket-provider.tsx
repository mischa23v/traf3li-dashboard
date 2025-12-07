/**
 * Socket Provider
 * Provides Socket.IO connection and real-time notification handling
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'https://api.traf3li.com'

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

  const { user, isAuthenticated } = useAuthStore()

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
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

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)

      // Join user session
      newSocket.emit('user:join', user._id)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Notification events
    newSocket.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    newSocket.on('notificationCount', (count: number) => {
      setUnreadCount(count)
    })

    newSocket.on('notificationsRead', () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
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
