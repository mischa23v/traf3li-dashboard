/**
 * Enterprise Permission Service
 * API functions for policy-based access control system
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  PermissionPolicy,
  PolicyListResponse,
  PolicyResponse,
  CreatePolicyData,
  UpdatePolicyData,
  RelationTuple,
  RelationTupleListResponse,
  CreateRelationTupleData,
  RelationCheck,
  CheckPermissionRequest,
  CheckPermissionResponse,
  PermissionDecision,
  DecisionLogListResponse,
  DecisionLogFilters,
  PermissionSummary,
  ResourceAccess,
} from '@/types/permissions'

const permissionService = {
  // ==================== POLICIES ====================

  /**
   * Get all policies with optional filtering
   */
  getPolicies: async (params?: {
    search?: string
    effect?: 'allow' | 'deny'
    priority?: string
    isEnabled?: boolean
    page?: number
    pageSize?: number
  }): Promise<PolicyListResponse['data']> => {
    try {
      const response = await apiClient.get('/permissions/policies', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get a single policy by ID
   */
  getPolicy: async (policyId: string): Promise<PermissionPolicy> => {
    try {
      const response = await apiClient.get(`/permissions/policies/${policyId}`)
      return response.data.data || response.data.policy
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a new policy
   */
  createPolicy: async (data: CreatePolicyData): Promise<PermissionPolicy> => {
    try {
      const response = await apiClient.post('/permissions/policies', data)
      return response.data.data || response.data.policy
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update an existing policy
   */
  updatePolicy: async (policyId: string, data: UpdatePolicyData): Promise<PermissionPolicy> => {
    try {
      const response = await apiClient.put(`/permissions/policies/${policyId}`, data)
      return response.data.data || response.data.policy
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a policy
   */
  deletePolicy: async (policyId: string): Promise<void> => {
    try {
      await apiClient.delete(`/permissions/policies/${policyId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle policy enabled state
   */
  togglePolicy: async (policyId: string, isEnabled: boolean): Promise<PermissionPolicy> => {
    try {
      const response = await apiClient.patch(`/permissions/policies/${policyId}/toggle`, { isEnabled })
      return response.data.data || response.data.policy
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CONFIG MANAGEMENT ====================

  /**
   * Get permission configuration
   */
  getPermissionConfig: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/config')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update permission configuration
   */
  updatePermissionConfig: async (config: any): Promise<any> => {
    try {
      const response = await apiClient.put('/permissions/config', config)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RELATION TUPLES ====================

  /**
   * Get relation statistics
   */
  getRelationStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/relations/stats')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Grant a relation tuple
   */
  grantRelation: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/permissions/relations', data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke a relation tuple
   */
  revokeRelation: async (data: any): Promise<void> => {
    try {
      await apiClient.delete('/permissions/relations', { data })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get relations for a resource
   */
  getResourceRelations: async (namespace: string, object: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/permissions/relations/${namespace}/${object}`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get relation tuples for a namespace/object (deprecated - use getResourceRelations)
   */
  getRelationTuples: async (params?: {
    namespace?: string
    object?: string
    relation?: string
    subjectId?: string
    limit?: number
    offset?: number
  }): Promise<RelationTupleListResponse['data']> => {
    try {
      const response = await apiClient.get('/permissions/relations', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a new relation tuple
   */
  createRelation: async (data: CreateRelationTupleData): Promise<RelationTuple> => {
    try {
      const response = await apiClient.post('/permissions/relations', data)
      return response.data.data || response.data.relation
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a relation tuple
   */
  deleteRelation: async (relationId: string): Promise<void> => {
    try {
      await apiClient.delete(`/permissions/relations/${relationId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk create relation tuples
   */
  bulkCreateRelations: async (tuples: CreateRelationTupleData[]): Promise<RelationTuple[]> => {
    try {
      const response = await apiClient.post('/permissions/relations/bulk', { tuples })
      return response.data.data || response.data.relations
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete relation tuples
   */
  bulkDeleteRelations: async (relationIds: string[]): Promise<void> => {
    try {
      await apiClient.delete('/permissions/relations/bulk', { data: { ids: relationIds } })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== PERMISSION CHECKS ====================

  /**
   * Check if current user has permission
   */
  checkPermission: async (request: CheckPermissionRequest): Promise<CheckPermissionResponse['data']> => {
    try {
      const response = await apiClient.post('/permissions/check', request)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Batch check multiple permissions at once
   */
  checkPermissionBatch: async (requests: CheckPermissionRequest[]): Promise<any> => {
    try {
      const response = await apiClient.post('/permissions/check-batch', { requests })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current user's effective permissions
   */
  getMyPermissions: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/my-permissions')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check relation (Zanzibar-style check)
   */
  checkRelation: async (check: RelationCheck): Promise<{ allowed: boolean; path?: string[] }> => {
    try {
      const response = await apiClient.post('/permissions/relations/check', check)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Expand relations for an object (Keto-style)
   */
  expandPermissions: async (namespace: string, resourceId: string, relation: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/permissions/expand/${namespace}/${resourceId}/${relation}`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get user's accessible resources
   */
  getUserResources: async (userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/permissions/user-resources/${userId}`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== DECISION LOGS ====================

  /**
   * Get decision logs
   */
  getDecisionLogs: async (filters?: DecisionLogFilters): Promise<DecisionLogListResponse['data']> => {
    try {
      const response = await apiClient.get('/permissions/decisions', { params: filters })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get a single decision log
   */
  getDecisionLog: async (decisionId: string): Promise<PermissionDecision> => {
    try {
      const response = await apiClient.get(`/permissions/decisions/${decisionId}`)
      return response.data.data || response.data.decision
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get decision statistics
   */
  getDecisionStats: async (params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/decisions/stats', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get denied access attempts
   */
  getDeniedAttempts: async (params?: {
    startDate?: string
    endDate?: string
    userId?: string
    limit?: number
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/decisions/denied', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get compliance report
   */
  getComplianceReport: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/decisions/compliance-report', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RESOURCE ACCESS ====================

  /**
   * Get users with access to a resource
   */
  getResourceAccess: async (
    resourceType: string,
    resourceId: string
  ): Promise<ResourceAccess[]> => {
    try {
      const response = await apiClient.get(`/permissions/resources/${resourceType}/${resourceId}/access`)
      return response.data.data || response.data.access
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Grant access to a resource
   */
  grantResourceAccess: async (
    resourceType: string,
    resourceId: string,
    data: {
      userId: string
      accessLevel: string
      expiresAt?: string
      reason?: string
    }
  ): Promise<ResourceAccess> => {
    try {
      const response = await apiClient.post(
        `/permissions/resources/${resourceType}/${resourceId}/access`,
        data
      )
      return response.data.data || response.data.access
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke access from a resource
   */
  revokeResourceAccess: async (
    resourceType: string,
    resourceId: string,
    userId: string
  ): Promise<void> => {
    try {
      await apiClient.delete(
        `/permissions/resources/${resourceType}/${resourceId}/access/${userId}`
      )
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== USER PERMISSIONS ====================

  /**
   * Get user's permission summary
   */
  getUserPermissionSummary: async (userId?: string): Promise<PermissionSummary> => {
    try {
      const endpoint = userId
        ? `/permissions/users/${userId}/summary`
        : '/permissions/me/summary'
      const response = await apiClient.get(endpoint)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get resources accessible by user
   */
  getUserAccessibleResources: async (
    userId: string,
    resourceType?: string
  ): Promise<ResourceAccess[]> => {
    try {
      const response = await apiClient.get(`/permissions/users/${userId}/resources`, {
        params: { resourceType }
      })
      return response.data.data || response.data.resources
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Get cache statistics
   */
  getCacheStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/cache/stats')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Clear permission cache
   */
  clearCache: async (): Promise<void> => {
    try {
      await apiClient.post('/permissions/cache/clear')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== UI ACCESS CONTROL ====================

  /**
   * Get visible sidebar items for current user
   */
  getVisibleSidebar: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/ui/sidebar')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all sidebar items (admin)
   */
  getAllSidebarItems: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/ui/sidebar/all')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update sidebar visibility for role
   */
  updateSidebarVisibility: async (itemId: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/permissions/ui/sidebar/${itemId}/visibility`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check page access for current user
   */
  checkPageAccess: async (pageId: string): Promise<any> => {
    try {
      const response = await apiClient.post('/permissions/ui/check-page', { pageId })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all page access rules (admin)
   */
  getAllPageAccess: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/ui/pages/all')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update page access for role
   */
  updatePageAccessForRole: async (pageId: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/permissions/ui/pages/${pageId}/access`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get UI access configuration (admin)
   */
  getUIAccessConfig: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/ui/config')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update UI access settings
   */
  updateUIAccessConfig: async (config: any): Promise<any> => {
    try {
      const response = await apiClient.put('/permissions/ui/config', config)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get access matrix for all roles
   */
  getAccessMatrix: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/ui/matrix')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk update role access
   */
  bulkUpdateRoleAccess: async (role: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/permissions/ui/roles/${role}/bulk`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add user-specific override
   */
  addUserOverride: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/permissions/ui/overrides', data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove user-specific override
   */
  removeUserOverride: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/permissions/ui/overrides/${userId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default permissionService
