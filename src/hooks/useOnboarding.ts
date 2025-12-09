import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  })
}

// Create onboarding
export const useCreateOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOnboardingData) => createOnboarding(data),
    onSuccess: () => {
      toast.success('تم إنشاء برنامج التأهيل بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء برنامج التأهيل')
    },
  })
}

// Update onboarding
export const useUpdateOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, data }: { onboardingId: string; data: UpdateOnboardingData }) =>
      updateOnboarding(onboardingId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث برنامج التأهيل بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث برنامج التأهيل')
    },
  })
}

// Delete onboarding
export const useDeleteOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (onboardingId: string) => deleteOnboarding(onboardingId),
    onSuccess: () => {
      toast.success('تم حذف برنامج التأهيل بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف برنامج التأهيل')
    },
  })
}

// Bulk delete onboardings
export const useBulkDeleteOnboardings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteOnboardings(ids),
    onSuccess: (data) => {
      toast.success(`تم حذف ${data.deleted} برنامج تأهيل بنجاح`)
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف برامج التأهيل')
    },
  })
}

// Update onboarding status
export const useUpdateOnboardingStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, status }: { onboardingId: string; status: OnboardingStatus }) =>
      updateOnboardingStatus(onboardingId, status),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث الحالة بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الحالة')
    },
  })
}

// Complete task
export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, taskId }: { onboardingId: string; taskId: string }) =>
      completeTask(onboardingId, taskId),
    onSuccess: (_, variables) => {
      toast.success('تم إكمال المهمة بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال المهمة')
    },
  })
}

// Add probation review
export const useAddProbationReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, review }: { onboardingId: string; review: Partial<ProbationReview> }) =>
      addProbationReview(onboardingId, review),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة تقييم فترة التجربة بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.upcomingReviews() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة التقييم')
    },
  })
}

// Complete probation (no extension - max 180 days per Saudi Labor Law Article 53)
export const useCompleteProbation = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال فترة التجربة')
    },
  })
}

// Upload document
export const useUploadOnboardingDocument = () => {
  const queryClient = useQueryClient()

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
  const queryClient = useQueryClient()

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (onboardingId: string) => completeFirstDay(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال اليوم الأول بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال اليوم الأول')
    },
  })
}

// Complete first week
export const useCompleteFirstWeek = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (onboardingId: string) => completeFirstWeek(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال الأسبوع الأول بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال الأسبوع الأول')
    },
  })
}

// Complete first month
export const useCompleteFirstMonth = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (onboardingId: string) => completeFirstMonth(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال الشهر الأول بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال الشهر الأول')
    },
  })
}

// Complete onboarding
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (onboardingId: string) => completeOnboarding(onboardingId),
    onSuccess: (_, onboardingId) => {
      toast.success('تم إكمال برنامج التأهيل بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(onboardingId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إكمال برنامج التأهيل')
    },
  })
}

// Add checklist category
export const useAddChecklistCategory = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة فئة القائمة')
    },
  })
}

// Add checklist task
export const useAddChecklistTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, categoryId, task }: {
      onboardingId: string
      categoryId: string
      task: Partial<OnboardingTask>
    }) => addChecklistTask(onboardingId, categoryId, task),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة مهمة القائمة بنجاح')
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة مهمة القائمة')
    },
  })
}

// Add employee feedback
export const useAddEmployeeFeedback = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(variables.onboardingId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة ملاحظات الموظف')
    },
  })
}
