import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getBenefits,
  getBenefit,
  getBenefitStats,
  getEmployeeBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  bulkDeleteBenefits,
  activateBenefit,
  suspendBenefit,
  terminateBenefit,
  addDependent,
  removeDependent,
  updateBeneficiary,
  exportBenefits,
  type BenefitFilters,
  type CreateBenefitData,
  type UpdateBenefitData,
  type CoveredDependent,
  type Beneficiary,
} from '@/services/benefitsService'

// Query keys
export const benefitKeys = {
  all: ['benefits'] as const,
  lists: () => [...benefitKeys.all, 'list'] as const,
  list: (filters?: BenefitFilters) => [...benefitKeys.lists(), filters] as const,
  details: () => [...benefitKeys.all, 'detail'] as const,
  detail: (id: string) => [...benefitKeys.details(), id] as const,
  stats: () => [...benefitKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...benefitKeys.all, 'employee', employeeId] as const,
}

// Get all benefits
export const useBenefits = (filters?: BenefitFilters) => {
  return useQuery({
    queryKey: benefitKeys.list(filters),
    queryFn: () => getBenefits(filters),
  })
}

// Get single benefit
export const useBenefit = (benefitId: string) => {
  return useQuery({
    queryKey: benefitKeys.detail(benefitId),
    queryFn: () => getBenefit(benefitId),
    enabled: !!benefitId,
  })
}

// Get benefit stats
export const useBenefitStats = () => {
  return useQuery({
    queryKey: benefitKeys.stats(),
    queryFn: getBenefitStats,
  })
}

// Get employee benefits
export const useEmployeeBenefits = (employeeId: string) => {
  return useQuery({
    queryKey: benefitKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeBenefits(employeeId),
    enabled: !!employeeId,
  })
}

// Create benefit
export const useCreateBenefit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBenefitData) => createBenefit(data),
    onSuccess: () => {
      toast.success('تم إضافة الميزة بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
      queryClient.invalidateQueries({ queryKey: benefitKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الميزة')
    },
  })
}

// Update benefit
export const useUpdateBenefit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, data }: { benefitId: string; data: UpdateBenefitData }) =>
      updateBenefit(benefitId, data),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم تحديث الميزة بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الميزة')
    },
  })
}

// Delete benefit
export const useDeleteBenefit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (benefitId: string) => deleteBenefit(benefitId),
    onSuccess: () => {
      toast.success('تم حذف الميزة بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
      queryClient.invalidateQueries({ queryKey: benefitKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الميزة')
    },
  })
}

// Bulk delete benefits
export const useBulkDeleteBenefits = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteBenefits(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} ميزة بنجاح`)
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
      queryClient.invalidateQueries({ queryKey: benefitKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المزايا')
    },
  })
}

// Activate benefit
export const useActivateBenefit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, data }: { benefitId: string; data?: { notes?: string } }) =>
      activateBenefit(benefitId, data),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم تفعيل الميزة بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
      queryClient.invalidateQueries({ queryKey: benefitKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل الميزة')
    },
  })
}

// Suspend benefit
export const useSuspendBenefit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, data }: { benefitId: string; data: { reason: string } }) =>
      suspendBenefit(benefitId, data),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم إيقاف الميزة بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف الميزة')
    },
  })
}

// Terminate benefit
export const useTerminateBenefit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, data }: { benefitId: string; data: { reason: string; terminationDate?: string } }) =>
      terminateBenefit(benefitId, data),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم إنهاء الميزة بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
      queryClient.invalidateQueries({ queryKey: benefitKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنهاء الميزة')
    },
  })
}

// Add dependent
export const useAddDependent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, data }: { benefitId: string; data: Omit<CoveredDependent, 'memberId'> }) =>
      addDependent(benefitId, data),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم إضافة المعال بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المعال')
    },
  })
}

// Remove dependent
export const useRemoveDependent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, memberId }: { benefitId: string; memberId: string }) =>
      removeDependent(benefitId, memberId),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم إزالة المعال بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إزالة المعال')
    },
  })
}

// Update beneficiary
export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ benefitId, beneficiaryId, data }: {
      benefitId: string
      beneficiaryId: string
      data: Partial<Beneficiary>
    }) => updateBeneficiary(benefitId, beneficiaryId, data),
    onSuccess: (_, { benefitId }) => {
      toast.success('تم تحديث المستفيد بنجاح')
      queryClient.invalidateQueries({ queryKey: benefitKeys.detail(benefitId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المستفيد')
    },
  })
}

// Export benefits
export const useExportBenefits = () => {
  return useMutation({
    mutationFn: (filters?: BenefitFilters) => exportBenefits(filters),
    onSuccess: () => {
      toast.success('تم تصدير المزايا بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير المزايا')
    },
  })
}
