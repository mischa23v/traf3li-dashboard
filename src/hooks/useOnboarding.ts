import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getOnboardings,
  getOnboarding,
  createOnboarding,
  updateOnboarding,
  deleteOnboarding,
  getOnboardingStats,
  updateOnboardingStatus,
  completeTask,
  addProbationReview,
  completeProbation,
  uploadOnboardingDocument,
  verifyOnboardingDocument,
  completeFirstDay,
  completeFirstWeek,
  completeFirstMonth,
  completeOnboarding,
  bulkDeleteOnboardings,
  getOnboardingByEmployee,
  getUpcomingProbationReviews,
  addChecklistCategory,
  addChecklistTask,
  addEmployeeFeedback,
  type OnboardingFilters,
  type CreateOnboardingData,
  type UpdateOnboardingData,
  type OnboardingStatus,
  type OnboardingDocumentType,
  type ProbationReview,
  type ProbationDecision,
  type OnboardingTask,
} from '@/services/onboardingService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query Keys
export const onboardingKeys = {
  all: ['onboarding'] as const,
  lists: () => [...onboardingKeys.all, 'list'] as const,
  list: (filters?: OnboardingFilters) => [...onboardingKeys.lists(), filters] as const,
  details: () => [...onboardingKeys.all, 'detail'] as const,
  detail: (id: string) => [...onboardingKeys.details(), id] as const,
  stats: () => [...onboardingKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...onboardingKeys.all, 'by-employee', employeeId] as const,
  upcomingReviews: (days?: number) => [...onboardingKeys.all, 'upcoming-reviews', days] as const,
}

