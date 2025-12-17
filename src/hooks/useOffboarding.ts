import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getOffboardings,
  getOffboarding,
  createOffboarding,
  updateOffboarding,
  deleteOffboarding,
  getOffboardingStats,
  updateOffboardingStatus,
  completeExitInterview,
  addClearanceItem,
  updateClearanceItem,
  completeClearanceSection,
  calculateFinalSettlement,
  approveFinalSettlement,
  processSettlementPayment,
  issueExperienceCertificate,
  completeOffboarding,
  bulkDeleteOffboardings,
  getOffboardingByEmployee,
  getPendingClearances,
  getPendingSettlements,
  updateRehireEligibility,
  type OffboardingFilters,
  type CreateOffboardingData,
  type UpdateOffboardingData,
  type OffboardingStatus,
  type ExitInterview,
  type ClearanceItem,
  type RehireEligibility,
} from '@/services/offboardingService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Query Keys
export const offboardingKeys = {
  all: ['offboarding'] as const,
  lists: () => [...offboardingKeys.all, 'list'] as const,
  list: (filters?: OffboardingFilters) => [...offboardingKeys.lists(), filters] as const,
  details: () => [...offboardingKeys.all, 'detail'] as const,
  detail: (id: string) => [...offboardingKeys.details(), id] as const,
  stats: () => [...offboardingKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...offboardingKeys.all, 'by-employee', employeeId] as const,
  pendingClearances: () => [...offboardingKeys.all, 'pending-clearances'] as const,
  pendingSettlements: () => [...offboardingKeys.all, 'pending-settlements'] as const,
}

// Get offboarding records
export const useOffboardings = (filters?: OffboardingFilters) => {
  return useQuery({
    queryKey: offboardingKeys.list(filters),
    queryFn: () => getOffboardings(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single offboarding record
export const useOffboarding = (offboardingId: string) => {
  return useQuery({
    queryKey: offboardingKeys.detail(offboardingId),
    queryFn: () => getOffboarding(offboardingId),
    enabled: !!offboardingId,
  })
}

// Get offboarding stats
export const useOffboardingStats = () => {
  return useQuery({
    queryKey: offboardingKeys.stats(),
    queryFn: () => getOffboardingStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get offboarding by employee
export const useOffboardingByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: offboardingKeys.byEmployee(employeeId),
    queryFn: () => getOffboardingByEmployee(employeeId),
    enabled: !!employeeId,
  })
}

// Get pending clearances
export const usePendingClearances = () => {
  return useQuery({
    queryKey: offboardingKeys.pendingClearances(),
    queryFn: () => getPendingClearances(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending settlements
export const usePendingSettlements = () => {
  return useQuery({
    queryKey: offboardingKeys.pendingSettlements(),
    queryFn: () => getPendingSettlements(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create offboarding
export const useCreateOffboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOffboardingData) => createOffboarding(data),
    onSuccess: () => {
      toast.success('تم إنشاء سجل إنهاء الخدمة بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء سجل إنهاء الخدمة')
    },
  })
}

// Update offboarding
export const useUpdateOffboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, data }: { offboardingId: string; data: UpdateOffboardingData }) =>
      updateOffboarding(offboardingId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث سجل إنهاء الخدمة بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث سجل إنهاء الخدمة')
    },
  })
}

// Delete offboarding
export const useDeleteOffboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offboardingId: string) => deleteOffboarding(offboardingId),
    onSuccess: () => {
      toast.success('تم حذف سجل إنهاء الخدمة بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف سجل إنهاء الخدمة')
    },
  })
}

// Bulk delete offboardings
export const useBulkDeleteOffboardings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteOffboardings(ids),
    onSuccess: (data) => {
      toast.success(`تم حذف ${data.deleted} سجل إنهاء خدمة بنجاح`)
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف السجلات')
    },
  })
}

