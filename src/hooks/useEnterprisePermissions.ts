/**
 * Enterprise Permission Hooks
 * React Query hooks for policy-based access control system
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import permissionService from '@/services/permissionService'
import { CACHE_TIMES } from '@/config/cache'
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
    staleTime: CACHE_TIMES.SHORT,
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
    staleTime: CACHE_TIMES.SHORT,
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
 * @deprecated Use useResourceRelations() instead. This hook will be removed in a future version.
 */
export const useRelationTuples = (params?: {
  namespace?: string
  object?: string
  relation?: string
  subjectId?: string
  limit?: number
  offset?: number
}) => {
  console.warn(
    '⚠️ DEPRECATED: useRelationTuples() is deprecated and will be removed in a future version.\n' +
    'Please migrate to useResourceRelations(namespace, object) instead.\n' +
    'تحذير: useRelationTuples() قديم وسيتم إزالته في إصدار مستقبلي.\n' +
    'يرجى الترحيل إلى useResourceRelations(namespace, object) بدلاً من ذلك.'
  )

  return useQuery({
    queryKey: permissionKeys.relationList(params),
    queryFn: async () => {
      try {
        return await permissionService.getRelationTuples(params)
      } catch (error: any) {
        const errorMessage = error?.message ||
          'Failed to fetch relation tuples | فشل في جلب علاقات الصلاحيات'
        console.error('Error fetching relation tuples:', errorMessage)
        throw new Error(errorMessage)
      }
    },
    staleTime: CACHE_TIMES.SHORT,
    onError: (error: any) => {
      const errorMsg = error?.message ||
        'Failed to load permission relations | فشل في تحميل علاقات الصلاحيات'
      toast.error(errorMsg)
    },
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
    staleTime: CACHE_TIMES.MEDIUM,
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
    staleTime: CACHE_TIMES.SHORT,
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
    staleTime: CACHE_TIMES.SHORT,
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
    staleTime: CACHE_TIMES.SHORT,
  })
}

// ==================== CONFIG HOOKS ====================

/**
 * Hook to get permission configuration
 */
export const usePermissionConfig = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'config'],
    queryFn: () => permissionService.getPermissionConfig(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to update permission configuration
 */
export const useUpdatePermissionConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: any) => permissionService.updatePermissionConfig(config),
    onSuccess: () => {
      toast.success('تم تحديث إعدادات الصلاحيات بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'config'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات الصلاحيات')
    },
  })
}

// ==================== RELATION STATS HOOKS ====================

/**
 * Hook to get relation statistics
 */
export const useRelationStats = () => {
  return useQuery({
    queryKey: [...permissionKeys.relations(), 'stats'],
    queryFn: () => permissionService.getRelationStats(),
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Hook to grant a relation
 */
export const useGrantRelation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => permissionService.grantRelation(data),
    onSuccess: () => {
      toast.success('تم منح العلاقة بنجاح')
      queryClient.invalidateQueries({ queryKey: permissionKeys.relations() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل منح العلاقة')
    },
  })
}

/**
 * Hook to revoke a relation
 */
export const useRevokeRelation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => permissionService.revokeRelation(data),
    onSuccess: () => {
      toast.success('تم إلغاء العلاقة بنجاح')
      queryClient.invalidateQueries({ queryKey: permissionKeys.relations() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء العلاقة')
    },
  })
}

/**
 * Hook to get resource relations
 */
export const useResourceRelations = (namespace: string, object: string) => {
  return useQuery({
    queryKey: [...permissionKeys.relations(), namespace, object],
    queryFn: () => permissionService.getResourceRelations(namespace, object),
    enabled: !!namespace && !!object,
    staleTime: CACHE_TIMES.SHORT,
  })
}

// ==================== BATCH PERMISSION HOOKS ====================

/**
 * Hook to batch check permissions
 */
export const useBatchCheckPermissions = () => {
  return useMutation({
    mutationFn: (requests: CheckPermissionRequest[]) =>
      permissionService.checkPermissionBatch(requests),
  })
}

/**
 * Hook to get my permissions
 */
export const useMyPermissions = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'my-permissions'],
    queryFn: () => permissionService.getMyPermissions(),
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Hook to expand permissions (Keto-style)
 */
export const useExpandPermissions = (namespace: string, resourceId: string, relation: string) => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'expand', namespace, resourceId, relation],
    queryFn: () => permissionService.expandPermissions(namespace, resourceId, relation),
    enabled: !!namespace && !!resourceId && !!relation,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Hook to get user resources
 */
