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
 * Mock user for development
 * Use credentials: username="admin" OR "lawyer", password="123456"
 */
const MOCK_USER: User = {
  _id: 'mock-user-id',
  username: 'admin',
  email: 'admin@traf3li.com',
  role: 'lawyer',
  country: 'SA',
  phone: '+966500000000',
  description: 'Mock user for development',
  isSeller: true,
  lawyerProfile: {
    specialization: ['Commercial Law', 'Corporate Law'],
    licenseNumber: 'LAW-12345',
    barAssociation: 'Saudi Bar Association',
    yearsExperience: 10,
    verified: true,
    rating: 4.8,
    totalReviews: 150,
    casesWon: 85,
    casesTotal: 100,
    languages: ['Arabic', 'English'],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Auth Service Object
 */
const authService = {
  /**
   * Login user
   * Backend sets HttpOnly cookie automatically
   * Falls back to mock auth if backend is unavailable in development
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

      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response.data.user
    } catch (error: any) {
      console.error('Login error:', error)

      // In development, allow mock authentication if backend is down
      if (import.meta.env.DEV) {
        console.warn('⚠️ Backend unavailable, using mock authentication')
        console.log('📝 Mock credentials: username="admin" or "lawyer", password="123456"')

        // Check if credentials match mock user
        if (
          (credentials.username === 'admin' || credentials.username === 'lawyer') &&
          credentials.password === '123456'
        ) {
          localStorage.setItem('user', JSON.stringify(MOCK_USER))
          console.log('✅ Mock login successful!')
          return MOCK_USER
        }
      }

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
   * Falls back to cached user in development if backend is down
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

      // In development, return cached user if backend is down
      if (import.meta.env.DEV) {
        const cachedUser = authService.getCachedUser()
        if (cachedUser) {
          console.warn('⚠️ Backend unavailable, using cached user')
          return cachedUser
        }
      }

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