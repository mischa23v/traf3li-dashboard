/**
 * Phone/SMS OTP Authentication Service
 * Handles phone number verification and SMS OTP authentication
 */

import { apiClientNoVersion, handleApiError, storeTokens } from '@/lib/api'
import type { User } from './authService'

const authApi = apiClientNoVersion

/**
 * OTP Purpose Types
 */
export type OTPPurpose = 'login' | 'registration' | 'verify_phone' | 'mfa'

/**
 * Phone OTP Response
 */
export interface PhoneOTPResponse {
  success: boolean
  message: string
  messageAr?: string
  expiresIn: number // seconds
}

/**
 * Phone Auth Response
 */
interface PhoneAuthResponse {
  error: boolean
  message: string
  user?: User
  accessToken?: string
  refreshToken?: string
  csrfToken?: string
  mfaRequired?: boolean
  mfaMethods?: string[]
  userId?: string
}

/**
 * OTP Status Response
 */
export interface OTPStatusResponse {
  canRequest: boolean
  waitTime: number // seconds to wait before next request
  attemptsRemaining: number
  resetTime?: string
}

/**
 * Phone Format Helper
 * Formats Saudi phone numbers to international format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // Handle Saudi Arabia numbers
  if (cleaned.startsWith('0')) {
    // Remove leading 0 and add +966
    cleaned = '966' + cleaned.substring(1)
  } else if (cleaned.startsWith('966')) {
    // Already in international format without +
  } else if (cleaned.startsWith('5')) {
    // Mobile number without country code
    cleaned = '966' + cleaned
  }

  return '+' + cleaned
}

/**
 * Phone Auth Service Object
 */
const phoneAuthService = {
  /**
   * Send OTP to phone number
   *
   * @param phone - Phone number with country code (e.g., +966501234567)
   * @param purpose - Purpose of OTP ('login' | 'registration' | 'verify_phone')
   */
  sendOTP: async (
    phone: string,
    purpose: OTPPurpose = 'login'
  ): Promise<PhoneOTPResponse> => {
    try {
      const formattedPhone = formatPhoneNumber(phone)

      const response = await authApi.post<PhoneOTPResponse>(
        '/auth/phone/send-otp',
        {
          phone: formattedPhone,
          purpose,
        }
      )

      return {
        success: response.data.success,
        message: response.data.message,
        messageAr: response.data.messageAr,
        expiresIn: response.data.expiresIn || 300, // 5 minutes default
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify OTP and authenticate
   *
   * @param phone - Phone number
   * @param otp - 6-digit OTP code
   * @param purpose - Purpose of verification
   */
  verifyOTP: async (
    phone: string,
    otp: string,
    purpose: OTPPurpose = 'login'
  ): Promise<{
    user?: User
    mfaRequired?: boolean
    mfaMethods?: string[]
    userId?: string
  }> => {
    try {
      const formattedPhone = formatPhoneNumber(phone)

      const response = await authApi.post<PhoneAuthResponse>(
        '/auth/phone/verify-otp',
        {
          phone: formattedPhone,
          otp,
          purpose,
        }
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'فشل التحقق من الرمز')
      }

      // If MFA is required
      if (response.data.mfaRequired) {
        return {
          mfaRequired: true,
          mfaMethods: response.data.mfaMethods,
          userId: response.data.userId,
        }
      }

      // Store tokens if provided - supports both OAuth 2.0 (snake_case) and legacy (camelCase)
      const accessToken = (response.data as any).access_token || response.data.accessToken
      const refreshToken = (response.data as any).refresh_token || response.data.refreshToken
      const expiresIn = (response.data as any).expires_in // seconds until access token expires

      if (accessToken && refreshToken) {
        storeTokens(accessToken, refreshToken, expiresIn)
      }

      // Store user in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return {
        user: response.data.user,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend OTP code
   * Subject to rate limiting
   *
   * @param phone - Phone number
   * @param purpose - Purpose of OTP
   */
  resendOTP: async (
    phone: string,
    purpose: OTPPurpose = 'login'
  ): Promise<PhoneOTPResponse> => {
    try {
      const formattedPhone = formatPhoneNumber(phone)

      const response = await authApi.post<PhoneOTPResponse>(
        '/auth/phone/resend-otp',
        {
          phone: formattedPhone,
          purpose,
        }
      )

      return {
        success: response.data.success,
        message: response.data.message,
        messageAr: response.data.messageAr,
        expiresIn: response.data.expiresIn || 300,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check OTP rate limit status
   *
   * @param phone - Phone number
   * @param purpose - Purpose of OTP
   */
  checkOTPStatus: async (
    phone: string,
    purpose: OTPPurpose = 'login'
  ): Promise<OTPStatusResponse> => {
    try {
      const formattedPhone = formatPhoneNumber(phone)

      const response = await authApi.get<OTPStatusResponse>(
        '/auth/phone/otp-status',
        {
          params: {
            phone: formattedPhone,
            purpose,
          },
        }
      )

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify phone number for existing user
   * Links phone to account after OTP verification
   *
   * @param phone - Phone number
   * @param otp - OTP code
   */
  verifyPhone: async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const formattedPhone = formatPhoneNumber(phone)

      const response = await authApi.post<{
        success: boolean
        message: string
      }>('/auth/phone/verify', {
        phone: formattedPhone,
        otp,
      })

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if phone number is available
   *
   * @param phone - Phone number to check
   */
  checkAvailability: async (
    phone: string
  ): Promise<{ available: boolean; message?: string }> => {
    try {
      const formattedPhone = formatPhoneNumber(phone)

      const response = await authApi.post<{
        available: boolean
        message?: string
      }>('/auth/check-availability', {
        field: 'phone',
        value: formattedPhone,
      })

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Validate phone number format
   *
   * @param phone - Phone number to validate
   */
  validatePhoneFormat: (phone: string): boolean => {
    const formatted = formatPhoneNumber(phone)
    // Saudi Arabia phone validation
    // +966 followed by 5 and 8 more digits
    return /^\+966[5][0-9]{8}$/.test(formatted)
  },

  /**
   * Get country code from phone number
   */
  getCountryCode: (phone: string): string => {
    if (phone.startsWith('+966') || phone.startsWith('966')) {
      return 'SA'
    }
    // Add more country codes as needed
    return 'SA' // Default to Saudi Arabia
  },
}

export default phoneAuthService
