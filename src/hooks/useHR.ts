import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import hrService, {
  type EmployeeFilters,
  type CreateEmployeeData,
  type UpdateEmployeeData,
  type DocumentType,
} from '@/services/hrService'

// ==================== EMPLOYEES ====================

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => hrService.getEmployees(filters),
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => hrService.getEmployee(id),
    enabled: !!id,
  })
}

export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employees', 'stats'],
    queryFn: () => hrService.getEmployeeStats(),
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeData) => hrService.createEmployee(data),
    onSuccess: () => {
      toast.success('تم إضافة الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الموظف')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      await queryClient.invalidateQueries({ queryKey: ['employees', variables.id] })
    },
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => hrService.deleteEmployee(id),
    onSuccess: () => {
      toast.success('تم حذف الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الموظف')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export const useBulkDeleteEmployees = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => hrService.bulkDeleteEmployees(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} موظف بنجاح`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الموظفين')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

// ==================== DOCUMENTS ====================

export const useUploadEmployeeDocument = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['employees', variables.employeeId] })
    },
  })
}

export const useDeleteEmployeeDocument = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['employees', variables.employeeId] })
    },
  })
}

export const useVerifyEmployeeDocument = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['employees', variables.employeeId] })
    },
  })
}