export const useUserResources = (userId: string) => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'user-resources', userId],
    queryFn: () => permissionService.getUserResources(userId),
    enabled: !!userId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

// ==================== DENIED ATTEMPTS & COMPLIANCE ====================

/**
 * Hook to get denied access attempts
 */
export const useDeniedAttempts = (params?: {
  startDate?: string
  endDate?: string
  userId?: string
  limit?: number
}) => {
  return useQuery({
    queryKey: [...permissionKeys.decisions(), 'denied', params],
    queryFn: () => permissionService.getDeniedAttempts(params),
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Hook to get compliance report
 */
export const useComplianceReport = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: [...permissionKeys.decisions(), 'compliance', params],
    queryFn: () => permissionService.getComplianceReport(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

// ==================== CACHE HOOKS ====================

/**
 * Hook to get cache statistics
 */
export const useCacheStats = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'cache', 'stats'],
    queryFn: () => permissionService.getCacheStats(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to clear cache
 */
export const useClearCache = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => permissionService.clearCache(),
    onSuccess: () => {
      toast.success('تم مسح الذاكرة المؤقتة بنجاح')
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل مسح الذاكرة المؤقتة')
    },
  })
}

// ==================== UI ACCESS CONTROL HOOKS ====================

/**
 * Hook to get visible sidebar items
 */
export const useVisibleSidebar = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'ui', 'sidebar'],
    queryFn: () => permissionService.getVisibleSidebar(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get all sidebar items (admin)
 */
export const useAllSidebarItems = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'ui', 'sidebar', 'all'],
    queryFn: () => permissionService.getAllSidebarItems(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to update sidebar visibility
 */
export const useUpdateSidebarVisibility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: any }) =>
      permissionService.updateSidebarVisibility(itemId, data),
    onSuccess: () => {
      toast.success('تم تحديث رؤية القائمة الجانبية بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'ui', 'sidebar'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث رؤية القائمة الجانبية')
    },
  })
}

/**
 * Hook to check page access
 */
export const useCheckPageAccess = () => {
  return useMutation({
    mutationFn: (pageId: string) => permissionService.checkPageAccess(pageId),
  })
}

/**
 * Hook to get all page access rules (admin)
 */
export const useAllPageAccess = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'ui', 'pages', 'all'],
    queryFn: () => permissionService.getAllPageAccess(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to update page access for role
 */
export const useUpdatePageAccessForRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: any }) =>
      permissionService.updatePageAccessForRole(pageId, data),
    onSuccess: () => {
      toast.success('تم تحديث صلاحيات الصفحة بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'ui', 'pages'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث صلاحيات الصفحة')
    },
  })
}

/**
 * Hook to get UI access configuration
 */
export const useUIAccessConfig = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'ui', 'config'],
    queryFn: () => permissionService.getUIAccessConfig(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to update UI access configuration
 */
export const useUpdateUIAccessConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: any) => permissionService.updateUIAccessConfig(config),
    onSuccess: () => {
      toast.success('تم تحديث إعدادات الوصول للواجهة بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'ui', 'config'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات الوصول للواجهة')
    },
  })
}

/**
 * Hook to get access matrix
 */
export const useAccessMatrix = () => {
  return useQuery({
    queryKey: [...permissionKeys.all, 'ui', 'matrix'],
    queryFn: () => permissionService.getAccessMatrix(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to bulk update role access
 */
export const useBulkUpdateRoleAccess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ role, data }: { role: string; data: any }) =>
      permissionService.bulkUpdateRoleAccess(role, data),
    onSuccess: () => {
      toast.success('تم تحديث صلاحيات الدور بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'ui'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث صلاحيات الدور')
    },
  })
}

/**
 * Hook to add user override
 */
export const useAddUserOverride = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => permissionService.addUserOverride(data),
    onSuccess: () => {
      toast.success('تم إضافة استثناء المستخدم بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'ui'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة استثناء المستخدم')
    },
  })
}

/**
 * Hook to remove user override
 */
export const useRemoveUserOverride = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => permissionService.removeUserOverride(userId),
    onSuccess: () => {
      toast.success('تم إزالة استثناء المستخدم بنجاح')
      queryClient.invalidateQueries({ queryKey: [...permissionKeys.all, 'ui'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إزالة استثناء المستخدم')
    },
  })
}
