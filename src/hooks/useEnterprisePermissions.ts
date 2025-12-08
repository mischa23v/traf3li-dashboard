/**
 * Enterprise Permission Hooks
 * React Query hooks for policy-based access control system
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import permissionService from '@/services/permissionService'
import type {
  PermissionPolicy,
  CreatePolicyData,
  UpdatePolicyData,
  RelationTuple,
  CreateRelationTupleData,
  DecisionLogFilters,
  CheckPermissionRequest,
  RelationCheck,
} from '@/types/permissions'

// ==================== QUERY KEYS ====================

export const permissionKeys = {
  all: ['permissions'] as const,
  policies: () => [...permissionKeys.all, 'policies'] as const,
  policyList: (filters: any) => [...permissionKeys.policies(), 'list', filters] as const,
  policy: (id: string) => [...permissionKeys.policies(), id] as const,
  relations: () => [...permissionKeys.all, 'relations'] as const,
  relationList: (params: any) => [...permissionKeys.relations(), 'list', params] as const,
  decisions: () => [...permissionKeys.all, 'decisions'] as const,
  decisionList: (filters: DecisionLogFilters) => [...permissionKeys.decisions(), 'list', filters] as const,
  decision: (id: string) => [...permissionKeys.decisions(), id] as const,
  decisionStats: (params: any) => [...permissionKeys.decisions(), 'stats', params] as const,
  resources: () => [...permissionKeys.all, 'resources'] as const,
  resourceAccess: (type: string, id: string) => [...permissionKeys.resources(), type, id, 'access'] as const,
  userSummary: (userId?: string) => [...permissionKeys.all, 'summary', userId] as const,
  userResources: (userId: string, type?: string) => [...permissionKeys.all, 'user', userId, 'resources', type] as const,
}

// ==================== POLICY HOOKS ====================

/**
 * Hook to fetch policies with filtering
 */
export const usePolicies = (params?: {
  search?: string
  effect?: 'allow' | 'deny'
  priority?: string
  isEnabled?: boolean
  page?: number
  pageSize?: number
}) => {
  return useQuery({
    queryKey: permissionKeys.policyList(params),
    queryFn: () => permissionService.getPolicies(params),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single policy
 */
export const usePolicy = (policyId: string) => {
  return useQuery({
    queryKey: permissionKeys.policy(policyId),
    queryFn: () => permissionService.getPolicy(policyId),
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a policy
 */
export const useCreatePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePolicyData) => permissionService.createPolicy(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء السياسة بنجاح')
      queryClient.setQueriesData({ queryKey: permissionKeys.policies() }, (old: any) => {
        if (!old) return old
        if (old.policies) {
          return { ...old, policies: [data, ...old.policies] }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء السياسة')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: permissionKeys.policies() })
    },
  })
}

/**
 * Hook to update a policy
 */
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: string; data: UpdatePolicyData }) =>
      permissionService.updatePolicy(policyId, data),
    onSuccess: (data, variables) => {
      toast.success('تم تحديث السياسة بنجاح')
      queryClient.setQueryData(permissionKeys.policy(variables.policyId), data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث السياسة')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.policies() })
      await queryClient.invalidateQueries({ queryKey: permissionKeys.policy(variables.policyId) })
    },
  })
}

/**
 * Hook to delete a policy
 */
export const useDeletePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (policyId: string) => permissionService.deletePolicy(policyId),
    onSuccess: (_, policyId) => {
      toast.success('تم حذف السياسة بنجاح')
      queryClient.setQueriesData({ queryKey: permissionKeys.policies() }, (old: any) => {
        if (!old) return old
        if (old.policies) {
          return { ...old, policies: old.policies.filter((p: PermissionPolicy) => p.id !== policyId) }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف السياسة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.policies() })
    },
  })
}

/**
 * Hook to toggle policy enabled state
 */
export const useTogglePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, isEnabled }: { policyId: string; isEnabled: boolean }) =>
      permissionService.togglePolicy(policyId, isEnabled),
    onSuccess: (data, variables) => {
      const message = variables.isEnabled ? 'تم تفعيل السياسة' : 'تم تعطيل السياسة'
      toast.success(message)
      queryClient.setQueryData(permissionKeys.policy(variables.policyId), data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تغيير حالة السياسة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.policies() })
    },
  })
}

// ==================== RELATION HOOKS ====================

/**
 * Hook to fetch relation tuples
 */
