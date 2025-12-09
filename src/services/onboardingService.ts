import api from './api'

// ==================== TYPES & ENUMS ====================

// Onboarding Status
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'

// Probation Status (no extension - max 180 days per Saudi Labor Law Article 53)
export type ProbationStatus = 'active' | 'passed' | 'failed'

// Task Status
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'not_applicable'

// Task Priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// Document Type
export type OnboardingDocumentType = 'national_id' | 'passport' | 'iqama' | 'degree' | 'certificate' |
  'bar_admission' | 'medical_certificate' | 'vaccine_certificate' | 'bank_letter' | 'photo' | 'other'

// Equipment Type
export type EquipmentType = 'laptop' | 'desktop' | 'monitor' | 'keyboard' | 'mouse' |
  'phone' | 'headset' | 'other'

// Training Type
export type TrainingType = 'classroom' | 'online' | 'shadowing' | 'hands_on' | 'self_paced' | 'reading'

// Training Category
export type TrainingCategory = 'mandatory' | 'role_specific' | 'compliance' | 'technical' | 'soft_skills'

// Review Recommendation
export type ReviewRecommendation = 'on_track' | 'needs_improvement' | 'at_risk' |
  'recommend_confirmation' | 'recommend_extension' | 'recommend_termination'

// Probation Decision (no extension - max 180 days per Saudi Labor Law Article 53)
export type ProbationDecision = 'confirm' | 'terminate'

// ==================== LABELS ====================

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'blue' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'emerald' },
  on_hold: { ar: 'معلق', en: 'On Hold', color: 'amber' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'red' },
}

export const PROBATION_STATUS_LABELS: Record<ProbationStatus, { ar: string; en: string; color: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'blue' },
  passed: { ar: 'اجتاز', en: 'Passed', color: 'emerald' },
  failed: { ar: 'لم يجتز', en: 'Failed', color: 'red' },
}

