import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import staffingPlanService, {
  type StaffingPlan,
  type StaffingPlanDetail,
  type StaffingPlanFilters,
} from '@/services/staffingPlanService'

// Query Keys
export const staffingPlanKeys = {
  all: ['staffing-plans'] as const,
  lists: () => [...staffingPlanKeys.all, 'list'] as const,
  list: (filters?: StaffingPlanFilters) => [...staffingPlanKeys.lists(), filters] as const,
  details: () => [...staffingPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffingPlanKeys.details(), id] as const,
  stats: () => [...staffingPlanKeys.all, 'stats'] as const,
  active: () => [...staffingPlanKeys.all, 'active'] as const,
  department: (departmentId: string) => [...staffingPlanKeys.all, 'department', departmentId] as const,
  progress: (planId: string) => [...staffingPlanKeys.all, 'progress', planId] as const,
  vacanciesSummary: () => [...staffingPlanKeys.all, 'vacancies-summary'] as const,
  urgentVacancies: () => [...staffingPlanKeys.all, 'urgent-vacancies'] as const,
  headcount: (departmentId: string, designation: string) =>
    [...staffingPlanKeys.all, 'headcount', departmentId, designation] as const,
}

// ==================== STAFFING PLAN HOOKS ====================

export function useStaffingPlans(filters?: StaffingPlanFilters) {
  return useQuery({
    queryKey: staffingPlanKeys.list(filters),
    queryFn: () => staffingPlanService.getStaffingPlans(filters),
  })
}

export function useStaffingPlan(planId: string) {
  return useQuery({
    queryKey: staffingPlanKeys.detail(planId),
    queryFn: () => staffingPlanService.getStaffingPlan(planId),
    enabled: !!planId,
  })
}

export function useStaffingPlanStats() {
  return useQuery({
    queryKey: staffingPlanKeys.stats(),
    queryFn: () => staffingPlanService.getStaffingPlanStats(),
  })
}

export function useActivePlans() {
  return useQuery({
    queryKey: staffingPlanKeys.active(),
    queryFn: () => staffingPlanService.getActivePlans(),
  })
}

export function usePlansByDepartment(departmentId: string) {
  return useQuery({
    queryKey: staffingPlanKeys.department(departmentId),
    queryFn: () => staffingPlanService.getPlansByDepartment(departmentId),
    enabled: !!departmentId,
  })
}

export function usePlanProgress(planId: string) {
  return useQuery({
    queryKey: staffingPlanKeys.progress(planId),
    queryFn: () => staffingPlanService.getPlanProgress(planId),
    enabled: !!planId,
  })
}

export function useVacanciesSummary() {
  return useQuery({
    queryKey: staffingPlanKeys.vacanciesSummary(),
    queryFn: () => staffingPlanService.getVacanciesSummary(),
  })
}

export function useUrgentVacancies() {
  return useQuery({
    queryKey: staffingPlanKeys.urgentVacancies(),
    queryFn: () => staffingPlanService.getUrgentVacancies(),
  })
}

export function useCurrentHeadcount(departmentId: string, designation: string) {
  return useQuery({
    queryKey: staffingPlanKeys.headcount(departmentId, designation),
    queryFn: () => staffingPlanService.getCurrentHeadcount(departmentId, designation),
    enabled: !!departmentId && !!designation,
  })
}

// ==================== MUTATION HOOKS ====================

export function useCreateStaffingPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<StaffingPlan>) => staffingPlanService.createStaffingPlan(data),
    onSuccess: () => {
      toast.success('تم إنشاء خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء خطة التوظيف')
    },
  })
}

export function useUpdateStaffingPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Partial<StaffingPlan> }) =>
      staffingPlanService.updateStaffingPlan(planId, data),
    onSuccess: (_, { planId }) => {
      toast.success('تم تحديث خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث خطة التوظيف')
    },
  })
}

export function useDeleteStaffingPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => staffingPlanService.deleteStaffingPlan(planId),
    onSuccess: () => {
      toast.success('تم حذف خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف خطة التوظيف')
    },
  })
}

export function useDuplicateStaffingPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      planId,
      newPlanData
    }: {
      planId: string
      newPlanData?: { name: string; nameAr?: string; fromDate: string; toDate: string }
    }) => staffingPlanService.duplicateStaffingPlan(planId, newPlanData),
    onSuccess: () => {
      toast.success('تم نسخ خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ خطة التوظيف')
    },
  })
}

// ==================== PLAN DETAIL HOOKS ====================

export function useAddPlanDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      planId,
      detail
    }: {
      planId: string
      detail: Omit<StaffingPlanDetail, 'detailId' | 'vacancies' | 'totalEstimatedBudget'>
    }) => staffingPlanService.addPlanDetail(planId, detail),
    onSuccess: (_, { planId }) => {
      toast.success('تم إضافة تفاصيل المنصب بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.vacanciesSummary() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة تفاصيل المنصب')
    },
  })
}