// Update offboarding status
export const useUpdateOffboardingStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, status }: { offboardingId: string; status: OffboardingStatus }) =>
      updateOffboardingStatus(offboardingId, status),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث الحالة بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الحالة')
    },
  })
}

// Complete exit interview
export const useCompleteExitInterview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, data }: { offboardingId: string; data: Partial<ExitInterview> }) =>
      completeExitInterview(offboardingId, data),
    onSuccess: (_, variables) => {
      toast.success('تم إكمال مقابلة الخروج بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال مقابلة الخروج')
    },
  })
}

// Add clearance item
export const useAddClearanceItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, item }: { offboardingId: string; item: Partial<ClearanceItem> }) =>
      addClearanceItem(offboardingId, item),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة عنصر الإخلاء بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة عنصر الإخلاء')
    },
  })
}

// Update clearance item
export const useUpdateClearanceItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, itemId, data }: { offboardingId: string; itemId: string; data: Partial<ClearanceItem> }) =>
      updateClearanceItem(offboardingId, itemId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث عنصر الإخلاء بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث عنصر الإخلاء')
    },
  })
}

// Complete clearance section
export const useCompleteClearanceSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, section }: { offboardingId: string; section: 'it' | 'finance' | 'hr' | 'department' | 'manager' }) =>
      completeClearanceSection(offboardingId, section),
    onSuccess: (_, variables) => {
      const sectionNames: Record<string, string> = {
        it: 'تقنية المعلومات',
        finance: 'المالية',
        hr: 'الموارد البشرية',
        department: 'القسم',
        manager: 'المدير',
      }
      toast.success(`تم إكمال إخلاء ${sectionNames[variables.section]} بنجاح`)
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.pendingClearances() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال الإخلاء')
    },
  })
}

// Calculate final settlement
export const useCalculateFinalSettlement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offboardingId: string) => calculateFinalSettlement(offboardingId),
    onSuccess: (_, offboardingId) => {
      toast.success('تم حساب التسوية النهائية بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(offboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حساب التسوية النهائية')
    },
  })
}

// Approve final settlement
export const useApproveFinalSettlement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offboardingId: string) => approveFinalSettlement(offboardingId),
    onSuccess: (_, offboardingId) => {
      toast.success('تم اعتماد التسوية النهائية بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.pendingSettlements() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في اعتماد التسوية النهائية')
    },
  })
}

// Process settlement payment
export const useProcessSettlementPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, paymentData }: {
      offboardingId: string
      paymentData: {
        paymentMethod: 'bank_transfer' | 'check' | 'cash'
        paymentReference?: string
        bankDetails?: {
          bankName: string
          iban: string
          accountNumber: string
        }
      }
    }) => processSettlementPayment(offboardingId, paymentData),
    onSuccess: (_, variables) => {
      toast.success('تم صرف التسوية النهائية بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.pendingSettlements() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في صرف التسوية النهائية')
    },
  })
}

// Issue experience certificate
export const useIssueExperienceCertificate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offboardingId: string) => issueExperienceCertificate(offboardingId),
    onSuccess: (_, offboardingId) => {
      toast.success('تم إصدار شهادة الخبرة بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(offboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إصدار شهادة الخبرة')
    },
  })
}

// Complete offboarding
export const useCompleteOffboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offboardingId: string) => completeOffboarding(offboardingId),
    onSuccess: (_, offboardingId) => {
      toast.success('تم إكمال إنهاء الخدمة بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(offboardingId) })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: offboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال إنهاء الخدمة')
    },
  })
}

// Update rehire eligibility
export const useUpdateRehireEligibility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offboardingId, data }: {
      offboardingId: string
      data: {
        eligibilityCategory: RehireEligibility
        eligibilityReason?: string
        conditions?: string[]
        notes?: string
      }
    }) => updateRehireEligibility(offboardingId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث أهلية إعادة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(variables.offboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث أهلية إعادة التوظيف')
    },
  })
}
