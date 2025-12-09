import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import authService, { type User, type LoginCredentials } from '../authService'
import apiClient from '@/lib/api'

// Mock the API client
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
  handleApiError: vi.fn((error) => error?.message || 'An error occurred'),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('authService', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('login', () => {
    it('should successfully login and store user in localStorage', async () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Login successful',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123',
      }

      const user = await authService.login(credentials)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(user).toEqual(mockUser)
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    })

    it('should normalize user data and extract firmId from firm.id', async () => {
      const mockUser: any = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        firm: {
          id: 'firm-456',
          name: 'Test Firm',
          status: 'active' as const,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Login successful',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const user = await authService.login({
        username: 'testuser',
        password: 'password123',
      })

      expect(user.firmId).toBe('firm-456')
    })

    it('should normalize user data and extract firmId from tenant.id', async () => {
      const mockUser: any = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        tenant: {
          id: 'tenant-789',
          name: 'Test Tenant',
          status: 'active',
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Login successful',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const user = await authService.login({
        username: 'testuser',
        password: 'password123',
      })

      expect(user.firmId).toBe('tenant-789')
    })

    it('should throw error when login fails', async () => {
      const mockResponse = {
        data: {
          error: true,
          message: 'Invalid credentials',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await expect(
        authService.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw error when user is not returned', async () => {
      const mockResponse = {
        data: {
          error: false,
          message: 'Success',
          user: null,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await expect(
        authService.login({
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow('Success')
    })

    it('should handle API errors', async () => {
      const mockError = new Error('Network error')
      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(
        authService.login({
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should successfully logout and clear localStorage', async () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })

      await authService.logout()

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should clear localStorage even if API call fails', async () => {
      localStorage.setItem('user', JSON.stringify({ _id: '123' }))

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))

      await authService.logout()

      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch and return current user', async () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Success',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const user = await authService.getCurrentUser()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
      expect(user).toEqual(mockUser)
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    })

    it('should return null if user is not authenticated', async () => {
      const mockResponse = {
        data: {
          error: true,
          message: 'Not authenticated',
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const user = await authService.getCurrentUser()

      expect(user).toBeNull()
    })

    it('should clear localStorage on 401 unauthorized error', async () => {
      localStorage.setItem('user', JSON.stringify({ _id: '123' }))

      const mockError: any = new Error('Unauthorized')
      mockError.status = 401

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      const user = await authService.getCurrentUser()

      expect(user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should normalize user data from getCurrentUser', async () => {
      const mockUser: any = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        firm: {
          id: 'firm-456',
          name: 'Test Firm',
          status: 'active' as const,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Success',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const user = await authService.getCurrentUser()

      expect(user?.firmId).toBe('firm-456')
    })
  })

  describe('getCachedUser', () => {
    it('should return cached user from localStorage', () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      const user = authService.getCachedUser()

      expect(user).toEqual(mockUser)
    })

    it('should return null if no cached user exists', () => {
      const user = authService.getCachedUser()
      expect(user).toBeNull()
    })

    it('should clear localStorage and return null on invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json')

      const user = authService.getCachedUser()

      expect(user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is cached', () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when no user is cached', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('Role Checks', () => {
    it('should correctly identify admin role', () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      expect(authService.isAdmin()).toBe(true)
      expect(authService.isLawyer()).toBe(false)
      expect(authService.isClient()).toBe(false)
      expect(authService.hasRole('admin')).toBe(true)
    })

    it('should correctly identify lawyer role', () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'lawyer',
        email: 'lawyer@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      expect(authService.isLawyer()).toBe(true)
      expect(authService.isAdmin()).toBe(false)
      expect(authService.isClient()).toBe(false)
      expect(authService.hasRole('lawyer')).toBe(true)
    })

    it('should correctly identify client role', () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'client',
        email: 'client@example.com',
        role: 'client',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      localStorage.setItem('user', JSON.stringify(mockUser))

      expect(authService.isClient()).toBe(true)
      expect(authService.isAdmin()).toBe(false)
      expect(authService.isLawyer()).toBe(false)
      expect(authService.hasRole('client')).toBe(true)
    })

    it('should return false for all role checks when not authenticated', () => {
      expect(authService.isAdmin()).toBe(false)
      expect(authService.isLawyer()).toBe(false)
      expect(authService.isClient()).toBe(false)
      expect(authService.hasRole('admin')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle user with firmId already set', async () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'lawyer',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        firmId: 'existing-firm-id',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Login successful',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const user = await authService.login({
        username: 'testuser',
        password: 'password123',
      })

      expect(user.firmId).toBe('existing-firm-id')
    })

    it('should handle user without firm or tenant', async () => {
      const mockUser: User = {
        _id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'client',
        country: 'SA',
        phone: '+966501234567',
        isSeller: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          error: false,
          message: 'Login successful',
          user: mockUser,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const user = await authService.login({
        username: 'testuser',
        password: 'password123',
      })

      expect(user.firmId).toBeUndefined()
    })

    it('should handle malformed localStorage data gracefully', () => {
      localStorage.setItem('user', '{invalid json}')

      const user = authService.getCachedUser()

      expect(user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })
})
