/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * User Interface matching backend response
 */
export interface User {
  _id: string
  username: string
  email: string
  role: 'client' | 'lawyer' | 'admin'
  image?: string
  country: string
  phone: string
  description?: string
  isSeller: boolean
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
 * API Response Interface
 */
interface AuthResponse {
  error: boolean
  message: string
  user?: User
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
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/login',
        credentials
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل تسجيل الدخول')
      }

      // Store minimal user data in localStorage for persistence
      // SECURITY NOTE: Role stored here is for UI display only
      // All authorization must be enforced on the backend
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response.data.user
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/register',
        data
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'فشل التسجيل')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Logout user
   * Clears HttpOnly cookie and localStorage
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout')
      localStorage.removeItem('user')
    } catch (error: any) {
      console.error('Logout error:', error)
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
      const response = await apiClient.get<AuthResponse>('/api/auth/me')

      if (response.data.error || !response.data.user) {
        return null
      }

      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response.data.user
    } catch (error: any) {
      console.error('Get current user error:', error)
      // If unauthorized, clear localStorage
      if (error?.status === 401) {
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
      console.error('Error parsing cached user:', error)
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
}

export default authService