/**
 * Test Authentication Fixtures
 *
 * SECURITY NOTE: These fixtures are for testing ONLY.
 * They are NOT included in production builds.
 * Test credentials should come from environment variables.
 *
 * Usage in tests:
 * import { testCredentials, createMockUser } from '@/test/auth-fixtures'
 */

import type { User } from '@/services/authService'

/**
 * Get test credentials from environment
 * These should be set in .env.test, not hardcoded
 */
export const getTestCredentials = () => {
  if (import.meta.env.PROD) {
    throw new Error('Test credentials cannot be accessed in production!')
  }

  const username = import.meta.env.VITE_TEST_USERNAME
  const email = import.meta.env.VITE_TEST_EMAIL
  const password = import.meta.env.VITE_TEST_PASSWORD

  if (!username || !email || !password) {
    console.warn(
      'Test credentials not configured. Set VITE_TEST_USERNAME, VITE_TEST_EMAIL, and VITE_TEST_PASSWORD in .env.test'
    )
    return null
  }

  return { username, email, password }
}

/**
 * Create a mock user for testing
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  return {
    _id: `test-user-${Date.now()}`,
    username: 'testuser',
    email: 'test@example.com',
    role: 'lawyer',
    country: 'SA',
    phone: '+966500000000',
    description: 'Mock user for testing',
    isSeller: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock admin user for testing
 */
export const createMockAdminUser = (overrides: Partial<User> = {}): User => {
  return createMockUser({
    role: 'admin',
    username: 'testadmin',
    email: 'admin@example.com',
    ...overrides,
  })
}

/**
 * Create a mock user with MFA enabled
 */
export const createMockMfaUser = (overrides: Partial<User> = {}): User => {
  return createMockUser({
    mfaEnabled: true,
    mfaPending: false,
    ...overrides,
  })
}

/**
 * Create a mock user with MFA verification pending
 */
export const createMockMfaPendingUser = (overrides: Partial<User> = {}): User => {
  return createMockUser({
    mfaEnabled: true,
    mfaPending: true,
    ...overrides,
  })
}

/**
 * Mock JWT tokens for testing
 * These are NOT valid tokens - just for structure testing
 */
export const mockTokens = {
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
  expiresIn: 900, // 15 minutes
}

/**
 * Mock login response for testing
 */
export const createMockLoginResponse = (user: Partial<User> = {}) => ({
  user: createMockUser(user),
  ...mockTokens,
})

export default {
  getTestCredentials,
  createMockUser,
  createMockAdminUser,
  createMockMfaUser,
  createMockMfaPendingUser,
  mockTokens,
  createMockLoginResponse,
}