export const useRelationTuples = (params?: {
  namespace?: string
  object?: string
  relation?: string
  subjectId?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: permissionKeys.relationList(params),
    queryFn: () => permissionService.getRelationTuples(params),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a relation tuple
 */
export const useCreateRelation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRelationTupleData) => permissionService.createRelation(data),
    onSuccess: () => {
      toast.success('تم إنشاء العلاقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء العلاقة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.relations() })
    },
  })
}

/**
 * Hook to delete a relation tuple
 */
export const useDeleteRelation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (relationId: string) => permissionService.deleteRelation(relationId),
    onSuccess: () => {
      toast.success('تم حذف العلاقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العلاقة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.relations() })
    },
  })
}

/**
 * Hook to bulk create relations
 */
export const useBulkCreateRelations = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tuples: CreateRelationTupleData[]) => permissionService.bulkCreateRelations(tuples),
    onSuccess: () => {
      toast.success('تم إنشاء العلاقات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء العلاقات')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.relations() })
    },
  })
}

// ==================== PERMISSION CHECK HOOKS ====================

/**
 * Hook to check permission
 */
export const useCheckPermission = () => {
  return useMutation({
    mutationFn: (request: CheckPermissionRequest) => permissionService.checkPermission(request),
  })
}

/**
 * Hook to check relation
 */
export const useCheckRelation = () => {
  return useMutation({
    mutationFn: (check: RelationCheck) => permissionService.checkRelation(check),
  })
}

// ==================== DECISION LOG HOOKS ====================

/**
 * Hook to fetch decision logs
 */
export const useDecisionLogs = (filters?: DecisionLogFilters) => {
  return useQuery({
    queryKey: permissionKeys.decisionList(filters || {}),
    queryFn: () => permissionService.getDecisionLogs(filters),
    staleTime: 30 * 1000, // 30 seconds for logs
  })
}

/**
 * Hook to fetch a single decision log
 */
export const useDecisionLog = (decisionId: string) => {
  return useQuery({
    queryKey: permissionKeys.decision(decisionId),
    queryFn: () => permissionService.getDecisionLog(decisionId),
    enabled: !!decisionId,
  })
}

/**
 * Hook to fetch decision statistics
 */
export const useDecisionStats = (params?: {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}) => {
  return useQuery({
    queryKey: permissionKeys.decisionStats(params),
    queryFn: () => permissionService.getDecisionStats(params),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== RESOURCE ACCESS HOOKS ====================

/**
 * Hook to get resource access list
 */
export const useResourceAccess = (resourceType: string, resourceId: string) => {
  return useQuery({
    queryKey: permissionKeys.resourceAccess(resourceType, resourceId),
    queryFn: () => permissionService.getResourceAccess(resourceType, resourceId),
    enabled: !!resourceType && !!resourceId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to grant resource access
 */
export const useGrantResourceAccess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resourceType,
      resourceId,
      data,
    }: {
      resourceType: string
      resourceId: string
      data: { userId: string; accessLevel: string; expiresAt?: string; reason?: string }
    }) => permissionService.grantResourceAccess(resourceType, resourceId, data),
    onSuccess: (_, variables) => {
      toast.success('تم منح الصلاحية بنجاح')
      queryClient.invalidateQueries({
        queryKey: permissionKeys.resourceAccess(variables.resourceType, variables.resourceId),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل منح الصلاحية')
    },
  })
}

/**
 * Hook to revoke resource access
 */
export const useRevokeResourceAccess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resourceType,
      resourceId,
      userId,
    }: {
      resourceType: string
      resourceId: string
      userId: string
    }) => permissionService.revokeResourceAccess(resourceType, resourceId, userId),
    onSuccess: (_, variables) => {
      toast.success('تم إلغاء الصلاحية بنجاح')
      queryClient.invalidateQueries({
        queryKey: permissionKeys.resourceAccess(variables.resourceType, variables.resourceId),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الصلاحية')
    },
  })
}

// ==================== USER PERMISSION HOOKS ====================

/**
 * Hook to get user permission summary
 */
export const useUserPermissionSummary = (userId?: string) => {
  return useQuery({
    queryKey: permissionKeys.userSummary(userId),
    queryFn: () => permissionService.getUserPermissionSummary(userId),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to get user's accessible resources
 */
export const useUserAccessibleResources = (userId: string, resourceType?: string) => {
  return useQuery({
    queryKey: permissionKeys.userResources(userId, resourceType),
    queryFn: () => permissionService.getUserAccessibleResources(userId, resourceType),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}