export const TASK_STATUS_LABELS: Record<TaskStatus, { ar: string; en: string; color: string }> = {
  not_started: { ar: 'لم يبدأ', en: 'Not Started', color: 'slate' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'blue' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'emerald' },
  blocked: { ar: 'معلق', en: 'Blocked', color: 'red' },
  not_applicable: { ar: 'غير مطبق', en: 'Not Applicable', color: 'gray' },
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, { ar: string; en: string; color: string }> = {
  low: { ar: 'منخفض', en: 'Low', color: 'slate' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'blue' },
  high: { ar: 'عالي', en: 'High', color: 'amber' },
  critical: { ar: 'حرج', en: 'Critical', color: 'red' },
}

export const DOCUMENT_TYPE_LABELS: Record<OnboardingDocumentType, { ar: string; en: string }> = {
  national_id: { ar: 'الهوية الوطنية', en: 'National ID' },
  passport: { ar: 'جواز السفر', en: 'Passport' },
  iqama: { ar: 'الإقامة', en: 'Iqama' },
  degree: { ar: 'الشهادة الجامعية', en: 'Degree' },
  certificate: { ar: 'شهادة', en: 'Certificate' },
  bar_admission: { ar: 'رخصة المحاماة', en: 'Bar Admission' },
  medical_certificate: { ar: 'شهادة طبية', en: 'Medical Certificate' },
  vaccine_certificate: { ar: 'شهادة تطعيم', en: 'Vaccine Certificate' },
  bank_letter: { ar: 'خطاب البنك', en: 'Bank Letter' },
  photo: { ar: 'صورة شخصية', en: 'Photo' },
  other: { ar: 'أخرى', en: 'Other' },
}

// ==================== INTERFACES ====================

// Document Required
export interface OnboardingDocument {
  documentType: OnboardingDocumentType
  documentName: string
  documentNameAr?: string
  required: boolean
  submitted: boolean
  submittedDate?: string
  verified: boolean
  verifiedBy?: string
  verificationDate?: string
  fileUrl?: string
  expiryDate?: string
  notes?: string
}

// Equipment
export interface OnboardingEquipment {
  equipmentType: EquipmentType
  equipmentId?: string
  serialNumber?: string
  provided: boolean
  providedDate?: string
  acknowledged: boolean
}

// Onboarding Task
export interface OnboardingTask {
  taskId: string
  taskName: string
  taskNameAr?: string
  description?: string
  category: string
  responsible: 'hr' | 'it' | 'manager' | 'employee' | 'facilities' | 'finance' | 'other'
  responsiblePerson?: string
  dueDate?: string
  priority: TaskPriority
  status: TaskStatus
  completedDate?: string
  completedBy?: string
  verificationRequired: boolean
  verified?: boolean
  verifiedBy?: string
  blockedReason?: string
  attachments?: string[]
  notes?: string
}

// Training
export interface OnboardingTraining {
  trainingId: string
  trainingName: string
  trainingNameAr?: string
  category: TrainingCategory
  trainingType: TrainingType
  trainer?: string
  duration?: number
  scheduledDate?: string
  completed: boolean
  completedDate?: string
  required: boolean
  assessment?: {
    required: boolean
    completed?: boolean
    score?: number
    passed?: boolean
  }
  certificateIssued?: boolean
  certificateUrl?: string
  expiryDate?: string
}

// Probation Review
export interface ProbationReview {
  reviewId: string
  reviewType: '30_day' | '60_day' | '90_day' | 'final' | 'ad_hoc'
  reviewDay: number
  scheduledDate: string
  conducted: boolean
  conductedDate?: string
  conductedBy?: string
  performanceAssessment: {
    workQuality: number
    productivity: number
    reliability: number
    teamwork: number
    communication: number
    initiative: number
    adaptability: number
    professionalism: number
    overallRating: number
  }
  strengths: string[]
  areasForImprovement: string[]
  managerComments: string
  employeeComments?: string
  recommendation: ReviewRecommendation
  recommendationReason?: string
  actionItems?: Array<{
    action: string
    owner: string
    dueDate?: string
    status: 'pending' | 'in_progress' | 'completed'
  }>
  nextReviewDate?: string
  reviewDocument?: string
  employeeAcknowledged: boolean
  acknowledgedDate?: string
}

// Checklist Category
export interface ChecklistCategory {
  categoryId: string
  categoryName: string
  categoryNameAr?: string
  tasks: OnboardingTask[]
  completionPercentage: number
}

// Main Onboarding Record
export interface OnboardingRecord {
  _id: string
  onboardingId: string
  onboardingNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  jobTitle: string
  jobTitleAr?: string
  department?: string

  // Manager
  managerId: string
  managerName: string

  // Dates
  startDate: string
  completionTargetDate: string

  // Probation
  probation: {
    probationPeriod: number
    probationStartDate: string
    probationEndDate: string
    onProbation: boolean
    probationStatus: ProbationStatus
  }

  // Completion
  completion: {
    tasksCompleted: number
    tasksTotal: number
    completionPercentage: number
  }

  // Status
  status: OnboardingStatus

  // Pre-boarding
  preBoarding?: {
    welcomePackage: {
      sent: boolean
      sentDate?: string
    }
    documentsCollection: {
      documentsRequired: OnboardingDocument[]
      allDocumentsCollected: boolean
      documentationComplete: boolean
    }
    contractSigning: {
      contractSent: boolean
      contractSigned: boolean
      signedDate?: string
    }
    itAccountSetup: {
      emailCreated: boolean
      emailAddress?: string
      systemAccessCreated: boolean
      completed: boolean
    }
    workstationPrep: {
      assigned: boolean
      location?: string
      deskNumber?: string
      equipmentReady: boolean
      completed: boolean
    }
    preboardingComplete: boolean
    preboardingCompletionDate?: string
  }

  // First Day
  firstDay?: {
    date: string
    arrival: {
      welcomed: boolean
      greeterName?: string
    }
    idBadge: {
      issued: boolean
      badgeNumber?: string
    }
    workstation: {
      shown: boolean
      location: string
      equipmentProvided: OnboardingEquipment[]
      setupComplete: boolean
    }
    orientation: {
      conducted: boolean
      conductedBy?: string
      completed: boolean
    }
    teamIntroduction: {
      conducted: boolean
      teamMembersIntroduced: number
      completed: boolean
    }
    welcomeLunch: {
      scheduled: boolean
      completed: boolean
    }
    hrMeeting: {
      conducted: boolean
      completed: boolean
    }
    firstDayComplete: boolean
  }

  // First Week
  firstWeek?: {
    laborLawTraining: {
      required: boolean
      completed: boolean
      completedDate?: string
    }
    systemsTraining: {
      trainingSessions: Array<{
        systemName: string
        conducted: boolean
        completedDate?: string
      }>
      allTrainingsCompleted: boolean
    }
    roleClarification: {
      jobDescriptionReviewed: boolean
      responsibilitiesDiscussed: boolean
      completed: boolean
    }
    buddyAssignment: {
      assigned: boolean
      buddyName?: string
      introducedToBuddy: boolean
    }
    firstWeekComplete: boolean
    firstWeekCompletionDate?: string
  }

  // First Month
  firstMonth?: {
    roleSpecificTraining: {
      trainingModules: OnboardingTraining[]
      allTrainingCompleted: boolean
    }
    initialFeedback: {
      conducted: boolean
      conductedDate?: string
      overallRating?: number
    }
    firstMonthComplete: boolean
    firstMonthCompletionDate?: string
  }

  // Probation Tracking (max 180 days, no extension per Saudi Labor Law Article 53)
  probationTracking?: {
    probationInfo: {
      probationPeriod: number
      probationStartDate: string
      probationEndDate: string
      currentStatus: ProbationStatus
    }
    probationReviews: ProbationReview[]
    finalReview?: {
      conducted: boolean
      decision: ProbationDecision
      decisionReason: string
    }
  }

  // Onboarding Checklist
  onboardingChecklist?: {
    categories: ChecklistCategory[]
    overallCompletion: number
    criticalTasksCompleted: boolean
    blockedTasks: number
  }

  // Training Completion
  trainingCompletion?: {
    requiredTrainings: number
    completedTrainings: number
    trainings: OnboardingTraining[]
    allMandatoryCompleted: boolean
  }

  // Notes
  notes?: {
    hrNotes?: string
    managerNotes?: string
    internalNotes?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Onboarding Data
export interface CreateOnboardingData {
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  jobTitle: string
  jobTitleAr?: string
  department?: string
  managerId: string
  managerName: string
  startDate: string
  completionTargetDate?: string
  probationPeriod?: number
  notes?: {
    hrNotes?: string
    managerNotes?: string
  }
}

// Update Onboarding Data
export interface UpdateOnboardingData {
  employeeName?: string
  employeeNameAr?: string
  jobTitle?: string
  jobTitleAr?: string
  department?: string
  managerId?: string
  managerName?: string
  startDate?: string
  completionTargetDate?: string
  status?: OnboardingStatus
  probation?: {
    probationPeriod?: number
    probationEndDate?: string
    probationStatus?: ProbationStatus
  }
  notes?: {
    hrNotes?: string
    managerNotes?: string
    internalNotes?: string
  }
}

// Filters
export interface OnboardingFilters {
  status?: OnboardingStatus
  probationStatus?: ProbationStatus
  department?: string
  managerId?: string
  startDateFrom?: string
  startDateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface OnboardingResponse {
  data: OnboardingRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface OnboardingStats {
  totalOnboardings: number
  byStatus: Array<{ status: OnboardingStatus; count: number }>
  byProbationStatus: Array<{ status: ProbationStatus; count: number }>
  averageCompletionRate: number
  overdueOnboardings: number
  upcomingProbationReviews: number
  thisMonth: {
    started: number
    completed: number
    cancelled: number
  }
}

// ==================== API FUNCTIONS ====================

// Get all onboarding records
export const getOnboardings = async (filters?: OnboardingFilters): Promise<OnboardingResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.probationStatus) params.append('probationStatus', filters.probationStatus)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.managerId) params.append('managerId', filters.managerId)
  if (filters?.startDateFrom) params.append('startDateFrom', filters.startDateFrom)
  if (filters?.startDateTo) params.append('startDateTo', filters.startDateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/onboarding?${params.toString()}`)
  return response.data
}

// Get single onboarding record
export const getOnboarding = async (onboardingId: string): Promise<OnboardingRecord> => {
  const response = await api.get(`/hr/onboarding/${onboardingId}`)
  return response.data
}

// Create onboarding record
export const createOnboarding = async (data: CreateOnboardingData): Promise<OnboardingRecord> => {
  const response = await api.post('/hr/onboarding', data)
  return response.data
}

// Update onboarding record
export const updateOnboarding = async (onboardingId: string, data: UpdateOnboardingData): Promise<OnboardingRecord> => {
  const response = await api.patch(`/hr/onboarding/${onboardingId}`, data)
  return response.data
}

// Delete onboarding record
export const deleteOnboarding = async (onboardingId: string): Promise<void> => {
  await api.delete(`/hr/onboarding/${onboardingId}`)
}

// Get onboarding stats
export const getOnboardingStats = async (): Promise<OnboardingStats> => {
  const response = await api.get('/hr/onboarding/stats')
  return response.data
}

// Update onboarding status
export const updateOnboardingStatus = async (onboardingId: string, status: OnboardingStatus): Promise<OnboardingRecord> => {
  const response = await api.patch(`/hr/onboarding/${onboardingId}/status`, { status })
  return response.data
}

// Complete task
export const completeTask = async (onboardingId: string, taskId: string): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/tasks/${taskId}/complete`)
  return response.data
}

// Add probation review
export const addProbationReview = async (onboardingId: string, review: Partial<ProbationReview>): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/probation-reviews`, review)
  return response.data
}

// Complete probation (no extension - max 180 days per Saudi Labor Law Article 53)
export const completeProbation = async (onboardingId: string, data: {
  decision: ProbationDecision
  decisionReason: string
  confirmationDate?: string
}): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/complete-probation`, data)
  return response.data
}

