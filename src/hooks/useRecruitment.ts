import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
import recruitmentService, {
  type JobPosting,
  type JobPostingFilters,
  type JobPostingStatus,
  type Applicant,
  type ApplicantFilters,
  type ApplicantStatus,
  type Interview,
  type Assessment,
  type BackgroundCheck,
  type Offer,
  type Communication,
  type Recommendation,
} from '@/services/recruitmentService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== JOB POSTING HOOKS ====================

export function useJobPostings(filters?: JobPostingFilters) {
  return useQuery({
    queryKey: QueryKeys.recruitment.jobList(filters),
    queryFn: () => recruitmentService.getJobPostings(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useJobPosting(jobId: string) {
  return useQuery({
    queryKey: QueryKeys.recruitment.jobDetail(jobId),
    queryFn: () => recruitmentService.getJobPosting(jobId),
    enabled: !!jobId,
  })
}

export function useRecruitmentStats() {
  return useQuery({
    queryKey: QueryKeys.recruitment.jobStats(),
    queryFn: () => recruitmentService.getRecruitmentStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useJobPostingStats() {
  return useQuery({
    queryKey: QueryKeys.recruitment.jobStats(),
    queryFn: () => recruitmentService.getJobPostingStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useTalentPool() {
  return useQuery({
    queryKey: QueryKeys.recruitment.talentPool(),
    queryFn: () => recruitmentService.getTalentPool(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useJobsNearingDeadline() {
  return useQuery({
    queryKey: QueryKeys.recruitment.jobsNearingDeadline(),
    queryFn: () => recruitmentService.getJobsNearingDeadline(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useJobPipeline(jobId: string) {
  return useQuery({
    queryKey: QueryKeys.recruitment.jobPipeline(jobId),
    queryFn: () => recruitmentService.getJobPipeline(jobId),
    enabled: !!jobId,
  })
}

export function useCreateJobPosting() {
  return useMutation({
    mutationFn: (data: Partial<JobPosting>) => recruitmentService.createJobPosting(data),
    onSuccess: () => {
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useUpdateJobPosting() {
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<JobPosting> }) =>
      recruitmentService.updateJobPosting(jobId, data),
    onSuccess: (_, { jobId }) => {
      invalidateCache.recruitment.jobDetail(jobId)
      invalidateCache.recruitment.jobLists()
    },
  })
}

export function useDeleteJobPosting() {
  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.deleteJobPosting(jobId),
    onSuccess: () => {
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function usePublishJobPosting() {
  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.publishJobPosting(jobId),
    onSuccess: (_, jobId) => {
      invalidateCache.recruitment.jobDetail(jobId)
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useCloseJobPosting() {
  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      recruitmentService.closeJobPosting(jobId, reason),
    onSuccess: (_, { jobId }) => {
      invalidateCache.recruitment.jobDetail(jobId)
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useHoldJobPosting() {
  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      recruitmentService.holdJobPosting(jobId, reason),
    onSuccess: (_, { jobId }) => {
      invalidateCache.recruitment.jobDetail(jobId)
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useDuplicateJobPosting() {
  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.duplicateJobPosting(jobId),
    onSuccess: () => {
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useCloneJobPosting() {
  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.cloneJobPosting(jobId),
    onSuccess: () => {
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useChangeJobStatus() {
  return useMutation({
    mutationFn: ({ jobId, status, reason }: { jobId: string; status: any; reason?: string }) =>
      recruitmentService.changeJobStatus(jobId, status, reason),
    onSuccess: (_, { jobId }) => {
      invalidateCache.recruitment.jobDetail(jobId)
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

// ==================== APPLICANT HOOKS ====================

export function useApplicants(filters?: ApplicantFilters) {
  return useQuery({
    queryKey: QueryKeys.recruitment.applicantList(filters),
    queryFn: () => recruitmentService.getApplicants(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useJobApplicants(jobId: string, filters?: ApplicantFilters) {
  return useQuery({
    queryKey: QueryKeys.recruitment.applicantList(filters),
    queryFn: () => recruitmentService.getJobApplicants(jobId, filters),
    enabled: !!jobId,
  })
}

export function useApplicant(applicantId: string) {
  return useQuery({
    queryKey: QueryKeys.recruitment.applicantDetail(applicantId),
    queryFn: () => recruitmentService.getApplicant(applicantId),
    enabled: !!applicantId,
  })
}

export function useApplicantStats(jobId?: string) {
  return useQuery({
    queryKey: QueryKeys.recruitment.applicantStats(),
    queryFn: () => recruitmentService.getApplicantStats(jobId),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useCreateApplicant() {
  return useMutation({
    mutationFn: (data: Partial<Applicant>) => recruitmentService.createApplicant(data),
    onSuccess: () => {
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
      invalidateCache.recruitment.jobLists()
    },
  })
}

export function useUpdateApplicant() {
  return useMutation({
    mutationFn: ({ applicantId, data }: { applicantId: string; data: Partial<Applicant> }) =>
      recruitmentService.updateApplicant(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useUpdateApplicantStatus() {
  return useMutation({
    mutationFn: ({
      applicantId,
      status,
      notes,
    }: {
      applicantId: string
      status: ApplicantStatus
      notes?: string
    }) => recruitmentService.updateApplicantStatus(applicantId, status, notes),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useUpdateApplicantStage() {
  return useMutation({
    mutationFn: ({
      applicantId,
      stage,
      notes,
    }: {
      applicantId: string
      stage: string
      notes?: string
    }) => recruitmentService.updateApplicantStage(applicantId, stage, notes),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useUpdateTalentPoolStatus() {
  return useMutation({
    mutationFn: ({
      applicantId,
      inTalentPool,
      talentPoolNotes,
    }: {
      applicantId: string
      inTalentPool: boolean
      talentPoolNotes?: string
    }) => recruitmentService.updateTalentPoolStatus(applicantId, inTalentPool, talentPoolNotes),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useScreenApplicant() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: {
        screeningScore: number
        screeningNotes?: string
        screeningDecision: 'passed' | 'rejected' | 'on_hold'
        screeningRejectReason?: string
      }
    }) => recruitmentService.screenApplicant(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

// ==================== INTERVIEW HOOKS ====================

export function useScheduleInterview() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Interview, 'interviewId' | 'interviewNumber' | 'status' | 'overallRecommendation'>
    }) => recruitmentService.scheduleInterview(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useUpdateInterview() {
  return useMutation({
    mutationFn: ({
      applicantId,
      interviewId,
      data,
    }: {
      applicantId: string
      interviewId: string
      data: Partial<Interview>
    }) => recruitmentService.updateInterview(applicantId, interviewId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

export function useSubmitInterviewFeedback() {
  return useMutation({
    mutationFn: ({
      applicantId,
      interviewId,
      data,
    }: {
      applicantId: string
      interviewId: string
      data: {
        rating?: number
        feedback?: string
        recommendation: Recommendation
        strengths?: string[]
        concerns?: string[]
      }
    }) => recruitmentService.submitInterviewFeedback(applicantId, interviewId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useCompleteInterview() {
  return useMutation({
    mutationFn: ({
      applicantId,
      interviewId,
      data,
    }: {
      applicantId: string
      interviewId: string
      data: {
        overallRating: number
        technicalAssessment?: number
        culturalFit?: number
        communication?: number
        problemSolving?: number
        competencyRatings?: Array<{ competency: string; rating: number }>
        interviewNotes?: string
        overallRecommendation: Recommendation
        nextSteps?: string
      }
    }) => recruitmentService.completeInterview(applicantId, interviewId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

// ==================== ASSESSMENT HOOKS ====================

export function useAssignAssessment() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Assessment, 'assessmentId' | 'status' | 'passed'>
    }) => recruitmentService.assignAssessment(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useCompleteAssessment() {
  return useMutation({
    mutationFn: ({
      applicantId,
      assessmentId,
      data,
    }: {
      applicantId: string
      assessmentId: string
      data: {
        score: number
        maxScore: number
        passed: boolean
        strengths?: string[]
        weaknesses?: string[]
        evaluatorComments?: string
        recommendation?: string
        resultsUrl?: string
        reportUrl?: string
      }
    }) => recruitmentService.completeAssessment(applicantId, assessmentId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

// ==================== BACKGROUND CHECK HOOKS ====================

export function useInitiateBackgroundCheck() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: {
        provider?: string
        checksRequired: Array<
          'employment' | 'education' | 'criminal' | 'credit' | 'reference' | 'license' | 'bar_admission'
        >
      }
    }) => recruitmentService.initiateBackgroundCheck(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useUpdateBackgroundCheck() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Partial<BackgroundCheck>
    }) => recruitmentService.updateBackgroundCheck(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

// ==================== OFFER HOOKS ====================

export function useExtendOffer() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Offer, 'offerStatus' | 'offerExtended'>
    }) => recruitmentService.extendOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useUpdateOffer() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Partial<Offer>
    }) => recruitmentService.updateOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

export function useAcceptOffer() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: { acceptedDate: string; signedOfferUrl?: string }
    }) => recruitmentService.acceptOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useRejectOffer() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: { rejectionDate: string; rejectionReason: string }
    }) => recruitmentService.rejectOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

// ==================== HIRING HOOKS ====================

export function useHireApplicant() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: {
        hireDate: string
        actualStartDate: string
        employeeNumber?: string
      }
    }) => recruitmentService.hireApplicant(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
      invalidateCache.recruitment.jobLists()
      invalidateCache.recruitment.jobStats()
    },
  })
}

export function useRejectApplicant() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: {
        rejectionStage: 'screening' | 'interview' | 'assessment' | 'background_check' | 'offer'
        rejectionReason: string
        rejectionCategory: string
        rejectionNotes?: string
        keepInTalentPool?: boolean
        feedbackProvided?: boolean
      }
    }) => recruitmentService.rejectApplicant(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

// ==================== COMMUNICATION HOOKS ====================

export function useAddCommunication() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Communication, 'communicationId'>
    }) => recruitmentService.addCommunication(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

export function useAddNote() {
  return useMutation({
    mutationFn: ({
      applicantId,
      noteType,
      note,
    }: {
      applicantId: string
      noteType: 'recruiter' | 'hiring_manager' | 'interviewer' | 'internal'
      note: string
    }) => recruitmentService.addNote(applicantId, noteType, note),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

export function useFlagApplicant() {
  return useMutation({
    mutationFn: ({ applicantId, flagReason }: { applicantId: string; flagReason: string }) =>
      recruitmentService.flagApplicant(applicantId, flagReason),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

export function useUnflagApplicant() {
  return useMutation({
    mutationFn: (applicantId: string) => recruitmentService.unflagApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
      invalidateCache.recruitment.applicantLists()
    },
  })
}

// ==================== REFERENCE HOOKS ====================

export function useAddReference() {
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: any
    }) => recruitmentService.addReference(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

export function useUpdateReferenceCheck() {
  return useMutation({
    mutationFn: ({
      applicantId,
      referenceId,
      data,
    }: {
      applicantId: string
      referenceId: string
      data: any
    }) => recruitmentService.updateReferenceCheck(applicantId, referenceId, data),
    onSuccess: (_, { applicantId }) => {
      invalidateCache.recruitment.applicantDetail(applicantId)
    },
  })
}

// ==================== BULK OPERATIONS ====================

export function useBulkUpdateStage() {
  return useMutation({
    mutationFn: ({
      applicantIds,
      stage,
      notes,
    }: {
      applicantIds: string[]
      stage: string
      notes?: string
    }) => recruitmentService.bulkUpdateStage(applicantIds, stage, notes),
    onSuccess: () => {
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useBulkReject() {
  return useMutation({
    mutationFn: ({
      applicantIds,
      rejectionReason,
      rejectionCategory,
    }: {
      applicantIds: string[]
      rejectionReason: string
      rejectionCategory: string
    }) => recruitmentService.bulkReject(applicantIds, rejectionReason, rejectionCategory),
    onSuccess: () => {
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useBulkUpdateApplicants() {
  return useMutation({
    mutationFn: ({
      applicantIds,
      data,
    }: {
      applicantIds: string[]
      data: { status?: ApplicantStatus; notes?: string }
    }) => recruitmentService.bulkUpdateApplicants(applicantIds, data),
    onSuccess: () => {
      invalidateCache.recruitment.applicantLists()
      invalidateCache.recruitment.applicantStats()
    },
  })
}

export function useExportApplicants() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: ApplicantFilters; format?: 'pdf' | 'excel' }) =>
      recruitmentService.exportApplicants(filters, format),
  })
}

export function useParseResume() {
  return useMutation({
    mutationFn: (fileUrl: string) => recruitmentService.parseResume(fileUrl),
  })
}
