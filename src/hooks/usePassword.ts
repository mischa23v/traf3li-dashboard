/**
 * Password Management Hooks
 * React hooks for password operations
 */

import { useState, useMemo, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import passwordService, {
  type PasswordStatus,
  type PasswordStrength,
} from '@/services/passwordService'

// Query keys
export const passwordKeys = {
  all: ['password'] as const,
  status: () => [...passwordKeys.all, 'status'] as const,
}

/**
 * Hook to get password status
 */
export function usePasswordStatus(enabled = true) {
  return useQuery<PasswordStatus>({
    queryKey: passwordKeys.status(),
    queryFn: () => passwordService.getStatus(),
    enabled,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook to request password reset
 */
export function useForgotPassword() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      email,
      captchaToken,
      captchaProvider,
    }: {
      email: string
      captchaToken?: string
      captchaProvider?: string
    }) => passwordService.forgotPassword({ email, captchaToken, captchaProvider }),
    onSuccess: () => {
      toast.success(t('auth.resetEmailSent', 'تم إرسال رابط إعادة التعيين إلى بريدك'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.resetEmailError', 'فشل إرسال الرابط'))
    },
  })
}

/**
 * Hook to reset password with token
 */
export function useResetPassword() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string
      newPassword: string
    }) => passwordService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success(t('auth.passwordReset', 'تم إعادة تعيين كلمة المرور بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.passwordResetError', 'فشل إعادة التعيين'))
    },
  })
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => passwordService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      invalidateCache.user.passwordStatus()
      toast.success(t('auth.passwordChanged', 'تم تغيير كلمة المرور بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.passwordChangeError', 'فشل تغيير كلمة المرور'))
    },
  })
}

/**
 * Hook to validate password reset token
 */
export function useValidateResetToken() {
  return useMutation({
    mutationFn: (token: string) => passwordService.validateResetToken(token),
  })
}

/**
 * Hook to check password breach status
 */
export function useCheckPasswordBreach() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (password: string) => passwordService.checkBreached(password),
    onSuccess: (data) => {
      if (data.breached) {
        toast.warning(
          t('auth.passwordBreached', 'كلمة المرور هذه موجودة في تسريبات بيانات'),
          {
            description: t(
              'auth.chooseStronger',
              'يرجى اختيار كلمة مرور أقوى'
            ),
          }
        )
      }
    },
  })
}

/**
 * Hook to calculate password strength in real-time
 */
export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => passwordService.checkStrength(password), [password])
}

/**
 * Hook for password field with validation
 */
export function usePasswordField(initialValue = '') {
  const [password, setPassword] = useState(initialValue)
  const [showPassword, setShowPassword] = useState(false)
  const strength = usePasswordStrength(password)
  const checkBreach = useCheckPasswordBreach()
  const { data: status } = usePasswordStatus()

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const validatePassword = useCallback(() => {
    const minLength = status?.minLength || 8

    if (password.length < minLength) {
      return {
        valid: false,
        message: `كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`,
      }
    }

    if (status?.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, message: 'يجب أن تحتوي على حرف كبير' }
    }

    if (status?.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, message: 'يجب أن تحتوي على حرف صغير' }
    }

    if (status?.requireNumbers && !/\d/.test(password)) {
      return { valid: false, message: 'يجب أن تحتوي على رقم' }
    }

    if (
      status?.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return { valid: false, message: 'يجب أن تحتوي على رمز خاص' }
    }

    if (strength.score < 40) {
      return { valid: false, message: 'كلمة المرور ضعيفة جداً' }
    }

    return { valid: true, message: '' }
  }, [password, status, strength])

  return {
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    strength,
    validation: validatePassword(),
    checkBreach: () => checkBreach.mutate(password),
    isCheckingBreach: checkBreach.isPending,
    breachData: checkBreach.data,
    requirements: status,
  }
}

export default {
  usePasswordStatus,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useValidateResetToken,
  useCheckPasswordBreach,
  usePasswordStrength,
  usePasswordField,
}
