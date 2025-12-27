import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import {
  getOrganizationalUnits,
  getOrganizationalUnit,
  getOrganizationalStructureStats,
  getHierarchyTree,
  getChildUnits,
  getUnitPath,
  createOrganizationalUnit,
  updateOrganizationalUnit,
  deleteOrganizationalUnit,
  bulkDeleteOrganizationalUnits,
  moveOrganizationalUnit,
  mergeOrganizationalUnits,
  dissolveOrganizationalUnit,
  activateOrganizationalUnit,
  deactivateOrganizationalUnit,
  updateHeadcount,
  updateBudget,
  addKPI,
  updateKPI,
  addLeadershipPosition,
  removeLeadershipPosition,
  exportOrganizationalStructure,
  type OrganizationalUnitFilters,
  type CreateOrganizationalUnitData,
  type UpdateOrganizationalUnitData,
  type HeadcountInfo,
  type BudgetInfo,
  type KPITarget,
  type LeadershipPosition,
} from '@/services/organizationalStructureService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query keys
export const organizationalStructureKeys = {
  all: ['organizational-structure'] as const,
  lists: () => [...organizationalStructureKeys.all, 'list'] as const,
  list: (filters?: OrganizationalUnitFilters) => [...organizationalStructureKeys.lists(), filters] as const,
  details: () => [...organizationalStructureKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationalStructureKeys.details(), id] as const,
  stats: () => [...organizationalStructureKeys.all, 'stats'] as const,
  tree: (rootUnitId?: string) => [...organizationalStructureKeys.all, 'tree', rootUnitId] as const,
  children: (parentId: string) => [...organizationalStructureKeys.all, 'children', parentId] as const,
  path: (unitId: string) => [...organizationalStructureKeys.all, 'path', unitId] as const,
}

// Get all organizational units
export const useOrganizationalUnits = (filters?: OrganizationalUnitFilters) => {
  return useQuery({
    queryKey: organizationalStructureKeys.list(filters),
    queryFn: () => getOrganizationalUnits(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single organizational unit
export const useOrganizationalUnit = (unitId: string) => {
  return useQuery({
    queryKey: organizationalStructureKeys.detail(unitId),
    queryFn: () => getOrganizationalUnit(unitId),
    enabled: !!unitId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get stats
export const useOrganizationalStructureStats = () => {
  return useQuery({
    queryKey: organizationalStructureKeys.stats(),
    queryFn: getOrganizationalStructureStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get hierarchy tree
export const useHierarchyTree = (rootUnitId?: string) => {
  return useQuery({
    queryKey: organizationalStructureKeys.tree(rootUnitId),
    queryFn: () => getHierarchyTree(rootUnitId),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get child units
export const useChildUnits = (parentUnitId: string) => {
  return useQuery({
    queryKey: organizationalStructureKeys.children(parentUnitId),
    queryFn: () => getChildUnits(parentUnitId),
    enabled: !!parentUnitId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get unit path
export const useUnitPath = (unitId: string) => {
  return useQuery({
    queryKey: organizationalStructureKeys.path(unitId),
    queryFn: () => getUnitPath(unitId),
    enabled: !!unitId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create organizational unit
export const useCreateOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrganizationalUnitData) => createOrganizationalUnit(data),
    onSuccess: () => {
      toast.success('تم إنشاء الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الوحدة التنظيمية')
    },
  })
}

// Update organizational unit
export const useUpdateOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: UpdateOrganizationalUnitData }) =>
      updateOrganizationalUnit(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم تحديث الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الوحدة التنظيمية')
    },
  })
}

// Delete organizational unit
export const useDeleteOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (unitId: string) => deleteOrganizationalUnit(unitId),
    onSuccess: () => {
      toast.success('تم حذف الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الوحدة التنظيمية')
    },
  })
}

// Bulk delete organizational units
export const useBulkDeleteOrganizationalUnits = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteOrganizationalUnits(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} وحدة تنظيمية بنجاح`)
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الوحدات التنظيمية')
    },
  })
}

// Move organizational unit
export const useMoveOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: { newParentId: string; reason?: string } }) =>
      moveOrganizationalUnit(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم نقل الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نقل الوحدة التنظيمية')
    },
  })
}

// Merge organizational units
export const useMergeOrganizationalUnits = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { sourceUnitIds: string[]; targetUnitId: string; reason?: string }) =>
      mergeOrganizationalUnits(data),
    onSuccess: () => {
      toast.success('تم دمج الوحدات التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل دمج الوحدات التنظيمية')
    },
  })
}

// Dissolve organizational unit
export const useDissolveOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: { reason: string; effectiveDate?: string; reassignTo?: string } }) =>
      dissolveOrganizationalUnit(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم حل الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حل الوحدة التنظيمية')
    },
  })
}

// Activate organizational unit
export const useActivateOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (unitId: string) => activateOrganizationalUnit(unitId),
    onSuccess: (_, unitId) => {
      toast.success('تم تفعيل الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل الوحدة التنظيمية')
    },
  })
}

// Deactivate organizational unit
export const useDeactivateOrganizationalUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data?: { reason?: string } }) =>
      deactivateOrganizationalUnit(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم تعطيل الوحدة التنظيمية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعطيل الوحدة التنظيمية')
    },
  })
}

// Update headcount
export const useUpdateHeadcount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: Partial<HeadcountInfo> }) =>
      updateHeadcount(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم تحديث العدد الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث العدد الوظيفي')
    },
  })
}

// Update budget
export const useUpdateBudget = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: Partial<BudgetInfo> }) =>
      updateBudget(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم تحديث الميزانية بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الميزانية')
    },
  })
}

// Add KPI
export const useAddKPI = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: Omit<KPITarget, 'kpiId'> }) =>
      addKPI(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم إضافة مؤشر الأداء بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة مؤشر الأداء')
    },
  })
}

// Update KPI
export const useUpdateKPI = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, kpiId, data }: { unitId: string; kpiId: string; data: Partial<KPITarget> }) =>
      updateKPI(unitId, kpiId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم تحديث مؤشر الأداء بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث مؤشر الأداء')
    },
  })
}

// Add leadership position
export const useAddLeadershipPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: Omit<LeadershipPosition, 'positionId'> }) =>
      addLeadershipPosition(unitId, data),
    onSuccess: (_, { unitId }) => {
      toast.success('تم إضافة المنصب القيادي بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المنصب القيادي')
    },
  })
}

// Remove leadership position
export const useRemoveLeadershipPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, positionId }: { unitId: string; positionId: string }) =>
      removeLeadershipPosition(unitId, positionId),
    onSuccess: (_, { unitId }) => {
      toast.success('تم إزالة المنصب القيادي بنجاح')
      queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.detail(unitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إزالة المنصب القيادي')
    },
  })
}

// Export organizational structure
export const useExportOrganizationalStructure = () => {
  return useMutation({
    mutationFn: (filters?: OrganizationalUnitFilters) => exportOrganizationalStructure(filters),
    onSuccess: () => {
      toast.success('تم تصدير الهيكل التنظيمي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير الهيكل التنظيمي')
    },
  })
}
