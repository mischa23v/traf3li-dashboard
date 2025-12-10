/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Firm info returned with user
 */
export interface UserFirm {
  id: string
  name: string
  nameEn?: string
  status: 'active' | 'suspended' | 'inactive'
}

/**
 * Tenant info for multi-tenant support
 */
export interface UserTenant {
  id: string
  name: string
  nameEn?: string
  status: string
  subscription?: {
    plan: string
    status: string
  }
}

/**
 * Permissions returned with login for solo lawyers and firm members
 */
export interface UserPermissions {
  modules?: {
    clients?: string
    cases?: string
    leads?: string
    invoices?: string
    payments?: string
    expenses?: string
    documents?: string
    tasks?: string
    events?: string
    timeTracking?: string
    reports?: string
    settings?: string
    team?: string
    hr?: string
    [key: string]: string | undefined
  }
  special?: {
    canApproveInvoices?: boolean
    canManageRetainers?: boolean
    canExportData?: boolean
    canDeleteRecords?: boolean
    canViewFinance?: boolean
    canManageTeam?: boolean
    canCreateFirm?: boolean
    canJoinFirm?: boolean
    [key: string]: boolean | undefined
  }
}

/**
 * User Interface matching backend response
 */
export interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  role: 'client' | 'lawyer' | 'admin'
  image?: string
  country: string
  phone: string
  description?: string
  isSeller: boolean
  // Solo lawyer support
  isSoloLawyer?: boolean
  lawyerWorkMode?: 'solo' | 'firm_owner' | 'firm_member' | null
  // Firm-related fields for RBAC
  firmId?: string
  firm?: UserFirm | null
  firmRole?: 'owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'departed'
  firmStatus?: 'active' | 'departed' | 'suspended' | 'pending' | null
  // Tenant for multi-tenant support
  tenant?: UserTenant | null
  // Permissions returned directly from login (for solo lawyers)
  permissions?: UserPermissions | null
  lawyerProfile?: {
    specialization: string[]
    licenseNumber?: string
    barAssociation?: string
    yearsExperience: number
    verified: boolean
    rating: number
    totalReviews: number
    casesWon: number
    casesTotal: number
    languages: string[]
    firmID?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Login Credentials Interface
 */
export interface LoginCredentials {
  username: string // Can be username OR email
  password: string
}

/**
 * Register Data Interface
 */
export interface RegisterData {
  username: string
  email: string
  password: string
  phone: string
  country?: string
  role?: 'client' | 'lawyer'
  isSeller?: boolean
  description?: string
  image?: string
}

/**
 * Check Availability Data Interface
 */
export interface CheckAvailabilityData {
  field: 'email' | 'username' | 'phone'
  value: string
}

/**
 * Check Availability Response
 */
export interface CheckAvailabilityResponse {
  available: boolean
  message?: string
}

/**
 * Send OTP Data Interface
 */
export interface SendOTPData {
  email: string
}

/**
 * OTP Response Interface
 */
export interface OTPResponse {
  success: boolean
  message: string
  expiresIn?: number
}

/**
 * Verify OTP Data Interface
 */
export interface VerifyOTPData {
  email: string
  code: string
}

/**
 * OTP Status Response
 */
export interface OTPStatusResponse {
  attemptsRemaining: number
  resetTime?: string
}

/**
 * API Response Interface
 */
interface AuthResponse {
  error: boolean
  message: string
  user?: User
}

/**
 * DEVELOPMENT ONLY: Test credentials
 * Only available in development mode - automatically stripped in production builds
 */
const TEST_CREDENTIALS = import.meta.env.DEV ? {
  username: 'test',
  email: 'test@example.com',
  password: 'test123',
} : null

const TEST_USER: User | null = import.meta.env.DEV ? {
  _id: 'test-user-id',
  username: 'test',
  email: 'test@example.com',
  role: 'admin',
  country: 'SA',
  phone: '+966500000000',
  description: 'Test user account',
  isSeller: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} : null

/**
 * Helper to normalize user data from backend
 * Extracts firmId from firm.id or tenant.id if not directly provided
 */
const normalizeUser = (user: User): User => {
  // If firmId is already set, return as-is
  if (user.firmId) return user

  // Extract firmId from firm.id or tenant.id
  const firmId = user.firm?.id || user.tenant?.id
  if (firmId) {
    return { ...user, firmId }
  }

  return user
}

/**
 * Auth Service Object
 */
const authService = {
  /**
   * Login user
   * Backend sets HttpOnly cookie automatically
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      // Call backend login API
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل تسجيل الدخول')
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Store minimal user data in localStorage for persistence
      // SECURITY NOTE: Role stored here is for UI display only
      // All authorization must be enforced on the backend
      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        data
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'فشل التسجيل')
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Logout user
   * Clears HttpOnly cookie and localStorage
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
      localStorage.removeItem('user')
    } catch (error: any) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('user')
    }
  },

  /**
   * Get current authenticated user
   * Verifies token validity with backend
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<AuthResponse>('/auth/me')

      if (response.data.error || !response.data.user) {
        return null
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error: any) {
      // If unauthorized (401) or unauthorized access (400 from backend), clear localStorage
      // Backend may return 400 for missing token, so treat both as auth errors
      if (error?.status === 401 || error?.status === 400) {
        localStorage.removeItem('user')
      }
      return null
    }
  },

  /**
   * Get cached user from localStorage
   * Use this for initial load, then verify with getCurrentUser()
   */
  getCachedUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch (error) {
      localStorage.removeItem('user')
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return authService.getCachedUser() !== null
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role: 'client' | 'lawyer' | 'admin'): boolean => {
    const user = authService.getCachedUser()
    return user?.role === role
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    return authService.hasRole('admin')
  },

  /**
   * Check if user is lawyer
   */
  isLawyer: (): boolean => {
    return authService.hasRole('lawyer')
  },

  /**
   * Check if user is client
   */
  isClient: (): boolean => {
    return authService.hasRole('client')
  },

  /**
   * Check availability of email, username, or phone
   */
  checkAvailability: async (data: CheckAvailabilityData): Promise<CheckAvailabilityResponse> => {
    try {
      const response = await apiClient.post<{ error: boolean; available: boolean; message?: string }>(
        '/auth/check-availability',
        data
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'فشل التحقق من التوفر')
      }

      return {
        available: response.data.available,
        message: response.data.message
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send OTP to email for passwordless authentication
   */
  sendOTP: async (data: SendOTPData): Promise<OTPResponse> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; expiresIn?: number }>(
        '/auth/send-otp',
        data
      )

      return {
        success: response.data.success,
        message: response.data.message,
        expiresIn: response.data.expiresIn
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify OTP code and login
   */
  verifyOTP: async (data: VerifyOTPData): Promise<User> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/verify-otp',
        data
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل التحقق من رمز OTP')
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend OTP code
   */
  resendOTP: async (data: SendOTPData): Promise<OTPResponse> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; expiresIn?: number }>(
        '/auth/resend-otp',
        data
      )

      return {
        success: response.data.success,
        message: response.data.message,
        expiresIn: response.data.expiresIn
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check OTP rate limit status
   */
  checkOTPStatus: async (): Promise<OTPStatusResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: {
          attemptsRemaining: number
          resetTime?: string
        }
      }>('/auth/otp-status')

      return {
        attemptsRemaining: response.data.data.attemptsRemaining,
        resetTime: response.data.data.resetTime
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default authService