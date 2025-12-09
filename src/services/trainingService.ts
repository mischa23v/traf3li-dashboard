import api from './api'

// ==================== TYPES & ENUMS ====================

// Training Type
export type TrainingType = 'internal' | 'external' | 'online' | 'certification' |
  'conference' | 'workshop' | 'mentoring' | 'on_the_job'

// Training Category
export type TrainingCategory = 'technical' | 'soft_skills' | 'leadership' | 'management' |
  'compliance' | 'safety' | 'product_knowledge' | 'systems' | 'legal_professional' |
  'business_development' | 'language' | 'other'

// Training Status
export type TrainingStatus = 'requested' | 'approved' | 'rejected' | 'enrolled' |
  'in_progress' | 'completed' | 'cancelled' | 'failed'

// Request Status
export type RequestStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'on_hold'

// Delivery Method
export type DeliveryMethod = 'classroom' | 'virtual_live' | 'self_paced_online' |
  'blended' | 'on_the_job' | 'simulation' | 'workshop' | 'seminar'

// Difficulty Level
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// Urgency Level
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

// Provider Type
export type ProviderType = 'internal' | 'external' | 'online_platform' | 'university' |
  'professional_association' | 'consultant'

// Location Type
export type LocationType = 'on_site' | 'off_site' | 'virtual' | 'hybrid'

// Certificate Type
export type CertificateType = 'completion' | 'achievement' | 'professional' | 'accredited'

// CLE Category (for attorneys)
export type CLECategory = 'legal_ethics' | 'substantive_law' | 'professional_skills' |
  'practice_management' | 'technology' | 'general'

// Assessment Type
export type AssessmentType = 'pre_assessment' | 'quiz' | 'mid_term' | 'final_exam' |
  'project' | 'presentation' | 'practical' | 'post_assessment'

// ==================== LABELS ====================

export const TRAINING_TYPE_LABELS: Record<TrainingType, { ar: string; en: string; color: string; icon: string }> = {
  internal: { ar: 'تدريب داخلي', en: 'Internal', color: 'blue', icon: 'Building2' },
  external: { ar: 'تدريب خارجي', en: 'External', color: 'purple', icon: 'ExternalLink' },
  online: { ar: 'تدريب إلكتروني', en: 'Online', color: 'teal', icon: 'Monitor' },
  certification: { ar: 'شهادة مهنية', en: 'Certification', color: 'amber', icon: 'Award' },
  conference: { ar: 'مؤتمر', en: 'Conference', color: 'indigo', icon: 'Users' },
  workshop: { ar: 'ورشة عمل', en: 'Workshop', color: 'orange', icon: 'Wrench' },
  mentoring: { ar: 'إرشاد', en: 'Mentoring', color: 'emerald', icon: 'UserCheck' },
  on_the_job: { ar: 'تدريب عملي', en: 'On-the-Job', color: 'slate', icon: 'Briefcase' },
}

