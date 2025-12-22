/**
 * LDAP Service
 * Handles all LDAP/Active Directory configuration and operations
 * Base route: /api/ldap
 */

import apiClient, { handleApiError } from '@/lib/api'

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
 * LDAP Service Object
 */
const ldapService = {
  /**
   * Get LDAP configuration
   * GET /api/ldap/config
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
   * POST /api/ldap/config or PUT /api/ldap/config
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
   * PUT /api/ldap/config
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
   * POST /api/ldap/test-connection
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
   * POST /api/ldap/test-user-lookup
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
   * POST /api/ldap/sync
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
   * GET /api/ldap/sync-status
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
   * DELETE /api/ldap/config
   */
  deleteConfig: async (): Promise<void> => {
    try {
      await apiClient.delete('/ldap/config')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default ldapService
