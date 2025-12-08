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

  // ==================== RELATION TUPLES ====================

  /**
   * Get relation tuples for a namespace/object
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
   * Expand relations for an object
   */
  expandRelations: async (namespace: string, object: string, relation: string): Promise<any> => {
    try {
      const response = await apiClient.get('/permissions/relations/expand', {
        params: { namespace, object, relation }
      })
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
}

export default permissionService
