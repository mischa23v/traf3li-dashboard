import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getJobPositions,
  getJobPosition,
  getJobPositionStats,
  getVacantPositions,
  getPositionsByDepartment,
  getReportingHierarchy,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  bulkDeleteJobPositions,
  freezeJobPosition,
  unfreezeJobPosition,
  eliminateJobPosition,
  markPositionVacant,
  fillJobPosition,
  vacateJobPosition,
  cloneJobPosition,
  updateResponsibilities,
  updateQualifications,
  updateSalaryRange,
  exportJobPositions,
  type JobPositionFilters,
  type CreateJobPositionData,
  type UpdateJobPositionData,
  type Qualification,
  type Responsibility,
  type SalaryRange,
} from '@/services/jobPositionsService'

// Query keys
export const jobPositionsKeys = {
  all: ['job-positions'] as const,
  lists: () => [...jobPositionsKeys.all, 'list'] as const,
  list: (filters?: JobPositionFilters) => [...jobPositionsKeys.lists(), filters] as const,
  details: () => [...jobPositionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobPositionsKeys.details(), id] as const,
  stats: () => [...jobPositionsKeys.all, 'stats'] as const,
  vacant: () => [...jobPositionsKeys.all, 'vacant'] as const,
  department: (departmentId: string) => [...jobPositionsKeys.all, 'department', departmentId] as const,
  hierarchy: (positionId: string) => [...jobPositionsKeys.all, 'hierarchy', positionId] as const,
}

// Get all job positions
export const useJobPositions = (filters?: JobPositionFilters) => {
  return useQuery({
    queryKey: jobPositionsKeys.list(filters),
    queryFn: () => getJobPositions(filters),
  })
}

// Get single job position
export const useJobPosition = (positionId: string) => {
  return useQuery({
    queryKey: jobPositionsKeys.detail(positionId),
    queryFn: () => getJobPosition(positionId),
    enabled: !!positionId,
  })
}

// Get stats
export const useJobPositionStats = () => {
  return useQuery({
    queryKey: jobPositionsKeys.stats(),
    queryFn: getJobPositionStats,
  })
}

// Get vacant positions
export const useVacantPositions = () => {
  return useQuery({
    queryKey: jobPositionsKeys.vacant(),
    queryFn: getVacantPositions,
  })
}

// Get positions by department
export const usePositionsByDepartment = (departmentId: string) => {
  return useQuery({
    queryKey: jobPositionsKeys.department(departmentId),
    queryFn: () => getPositionsByDepartment(departmentId),
    enabled: !!departmentId,
  })
}

// Get reporting hierarchy
export const useReportingHierarchy = (positionId: string) => {
  return useQuery({
    queryKey: jobPositionsKeys.hierarchy(positionId),
    queryFn: () => getReportingHierarchy(positionId),
    enabled: !!positionId,
  })
}

// Create job position
export const useCreateJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateJobPositionData) => createJobPosition(data),
    onSuccess: () => {
      toast.success('تم إنشاء المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المنصب الوظيفي')
    },
  })
}

// Update job position
export const useUpdateJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: { positionId: string; data: UpdateJobPositionData }) =>
      updateJobPosition(positionId, data),
    onSuccess: (_, { positionId }) => {
      toast.success('تم تحديث المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المنصب الوظيفي')
    },
  })
}

// Delete job position
export const useDeleteJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (positionId: string) => deleteJobPosition(positionId),
    onSuccess: () => {
      toast.success('تم حذف المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المنصب الوظيفي')
    },
  })
}

// Bulk delete job positions
export const useBulkDeleteJobPositions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteJobPositions(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} منصب وظيفي بنجاح`)
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المناصب الوظيفية')
    },
  })
}

// Freeze job position
export const useFreezeJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: { positionId: string; data: { reason: string; effectiveDate?: string } }) =>
      freezeJobPosition(positionId, data),
    onSuccess: (_, { positionId }) => {
      toast.success('تم تجميد المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تجميد المنصب الوظيفي')
    },
  })
}

// Unfreeze job position
export const useUnfreezeJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (positionId: string) => unfreezeJobPosition(positionId),
    onSuccess: (_, positionId) => {
      toast.success('تم إلغاء تجميد المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء تجميد المنصب الوظيفي')
    },
  })
}

// Eliminate job position
export const useEliminateJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: { positionId: string; data: { reason: string; effectiveDate?: string } }) =>
      eliminateJobPosition(positionId, data),
    onSuccess: (_, { positionId }) => {
      toast.success('تم إلغاء المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء المنصب الوظيفي')
    },
  })
}

// Mark position as vacant
export const useMarkPositionVacant = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: { positionId: string; data: { reason: string; vacantSince?: string } }) =>
      markPositionVacant(positionId, data),
    onSuccess: (_, { positionId }) => {
      toast.success('تم تحديد المنصب كشاغر بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.vacant() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديد المنصب كشاغر')
    },
  })
}

// Fill job position
export const useFillJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: {
      positionId: string
      data: {
        employeeId: string
        employeeName: string
        employeeNameAr?: string
        assignmentType: 'permanent' | 'acting' | 'temporary' | 'probation'
        assignmentDate: string
        probationEnd?: string
      }
    }) => fillJobPosition(positionId, data),
    onSuccess: (_, { positionId }) => {
      toast.success('تم شغل المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.vacant() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل شغل المنصب الوظيفي')
    },
  })
}

// Vacate job position
export const useVacateJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: { positionId: string; data: { reason: string; effectiveDate?: string } }) =>
      vacateJobPosition(positionId, data),
    onSuccess: (_, { positionId }) => {
      toast.success('تم إخلاء المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.vacant() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إخلاء المنصب الوظيفي')
    },
  })
}

// Clone job position
export const useCloneJobPosition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, data }: { positionId: string; data?: { newPositionNumber?: string } }) =>
      cloneJobPosition(positionId, data),
    onSuccess: () => {
      toast.success('تم نسخ المنصب الوظيفي بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ المنصب الوظيفي')
    },
  })
}

// Update responsibilities
export const useUpdateResponsibilities = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, responsibilities }: { positionId: string; responsibilities: Omit<Responsibility, 'responsibilityId'>[] }) =>
      updateResponsibilities(positionId, responsibilities),
    onSuccess: (_, { positionId }) => {
      toast.success('تم تحديث المسؤوليات بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المسؤوليات')
    },
  })
}

// Update qualifications
export const useUpdateQualifications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, qualifications }: { positionId: string; qualifications: Qualification }) =>
      updateQualifications(positionId, qualifications),
    onSuccess: (_, { positionId }) => {
      toast.success('تم تحديث المؤهلات بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المؤهلات')
    },
  })
}

// Update salary range
export const useUpdateSalaryRange = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ positionId, salaryRange }: { positionId: string; salaryRange: SalaryRange }) =>
      updateSalaryRange(positionId, salaryRange),
    onSuccess: (_, { positionId }) => {
      toast.success('تم تحديث نطاق الراتب بنجاح')
      queryClient.invalidateQueries({ queryKey: jobPositionsKeys.detail(positionId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث نطاق الراتب')
    },
  })
}

// Export job positions
export const useExportJobPositions = () => {
  return useMutation({
    mutationFn: (filters?: JobPositionFilters) => exportJobPositions(filters),
    onSuccess: () => {
      toast.success('تم تصدير المناصب الوظيفية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير المناصب الوظيفية')
    },
  })
}
