/**
 * MFA React Hooks
 * Provides React Query-based hooks for MFA operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import * as React from 'react'

import {
  setupMFA,
  verifyMFASetup,
  verifyMFA,
  getMFAStatus,
  disableMFA,
  requestMFACode,
  regenerateBackupCodes,
  verifyBackupCode,
  checkMFARequirement,
  type MFASetupResponse,
  type MFAVerifyResponse,
  type MFAStatusResponse,
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
}

/**
 * Hook to get MFA status
 */
export function useMFAStatus(enabled = true) {
  return useQuery({
    queryKey: mfaKeys.status(),
    queryFn: getMFAStatus,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to setup MFA
 */
export function useSetupMFA() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (method: 'totp' | 'sms' | 'email' = 'totp') => setupMFA(method),
    onError: (error: any) => {
      toast.error(error.message || t('mfa.errors.setupFailed'))
    },
  })
}

/**
 * Hook to verify MFA setup (enable MFA)
 */
export function useVerifyMFASetup() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => verifyMFASetup(code),
    onSuccess: (data) => {
      if (data.success && data.data.verified) {
        toast.success(t('mfa.setup.setupComplete'))
        queryClient.invalidateQueries({ queryKey: mfaKeys.status() })
        queryClient.invalidateQueries({ queryKey: mfaKeys.requirement() })
      }
    },
    onError: (error: any) => {
      if (error.code === 'INVALID_CODE') {
        toast.error(t('mfa.verify.invalidCode'))
      } else {
        toast.error(error.message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to verify MFA for protected actions
 */
export function useVerifyMFA() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ code, action }: { code: string; action?: string }) =>
      verifyMFA(code, action),
    onError: (error: any) => {
      if (error.code === 'INVALID_CODE') {
        toast.error(t('mfa.verify.invalidCode'))
      } else if (error.code === 'TOO_MANY_ATTEMPTS') {
        toast.error(t('mfa.verify.tooManyAttempts'))
      } else {
        toast.error(error.message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to disable MFA
 */
export function useDisableMFA() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ code, password }: { code: string; password: string }) =>
      disableMFA(code, password),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t('mfa.disable.disabled'))
        queryClient.invalidateQueries({ queryKey: mfaKeys.status() })
        queryClient.invalidateQueries({ queryKey: mfaKeys.requirement() })
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('mfa.errors.verificationFailed'))
    },
  })
}

/**
 * Hook to request SMS/Email MFA code
 */
export function useRequestMFACode() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (method: 'sms' | 'email') => requestMFACode(method),
    onSuccess: () => {
      toast.success(t('mfa.verify.resendCode'))
    },
    onError: (error: any) => {
      toast.error(error.message || t('mfa.errors.verificationFailed'))
    },
  })
}

/**
 * Hook to regenerate backup codes
 */
export function useRegenerateBackupCodes() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (code: string) => regenerateBackupCodes(code),
    onSuccess: () => {
      toast.success(t('mfa.backup.regenerate'))
    },
    onError: (error: any) => {
      if (error.code === 'INVALID_CODE') {
        toast.error(t('mfa.verify.invalidCode'))
      } else {
        toast.error(error.message || t('mfa.errors.verificationFailed'))
      }
    },
  })
}

/**
 * Hook to verify using backup code
 */
export function useVerifyBackupCode() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (backupCode: string) => verifyBackupCode(backupCode),
    onError: (error: any) => {
      if (error.code === 'INVALID_BACKUP_CODE') {
        toast.error(t('mfa.errors.invalidBackupCode'))
      } else if (error.code === 'BACKUP_CODE_USED') {
        toast.error(t('mfa.errors.backupCodeUsed'))
      } else {
        toast.error(error.message || t('mfa.errors.verificationFailed'))
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

  const mfaEnabled = mfaStatus?.data?.enabled ?? false

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
  useSetupMFA,
  useVerifyMFASetup,
  useVerifyMFA,
  useDisableMFA,
  useRequestMFACode,
  useRegenerateBackupCodes,
  useVerifyBackupCode,
  useMFAProtection,
  useMFASession,
  useMFARoleRequirement,
}
