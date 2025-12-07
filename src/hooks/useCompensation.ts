import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  compensationApi,
  CompensationReward,
  type CompensationFilters,
  type CreateCompensationInput,
  type UpdateCompensationInput,
  type Allowance,
  type RecognitionAward,
  type ChangeType,
  type BonusType
} from '@/services/compensationService'
import { toast } from 'sonner'

// Query Keys
export const compensationKeys = {
  all: ['compensation'] as const,
  lists: () => [...compensationKeys.all, 'list'] as const,
  list: (filters?: CompensationFilters) => [...compensationKeys.lists(), filters] as const,
  details: () => [...compensationKeys.all, 'detail'] as const,
  detail: (id: string) => [...compensationKeys.details(), id] as const,
  byEmployee: (employeeId: string) => [...compensationKeys.all, 'by-employee', employeeId] as const,
  stats: (officeId?: string) => [...compensationKeys.all, 'stats', officeId] as const,
  payGradeAnalysis: (payGrade: string) => [...compensationKeys.all, 'pay-grade-analysis', payGrade] as const
}

// ==================== QUERY HOOKS ====================

// Get all compensation records
export function useCompensationRecords(filters?: CompensationFilters) {
  return useQuery({
    queryKey: compensationKeys.list(filters),
    queryFn: () => compensationApi.getAll(filters)
  })
}

// Get single compensation record
export function useCompensationRecord(id: string) {
  return useQuery({
    queryKey: compensationKeys.detail(id),
    queryFn: () => compensationApi.getById(id),
    enabled: !!id
  })
}

// Get compensation by employee
export function useCompensationByEmployee(employeeId: string) {
  return useQuery({
    queryKey: compensationKeys.byEmployee(employeeId),
    queryFn: () => compensationApi.getByEmployee(employeeId),
    enabled: !!employeeId
  })
}

// Get compensation statistics
export function useCompensationStats(officeId?: string) {
  return useQuery({
    queryKey: compensationKeys.stats(officeId),
    queryFn: () => compensationApi.getStats(officeId)
  })
}

// Get pay grade analysis
export function usePayGradeAnalysis(payGrade: string) {
  return useQuery({
    queryKey: compensationKeys.payGradeAnalysis(payGrade),
    queryFn: () => compensationApi.getPayGradeAnalysis(payGrade),
    enabled: !!payGrade
  })
}

// ==================== MUTATION HOOKS ====================

// Create compensation record
export function useCreateCompensation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompensationInput) => compensationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم إنشاء سجل التعويضات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إنشاء سجل التعويضات: ${error.message}`)
    }
  })
}

// Update compensation record
export function useUpdateCompensation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompensationInput }) =>
      compensationApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      toast.success('تم تحديث سجل التعويضات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث سجل التعويضات: ${error.message}`)
    }
  })
}

// Delete compensation record
export function useDeleteCompensation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => compensationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم حذف سجل التعويضات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف سجل التعويضات: ${error.message}`)
    }
  })
}

// Bulk delete compensation records
export function useBulkDeleteCompensation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => compensationApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم حذف سجلات التعويضات المحددة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف سجلات التعويضات: ${error.message}`)
    }
  })
}

// ==================== SALARY MUTATION HOOKS ====================

// Process salary increase
export function useProcessSalaryIncrease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        increaseAmount?: number
        increasePercentage?: number
        changeType: ChangeType
        changeReason?: string
        effectiveDate: string
      }
    }) => compensationApi.processSalaryIncrease(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم معالجة زيادة الراتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل معالجة زيادة الراتب: ${error.message}`)
    }
  })
}

// ==================== ALLOWANCE MUTATION HOOKS ====================

// Add allowance
export function useAddAllowance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, allowance }: { id: string; allowance: Omit<Allowance, 'allowanceId'> }) =>
      compensationApi.addAllowance(id, allowance),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم إضافة البدل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إضافة البدل: ${error.message}`)
    }
  })
}

// Update allowance
export function useUpdateAllowance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, allowanceId, data }: { id: string; allowanceId: string; data: Partial<Allowance> }) =>
      compensationApi.updateAllowance(id, allowanceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم تحديث البدل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث البدل: ${error.message}`)
    }
  })
}

// Remove allowance
export function useRemoveAllowance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, allowanceId }: { id: string; allowanceId: string }) =>
      compensationApi.removeAllowance(id, allowanceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم إزالة البدل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إزالة البدل: ${error.message}`)
    }
  })
}

// ==================== BONUS MUTATION HOOKS ====================

// Process bonus
export function useProcessBonus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        bonusType: BonusType
        targetAmount: number
        actualAmount: number
        year: number
        paymentDate?: string
      }
    }) => compensationApi.processBonus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم معالجة المكافأة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل معالجة المكافأة: ${error.message}`)
    }
  })
}

// ==================== REVIEW MUTATION HOOKS ====================

// Submit for salary review
export function useSubmitForReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => compensationApi.submitForReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم تقديم الطلب للمراجعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تقديم الطلب للمراجعة: ${error.message}`)
    }
  })
}

// Approve salary review
export function useApproveReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        approvedIncrease: number
        approvedPercentage: number
        effectiveDate: string
        comments?: string
      }
    }) => compensationApi.approveReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم اعتماد المراجعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل اعتماد المراجعة: ${error.message}`)
    }
  })
}

// ==================== RECOGNITION MUTATION HOOKS ====================

// Add recognition award
export function useAddRecognition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, award }: { id: string; award: Omit<RecognitionAward, 'programId'> }) =>
      compensationApi.addRecognition(id, award),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compensationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: compensationKeys.all })
      toast.success('تم إضافة جائزة التقدير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إضافة جائزة التقدير: ${error.message}`)
    }
  })
}

// Generate total rewards statement
export function useGenerateTotalRewardsStatement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => compensationApi.generateTotalRewardsStatement(id),
    onSuccess: () => {
      toast.success('تم إنشاء كشف المكافآت الإجمالية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إنشاء كشف المكافآت الإجمالية: ${error.message}`)
    }
  })
}
