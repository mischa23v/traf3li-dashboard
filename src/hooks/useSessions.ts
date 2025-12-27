/**
 * Sessions React Hooks
 * Provides React Query-based hooks for session management
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  type Session,
} from '@/services/sessions.service'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'

// Query keys for sessions
export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
}

/**
 * Hook to get active sessions
 */
export function useActiveSessions(enabled = true) {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: getActiveSessions,
    enabled,
    staleTime: CACHE_TIMES.REALTIME.LIVE_FEED, // 30 seconds
    retry: 1,
    select: (data) => data.data.sessions,
  })
}

/**
 * Hook to revoke a specific session
 */
export function useRevokeSession() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      toast.success(t('security.sessions.sessionEnded'))
      invalidateCache.sessions.list()
    },
    onError: (error: any) => {
      toast.error(error.message || t('security.sessions.endSessionError'))
    },
  })
}

/**
 * Hook to revoke all sessions except current
 */
export function useRevokeAllSessions() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: (data) => {
      toast.success(
        t('security.sessions.allSessionsEnded', { count: data.revokedCount })
      )
      invalidateCache.sessions.list()
    },
    onError: (error: any) => {
      toast.error(error.message || t('security.sessions.endAllSessionsError'))
    },
  })
}

export default {
  useActiveSessions,
  useRevokeSession,
  useRevokeAllSessions,
}
