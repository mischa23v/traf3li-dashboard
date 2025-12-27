import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config'
import {
  getAdvances,
  getAdvance,
  createAdvance,
  updateAdvance,
  deleteAdvance,
  getAdvanceStats,
  checkAdvanceEligibility,
  submitAdvanceRequest,
  approveAdvance,
  rejectAdvance,
  disburseAdvance,
  recordAdvanceRecovery,
  processPayrollDeduction,
  processEarlyRecovery,
  waiveAdvance,
  issueClearanceLetter,
  bulkDeleteAdvances,
  getEmployeeAdvances,
  getPendingApprovals,
  getOverdueRecoveries,
  getEmergencyAdvances,
  type AdvanceFilters,
  type CreateAdvanceData,
  type UpdateAdvanceData,
  type RecoveryMethod,
  type DisbursementMethod,
} from '@/services/advancesService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query keys
export const advanceKeys = {
  all: ['advances'] as const,
  lists: () => [...advanceKeys.all, 'list'] as const,
  list: (filters?: AdvanceFilters) => [...advanceKeys.lists(), filters] as const,
  details: () => [...advanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...advanceKeys.details(), id] as const,
  stats: () => [...advanceKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...advanceKeys.all, 'employee', employeeId] as const,
  pendingApprovals: () => [...advanceKeys.all, 'pending-approvals'] as const,
  overdueRecoveries: () => [...advanceKeys.all, 'overdue-recoveries'] as const,
  emergency: () => [...advanceKeys.all, 'emergency'] as const,
}

// Get all advances
export const useAdvances = (filters?: AdvanceFilters) => {
  return useQuery({
    queryKey: advanceKeys.list(filters),
    queryFn: () => getAdvances(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single advance
export const useAdvance = (advanceId: string) => {
  return useQuery({
    queryKey: advanceKeys.detail(advanceId),
    queryFn: () => getAdvance(advanceId),
    enabled: !!advanceId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get advance stats
export const useAdvanceStats = () => {
  return useQuery({
    queryKey: advanceKeys.stats(),
    queryFn: getAdvanceStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee advances
export const useEmployeeAdvances = (employeeId: string) => {
  return useQuery({
    queryKey: advanceKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeAdvances(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending approvals
export const usePendingAdvanceApprovals = () => {
  return useQuery({
    queryKey: advanceKeys.pendingApprovals(),
    queryFn: getPendingApprovals,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get overdue recoveries
export const useOverdueRecoveries = () => {
  return useQuery({
    queryKey: advanceKeys.overdueRecoveries(),
    queryFn: getOverdueRecoveries,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get emergency advances
export const useEmergencyAdvances = () => {
  return useQuery({
    queryKey: advanceKeys.emergency(),
    queryFn: getEmergencyAdvances,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create advance
export const useCreateAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdvanceData) => createAdvance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Update advance
export const useUpdateAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: { advanceId: string; data: UpdateAdvanceData }) =>
      updateAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
    },
  })
}

// Delete advance
export const useDeleteAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (advanceId: string) => deleteAdvance(advanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Check eligibility
export const useCheckAdvanceEligibility = () => {
  return useMutation({
    mutationFn: ({ employeeId, amount }: { employeeId: string; amount: number }) =>
      checkAdvanceEligibility(employeeId, amount),
  })
}

// Submit advance request
/**
 * @deprecated Backend endpoint not implemented yet. Use at your own risk.
 * This mutation will throw an error until the backend implements POST /hr/advances/:advanceId/submit
 *
 * TODO: [BACKEND-PENDING] Implement POST /hr/advances/:advanceId/submit endpoint
 * The backend needs to implement this endpoint before this hook can be used in production.
 */
export const useSubmitAdvanceRequest = () => {
  const queryClient = useQueryClient()

  // Deprecation warning
  console.warn(
    '⚠️ DEPRECATED: useSubmitAdvanceRequest is using a non-implemented backend endpoint. ' +
    'Please implement POST /hr/advances/:advanceId/submit before using this mutation. | ' +
    'تحذير: useSubmitAdvanceRequest يستخدم نقطة نهاية خلفية غير مطبقة. ' +
    'يرجى تنفيذ POST /hr/advances/:advanceId/submit قبل استخدام هذا التحويل.'
  )

  return useMutation({
    mutationFn: async (advanceId: string) => {
      try {
        return await submitAdvanceRequest(advanceId)
      } catch (error) {
        // Enhanced error handling with bilingual messages
        const errorMessage = error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'

        // Show user-facing error alert (bilingual)
        toast.error(
          'فشل إرسال طلب السلفة | Failed to Submit Advance Request',
          {
            description: 'نقطة النهاية الخلفية غير مطبقة. يرجى الاتصال بالدعم الفني. | Backend endpoint not implemented. Please contact technical support.',
          }
        )

        if (error instanceof Error) {
          throw new Error(
            `Failed to submit advance request: ${error.message} | ` +
            `فشل في إرسال طلب السلفة: ${error.message}`
          )
        }
        throw new Error(
          'An unexpected error occurred while submitting the advance request. | ' +
          'حدث خطأ غير متوقع أثناء إرسال طلب السلفة.'
        )
      }
    },
    onSuccess: (_, advanceId) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.pendingApprovals() })

      // Success toast
      toast.success(
        'تم إرسال طلب السلفة بنجاح | Advance Request Submitted Successfully'
      )
    },
    onError: (error) => {
      console.error(
        '❌ Error submitting advance request | خطأ في إرسال طلب السلفة:',
        error
      )
    },
  })
}

// Approve advance
export const useApproveAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        approvedAmount?: number
        approvedInstallments?: number
        comments?: string
      }
    }) => approveAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Reject advance
export const useRejectAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: { reason: string; comments?: string }
    }) => rejectAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.pendingApprovals() })
    },
  })
}

// Disburse advance
export const useDisburseAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        disbursementMethod: DisbursementMethod
        bankDetails?: {
          bankName: string
          accountNumber: string
          iban: string
        }
        transferReference?: string
        urgentDisbursement?: boolean
      }
    }) => disburseAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Record recovery
export const useRecordAdvanceRecovery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        installmentNumber?: number
        amount: number
        recoveryMethod: RecoveryMethod
        recoveryDate: string
        recoveryReference?: string
        notes?: string
      }
    }) => recordAdvanceRecovery(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.overdueRecoveries() })
    },
  })
}

