/**
 * LDAP Service
 * Handles all LDAP/Active Directory configuration and operations
 *
 * ⚠️ IMPORTANT API DOCUMENTATION:
 * ==================================
 *
 * Base Path: /ldap (NOT /api/auth/ldap or /api/admin/ldap)
 * -----------
 * All endpoints use the base path `/ldap` which is automatically prefixed by apiClient.
 * The backend serves these routes at `/api/ldap/*` but apiClient handles the `/api` prefix.
 *
 * Example:
 * - Code calls: apiClient.get('/ldap/config')
 * - Actual HTTP request: GET /api/ldap/config
 *
 * Endpoint Patterns:
 * ------------------
 * Configuration:
 *   GET    /ldap/config          - Get LDAP configuration
 *   POST   /ldap/config          - Create/save LDAP configuration
 *   PUT    /ldap/config          - Update LDAP configuration
 *   DELETE /ldap/config          - Delete LDAP configuration
 *
 * Testing:
 *   POST   /ldap/test-connection - Test LDAP connection
 *   POST   /ldap/test-user-lookup - Test user lookup
 *
 * Synchronization:
 *   POST   /ldap/sync            - Trigger manual user sync
 *   GET    /ldap/sync-status     - Get sync status
 *
 * Authentication:
 *   POST   /ldap/login           - Authenticate via LDAP
 *
 * ⚠️ LDAP Login Status:
 * ---------------------
 * LDAP login is now integrated into the main login page.
 * The feature will only show if LDAP is configured and enabled.
 * Users can authenticate via LDAP using their directory credentials.
 */

import apiClient, { handleApiError } from '@/lib/api'
import type { User } from './authService'

/**
 * LDAP Configuration Interface
 */
export interface LDAPConfig {
  _id: string
  firmId: string
  enabled: boolean
  serverUrl: string
  bindDN: string
  baseDN: string
  userFilter: string
  useTLS: boolean
  useSSL: boolean
  attributeMappings: {
    email: string
    firstName: string
    lastName: string
    username: string
    phone?: string
  }
  groupSync: {
    enabled: boolean
    baseDN?: string
    groupFilter?: string
    memberAttribute?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * LDAP Configuration Form Data
 */
export interface LDAPConfigFormData {
  enabled: boolean
  serverUrl: string
  bindDN: string
  bindPassword: string
  baseDN: string
  userFilter: string
  useTLS: boolean
  useSSL: boolean
  attributeMappings: {
    email: string
    firstName: string
    lastName: string
    username: string
    phone?: string
  }
  groupSync: {
    enabled: boolean
    baseDN?: string
    groupFilter?: string
    memberAttribute?: string
  }
}

/**
 * LDAP Connection Test Result
 */
export interface LDAPTestResult {
  success: boolean
  message: string
  messageAr: string
  details?: {
    canConnect: boolean
    canBind: boolean
    canSearch: boolean
    usersFound?: number
    groupsFound?: number
    error?: string
  }
}

/**
 * LDAP User Lookup Result
 */
export interface LDAPUserLookup {
  success: boolean
  user?: {
    dn: string
    username: string
    email: string
    firstName: string
    lastName: string
    attributes: Record<string, any>
  }
  error?: string
}

/**
 * LDAP Sync Status
 */
export interface LDAPSyncStatus {
  isRunning: boolean
  lastSync?: {
    timestamp: string
    status: 'success' | 'failed' | 'partial'
    usersAdded: number
    usersUpdated: number
    usersDeactivated: number
    groupsSynced: number
    errors: string[]
  }
  nextScheduledSync?: string
}

/**
 * LDAP Login Credentials
 */
export interface LDAPLoginCredentials {
  username: string
  password: string
}

/**
 * LDAP Service Object
 */
const ldapService = {
  /**
   * Get LDAP configuration
   * GET /ldap/config
   */
  getConfig: async (): Promise<LDAPConfig | null> => {
    try {
      const response = await apiClient.get('/ldap/config')
      return response.data.config || response.data.data || null
    } catch (error: any) {
      // Return null if no config exists (404)
      if (error.response?.status === 404) {
        return null
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save LDAP configuration
   * POST /ldap/config
   */
  saveConfig: async (data: LDAPConfigFormData): Promise<LDAPConfig> => {
    try {
      const response = await apiClient.post('/ldap/config', data)
      return response.data.config || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update LDAP configuration
   * PUT /ldap/config
   */
  updateConfig: async (data: Partial<LDAPConfigFormData>): Promise<LDAPConfig> => {
    try {
      const response = await apiClient.put('/ldap/config', data)
      return response.data.config || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Test LDAP connection
   * POST /ldap/test-connection
   */
  testConnection: async (data: LDAPConfigFormData): Promise<LDAPTestResult> => {
    try {
      const response = await apiClient.post('/ldap/test-connection', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Test LDAP user lookup
   * POST /ldap/test-user-lookup
   */
  testUserLookup: async (username: string): Promise<LDAPUserLookup> => {
    try {
      const response = await apiClient.post('/ldap/test-user-lookup', { username })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Trigger manual user sync
   * POST /ldap/sync
   */
  syncUsers: async (): Promise<{ message: string; messageAr: string }> => {
    try {
      const response = await apiClient.post('/ldap/sync')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get sync status
   * GET /ldap/sync-status
   */
  getSyncStatus: async (): Promise<LDAPSyncStatus> => {
    try {
      const response = await apiClient.get('/ldap/sync-status')
      return response.data.status || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete LDAP configuration
   * DELETE /ldap/config
   */
  deleteConfig: async (): Promise<void> => {
    try {
      await apiClient.delete('/ldap/config')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * LDAP Login
   * Authenticate user via LDAP/Active Directory
   * POST /ldap/login
   */
  login: async (credentials: LDAPLoginCredentials): Promise<User> => {
    try {
      const response = await apiClient.post('/ldap/login', credentials)

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'LDAP authentication failed')
      }

      const user = response.data.user

      // Store user data in localStorage (matching authService pattern)
      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default ldapService
