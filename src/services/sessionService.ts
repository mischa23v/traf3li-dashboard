/**
 * Session Management Service
 * Handles active sessions, session termination, and suspicious activity detection
 */

import { apiClientNoVersion, handleApiError } from '@/lib/api'

const authApi = apiClientNoVersion

/**
 * Session Location Info
 */
export interface SessionLocation {
  country: string
  countryCode?: string
  city?: string
  region?: string
}

/**
 * Session Device Info
 */
export interface SessionDevice {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  browserVersion?: string
  os: string
  osVersion?: string
}

/**
 * Active Session
 */
export interface Session {
  id: string
  device: SessionDevice
  ip: string
  location?: SessionLocation
  createdAt: Date
  lastActivityAt: Date
  expiresAt?: Date
  isCurrent: boolean
  isSuspicious: boolean
  suspiciousReasons?: string[]
}

/**
 * Session Statistics
 */
export interface SessionStats {
  totalSessions: number
  activeSessions: number
  suspiciousSessions: number
  lastLoginAt?: Date
  lastLoginLocation?: SessionLocation
  loginHistory: Array<{
    timestamp: Date
    location: SessionLocation
    ip: string
    success: boolean
  }>
}

/**
 * Parse session from API response
 */
const parseSession = (session: any): Session => ({
  id: session.id,
  device: {
    type: session.device || 'unknown',
    browser: session.browser || 'Unknown',
    browserVersion: session.browserVersion,
    os: session.os || 'Unknown',
    osVersion: session.osVersion,
  },
  ip: session.ip,
  location: session.location,
  createdAt: new Date(session.createdAt),
  lastActivityAt: new Date(session.lastActivityAt),
  expiresAt: session.expiresAt ? new Date(session.expiresAt) : undefined,
  isCurrent: session.isCurrent || false,
  isSuspicious: session.isSuspicious || false,
  suspiciousReasons: session.suspiciousReasons,
})

/**
 * Session Service Object
 */
const sessionService = {
  /**
   * Get all active sessions for current user
   */
  getSessions: async (): Promise<Session[]> => {
    try {
      const response = await authApi.get<{ sessions: any[] }>(
        '/auth/sessions'
      )
      return response.data.sessions.map(parseSession)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current session details
   */
  getCurrentSession: async (): Promise<Session> => {
    try {
      const response = await authApi.get<any>('/auth/sessions/current')
      return parseSession(response.data)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Terminate a specific session
   *
   * @param sessionId - Session ID to terminate
   */
  terminateSession: async (sessionId: string): Promise<void> => {
    try {
      await authApi.delete(`/auth/sessions/${sessionId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Terminate all sessions except current
   */
  terminateAllOtherSessions: async (): Promise<{ count: number }> => {
    try {
      const response = await authApi.delete<{ count: number }>(
        '/auth/sessions'
      )
      return { count: response.data.count }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get session statistics
   */
  getStats: async (): Promise<SessionStats> => {
    try {
      const response = await authApi.get<SessionStats>('/auth/sessions/stats')
      return {
        ...response.data,
        lastLoginAt: response.data.lastLoginAt
          ? new Date(response.data.lastLoginAt)
          : undefined,
        loginHistory: response.data.loginHistory?.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })) || [],
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Report a session as suspicious
   *
   * @param sessionId - Session ID to report
   * @param reason - Reason for reporting
   */
  reportSuspicious: async (
    sessionId: string,
    reason: string
  ): Promise<void> => {
    try {
      await authApi.post(`/auth/sessions/${sessionId}/report`, { reason })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Extend current session
   * Call this on user activity to prevent idle timeout
   */
  extendSession: async (): Promise<{ expiresAt: Date }> => {
    try {
      const response = await authApi.post<{ expiresAt: string }>(
        '/auth/sessions/extend'
      )
      return { expiresAt: new Date(response.data.expiresAt) }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get device icon based on device type
   */
  getDeviceIcon: (deviceType: string): string => {
    switch (deviceType) {
      case 'desktop':
        return '💻'
      case 'mobile':
        return '📱'
      case 'tablet':
        return '📱'
      default:
        return '🖥️'
    }
  },

  /**
   * Format session date for display
   */
  formatDate: (date: Date, locale: string = 'ar-SA'): string => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  },

  /**
   * Get relative time (e.g., "منذ 5 دقائق")
   */
  getRelativeTime: (date: Date, locale: string = 'ar'): string => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return rtf.format(-days, 'day')
    }
    if (hours > 0) {
      return rtf.format(-hours, 'hour')
    }
    if (minutes > 0) {
      return rtf.format(-minutes, 'minute')
    }
    return rtf.format(-seconds, 'second')
  },
}

export default sessionService