// Upload document
export const uploadOnboardingDocument = async (
  onboardingId: string,
  file: File,
  documentType: OnboardingDocumentType
): Promise<OnboardingDocument> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const response = await api.post(`/hr/onboarding/${onboardingId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// Verify document
export const verifyOnboardingDocument = async (
  onboardingId: string,
  documentType: OnboardingDocumentType
): Promise<OnboardingDocument> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/documents/${documentType}/verify`)
  return response.data
}

// Complete first day
export const completeFirstDay = async (onboardingId: string): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/complete-first-day`)
  return response.data
}

// Complete first week
export const completeFirstWeek = async (onboardingId: string): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/complete-first-week`)
  return response.data
}

// Complete first month
export const completeFirstMonth = async (onboardingId: string): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/complete-first-month`)
  return response.data
}

// Complete onboarding
export const completeOnboarding = async (onboardingId: string): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/complete`)
  return response.data
}

// Bulk delete
export const bulkDeleteOnboardings = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/onboarding/bulk-delete', { ids })
  return response.data
}

// Get onboarding by employee
export const getOnboardingByEmployee = async (employeeId: string): Promise<OnboardingRecord | null> => {
  const response = await api.get(`/hr/onboarding/by-employee/${employeeId}`)
  return response.data
}

// Get upcoming probation reviews
export const getUpcomingProbationReviews = async (days?: number): Promise<Array<{
  onboardingId: string
  employeeName: string
  reviewType: string
  dueDate: string
}>> => {
  const params = new URLSearchParams()
  if (days) params.append('days', days.toString())

  const response = await api.get(`/hr/onboarding/upcoming-reviews?${params.toString()}`)
  return response.data
}

// Add checklist category
export const addChecklistCategory = async (
  onboardingId: string,
  category: {
    categoryName: string
    categoryNameAr?: string
  }
): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/checklist/categories`, category)
  return response.data
}

// Add checklist task
export const addChecklistTask = async (
  onboardingId: string,
  categoryId: string,
  task: Partial<OnboardingTask>
): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/checklist/categories/${categoryId}/tasks`, task)
  return response.data
}

// Add employee feedback
export const addEmployeeFeedback = async (
  onboardingId: string,
  feedback: {
    feedbackType: 'first_day' | 'first_week' | 'first_month' | 'general'
    rating?: number
    comments: string
    suggestions?: string
  }
): Promise<OnboardingRecord> => {
  const response = await api.post(`/hr/onboarding/${onboardingId}/feedback`, feedback)
  return response.data
}