// Get onboarding records
export const useOnboardings = (filters?: OnboardingFilters) => {
  return useQuery({
    queryKey: onboardingKeys.list(filters),
    queryFn: () => getOnboardings(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single onboarding record
export const useOnboarding = (onboardingId: string) => {
  return useQuery({
    queryKey: onboardingKeys.detail(onboardingId),
    queryFn: () => getOnboarding(onboardingId),
    enabled: !!onboardingId,
  })
}

// Get onboarding stats
export const useOnboardingStats = () => {
  return useQuery({
    queryKey: onboardingKeys.stats(),
    queryFn: () => getOnboardingStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get onboarding by employee
export const useOnboardingByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: onboardingKeys.byEmployee(employeeId),
    queryFn: () => getOnboardingByEmployee(employeeId),
    enabled: !!employeeId,
  })
}

// Get upcoming probation reviews
export const useUpcomingProbationReviews = (days?: number) => {
  return useQuery({
    queryKey: onboardingKeys.upcomingReviews(days),
    queryFn: () => getUpcomingProbationReviews(days),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create onboarding
export const useCreateOnboarding = () => {
  return useMutation({
    mutationFn: (data: CreateOnboardingData) => createOnboarding(data),
    onSuccess: () => {
      toast.success('تم إنشاء برنامج التأهيل بنجاح')
      invalidateCache.onboarding.lists()
      invalidateCache.onboarding.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء برنامج التأهيل')
    },
  })
}

// Update onboarding
export const useUpdateOnboarding = () => {
  return useMutation({
    mutationFn: ({ onboardingId, data }: { onboardingId: string; data: UpdateOnboardingData }) =>
      updateOnboarding(onboardingId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث برنامج التأهيل بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
      invalidateCache.onboarding.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث برنامج التأهيل')
    },
  })
}

// Delete onboarding
export const useDeleteOnboarding = () => {
  return useMutation({
    mutationFn: (onboardingId: string) => deleteOnboarding(onboardingId),
    onSuccess: () => {
      toast.success('تم حذف برنامج التأهيل بنجاح')
      invalidateCache.onboarding.lists()
      invalidateCache.onboarding.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف برنامج التأهيل')
    },
  })
}

// Bulk delete onboardings
export const useBulkDeleteOnboardings = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteOnboardings(ids),
    onSuccess: (data) => {
      toast.success(`تم حذف ${data.deleted} برنامج تأهيل بنجاح`)
      invalidateCache.onboarding.lists()
      invalidateCache.onboarding.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف برامج التأهيل')
    },
  })
}

// Update onboarding status
export const useUpdateOnboardingStatus = () => {
  return useMutation({
    mutationFn: ({ onboardingId, status }: { onboardingId: string; status: OnboardingStatus }) =>
      updateOnboardingStatus(onboardingId, status),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث الحالة بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
      invalidateCache.onboarding.lists()
      invalidateCache.onboarding.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الحالة')
    },
  })
}

// Complete task
export const useCompleteTask = () => {
  return useMutation({
    mutationFn: ({ onboardingId, taskId }: { onboardingId: string; taskId: string }) =>
      completeTask(onboardingId, taskId),
    onSuccess: (_, variables) => {
      toast.success('تم إكمال المهمة بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
      invalidateCache.onboarding.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال المهمة')
    },
  })
}

// Add probation review
export const useAddProbationReview = () => {
  return useMutation({
    mutationFn: ({ onboardingId, review }: { onboardingId: string; review: Partial<ProbationReview> }) =>
      addProbationReview(onboardingId, review),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة تقييم فترة التجربة بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
      invalidateCache.onboarding.upcomingReviews()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة التقييم')
    },
  })
}

// Complete probation (no extension - max 180 days per Saudi Labor Law Article 53)
export const useCompleteProbation = () => {
  return useMutation({
    mutationFn: ({ onboardingId, data }: {
      onboardingId: string
      data: {
        decision: ProbationDecision
        decisionReason: string
        confirmationDate?: string
      }
    }) => completeProbation(onboardingId, data),
    onSuccess: (_, variables) => {
      const messages: Record<ProbationDecision, string> = {
        confirm: 'تم تثبيت الموظف بنجاح',
        terminate: 'تم إنهاء فترة التجربة',
      }
      toast.success(messages[variables.data.decision])
      invalidateCache.onboarding.detail(variables.onboardingId)
      invalidateCache.onboarding.lists()
      invalidateCache.onboarding.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال فترة التجربة')
    },
  })
}

// Upload document
export const useUploadOnboardingDocument = () => {
  return useMutation({
    mutationFn: ({ onboardingId, file, documentType }: {
      onboardingId: string
      file: File
      documentType: OnboardingDocumentType
    }) => uploadOnboardingDocument(onboardingId, file, documentType),
    onSuccess: () => {
      toast.success('تم رفع المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في رفع المستند')
    },
  })
}

// Verify document
export const useVerifyOnboardingDocument = () => {
  return useMutation({
    mutationFn: ({ onboardingId, documentType }: {
      onboardingId: string
      documentType: OnboardingDocumentType
    }) => verifyOnboardingDocument(onboardingId, documentType),
    onSuccess: () => {
      toast.success('تم التحقق من المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحقق من المستند')
    },
  })
}

// Complete first day
export const useCompleteFirstDay = () => {
  return useMutation({
    mutationFn: (onboardingId: string) => completeFirstDay(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال اليوم الأول بنجاح')
      invalidateCache.onboarding.detail(onboardingId)
      invalidateCache.onboarding.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال اليوم الأول')
    },
  })
}

// Complete first week
export const useCompleteFirstWeek = () => {
  return useMutation({
    mutationFn: (onboardingId: string) => completeFirstWeek(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال الأسبوع الأول بنجاح')
      invalidateCache.onboarding.detail(onboardingId)
      invalidateCache.onboarding.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال الأسبوع الأول')
    },
  })
}

// Complete first month
export const useCompleteFirstMonth = () => {
  return useMutation({
    mutationFn: (onboardingId: string) => completeFirstMonth(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال الشهر الأول بنجاح')
      invalidateCache.onboarding.detail(onboardingId)
      invalidateCache.onboarding.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال الشهر الأول')
    },
  })
}

// Complete onboarding
export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: (onboardingId: string) => completeOnboarding(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال برنامج التأهيل بنجاح')
      invalidateCache.onboarding.detail(onboardingId)
      invalidateCache.onboarding.lists()
      invalidateCache.onboarding.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال برنامج التأهيل')
    },
  })
}

// Add checklist category
export const useAddChecklistCategory = () => {
  return useMutation({
    mutationFn: ({ onboardingId, category }: {
      onboardingId: string
      category: {
        categoryName: string
        categoryNameAr?: string
      }
    }) => addChecklistCategory(onboardingId, category),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة فئة القائمة بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة فئة القائمة')
    },
  })
}

// Add checklist task
export const useAddChecklistTask = () => {
  return useMutation({
    mutationFn: ({ onboardingId, categoryId, task }: {
      onboardingId: string
      categoryId: string
      task: Partial<OnboardingTask>
    }) => addChecklistTask(onboardingId, categoryId, task),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة مهمة القائمة بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة مهمة القائمة')
    },
  })
}

// Add employee feedback
export const useAddEmployeeFeedback = () => {
  return useMutation({
    mutationFn: ({ onboardingId, feedback }: {
      onboardingId: string
      feedback: {
        feedbackType: 'first_day' | 'first_week' | 'first_month' | 'general'
        rating?: number
        comments: string
        suggestions?: string
      }
    }) => addEmployeeFeedback(onboardingId, feedback),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة ملاحظات الموظف بنجاح')
      invalidateCache.onboarding.detail(variables.onboardingId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة ملاحظات الموظف')
    },
  })
}
