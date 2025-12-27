import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import staffingPlanService, {
  type StaffingPlan,
  type StaffingPlanDetail,
  type StaffingPlanFilters,
} from '@/services/staffingPlanService'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'

// ==================== STAFFING PLAN HOOKS ====================

export function useStaffingPlans(filters?: StaffingPlanFilters) {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.list(filters),
    queryFn: () => staffingPlanService.getStaffingPlans(filters),
  })
}

export function useStaffingPlan(planId: string) {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.detail(planId),
    queryFn: () => staffingPlanService.getStaffingPlan(planId),
    enabled: !!planId,
  })
}

export function useStaffingPlanStats() {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.stats(),
    queryFn: () => staffingPlanService.getStaffingPlanStats(),
  })
}

export function useActivePlans() {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.active(),
    queryFn: () => staffingPlanService.getActivePlans(),
  })
}

export function usePlansByDepartment(departmentId: string) {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.department(departmentId),
    queryFn: () => staffingPlanService.getPlansByDepartment(departmentId),
    enabled: !!departmentId,
  })
}

export function usePlanProgress(planId: string) {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.progress(planId),
    queryFn: () => staffingPlanService.getPlanProgress(planId),
    enabled: !!planId,
  })
}

export function useVacanciesSummary() {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.vacanciesSummary(),
    queryFn: () => staffingPlanService.getVacanciesSummary(),
  })
}

export function useUrgentVacancies() {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.urgentVacancies(),
    queryFn: () => staffingPlanService.getUrgentVacancies(),
  })
}

export function useCurrentHeadcount(departmentId: string, designation: string) {
  return useQuery({
    queryKey: QueryKeys.staffingPlan.headcount(departmentId, designation),
    queryFn: () => staffingPlanService.getCurrentHeadcount(departmentId, designation),
    enabled: !!departmentId && !!designation,
  })
}

// ==================== MUTATION HOOKS ====================

export function useCreateStaffingPlan() {
  return useMutation({
    mutationFn: (data: Partial<StaffingPlan>) => staffingPlanService.createStaffingPlan(data),
    onSuccess: () => {
      toast.success('تم إنشاء خطة التوظيف بنجاح')
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء خطة التوظيف')
    },
  })
}

export function useUpdateStaffingPlan() {
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Partial<StaffingPlan> }) =>
      staffingPlanService.updateStaffingPlan(planId, data),
    onSuccess: (_, { planId }) => {
      toast.success('تم تحديث خطة التوظيف بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث خطة التوظيف')
    },
  })
}

export function useDeleteStaffingPlan() {
  return useMutation({
    mutationFn: (planId: string) => staffingPlanService.deleteStaffingPlan(planId),
    onSuccess: () => {
      toast.success('تم حذف خطة التوظيف بنجاح')
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف خطة التوظيف')
    },
  })
}

export function useDuplicateStaffingPlan() {
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
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ خطة التوظيف')
    },
  })
}

// ==================== PLAN DETAIL HOOKS ====================

export function useAddPlanDetail() {
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
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.progress(planId)
      invalidateCache.staffingPlan.vacanciesSummary()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة تفاصيل المنصب')
    },
  })
}

export function useUpdatePlanDetail() {
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
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.progress(planId)
      invalidateCache.staffingPlan.vacanciesSummary()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث تفاصيل المنصب')
    },
  })
}

export function useRemovePlanDetail() {
  return useMutation({
    mutationFn: ({ planId, detailId }: { planId: string; detailId: string }) =>
      staffingPlanService.removePlanDetail(planId, detailId),
    onSuccess: (_, { planId }) => {
      toast.success('تم حذف تفاصيل المنصب بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.progress(planId)
      invalidateCache.staffingPlan.vacanciesSummary()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف تفاصيل المنصب')
    },
  })
}

export function useBulkUpdateDetails() {
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
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.progress(planId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التفاصيل')
    },
  })
}

// ==================== VACANCY CALCULATION HOOKS ====================

export function useCalculateVacancies() {
  return useMutation({
    mutationFn: (planId: string) => staffingPlanService.calculateVacancies(planId),
    onSuccess: (_, planId) => {
      toast.success('تم حساب الشواغر بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.progress(planId)
      invalidateCache.staffingPlan.vacanciesSummary()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حساب الشواغر')
    },
  })
}

// ==================== JOB OPENING HOOKS ====================

export function useCreateJobOpeningFromPlan() {
  return useMutation({
    mutationFn: ({ planId, detailId }: { planId: string; detailId: string }) =>
      staffingPlanService.createJobOpeningFromPlan(planId, detailId),
    onSuccess: (_, { planId }) => {
      toast.success('تم إنشاء إعلان الوظيفة بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.progress(planId)
      invalidateCache.jobs.postings()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إعلان الوظيفة')
    },
  })
}

export function useLinkJobOpening() {
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
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.progress(planId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط إعلان الوظيفة')
    },
  })
}

export function useUnlinkJobOpening() {
  return useMutation({
    mutationFn: ({ planId, detailId }: { planId: string; detailId: string }) =>
      staffingPlanService.unlinkJobOpening(planId, detailId),
    onSuccess: (_, { planId }) => {
      toast.success('تم إلغاء ربط إعلان الوظيفة بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.progress(planId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء ربط إعلان الوظيفة')
    },
  })
}

export function useBulkCreateJobOpenings() {
  return useMutation({
    mutationFn: ({ planId, detailIds }: { planId: string; detailIds: string[] }) =>
      staffingPlanService.bulkCreateJobOpenings(planId, detailIds),
    onSuccess: (data, { planId }) => {
      toast.success(`تم إنشاء ${data.created} إعلان وظيفي بنجاح`)
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.progress(planId)
      invalidateCache.jobs.postings()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إعلانات الوظائف')
    },
  })
}

// ==================== STATUS MANAGEMENT HOOKS ====================

export function useActivatePlan() {
  return useMutation({
    mutationFn: (planId: string) => staffingPlanService.activatePlan(planId),
    onSuccess: (_, planId) => {
      toast.success('تم تفعيل خطة التوظيف بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.stats()
      invalidateCache.staffingPlan.active()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل خطة التوظيف')
    },
  })
}

export function useClosePlan() {
  return useMutation({
    mutationFn: ({ planId, reason }: { planId: string; reason?: string }) =>
      staffingPlanService.closePlan(planId, reason),
    onSuccess: (_, { planId }) => {
      toast.success('تم إغلاق خطة التوظيف بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
      invalidateCache.staffingPlan.stats()
      invalidateCache.staffingPlan.active()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إغلاق خطة التوظيف')
    },
  })
}

export function useApprovePlan() {
  return useMutation({
    mutationFn: ({ planId, notes }: { planId: string; notes?: string }) =>
      staffingPlanService.approvePlan(planId, notes),
    onSuccess: (_, { planId }) => {
      toast.success('تم اعتماد خطة التوظيف بنجاح')
      invalidateCache.staffingPlan.detail(planId)
      invalidateCache.staffingPlan.lists()
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
