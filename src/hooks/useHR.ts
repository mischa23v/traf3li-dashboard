import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import hrService, {
  EmployeeFilters,
  CreateEmployeeData,
  UpdateEmployeeData,
  DocumentType,
} from '@/services/hrService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== EMPLOYEES ====================

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: QueryKeys.employees.list(filters),
    queryFn: () => hrService.getEmployees(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.employees.detail(id),
    queryFn: () => hrService.getEmployee(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useEmployeeStats = () => {
  return useQuery({
    queryKey: QueryKeys.employees.stats(),
    queryFn: () => hrService.getEmployeeStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useCreateEmployee = () => {
  return useMutation({
    mutationFn: (data: CreateEmployeeData) => hrService.createEmployee(data),
    onSuccess: () => {
      toast.success('تم إضافة الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الموظف')
    },
    onSettled: async () => {
      await invalidateCache.staff.employees()
    },
  })
}

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      hrService.updateEmployee(id, data),
    onSuccess: () => {
      toast.success('تم تحديث بيانات الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث بيانات الموظف')
    },
    onSettled: async (_, __, variables) => {
      await Promise.all([
        invalidateCache.staff.employees(),
        invalidateCache.staff.employee(variables.id)
      ])
    },
  })
}

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: (id: string) => hrService.deleteEmployee(id),
    onSuccess: () => {
      toast.success('تم حذف الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الموظف')
    },
    onSettled: async () => {
      await invalidateCache.staff.employees()
    },
  })
}

export const useBulkDeleteEmployees = () => {
  return useMutation({
    mutationFn: (ids: string[]) => hrService.bulkDeleteEmployees(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} موظف بنجاح`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الموظفين')
    },
    onSettled: async () => {
      await invalidateCache.staff.employees()
    },
  })
}

// ==================== DOCUMENTS ====================

export const useUploadEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, file, documentType }: { employeeId: string; file: File; documentType: DocumentType }) =>
      hrService.uploadDocument(employeeId, file, documentType),
    onSuccess: () => {
      toast.success('تم رفع المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع المستند')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.staff.employee(variables.employeeId)
    },
  })
}

export const useDeleteEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, documentId }: { employeeId: string; documentId: string }) =>
      hrService.deleteDocument(employeeId, documentId),
    onSuccess: () => {
      toast.success('تم حذف المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستند')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.staff.employee(variables.employeeId)
    },
  })
}

export const useVerifyEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, documentId }: { employeeId: string; documentId: string }) =>
      hrService.verifyDocument(employeeId, documentId),
    onSuccess: () => {
      toast.success('تم التحقق من المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحقق من المستند')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.staff.employee(variables.employeeId)
    },
  })
}
