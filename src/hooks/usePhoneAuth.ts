/**
 * Phone Authentication Hooks
 * React hooks for phone/SMS OTP authentication
 */

import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import phoneAuthService, {
  type OTPPurpose,
  type PhoneOTPResponse,
  type OTPStatusResponse,
} from '@/services/phoneAuthService'
import { useAuthStore } from '@/stores/auth-store'
import { invalidateCache } from '@/lib/cache-invalidation'

/**
 * Hook to send phone OTP
 */
export function useSendPhoneOTP() {
  const { t } = useTranslation()

  return useMutation<
    PhoneOTPResponse,
    Error,
    { phone: string; purpose?: OTPPurpose }
  >({
    mutationFn: ({ phone, purpose = 'login' }) =>
      phoneAuthService.sendOTP(phone, purpose),
    onSuccess: () => {
      toast.success(t('auth.otpSent', 'تم إرسال رمز التحقق'))
    },
    onError: (error) => {
      toast.error(error.message || t('auth.otpSendError', 'فشل إرسال الرمز'))
    },
  })
}

/**
 * Hook to verify phone OTP
 */
export function useVerifyPhoneOTP() {
  const { t } = useTranslation()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({
      phone,
      otp,
      purpose = 'login',
    }: {
      phone: string
      otp: string
      purpose?: OTPPurpose
    }) => phoneAuthService.verifyOTP(phone, otp, purpose),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user)
        invalidateCache.user.profile()
        toast.success(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'))
        navigate({ to: '/dashboard' })
      } else if (data.mfaRequired) {
        // MFA is required - don't redirect yet
        toast.info(t('auth.mfaRequired', 'يرجى إدخال رمز المصادقة الثنائية'))
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.otpVerifyError', 'رمز التحقق غير صحيح'))
    },
  })
}

/**
 * Hook to resend phone OTP
 */
export function useResendPhoneOTP() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      phone,
      purpose = 'login',
    }: {
      phone: string
      purpose?: OTPPurpose
    }) => phoneAuthService.resendOTP(phone, purpose),
    onSuccess: () => {
      toast.success(t('auth.otpResent', 'تم إعادة إرسال رمز التحقق'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.otpResendError', 'فشل إعادة الإرسال'))
    },
  })
}

/**
 * Hook to check OTP rate limit status
 */
export function useCheckPhoneOTPStatus() {
  return useMutation<OTPStatusResponse, Error, { phone: string; purpose?: OTPPurpose }>({
    mutationFn: ({ phone, purpose = 'login' }) =>
      phoneAuthService.checkOTPStatus(phone, purpose),
  })
}

/**
 * Hook to verify phone number for existing user
 */
export function useVerifyPhone() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      phoneAuthService.verifyPhone(phone, otp),
    onSuccess: () => {
      invalidateCache.user.profile()
      toast.success(t('auth.phoneVerified', 'تم التحقق من رقم الجوال'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.phoneVerifyError', 'فشل التحقق'))
    },
  })
}

/**
 * Hook to check phone availability
 */
export function useCheckPhoneAvailability() {
  return useMutation({
    mutationFn: (phone: string) => phoneAuthService.checkAvailability(phone),
  })
}

/**
 * Hook for phone OTP login flow with countdown
 */
export function usePhoneOTPLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [countdown, setCountdown] = useState(0)

  const sendOTP = useSendPhoneOTP()
  const verifyOTP = useVerifyPhoneOTP()
  const resendOTP = useResendPhoneOTP()

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = useCallback(async () => {
    if (!phoneAuthService.validatePhoneFormat(phone)) {
      toast.error('رقم الجوال غير صحيح')
      return
    }

    try {
      await sendOTP.mutateAsync({ phone, purpose: 'login' })
      setStep('otp')
      setCountdown(60) // 60 seconds cooldown
    } catch {
      // Error handled by mutation
    }
  }, [phone, sendOTP])

  const handleVerifyOTP = useCallback(async () => {
    try {
      await verifyOTP.mutateAsync({ phone, otp, purpose: 'login' })
    } catch {
      // Error handled by mutation
    }
  }, [phone, otp, verifyOTP])

  const handleResendOTP = useCallback(async () => {
    if (countdown > 0) return

    try {
      await resendOTP.mutateAsync({ phone, purpose: 'login' })
      setCountdown(60)
    } catch {
      // Error handled by mutation
    }
  }, [phone, countdown, resendOTP])

  const reset = useCallback(() => {
    setPhone('')
    setOtp('')
    setStep('phone')
    setCountdown(0)
  }, [])

  return {
    // State
    phone,
    setPhone,
    otp,
    setOtp,
    step,
    setStep,
    countdown,

    // Actions
    handleSendOTP,
    handleVerifyOTP,
    handleResendOTP,
    reset,

    // Loading states
    isSendingOTP: sendOTP.isPending,
    isVerifyingOTP: verifyOTP.isPending,
    isResendingOTP: resendOTP.isPending,

    // MFA handling
    mfaRequired: verifyOTP.data?.mfaRequired,
    mfaMethods: verifyOTP.data?.mfaMethods,
    mfaUserId: verifyOTP.data?.userId,

    // Validation
    isValidPhone: phoneAuthService.validatePhoneFormat(phone),
    canResend: countdown === 0,
  }
}

export default {
  useSendPhoneOTP,
  useVerifyPhoneOTP,
  useResendPhoneOTP,
  useCheckPhoneOTPStatus,
  useVerifyPhone,
  useCheckPhoneAvailability,
  usePhoneOTPLogin,
}
