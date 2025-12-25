/**
 * Step-Up Authentication Hooks
 * React hooks for reauthentication flows
 */

import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import stepUpAuthService, {
  type ReauthStatus,
  type ReauthMethod,
} from '@/services/stepUpAuthService'

// Query keys
export const stepUpAuthKeys = {
  all: ['stepUpAuth'] as const,
  status: () => [...stepUpAuthKeys.all, 'status'] as const,
  methods: () => [...stepUpAuthKeys.all, 'methods'] as const,
}

/**
 * Hook to check reauthentication status
 */
export function useReauthStatus(enabled = true) {
  return useQuery<ReauthStatus>({
    queryKey: stepUpAuthKeys.status(),
    queryFn: () => stepUpAuthService.checkStatus(),
    enabled,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  })
}

/**
 * Hook to get available reauthentication methods
 */
export function useReauthMethods(enabled = true) {
  return useQuery<ReauthMethod[]>({
    queryKey: stepUpAuthKeys.methods(),
    queryFn: () => stepUpAuthService.getAvailableMethods(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to reauthenticate with password
 */
export function useReauthWithPassword() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (password: string) => stepUpAuthService.withPassword(password),
    onSuccess: () => {
      toast.success(t('auth.reauthenticated', 'تم التحقق بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.invalidPassword', 'كلمة المرور غير صحيحة'))
    },
  })
}

/**
 * Hook to reauthenticate with TOTP
 */
export function useReauthWithTOTP() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (code: string) => stepUpAuthService.withTOTP(code),
    onSuccess: () => {
      toast.success(t('auth.reauthenticated', 'تم التحقق بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('mfa.verify.invalidCode', 'رمز التحقق غير صحيح'))
    },
  })
}

/**
 * Hook to request OTP for reauthentication
 */
export function useRequestReauthChallenge() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      method,
      purpose,
    }: {
      method?: 'email' | 'sms'
      purpose?: string
    }) => stepUpAuthService.requestChallenge(method, purpose),
    onSuccess: (data) => {
      toast.success(t('auth.codeSent', 'تم إرسال رمز التحقق'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.sendCodeError', 'فشل إرسال الرمز'))
    },
  })
}

/**
 * Hook to verify OTP for reauthentication
 */
export function useVerifyReauthChallenge() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (code: string) => stepUpAuthService.verifyChallenge(code),
    onSuccess: () => {
      toast.success(t('auth.reauthenticated', 'تم التحقق بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.invalidCode', 'رمز التحقق غير صحيح'))
    },
  })
}

/**
 * Hook to manage step-up authentication flow
 * Wraps protected actions with reauthentication
 */
export function useStepUpAuth() {
  const [showReauthModal, setShowReauthModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => Promise<any>) | null>(null)
  const [pendingPurpose, setPendingPurpose] = useState<string>('')
  const { data: status } = useReauthStatus()

  /**
   * Execute an action with step-up authentication
   * If reauthentication is required, shows modal first
   */
  const executeWithReauth = useCallback(
    async <T>(
      action: () => Promise<T>,
      purpose: string = 'sensitive_operation'
    ): Promise<T | null> => {
      try {
        // Try to execute the action
        return await action()
      } catch (error: any) {
        // Check if reauthentication is required
        if (error?.code === 'REAUTHENTICATION_REQUIRED') {
          // Store the action to retry after reauth
          setPendingAction(() => action)
          setPendingPurpose(purpose)
          setShowReauthModal(true)
          return null
        }
        throw error
      }
    },
    []
  )

  /**
   * Called when reauthentication succeeds
   */
  const handleReauthSuccess = useCallback(async () => {
    setShowReauthModal(false)
    if (pendingAction) {
      try {
        const result = await pendingAction()
        setPendingAction(null)
        setPendingPurpose('')
        return result
      } catch (error) {
        console.error('Failed to execute pending action after reauth:', error)
        throw error
      }
    }
  }, [pendingAction])

  /**
   * Called when reauthentication is cancelled
   */
  const handleReauthCancel = useCallback(() => {
    setShowReauthModal(false)
    setPendingAction(null)
    setPendingPurpose('')
  }, [])

  return {
    showReauthModal,
    setShowReauthModal,
    executeWithReauth,
    handleReauthSuccess,
    handleReauthCancel,
    pendingPurpose,
    isRecentlyAuthenticated: status?.isRecent ?? false,
  }
}

export default {
  useReauthStatus,
  useReauthMethods,
  useReauthWithPassword,
  useReauthWithTOTP,
  useRequestReauthChallenge,
  useVerifyReauthChallenge,
  useStepUpAuth,
}
