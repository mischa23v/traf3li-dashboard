/**
 * OTP Service
 * Handles OTP-based authentication API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

// OTP Purpose types
export type OtpPurpose = 'login' | 'registration' | 'password_reset' | 'email_verification'

// Send OTP request/response
export interface SendOtpRequest {
  email: string
  purpose: OtpPurpose
}

export interface SendOtpResponse {
  success: boolean
  message: string
  messageAr?: string
  expiresIn: number // seconds until OTP expires
}

// Verify OTP request/response
export interface VerifyOtpRequest {
  email: string
  otp: string
  purpose: OtpPurpose
}

export interface VerifyOtpResponse {
  success: boolean
  message: string
  messageAr?: string
  user?: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    email: string
    role: 'client' | 'lawyer' | 'admin'
    image?: string
    country: string
    phone: string
  }
  accessToken?: string
  refreshToken?: string
  attemptsLeft?: number
}

// OTP Status response
export interface OtpStatusResponse {
  canRequest: boolean
  waitTime: number // seconds to wait before next request
  attemptsRemaining: number
}

// Error response format
export interface OtpErrorResponse {
  success: false
  error: string
  errorAr?: string
  waitTime?: number
  attemptsLeft?: number
}

/**
 * OTP Service Object
 */
const otpService = {
  /**
   * Send OTP to email
   * Rate limited: 5 requests/hour, 60 seconds between requests
   */
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    try {
      const response = await apiClient.post<SendOtpResponse>('/auth/send-otp', data)
      return response.data
    } catch (error: any) {
      // Check for rate limit error
      if (error?.status === 429) {
        const waitTime = error?.response?.data?.waitTime || 60
        throw {
          message: error?.response?.data?.error || `يرجى الانتظار ${waitTime} ثانية`,
          messageAr: error?.response?.data?.errorAr,
          waitTime,
          isRateLimited: true,
        }
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify OTP code
   * Max 3 attempts per OTP
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', data)

      if (response.data.success && response.data.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      // Check for invalid OTP with attempts remaining
      if (error?.status === 400 && error?.response?.data?.attemptsLeft !== undefined) {
        throw {
          message: error?.response?.data?.error || 'رمز التحقق غير صحيح',
          messageAr: error?.response?.data?.errorAr,
          attemptsLeft: error?.response?.data?.attemptsLeft,
          isInvalidOtp: true,
        }
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend OTP
   * Same rate limits as sendOtp
   */
  resendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    try {
      const response = await apiClient.post<SendOtpResponse>('/auth/resend-otp', data)
      return response.data
    } catch (error: any) {
      if (error?.status === 429) {
        const waitTime = error?.response?.data?.waitTime || 60
        throw {
          message: error?.response?.data?.error || `يرجى الانتظار ${waitTime} ثانية`,
          messageAr: error?.response?.data?.errorAr,
          waitTime,
          isRateLimited: true,
        }
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check OTP status
   * Get info about rate limits and wait times
   */
  getOtpStatus: async (email: string, purpose: OtpPurpose): Promise<OtpStatusResponse> => {
    try {
      const response = await apiClient.get<OtpStatusResponse>('/auth/otp-status', {
        params: { email, purpose },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default otpService