// Process payroll deduction
export const useProcessPayrollDeduction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        payrollRunId: string
        payrollMonth: string
        payrollYear: number
        deductedAmount: number
      }
    }) => processPayrollDeduction(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
    },
  })
}

// Process early recovery
export const useProcessEarlyRecovery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        recoveryAmount: number
        recoveryMethod: RecoveryMethod
        recoveryReference?: string
      }
    }) => processEarlyRecovery(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Waive advance
/**
 * @deprecated Backend endpoint not implemented yet. Use at your own risk.
 * This mutation will throw an error until the backend implements POST /hr/advances/:advanceId/waive
 *
 * TODO: [BACKEND-PENDING] Implement POST /hr/advances/:advanceId/waive endpoint
 * The backend needs to implement this endpoint before this hook can be used in production.
 */
export const useWaiveAdvance = () => {
  const queryClient = useQueryClient()

  // Deprecation warning
  console.warn(
    '⚠️ DEPRECATED: useWaiveAdvance is using a non-implemented backend endpoint. ' +
    'Please implement POST /hr/advances/:advanceId/waive before using this mutation. | ' +
    'تحذير: useWaiveAdvance يستخدم نقطة نهاية خلفية غير مطبقة. ' +
    'يرجى تنفيذ POST /hr/advances/:advanceId/waive قبل استخدام هذا التحويل.'
  )

  return useMutation({
    mutationFn: async ({ advanceId, data }: {
      advanceId: string
      data: {
        waiveReason: string
        waiveAmount?: number
        comments?: string
      }
    }) => {
      try {
        return await waiveAdvance(advanceId, data)
      } catch (error) {
        // Enhanced error handling with bilingual messages
        const errorMessage = error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'

        // Show user-facing error alert (bilingual)
        toast.error(
          'فشل إعفاء السلفة | Failed to Waive Advance',
          {
            description: 'نقطة النهاية الخلفية غير مطبقة. يرجى الاتصال بالدعم الفني. | Backend endpoint not implemented. Please contact technical support.',
          }
        )

        if (error instanceof Error) {
          throw new Error(
            `Failed to waive advance: ${error.message} | ` +
            `فشل في إعفاء السلفة: ${error.message}`
          )
        }
        throw new Error(
          'An unexpected error occurred while waiving the advance. | ' +
          'حدث خطأ غير متوقع أثناء إعفاء السلفة.'
        )
      }
    },
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })

      // Success toast
      toast.success(
        'تم إعفاء السلفة بنجاح | Advance Waived Successfully'
      )
    },
    onError: (error) => {
      console.error(
        '❌ Error waiving advance | خطأ في إعفاء السلفة:',
        error
      )
    },
  })
}

// Issue clearance letter
export const useIssueClearanceLetter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (advanceId: string) => issueClearanceLetter(advanceId),
    onSuccess: (_, advanceId) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
    },
  })
}

// Bulk delete
export const useBulkDeleteAdvances = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdvances(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}
