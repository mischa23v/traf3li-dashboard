/**
 * Sessions API Service
 * Manages user login sessions and devices
 * NCA ECC 2-2-3 Compliance
 */

import { apiClient } from '@/lib/api'

/**
 * Session interface matching backend response
 */
export interface Session {
  id: string
  userId: string
  device: string
  deviceEn?: string
  browser: string
  os: string
  ip: string
  location?: string
  locationEn?: string
  country?: string
  city?: string
  isCurrent: boolean
  createdAt: string
  lastActiveAt: string
  expiresAt: string
}

/**
 * Sessions list response
 */
export interface SessionsResponse {
  success: boolean
  data: {
    sessions: Session[]
    totalCount: number
  }
}

/**
 * Get all active sessions for the current user
 */
export async function getActiveSessions(): Promise<SessionsResponse> {
  try {
    const response = await apiClient.get('/auth/sessions')
    return response.data
  } catch (error: any) {
    // Return empty array on error to prevent UI crash
    console.error('Failed to fetch sessions:', error)
    return {
      success: false,
      data: {
        sessions: [],
        totalCount: 0,
      },
    }
  }
}

/**
 * Revoke (end) a specific session
 */
export async function revokeSession(sessionId: string): Promise<{
  success: boolean
  message: string
}> {
  const response = await apiClient.delete(`/auth/sessions/${sessionId}`)
  return response.data
}

/**
 * Revoke all sessions except the current one
 */
export async function revokeAllSessions(): Promise<{
  success: boolean
  message: string
  revokedCount: number
}> {
  const response = await apiClient.delete('/auth/sessions')
  return response.data
}

/**
 * Format session last active time
 */
export function formatLastActive(lastActiveAt: string, isRTL: boolean): string {
  const now = new Date()
  const lastActive = new Date(lastActiveAt)
  const diffMs = now.getTime() - lastActive.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) {
    return isRTL ? 'الآن' : 'Now'
  } else if (diffMinutes < 60) {
    return isRTL
      ? `منذ ${diffMinutes} دقيقة`
      : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return isRTL
      ? `منذ ${diffHours} ساعة`
      : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    return isRTL
      ? `منذ ${diffDays} يوم`
      : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
}

/**
 * Format device string from session data
 */
export function formatDevice(session: Session, isRTL: boolean): string {
  if (isRTL && session.device) {
    return session.device
  }
  if (!isRTL && session.deviceEn) {
    return session.deviceEn
  }
  // Fallback: construct from browser and OS
  return `${session.browser} on ${session.os}`
}

/**
 * Format location string from session data
 */
export function formatLocation(session: Session, isRTL: boolean): string {
  if (isRTL && session.location) {
    return session.location
  }
  if (!isRTL && session.locationEn) {
    return session.locationEn
  }
  // Fallback: construct from city and country
  if (session.city && session.country) {
    return `${session.city}, ${session.country}`
  }
  return session.country || session.city || 'Unknown'
}

export default {
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  formatLastActive,
  formatDevice,
  formatLocation,
}
