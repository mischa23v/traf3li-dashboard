/**
 * MFA React Hooks
 * Provides React Query-based hooks for MFA operations
 *
 * Backend: /api/auth/mfa/*
 * Only TOTP supported (no SMS/email)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import * as React from 'react'
import { CACHE_TIMES } from '@/config/cache'

import {
  setupMFA,
  verifyMFASetup,
  verifyMFA,
  getMFAStatus,
  disableMFA,
  regenerateBackupCodes,
  verifyBackupCode,
  getBackupCodesCount,
  checkMFARequirement,
  type MFASetupResponse,
  type MFAVerifySetupResponse,
  type MFAVerifyResponse,
  type MFAStatusResponse,
  type BackupCodeVerifyResponse,
  type BackupCodesRegenerateResponse,
  type BackupCodesCountResponse,
} from '@/services/mfa.service'
import {
  isMFARequired,
  isMFARecommended,
  needsMFAForAction,
  hasMFASession,
  getMFASessionRemaining,
  setMFASession,
  clearMFASession,
} from '@/lib/mfa-enforcement'

// Query keys for MFA
export const mfaKeys = {
  all: ['mfa'] as const,
  status: () => [...mfaKeys.all, 'status'] as const,
  requirement: () => [...mfaKeys.all, 'requirement'] as const,
  backupCodesCount: () => [...mfaKeys.all, 'backup-codes-count'] as const,
}

/**
 * Hook to get MFA status
 */
