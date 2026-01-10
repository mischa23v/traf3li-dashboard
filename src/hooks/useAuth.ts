/**
 * Auth Hooks
 * React hooks for authentication operations matching backend auth.route.js
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import authService, {
  LoginCredentials,
  RegisterData,
  CheckAvailabilityData,
  SendOTPData,
  VerifyOTPData,
} from '@/services/authService'
import { useAuthStore } from '@/stores/auth-store'
import { invalidateCache } from '@/lib/cache-invalidation'

// ==================== QUERY KEYS ====================

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
  otpStatus: () => [...authKeys.all, 'otp-status'] as const,
}

// ==================== AUTH HOOKS ====================

/**
 * Hook to login user
 * Handles both direct login (SSO, One-Tap) and OTP-required flow
 */
export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const setEmailVerification = useAuthStore((state) => state.setEmailVerification)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (result) => {
      // Check if this is an OTP-required response (not a user object)
      if ('requiresOtp' in result && result.requiresOtp) {
        // OTP required - don't set user yet, let form handle redirect
        return
      }

      // Direct login success - result is LoginResult with user
      if ('user' in result) {
        setUser(result.user)
        // Store email verification state if provided by backend
        if (result.emailVerification) {
          setEmailVerification(result.emailVerification)
        }
        toast.success('تم تسجيل الدخول بنجاح')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الدخول')
    },
  })
}

/**
 * Hook to register new user
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      toast.success('تم التسجيل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التسجيل')
    },
  })
}

/**
 * Hook to logout user
 */
export const useLogout = () => {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setUser(null)
      invalidateCache.auth.clearAll()
      toast.success('تم تسجيل الخروج بنجاح')
    },
    onError: (error: Error) => {
      // Still clear user even if API call fails
      setUser(null)
      invalidateCache.auth.clearAll()
      toast.error(error.message || 'فشل تسجيل الخروج')
    },
  })
}

/**
 * Hook to get current user
 */
export const useCurrentUser = (enabled: boolean = true) => {
  const setUser = useAuthStore((state) => state.setUser)

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      const user = await authService.getCurrentUser()
      // setUser handles both setting user or clearing (when null)
      setUser(user)
      return user
    },
    enabled,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    retry: false,
  })
}

// ==================== AVAILABILITY CHECK HOOKS ====================

/**
 * Hook to check availability of email, username, or phone
 */
export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: (data: CheckAvailabilityData) => authService.checkAvailability(data),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحقق من التوفر')
    },
  })
}

// ==================== OTP AUTHENTICATION HOOKS ====================

/**
 * Hook to send OTP to email
 */
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (data: SendOTPData) => authService.sendOTP(data),
    onSuccess: (response) => {
      toast.success(response.message || 'تم إرسال رمز التحقق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال رمز التحقق')
    },
  })
}

/**
 * Hook to verify OTP and login
 */
export const useVerifyOTP = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const setEmailVerification = useAuthStore((state) => state.setEmailVerification)

  return useMutation({
    mutationFn: (data: VerifyOTPData) => authService.verifyOTP(data),
    onSuccess: (result) => {
      setUser(result.user)
      // Store email verification state if provided by backend
      if (result.emailVerification) {
        setEmailVerification(result.emailVerification)
      }
      toast.success('تم التحقق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحقق من رمز OTP')
    },
  })
}

/**
 * Hook to resend OTP
 */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: (data: SendOTPData) => authService.resendOTP(data),
    onSuccess: (response) => {
      toast.success(response.message || 'تم إعادة إرسال رمز التحقق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة إرسال رمز التحقق')
    },
  })
}

/**
 * Hook to check OTP rate limit status
 */
export const useOTPStatus = () => {
  return useQuery({
    queryKey: authKeys.otpStatus(),
    queryFn: () => authService.checkOTPStatus(),
    staleTime: CACHE_TIMES.REALTIME.LIVE_FEED, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: false,
  })
}
