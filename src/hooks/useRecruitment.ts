import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

// Query Keys
export const recruitmentKeys = {
  // Job Postings
  jobs: ['job-postings'] as const,
  jobLists: () => [...recruitmentKeys.jobs, 'list'] as const,
  jobList: (filters?: JobPostingFilters) => [...recruitmentKeys.jobLists(), filters] as const,
  jobDetails: () => [...recruitmentKeys.jobs, 'detail'] as const,
  jobDetail: (id: string) => [...recruitmentKeys.jobDetails(), id] as const,
  jobStats: () => [...recruitmentKeys.jobs, 'stats'] as const,

  // Applicants
  applicants: ['applicants'] as const,
  applicantLists: () => [...recruitmentKeys.applicants, 'list'] as const,
  applicantList: (filters?: ApplicantFilters) => [...recruitmentKeys.applicantLists(), filters] as const,
  applicantDetails: () => [...recruitmentKeys.applicants, 'detail'] as const,
  applicantDetail: (id: string) => [...recruitmentKeys.applicantDetails(), id] as const,
  applicantStats: (jobId?: string) => [...recruitmentKeys.applicants, 'stats', jobId] as const,
  jobApplicants: (jobId: string, filters?: ApplicantFilters) =>
    [...recruitmentKeys.applicants, 'job', jobId, filters] as const,
}

// ==================== JOB POSTING HOOKS ====================

export function useJobPostings(filters?: JobPostingFilters) {
  return useQuery({
    queryKey: recruitmentKeys.jobList(filters),
    queryFn: () => recruitmentService.getJobPostings(filters),
  })
}

export function useJobPosting(jobId: string) {
  return useQuery({
    queryKey: recruitmentKeys.jobDetail(jobId),
    queryFn: () => recruitmentService.getJobPosting(jobId),
    enabled: !!jobId,
  })
}

export function useRecruitmentStats() {
  return useQuery({
    queryKey: recruitmentKeys.jobStats(),
    queryFn: () => recruitmentService.getRecruitmentStats(),
  })
}

export function useJobPostingStats() {
  return useQuery({
    queryKey: recruitmentKeys.jobStats(),
    queryFn: () => recruitmentService.getJobPostingStats(),
  })
}

export function useTalentPool() {
  return useQuery({
    queryKey: ['talent-pool'],
    queryFn: () => recruitmentService.getTalentPool(),
  })
}

export function useJobsNearingDeadline() {
  return useQuery({
    queryKey: ['jobs-nearing-deadline'],
    queryFn: () => recruitmentService.getJobsNearingDeadline(),
  })
}

export function useJobPipeline(jobId: string) {
  return useQuery({
    queryKey: ['job-pipeline', jobId],
    queryFn: () => recruitmentService.getJobPipeline(jobId),
    enabled: !!jobId,
  })
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<JobPosting>) => recruitmentService.createJobPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useUpdateJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<JobPosting> }) =>
      recruitmentService.updateJobPosting(jobId, data),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
    },
  })
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.deleteJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function usePublishJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.publishJobPosting(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useCloseJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      recruitmentService.closeJobPosting(jobId, reason),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useHoldJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      recruitmentService.holdJobPosting(jobId, reason),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useDuplicateJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.duplicateJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useCloneJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => recruitmentService.cloneJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useChangeJobStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, status, reason }: { jobId: string; status: any; reason?: string }) =>
      recruitmentService.changeJobStatus(jobId, status, reason),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobDetail(jobId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

// ==================== APPLICANT HOOKS ====================

export function useApplicants(filters?: ApplicantFilters) {
  return useQuery({
    queryKey: recruitmentKeys.applicantList(filters),
    queryFn: () => recruitmentService.getApplicants(filters),
  })
}

export function useJobApplicants(jobId: string, filters?: ApplicantFilters) {
  return useQuery({
    queryKey: recruitmentKeys.jobApplicants(jobId, filters),
    queryFn: () => recruitmentService.getJobApplicants(jobId, filters),
    enabled: !!jobId,
  })
}

export function useApplicant(applicantId: string) {
  return useQuery({
    queryKey: recruitmentKeys.applicantDetail(applicantId),
    queryFn: () => recruitmentService.getApplicant(applicantId),
    enabled: !!applicantId,
  })
}

export function useApplicantStats(jobId?: string) {
  return useQuery({
    queryKey: recruitmentKeys.applicantStats(jobId),
    queryFn: () => recruitmentService.getApplicantStats(jobId),
  })
}

export function useCreateApplicant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Applicant>) => recruitmentService.createApplicant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
    },
  })
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicantId, data }: { applicantId: string; data: Partial<Applicant> }) =>
      recruitmentService.updateApplicant(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useUpdateApplicantStatus() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

export function useUpdateApplicantStage() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

export function useUpdateTalentPoolStatus() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useScreenApplicant() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

// ==================== INTERVIEW HOOKS ====================

export function useScheduleInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Interview, 'interviewId' | 'interviewNumber' | 'status' | 'overallRecommendation'>
    }) => recruitmentService.scheduleInterview(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useUpdateInterview() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useCompleteInterview() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

// ==================== ASSESSMENT HOOKS ====================

export function useAssignAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Assessment, 'assessmentId' | 'status' | 'passed'>
    }) => recruitmentService.assignAssessment(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useCompleteAssessment() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

// ==================== BACKGROUND CHECK HOOKS ====================

export function useInitiateBackgroundCheck() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useUpdateBackgroundCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Partial<BackgroundCheck>
    }) => recruitmentService.updateBackgroundCheck(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

// ==================== OFFER HOOKS ====================

export function useExtendOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Offer, 'offerStatus' | 'offerExtended'>
    }) => recruitmentService.extendOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

export function useUpdateOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Partial<Offer>
    }) => recruitmentService.updateOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

export function useAcceptOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: { acceptedDate: string; signedOfferUrl?: string }
    }) => recruitmentService.acceptOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

export function useRejectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: { rejectionDate: string; rejectionReason: string }
    }) => recruitmentService.rejectOffer(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

// ==================== HIRING HOOKS ====================

export function useHireApplicant() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobStats() })
    },
  })
}

export function useRejectApplicant() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

// ==================== COMMUNICATION HOOKS ====================

export function useAddCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: Omit<Communication, 'communicationId'>
    }) => recruitmentService.addCommunication(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

export function useAddNote() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

export function useFlagApplicant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicantId, flagReason }: { applicantId: string; flagReason: string }) =>
      recruitmentService.flagApplicant(applicantId, flagReason),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

export function useUnflagApplicant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicantId: string) => recruitmentService.unflagApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
    },
  })
}

// ==================== REFERENCE HOOKS ====================

export function useAddReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string
      data: any
    }) => recruitmentService.addReference(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

export function useUpdateReferenceCheck() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantDetail(applicantId) })
    },
  })
}

// ==================== BULK OPERATIONS ====================

export function useBulkUpdateStage() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

export function useBulkReject() {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
    },
  })
}

export function useBulkUpdateApplicants() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicantIds,
      data,
    }: {
      applicantIds: string[]
      data: { status?: ApplicantStatus; notes?: string }
    }) => recruitmentService.bulkUpdateApplicants(applicantIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantLists() })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicantStats() })
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