export function useMFAStatus(enabled = true) {
  return useQuery({
    queryKey: mfaKeys.status(),
    queryFn: getMFAStatus,
    enabled,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to check MFA requirement for user
 */
export function useMFARequirement(enabled = true) {
  return useQuery({
    queryKey: mfaKeys.requirement(),
    queryFn: checkMFARequirement,
    enabled,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to get backup codes count
 */
export function useBackupCodesCount(enabled = true) {
  return useQuery({
    queryKey: mfaKeys.backupCodesCount(),
    queryFn: getBackupCodesCount,
    enabled,
    staleTime: CACHE_TIMES.MEDIUM,
    retry: 1,
  })
}

/**
 * Hook to setup MFA (generates QR code)
 * POST /api/auth/mfa/setup - no body required
 */
export function useSetupMFA() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => setupMFA(),
    onError: (error: any) => {
      const message = error.response?.data?.messageEn || error.response?.data?.message
      toast.error(message || t('mfa.errors.setupFailed'))
    },
  })
}

/**
 * Hook to verify MFA setup (enables MFA)
 * POST /api/auth/mfa/verify-setup { token }
 */
export function useVerifyMFASetup() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => verifyMFASetup(token),
    onSuccess: (data) => {
      if (!data.error && data.enabled) {
        toast.success(t('mfa.setup.setupComplete'))
        queryClient.invalidateQueries({ queryKey: mfaKeys.status() })
        queryClient.invalidateQueries({ queryKey: mfaKeys.requirement() })
        queryClient.invalidateQueries({ queryKey: mfaKeys.backupCodesCount() })
      }
    },
    onError: (error: any) => {
      const code = error.response?.data?.code
      if (code === 'INVALID_TOKEN') {
        toast.error(t('mfa.verify.invalidCode'))
      } else {
        const message = error.response?.data?.messageEn || error.response?.data?.message
        toast.error(message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to verify MFA for login
 * POST /api/auth/mfa/verify { userId, token }
 */
export function useVerifyMFA() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      verifyMFA(userId, token),
    onError: (error: any) => {
      const code = error.response?.data?.code
      if (code === 'INVALID_TOKEN') {
        toast.error(t('mfa.verify.invalidCode'))
      } else if (code === 'AUTH_RATE_LIMIT_EXCEEDED') {
        toast.error(t('mfa.verify.tooManyAttempts'))
      } else {
        const message = error.response?.data?.messageEn || error.response?.data?.message
        toast.error(message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to disable MFA
 * POST /api/auth/mfa/disable { password }
 */
export function useDisableMFA() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) => disableMFA(password),
    onSuccess: (data) => {
      if (!data.error && data.disabled) {
        toast.success(t('mfa.disable.disabled'))
        queryClient.invalidateQueries({ queryKey: mfaKeys.status() })
        queryClient.invalidateQueries({ queryKey: mfaKeys.requirement() })
        queryClient.invalidateQueries({ queryKey: mfaKeys.backupCodesCount() })
      }
    },
    onError: (error: any) => {
      const code = error.response?.data?.code
      if (code === 'INVALID_PASSWORD') {
        toast.error(t('mfa.disable.invalidPassword'))
      } else {
        const message = error.response?.data?.messageEn || error.response?.data?.message
        toast.error(message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to regenerate backup codes
 * POST /api/auth/mfa/backup-codes/regenerate - no body
 */
export function useRegenerateBackupCodes() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => regenerateBackupCodes(),
    onSuccess: () => {
      toast.success(t('mfa.backup.regenerate'))
      queryClient.invalidateQueries({ queryKey: mfaKeys.backupCodesCount() })
    },
    onError: (error: any) => {
      const message = error.response?.data?.messageEn || error.response?.data?.message
      toast.error(message || t('mfa.errors.verificationFailed'))
    },
  })
}

/**
 * Hook to verify using backup code
 * POST /api/auth/mfa/backup-codes/verify { userId, code }
 */
export function useVerifyBackupCode() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) =>
      verifyBackupCode(userId, code),
    onSuccess: (data) => {
      if (data.remainingCodes <= 2 && data.warning) {
        toast.warning(t('mfa.backup.lowCodesWarning'))
      }
      queryClient.invalidateQueries({ queryKey: mfaKeys.backupCodesCount() })
    },
    onError: (error: any) => {
      const code = error.response?.data?.code
      if (code === 'INVALID_CODE') {
        toast.error(t('mfa.errors.invalidBackupCode'))
      } else if (code === 'INVALID_FORMAT') {
        toast.error(t('mfa.errors.invalidBackupFormat'))
      } else {
        const message = error.response?.data?.messageEn || error.response?.data?.message
        toast.error(message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to manage MFA verification state for protected actions
 */
export function useMFAProtection(action: string) {
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null)
  const { data: mfaStatus } = useMFAStatus()

  const mfaEnabled = mfaStatus?.mfaEnabled ?? false

  /**
   * Check if MFA is required for this action and trigger verification if needed
   */
  const requireMFA = React.useCallback(
    (callback: () => void) => {
      // Check if action needs MFA
      if (!needsMFAForAction(action, mfaEnabled)) {
        callback()
        return
      }

      // Check if we have a valid MFA session
      if (hasMFASession()) {
        callback()
        return
      }

      // Show MFA modal
      setPendingAction(() => callback)
      setShowModal(true)
    },
    [action, mfaEnabled]
  )

  /**
   * Called when MFA verification succeeds
   */
  const onVerified = React.useCallback(() => {
    setShowModal(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }, [pendingAction])

  /**
   * Called when MFA verification is cancelled
   */
  const onCancel = React.useCallback(() => {
    setShowModal(false)
    setPendingAction(null)
  }, [])

  return {
    requireMFA,
    showModal,
    setShowModal,
    onVerified,
    onCancel,
    isVerifying,
    action,
    mfaEnabled,
  }
}

/**
 * Hook to check MFA session status
 */
export function useMFASession() {
  const [hasSession, setHasSession] = React.useState(hasMFASession())
  const [remaining, setRemaining] = React.useState(getMFASessionRemaining())

  // Update session status periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setHasSession(hasMFASession())
      setRemaining(getMFASessionRemaining())
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    hasSession,
    remaining,
    setSession: setMFASession,
    clearSession: clearMFASession,
  }
}

/**
 * Hook to check if MFA is required/recommended for user's role
 */
export function useMFARoleRequirement(role?: string) {
  return React.useMemo(
    () => ({
      isRequired: role ? isMFARequired(role) : false,
      isRecommended: role ? isMFARecommended(role) : false,
    }),
    [role]
  )
}

export default {
  useMFAStatus,
  useMFARequirement,
  useBackupCodesCount,
  useSetupMFA,
  useVerifyMFASetup,
  useVerifyMFA,
  useDisableMFA,
  useRegenerateBackupCodes,
  useVerifyBackupCode,
  useMFAProtection,
  useMFASession,
  useMFARoleRequirement,
}