export function useUpdatePlanDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      planId,
      detailId,
      detail
    }: {
      planId: string
      detailId: string
      detail: Partial<StaffingPlanDetail>
    }) => staffingPlanService.updatePlanDetail(planId, detailId, detail),
    onSuccess: (_, { planId }) => {
      toast.success('تم تحديث تفاصيل المنصب بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.vacanciesSummary() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث تفاصيل المنصب')
    },
  })
}

export function useRemovePlanDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, detailId }: { planId: string; detailId: string }) =>
      staffingPlanService.removePlanDetail(planId, detailId),
    onSuccess: (_, { planId }) => {
      toast.success('تم حذف تفاصيل المنصب بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.vacanciesSummary() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف تفاصيل المنصب')
    },
  })
}

export function useBulkUpdateDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      planId,
      updates
    }: {
      planId: string
      updates: Array<{ detailId: string; data: Partial<StaffingPlanDetail> }>
    }) => staffingPlanService.bulkUpdateDetails(planId, updates),
    onSuccess: (_, { planId }) => {
      toast.success('تم تحديث التفاصيل بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التفاصيل')
    },
  })
}

// ==================== VACANCY CALCULATION HOOKS ====================

export function useCalculateVacancies() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => staffingPlanService.calculateVacancies(planId),
    onSuccess: (_, planId) => {
      toast.success('تم حساب الشواغر بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.vacanciesSummary() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حساب الشواغر')
    },
  })
}

// ==================== JOB OPENING HOOKS ====================

export function useCreateJobOpeningFromPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, detailId }: { planId: string; detailId: string }) =>
      staffingPlanService.createJobOpeningFromPlan(planId, detailId),
    onSuccess: (_, { planId }) => {
      toast.success('تم إنشاء إعلان الوظيفة بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
      // Also invalidate job postings if using recruitment hooks
      queryClient.invalidateQueries({ queryKey: ['job-postings'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إعلان الوظيفة')
    },
  })
}

export function useLinkJobOpening() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      planId,
      detailId,
      jobOpeningId
    }: {
      planId: string
      detailId: string
      jobOpeningId: string
    }) => staffingPlanService.linkJobOpening(planId, detailId, jobOpeningId),
    onSuccess: (_, { planId }) => {
      toast.success('تم ربط إعلان الوظيفة بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط إعلان الوظيفة')
    },
  })
}

export function useUnlinkJobOpening() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, detailId }: { planId: string; detailId: string }) =>
      staffingPlanService.unlinkJobOpening(planId, detailId),
    onSuccess: (_, { planId }) => {
      toast.success('تم إلغاء ربط إعلان الوظيفة بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء ربط إعلان الوظيفة')
    },
  })
}

export function useBulkCreateJobOpenings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, detailIds }: { planId: string; detailIds: string[] }) =>
      staffingPlanService.bulkCreateJobOpenings(planId, detailIds),
    onSuccess: (data, { planId }) => {
      toast.success(`تم إنشاء ${data.created} إعلان وظيفي بنجاح`)
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.progress(planId) })
      queryClient.invalidateQueries({ queryKey: ['job-postings'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إعلانات الوظائف')
    },
  })
}

// ==================== STATUS MANAGEMENT HOOKS ====================

export function useActivatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => staffingPlanService.activatePlan(planId),
    onSuccess: (_, planId) => {
      toast.success('تم تفعيل خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.stats() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.active() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل خطة التوظيف')
    },
  })
}

export function useClosePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, reason }: { planId: string; reason?: string }) =>
      staffingPlanService.closePlan(planId, reason),
    onSuccess: (_, { planId }) => {
      toast.success('تم إغلاق خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.stats() })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.active() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إغلاق خطة التوظيف')
    },
  })
}

export function useApprovePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, notes }: { planId: string; notes?: string }) =>
      staffingPlanService.approvePlan(planId, notes),
    onSuccess: (_, { planId }) => {
      toast.success('تم اعتماد خطة التوظيف بنجاح')
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: staffingPlanKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل اعتماد خطة التوظيف')
    },
  })
}

// ==================== EXPORT HOOKS ====================

export function useExportStaffingPlans() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: StaffingPlanFilters; format?: 'pdf' | 'excel' }) =>
      staffingPlanService.exportStaffingPlans(filters, format),
    onSuccess: () => {
      toast.success('تم تصدير خطط التوظيف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير خطط التوظيف')
    },
  })
}

export function useExportVacanciesReport() {
  return useMutation({
    mutationFn: (format: 'pdf' | 'excel' = 'excel') =>
      staffingPlanService.exportVacanciesReport(format),
    onSuccess: () => {
      toast.success('تم تصدير تقرير الشواغر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير تقرير الشواغر')
    },
  })
}