export const TRAINING_CATEGORY_LABELS: Record<TrainingCategory, { ar: string; en: string; color: string }> = {
  technical: { ar: 'تقني', en: 'Technical', color: 'blue' },
  soft_skills: { ar: 'مهارات شخصية', en: 'Soft Skills', color: 'pink' },
  leadership: { ar: 'قيادة', en: 'Leadership', color: 'purple' },
  management: { ar: 'إدارة', en: 'Management', color: 'indigo' },
  compliance: { ar: 'امتثال', en: 'Compliance', color: 'red' },
  safety: { ar: 'سلامة', en: 'Safety', color: 'orange' },
  product_knowledge: { ar: 'معرفة المنتج', en: 'Product Knowledge', color: 'teal' },
  systems: { ar: 'أنظمة', en: 'Systems', color: 'cyan' },
  legal_professional: { ar: 'قانوني مهني', en: 'Legal Professional', color: 'amber' },
  business_development: { ar: 'تطوير الأعمال', en: 'Business Development', color: 'emerald' },
  language: { ar: 'لغات', en: 'Language', color: 'violet' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray' },
}

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, { ar: string; en: string; color: string }> = {
  requested: { ar: 'مطلوب', en: 'Requested', color: 'slate' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'blue' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  enrolled: { ar: 'مسجل', en: 'Enrolled', color: 'purple' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'amber' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'emerald' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'gray' },
  failed: { ar: 'فشل', en: 'Failed', color: 'red' },
}

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, { ar: string; en: string }> = {
  classroom: { ar: 'حضوري', en: 'Classroom' },
  virtual_live: { ar: 'افتراضي مباشر', en: 'Virtual Live' },
  self_paced_online: { ar: 'ذاتي عبر الإنترنت', en: 'Self-Paced Online' },
  blended: { ar: 'مدمج', en: 'Blended' },
  on_the_job: { ar: 'أثناء العمل', en: 'On-the-Job' },
  simulation: { ar: 'محاكاة', en: 'Simulation' },
  workshop: { ar: 'ورشة عمل', en: 'Workshop' },
  seminar: { ar: 'ندوة', en: 'Seminar' },
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, { ar: string; en: string; color: string }> = {
  beginner: { ar: 'مبتدئ', en: 'Beginner', color: 'emerald' },
  intermediate: { ar: 'متوسط', en: 'Intermediate', color: 'blue' },
  advanced: { ar: 'متقدم', en: 'Advanced', color: 'amber' },
  expert: { ar: 'خبير', en: 'Expert', color: 'purple' },
}

export const URGENCY_LABELS: Record<UrgencyLevel, { ar: string; en: string; color: string }> = {
  low: { ar: 'منخفضة', en: 'Low', color: 'slate' },
  medium: { ar: 'متوسطة', en: 'Medium', color: 'blue' },
  high: { ar: 'عالية', en: 'High', color: 'amber' },
  critical: { ar: 'حرجة', en: 'Critical', color: 'red' },
}

export const CLE_CATEGORY_LABELS: Record<CLECategory, { ar: string; en: string }> = {
  legal_ethics: { ar: 'أخلاقيات قانونية', en: 'Legal Ethics' },
  substantive_law: { ar: 'قانون موضوعي', en: 'Substantive Law' },
  professional_skills: { ar: 'مهارات مهنية', en: 'Professional Skills' },
  practice_management: { ar: 'إدارة المكتب', en: 'Practice Management' },
  technology: { ar: 'تقنية', en: 'Technology' },
  general: { ar: 'عام', en: 'General' },
}

// ==================== INTERFACES ====================

// Training Session
export interface TrainingSession {
  sessionNumber: number
  sessionDate: string
  startTime: string
  endTime: string
  duration: number
  topic?: string
  topicAr?: string
  mandatory: boolean
  attended?: boolean
  checkInTime?: string
  checkOutTime?: string
}

// Approval Step
export interface ApprovalStep {
  stepNumber: number
  stepName: string
  stepNameAr?: string
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'conditional' | 'skipped'
  actionDate?: string
  decision?: 'approve' | 'reject' | 'approve_with_conditions' | 'defer'
  comments?: string
  budgetApproval?: {
    budgetAvailable: boolean
    budgetSource?: string
    costCenter?: string
  }
  notificationSent: boolean
}

// Assessment
export interface TrainingAssessment {
  assessmentId: string
  assessmentType: AssessmentType
  assessmentTitle: string
  assessmentDate?: string
  attemptNumber: number
  maxAttempts?: number
  score?: number
  maxScore?: number
  percentageScore?: number
  passingScore: number
  passed: boolean
  grade?: string
  timeAllowed?: number
  timeSpent?: number
  feedback?: string
  areasOfStrength?: string[]
  areasForImprovement?: string[]
  retakeRequired?: boolean
  retakeDate?: string
}

// Attendance Summary
export interface AttendanceSummary {
  totalSessions: number
  attendedSessions: number
  missedSessions: number
  attendancePercentage: number
  minimumRequired: number
  meetsMinimum: boolean
  totalHoursAttended: number
}

// Cost Details
export interface TrainingCosts {
  trainingFee: {
    baseFee: number
    currency: string
    discount?: {
      discountType: 'early_bird' | 'group' | 'corporate' | 'promotional'
      discountPercentage?: number
      discountAmount?: number
    }
    netTrainingFee: number
  }
  additionalCosts?: Array<{
    costType: string
    description: string
    amount: number
  }>
  totalAdditionalCosts: number
  totalCost: number
  costAllocation: {
    companyPaid: number
    employeePaid?: number
  }
  payment: {
    paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
    totalPaid: number
    outstandingAmount: number
  }
}

// Certificate
export interface TrainingCertificate {
  issued: boolean
  issueDate?: string
  certificateNumber?: string
  certificateUrl?: string
  certificateType: CertificateType
  validFrom?: string
  validUntil?: string
  renewalRequired?: boolean
  renewalDueDate?: string
  cleCredits?: number
  cpdPoints?: number
  verificationUrl?: string
  delivered: boolean
  deliveryDate?: string
}

// Evaluation (Kirkpatrick Level 1)
export interface TrainingEvaluation {
  evaluationCompleted: boolean
  evaluationDate?: string
  ratings: {
    overallSatisfaction?: number
    contentRelevance?: number
    contentQuality?: number
    instructorKnowledge?: number
    instructorEffectiveness?: number
    materialsQuality?: number
    recommendToOthers?: number
  }
  openEndedFeedback?: {
    whatWasGood?: string
    whatCouldImprove?: string
    additionalComments?: string
  }
}

// Provider
export interface TrainingProvider {
  providerType: ProviderType
  providerName?: string
  providerNameAr?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  accredited?: boolean
  rating?: number
  platformName?: string
  platformType?: string
}

// CLE Details (Attorney Training)
export interface CLEDetails {
  isCLE: boolean
  cleCredits: number
  cleHours: number
  cleCategory: CLECategory
  barApprovalNumber?: string
  approvedByBar: boolean
  ethicsCredits?: number
  specialtyArea?: string
  specialtyCredits?: number
}

// Main Training Record
export interface TrainingRecord {
  _id: string
  trainingId: string
  trainingNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string

  // Training Details
  trainingTitle: string
  trainingTitleAr?: string
  trainingDescription?: string
  trainingDescriptionAr?: string
  trainingType: TrainingType
  trainingCategory: TrainingCategory
  deliveryMethod: DeliveryMethod
  difficultyLevel: DifficultyLevel
  urgency?: UrgencyLevel

  // Request
  requestDate: string
  requestedBy: 'employee' | 'manager' | 'hr' | 'learning_admin'
  businessJustification?: string
  businessJustificationAr?: string

  // Dates
  startDate: string
  endDate: string
  duration: {
    totalHours: number
    totalDays?: number
    sessionsCount?: number
  }

  // Location
  locationType: LocationType
  venue?: {
    venueName?: string
    venueAddress?: string
    city?: string
    country?: string
  }
  virtualDetails?: {
    platform: string
    meetingLink?: string
  }

  // Provider
  provider?: TrainingProvider

  // Attorney Training (CLE)
  cleDetails?: CLEDetails

  // Status
  status: TrainingStatus
  requestStatus?: RequestStatus

  // Approval
  approvalWorkflow?: {
    required: boolean
    workflowSteps: ApprovalStep[]
    currentStep: number
    totalSteps: number
    finalStatus: 'pending' | 'approved' | 'rejected' | 'conditional'
    finalApprover?: string
    finalApprovalDate?: string
    rejectionReason?: string
  }

  // Enrollment
  enrollment?: {
    enrolled: boolean
    enrollmentDate?: string
    registrationNumber?: string
    confirmationReceived: boolean
  }

  // Attendance
  sessions?: TrainingSession[]
  attendanceSummary?: AttendanceSummary

  // Progress (for online courses)
  progress?: {
    totalModules: number
    completedModules: number
    progressPercentage: number
    lastAccessDate?: string
    totalTimeSpent?: number
  }

  // Assessments
  assessments?: TrainingAssessment[]

  // Completion
  completion: {
    completed: boolean
    completionDate?: string
    passed: boolean
    finalScore?: number
    finalGrade?: string
  }

  // Certificate
  certificate?: TrainingCertificate

  // Evaluation
  evaluation?: TrainingEvaluation

  // Costs
  costs?: TrainingCosts

  // Compliance
  complianceTracking?: {
    isMandatory: boolean
    mandatoryReason?: string
    complianceDeadline?: string
    overdue: boolean
    daysOverdue?: number
  }

  // Notes
  notes?: {
    employeeNotes?: string
    managerNotes?: string
    hrNotes?: string
    trainerNotes?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Training Data
export interface CreateTrainingData {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string
  department?: string
  jobTitle?: string
  trainingTitle: string
  trainingTitleAr?: string
  trainingDescription?: string
  trainingDescriptionAr?: string
  trainingType: TrainingType
  trainingCategory: TrainingCategory
  deliveryMethod?: DeliveryMethod
  difficultyLevel?: DifficultyLevel
  urgency?: UrgencyLevel
  requestedBy?: 'employee' | 'manager' | 'hr' | 'learning_admin'
  businessJustification?: string
  businessJustificationAr?: string
  startDate: string
  endDate: string
  totalHours: number
  totalDays?: number
  locationType?: LocationType
  venue?: {
    venueName?: string
    venueAddress?: string
    city?: string
    country?: string
  }
  virtualDetails?: {
    platform?: string
    meetingLink?: string
  }
  provider?: {
    providerType: ProviderType
    providerName?: string
    providerNameAr?: string
    contactEmail?: string
    platformName?: string
  }
  cleDetails?: {
    isCLE: boolean
    cleCredits?: number
    cleCategory?: CLECategory
    ethicsCredits?: number
  }
  costs?: {
    baseFee: number
    currency?: string
  }
  isMandatory?: boolean
  mandatoryReason?: string
  complianceDeadline?: string
  notes?: {
    employeeNotes?: string
    hrNotes?: string
  }
}

// Update Training Data
export interface UpdateTrainingData {
  trainingTitle?: string
  trainingTitleAr?: string
  trainingDescription?: string
  trainingDescriptionAr?: string
  trainingType?: TrainingType
  trainingCategory?: TrainingCategory
  deliveryMethod?: DeliveryMethod
  difficultyLevel?: DifficultyLevel
  urgency?: UrgencyLevel
  businessJustification?: string
  businessJustificationAr?: string
  startDate?: string
  endDate?: string
  totalHours?: number
  locationType?: LocationType
  venue?: {
    venueName?: string
    venueAddress?: string
    city?: string
  }
  virtualDetails?: {
    platform?: string
    meetingLink?: string
  }
  provider?: {
    providerType?: ProviderType
    providerName?: string
    contactEmail?: string
  }
  cleDetails?: {
    isCLE?: boolean
    cleCredits?: number
    cleCategory?: CLECategory
  }
  costs?: {
    baseFee?: number
  }
  notes?: {
    employeeNotes?: string
    managerNotes?: string
    hrNotes?: string
  }
}

// Filters
export interface TrainingFilters {
  status?: TrainingStatus
  trainingType?: TrainingType
  trainingCategory?: TrainingCategory
  department?: string
  employeeId?: string
  deliveryMethod?: DeliveryMethod
  isMandatory?: boolean
  isCLE?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface TrainingResponse {
  data: TrainingRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface TrainingStats {
  totalTrainings: number
  byStatus: Array<{ status: TrainingStatus; count: number }>
  byType: Array<{ trainingType: TrainingType; count: number }>
  byCategory: Array<{ category: TrainingCategory; count: number }>
  totalHoursCompleted: number
  totalInvestment: number
  pendingRequests: number
  inProgress: number
  completedThisMonth: number
  completionRate: number
  averageSatisfactionScore: number
  cleCreditsEarned: number
  thisMonth: {
    requests: number
    approvals: number
    completions: number
    hours: number
  }
  upcomingTrainings: number
  overdueCompliance: number
}

// ==================== API FUNCTIONS ====================

// Get all trainings
export const getTrainings = async (filters?: TrainingFilters): Promise<TrainingResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.trainingType) params.append('trainingType', filters.trainingType)
  if (filters?.trainingCategory) params.append('trainingCategory', filters.trainingCategory)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.deliveryMethod) params.append('deliveryMethod', filters.deliveryMethod)
  if (filters?.isMandatory !== undefined) params.append('isMandatory', filters.isMandatory.toString())
  if (filters?.isCLE !== undefined) params.append('isCLE', filters.isCLE.toString())
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/trainings?${params.toString()}`)
  return response.data
}

// Get single training
export const getTraining = async (trainingId: string): Promise<TrainingRecord> => {
  const response = await api.get(`/hr/trainings/${trainingId}`)
  return response.data
}

// Create training
export const createTraining = async (data: CreateTrainingData): Promise<TrainingRecord> => {
  const response = await api.post('/hr/trainings', data)
  return response.data
}

// Update training
export const updateTraining = async (trainingId: string, data: UpdateTrainingData): Promise<TrainingRecord> => {
  const response = await api.patch(`/hr/trainings/${trainingId}`, data)
  return response.data
}

// Delete training
export const deleteTraining = async (trainingId: string): Promise<void> => {
  await api.delete(`/hr/trainings/${trainingId}`)
}

// Get training stats
export const getTrainingStats = async (): Promise<TrainingStats> => {
  const response = await api.get('/hr/trainings/stats')
  return response.data
}

// Submit training request
export const submitTrainingRequest = async (trainingId: string): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/submit`)
  return response.data
}

// Approve training
export const approveTraining = async (trainingId: string, data: {
  comments?: string
  budgetApproved?: boolean
  costCenter?: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/approve`, data)
  return response.data
}

// Reject training
export const rejectTraining = async (trainingId: string, data: {
  reason: string
  comments?: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/reject`, data)
  return response.data
}

// Enroll in training
export const enrollInTraining = async (trainingId: string, data?: {
  registrationNumber?: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/enroll`, data)
  return response.data
}

// Start training
export const startTraining = async (trainingId: string): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/start`)
  return response.data
}

// Record attendance
export const recordAttendance = async (trainingId: string, data: {
  sessionNumber: number
  attended: boolean
  checkInTime?: string
  checkOutTime?: string
  notes?: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/attendance`, data)
  return response.data
}

// Update progress
export const updateProgress = async (trainingId: string, data: {
  completedModules: number
  timeSpent?: number
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/progress`, data)
  return response.data
}

// Submit assessment
export const submitAssessment = async (trainingId: string, data: {
  assessmentType: AssessmentType
  assessmentTitle: string
  score: number
  maxScore: number
  timeSpent?: number
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/assessments`, data)
  return response.data
}

// Complete training
export const completeTraining = async (trainingId: string, data?: {
  passed?: boolean
  finalScore?: number
  finalGrade?: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/complete`, data)
  return response.data
}

// Issue certificate
export const issueCertificate = async (trainingId: string, data?: {
  certificateType?: CertificateType
  validUntil?: string
  cleCredits?: number
  cpdPoints?: number
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/issue-certificate`, data)
  return response.data
}

// Submit evaluation
export const submitEvaluation = async (trainingId: string, data: {
  ratings: {
    overallSatisfaction: number
    contentRelevance?: number
    contentQuality?: number
    instructorKnowledge?: number
    instructorEffectiveness?: number
    materialsQuality?: number
    recommendToOthers?: number
  }
  openEndedFeedback?: {
    whatWasGood?: string
    whatCouldImprove?: string
    additionalComments?: string
  }
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/evaluation`, data)
  return response.data
}

// Record payment
export const recordTrainingPayment = async (trainingId: string, data: {
  amount: number
  paymentMethod: 'bank_transfer' | 'credit_card' | 'check' | 'invoice'
  paymentDate: string
  paymentReference?: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/payment`, data)
  return response.data
}

// Cancel training
export const cancelTraining = async (trainingId: string, data: {
  reason: string
}): Promise<TrainingRecord> => {
  const response = await api.post(`/hr/trainings/${trainingId}/cancel`, data)
  return response.data
}

// Bulk delete
export const bulkDeleteTrainings = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/trainings/bulk-delete', { ids })
  return response.data
}

// Get employee trainings
export const getEmployeeTrainings = async (employeeId: string): Promise<TrainingRecord[]> => {
  const response = await api.get(`/hr/trainings/by-employee/${employeeId}`)
  return response.data
}

// Get pending approvals
export const getPendingTrainingApprovals = async (): Promise<Array<{
  trainingId: string
  employeeName: string
  trainingTitle: string
  trainingType: TrainingType
  cost: number
  requestDate: string
}>> => {
  const response = await api.get('/hr/trainings/pending-approvals')
  return response.data
}

// Get upcoming trainings
export const getUpcomingTrainings = async (): Promise<TrainingRecord[]> => {
  const response = await api.get('/hr/trainings/upcoming')
  return response.data
}

// Get overdue compliance trainings
export const getOverdueComplianceTrainings = async (): Promise<Array<{
  trainingId: string
  employeeName: string
  trainingTitle: string
  complianceDeadline: string
  daysOverdue: number
}>> => {
  const response = await api.get('/hr/trainings/overdue-compliance')
  return response.data
}

// Get CLE summary
export const getCLESummary = async (employeeId: string): Promise<{
  totalCredits: number
  ethicsCredits: number
  byCategory: Array<{ category: CLECategory; credits: number }>
  recentTrainings: Array<{
    trainingTitle: string
    completionDate: string
    credits: number
    category: CLECategory
  }>
  upcomingRenewals: Array<{
    trainingTitle: string
    renewalDate: string
    credits: number
  }>
}> => {
  const response = await api.get(`/hr/trainings/cle-summary/${employeeId}`)
  return response.data
}

// Get training calendar
export const getTrainingCalendar = async (month: number, year: number): Promise<Array<{
  date: string
  trainings: Array<{
    trainingId: string
    trainingTitle: string
    trainingType: TrainingType
    startTime?: string
    endTime?: string
    employeeName: string
  }>
}>> => {
  const response = await api.get(`/hr/trainings/calendar?month=${month}&year=${year}`)
  return response.data
}

// Get training providers
export const getTrainingProviders = async (): Promise<Array<{
  providerId: string
  providerName: string
  providerType: ProviderType
  rating?: number
  trainingsCount: number
}>> => {
  const response = await api.get('/hr/trainings/providers')
  return response.data
}

// Export trainings
export const exportTrainings = async (filters?: TrainingFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)

  const response = await api.get(`/hr/trainings/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}

// Get training policies
export const getTrainingPolicies = async (): Promise<Array<{
  policyId: string
  policyName: string
  policyNameAr?: string
  policyType: 'compliance' | 'development' | 'general'
  description?: string
  effectiveDate: string
  documentUrl?: string
  mandatory: boolean
}>> => {
  const response = await api.get('/hr/trainings/policies')
  return response.data
}
