import api from './api'
import type { SkillCategory } from './skillService'
import type { CompetencyType, CompetencyCluster } from './competencyService'

// ==================== TYPES & ENUMS ====================

// Assessment Type
export type AssessmentType =
  | 'annual'
  | 'quarterly'
  | 'probation'
  | 'promotion'
  | 'project_end'
  | 'skill_gap'
  | '360_review'
  | 'certification_prep'

// Assessment Status (Workflow)
export type AssessmentStatus =
  | 'draft'
  | 'self_assessment'
  | 'manager_review'
  | 'peer_review'
  | 'calibration'
  | 'completed'
  | 'acknowledged'
  | 'cancelled'

// Rating Scale
export type RatingScale = 1 | 2 | 3 | 4 | 5 | 6 | 7

// Reviewer Role
export type ReviewerRole = 'self' | 'manager' | 'peer' | 'direct_report' | 'external' | 'hr'

// ==================== LABELS ====================

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, { ar: string; en: string; description: string }> = {
  annual: { ar: 'سنوي', en: 'Annual', description: 'Annual performance and skill assessment' },
  quarterly: { ar: 'ربع سنوي', en: 'Quarterly', description: 'Quarterly skill check-in' },
  probation: { ar: 'فترة الاختبار', en: 'Probation', description: 'Probationary period assessment' },
  promotion: { ar: 'ترقية', en: 'Promotion', description: 'Assessment for promotion consideration' },
  project_end: { ar: 'نهاية المشروع', en: 'Project End', description: 'Post-project skill assessment' },
  skill_gap: { ar: 'فجوة المهارات', en: 'Skill Gap', description: 'Targeted skill gap analysis' },
  '360_review': { ar: 'تقييم 360 درجة', en: '360 Review', description: 'Full 360-degree feedback assessment' },
  certification_prep: { ar: 'تحضير للشهادة', en: 'Certification Prep', description: 'Pre-certification readiness assessment' },
}

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  self_assessment: { ar: 'التقييم الذاتي', en: 'Self Assessment', color: 'blue' },
  manager_review: { ar: 'مراجعة المدير', en: 'Manager Review', color: 'yellow' },
  peer_review: { ar: 'مراجعة الزملاء', en: 'Peer Review', color: 'orange' },
  calibration: { ar: 'المعايرة', en: 'Calibration', color: 'purple' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'green' },
  acknowledged: { ar: 'تم الإقرار', en: 'Acknowledged', color: 'teal' },
  cancelled: { ar: 'ملغى', en: 'Cancelled', color: 'red' },
}

export const REVIEWER_ROLE_LABELS: Record<ReviewerRole, { ar: string; en: string }> = {
  self: { ar: 'ذاتي', en: 'Self' },
  manager: { ar: 'المدير', en: 'Manager' },
  peer: { ar: 'زميل', en: 'Peer' },
  direct_report: { ar: 'مرؤوس مباشر', en: 'Direct Report' },
  external: { ar: 'خارجي', en: 'External' },
  hr: { ar: 'الموارد البشرية', en: 'HR' },
}

export const RATING_SCALE_LABELS: Record<RatingScale, { ar: string; en: string; description: string }> = {
  1: { ar: 'مبتدئ', en: 'Novice', description: 'No experience or very basic awareness' },
  2: { ar: 'متعلم', en: 'Learner', description: 'Some exposure, still learning fundamentals' },
  3: { ar: 'ممارس', en: 'Practitioner', description: 'Can apply skills with some guidance' },
  4: { ar: 'كفء', en: 'Competent', description: 'Works independently with good proficiency' },
  5: { ar: 'متقدم', en: 'Advanced', description: 'Expert level, can mentor others' },
  6: { ar: 'خبير', en: 'Expert', description: 'Deep expertise, recognized authority' },
  7: { ar: 'قائد', en: 'Master', description: 'Industry leader, sets standards' },
}

// ==================== INTERFACES ====================

// Skill Rating (within assessment)
export interface SkillRating {
  skillId: string
  skillName: string
  skillNameAr: string
  category: SkillCategory
  selfRating?: RatingScale
  managerRating?: RatingScale
  peerRatings?: Array<{
    reviewerId: string
    reviewerName: string
    rating: RatingScale
    comments?: string
  }>
  finalRating?: RatingScale
  targetRating?: RatingScale
  gap?: number
  evidence?: string[]
  evidenceAr?: string[]
  developmentSuggestions?: string[]
  developmentSuggestionsAr?: string[]
  comments?: string
  commentsAr?: string
}

// Competency Rating (within assessment)
export interface CompetencyRating {
  competencyId: string
  competencyName: string
  competencyNameAr: string
  type: CompetencyType
  cluster: CompetencyCluster
  selfRating?: RatingScale
  managerRating?: RatingScale
  peerRatings?: Array<{
    reviewerId: string
    reviewerName: string
    rating: RatingScale
    comments?: string
  }>
  finalRating?: RatingScale
  targetRating?: RatingScale
  gap?: number
  behavioralExamples?: Array<{
    behavior: string
    behaviorAr?: string
    situation: string
    situationAr?: string
    action: string
    actionAr?: string
    result: string
    resultAr?: string
    observedBy?: string
    observedAt?: string
  }>
  strengthAreas?: string[]
  strengthAreasAr?: string[]
  developmentAreas?: string[]
  developmentAreasAr?: string[]
  comments?: string
  commentsAr?: string
}

// Reviewer Assignment
export interface ReviewerAssignment {
  reviewerId: string
  reviewerName: string
  reviewerNameAr?: string
  role: ReviewerRole
  email?: string
  department?: string
  status: 'pending' | 'in_progress' | 'completed' | 'declined'
  invitedAt: string
  completedAt?: string
  declineReason?: string
  remindersSent: number
  lastReminderAt?: string
}

// Development Plan Item
export interface DevelopmentPlanItem {
  skillOrCompetencyId: string
  skillOrCompetencyName: string
  type: 'skill' | 'competency'
  currentLevel: number
  targetLevel: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  activities: Array<{
    activity: string
    activityAr?: string
    type: 'training' | 'coaching' | 'project' | 'mentoring' | 'reading' | 'assignment' | 'workshop' | 'certification'
    dueDate?: string
    estimatedHours?: number
    provider?: string
    cost?: number
    status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
    completedAt?: string
    notes?: string
  }>
  dueDate?: string
  notes?: string
  notesAr?: string
}

// Skill Assessment (Main Interface)
export interface SkillAssessment {
  _id: string
  assessmentId: string

  // Assessment Info
  title: string
  titleAr: string
  type: AssessmentType
  status: AssessmentStatus

  // Period
  assessmentPeriodStart: string
  assessmentPeriodEnd: string
  dueDate: string

  // Employee Info
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  designationAr?: string
  departmentId: string
  departmentName: string
  departmentNameAr?: string

  // Manager Info
  managerId: string
  managerName: string
  managerNameAr?: string

  // Reviewers (for 360)
  reviewers: ReviewerAssignment[]

  // Ratings
  skillRatings: SkillRating[]
  competencyRatings: CompetencyRating[]

  // Overall Scores
  overallSkillScore?: number
  overallCompetencyScore?: number
  overallScore?: number

  // Strengths & Development Areas (Summary)
  keyStrengths?: string[]
  keyStrengthsAr?: string[]
  developmentAreas?: string[]
  developmentAreasAr?: string[]

  // Development Plan
  developmentPlan: DevelopmentPlanItem[]

  // Comments
  selfAssessmentComments?: string
  selfAssessmentCommentsAr?: string
  managerComments?: string
  managerCommentsAr?: string
  hrComments?: string

  // Acknowledgment
  employeeAcknowledgedAt?: string
  employeeAcknowledgementComments?: string
  managerSignedOffAt?: string

  // Workflow Tracking
  selfAssessmentCompletedAt?: string
  managerReviewCompletedAt?: string
  peerReviewCompletedAt?: string
  calibrationCompletedAt?: string
  completedAt?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

// Create Assessment Data
export interface CreateAssessmentData {
  title: string
  titleAr: string
  type: AssessmentType
  employeeId: string
  managerId: string
  assessmentPeriodStart: string
  assessmentPeriodEnd: string
  dueDate: string
  skillIds?: string[]
  competencyIds?: string[]
  reviewerIds?: Array<{
    reviewerId: string
    role: ReviewerRole
  }>
}

// Update Assessment Data
export interface UpdateAssessmentData extends Partial<CreateAssessmentData> {
  status?: AssessmentStatus
}

// Self Assessment Submission
export interface SelfAssessmentSubmission {
  skillRatings: Array<{
    skillId: string
    rating: RatingScale
    evidence?: string[]
    comments?: string
  }>
  competencyRatings: Array<{
    competencyId: string
    rating: RatingScale
    behavioralExamples?: Array<{
      behavior: string
      situation: string
      action: string
      result: string
    }>
    comments?: string
  }>
  overallComments?: string
  overallCommentsAr?: string
}

// Manager Review Submission
export interface ManagerReviewSubmission {
  skillRatings: Array<{
    skillId: string
    rating: RatingScale
    comments?: string
    developmentSuggestions?: string[]
  }>
  competencyRatings: Array<{
    competencyId: string
    rating: RatingScale
    strengthAreas?: string[]
    developmentAreas?: string[]
    comments?: string
  }>
  keyStrengths?: string[]
  developmentAreas?: string[]
  overallComments?: string
  overallCommentsAr?: string
  developmentPlan?: DevelopmentPlanItem[]
}

// Peer Review Submission
export interface PeerReviewSubmission {
  skillRatings: Array<{
    skillId: string
    rating: RatingScale
    comments?: string
  }>
  competencyRatings: Array<{
    competencyId: string
    rating: RatingScale
    comments?: string
  }>
  overallComments?: string
}

// Assessment Filters
export interface AssessmentFilters {
  type?: AssessmentType
  status?: AssessmentStatus
  employeeId?: string
  managerId?: string
  departmentId?: string
  periodStart?: string
  periodEnd?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Assessment Response
export interface AssessmentResponse {
  data: SkillAssessment[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Assessment Statistics
export interface AssessmentStatistics {
  totalAssessments: number
  byStatus: Record<AssessmentStatus, number>
  byType: Record<AssessmentType, number>
  completionRate: number
  avgDaysToComplete: number
  overdueCount: number
  pendingReviews: number
  avgSkillScore: number
  avgCompetencyScore: number
  avgOverallScore: number
}

// Assessment Comparison
export interface AssessmentComparison {
  employeeId: string
  employeeName: string
  assessments: Array<{
    assessmentId: string
    type: AssessmentType
    completedAt: string
    overallSkillScore: number
    overallCompetencyScore: number
    overallScore: number
  }>
  skillTrends: Array<{
    skillId: string
    skillName: string
    ratings: Array<{
      assessmentId: string
      date: string
      rating: number
    }>
    trend: 'improving' | 'stable' | 'declining'
  }>
  competencyTrends: Array<{
    competencyId: string
    competencyName: string
    ratings: Array<{
      assessmentId: string
      date: string
      rating: number
    }>
    trend: 'improving' | 'stable' | 'declining'
  }>
}

// Calibration Session
export interface CalibrationSession {
  sessionId: string
  assessmentIds: string[]
  departmentId?: string
  facilitatorId: string
  facilitatorName: string
  scheduledAt: string
  completedAt?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  participants: Array<{
    participantId: string
    participantName: string
    role: 'facilitator' | 'reviewer' | 'observer'
  }>
  adjustments: Array<{
    assessmentId: string
    employeeName: string
    originalScore: number
    adjustedScore: number
    adjustmentReason: string
    adjustedBy: string
    adjustedAt: string
  }>
  notes?: string
}

// ==================== API FUNCTIONS ====================

/**
 * Get all skill assessments with filters
 * GET /hr/skills/assessments
 */
export const getSkillAssessments = async (filters?: AssessmentFilters): Promise<AssessmentResponse> => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.managerId) params.append('managerId', filters.managerId)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.periodStart) params.append('periodStart', filters.periodStart)
  if (filters?.periodEnd) params.append('periodEnd', filters.periodEnd)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/hr/skills/assessments?${params.toString()}`)
  return response.data
}

/**
 * Get single skill assessment by ID
 * GET /hr/skills/assessments/:id
 */
export const getSkillAssessment = async (assessmentId: string): Promise<SkillAssessment> => {
  const response = await api.get(`/hr/skills/assessments/${assessmentId}`)
  return response.data
}

/**
 * Create a new skill assessment
 * POST /hr/skills/assessments
 */
export const createSkillAssessment = async (data: CreateAssessmentData): Promise<SkillAssessment> => {
  const response = await api.post('/hr/skills/assessments', data)
  return response.data
}

/**
 * Update a skill assessment
 * PATCH /hr/skills/assessments/:id
 */
export const updateSkillAssessment = async (
  assessmentId: string,
  data: UpdateAssessmentData
): Promise<SkillAssessment> => {
  const response = await api.patch(`/hr/skills/assessments/${assessmentId}`, data)
  return response.data
}

/**
 * Delete a skill assessment
 * DELETE /hr/skills/assessments/:id
 */
export const deleteSkillAssessment = async (assessmentId: string): Promise<void> => {
  await api.delete(`/hr/skills/assessments/${assessmentId}`)
}

/**
 * Submit self assessment
 * POST /hr/skills/assessments/:id/self-assessment
 */
export const submitSelfAssessment = async (
  assessmentId: string,
  data: SelfAssessmentSubmission
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/self-assessment`, data)
  return response.data
}

/**
 * Submit manager review
 * POST /hr/skills/assessments/:id/manager-review
 */
export const submitManagerReview = async (
  assessmentId: string,
  data: ManagerReviewSubmission
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/manager-review`, data)
  return response.data
}

/**
 * Submit peer review
 * POST /hr/skills/assessments/:id/peer-review
 */
export const submitPeerReview = async (
  assessmentId: string,
  reviewerId: string,
  data: PeerReviewSubmission
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/peer-review`, {
    reviewerId,
    ...data,
  })
  return response.data
}

/**
 * Invite peer reviewers
 * POST /hr/skills/assessments/:id/invite-reviewers
 */
export const invitePeerReviewers = async (
  assessmentId: string,
  reviewers: Array<{ reviewerId: string; role: ReviewerRole }>
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/invite-reviewers`, { reviewers })
  return response.data
}

/**
 * Send reminder to reviewers
 * POST /hr/skills/assessments/:id/send-reminders
 */
export const sendReviewerReminders = async (
  assessmentId: string,
  reviewerIds?: string[]
): Promise<{ sent: number }> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/send-reminders`, { reviewerIds })
  return response.data
}

/**
 * Complete assessment (finalize)
 * POST /hr/skills/assessments/:id/complete
 */
export const completeAssessment = async (
  assessmentId: string,
  data?: {
    finalComments?: string
    developmentPlan?: DevelopmentPlanItem[]
  }
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/complete`, data || {})
  return response.data
}

/**
 * Employee acknowledges assessment
 * POST /hr/skills/assessments/:id/acknowledge
 */
export const acknowledgeAssessment = async (
  assessmentId: string,
  comments?: string
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/acknowledge`, { comments })
  return response.data
}

/**
 * Manager sign-off on assessment
 * POST /hr/skills/assessments/:id/sign-off
 */
export const signOffAssessment = async (assessmentId: string): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/sign-off`)
  return response.data
}

/**
 * Get my pending assessments (as employee or reviewer)
 * GET /hr/skills/assessments/my-pending
 */
export const getMyPendingAssessments = async (): Promise<{
  asEmployee: SkillAssessment[]
  asManager: SkillAssessment[]
  asPeerReviewer: SkillAssessment[]
}> => {
  const response = await api.get('/hr/skills/assessments/my-pending')
  return response.data
}

/**
 * Get employee assessment history
 * GET /hr/skills/assessments/employee/:employeeId/history
 */
export const getEmployeeAssessmentHistory = async (employeeId: string): Promise<SkillAssessment[]> => {
  const response = await api.get(`/hr/skills/assessments/employee/${employeeId}/history`)
  return response.data
}

/**
 * Compare assessments over time
 * GET /hr/skills/assessments/employee/:employeeId/comparison
 */
export const compareAssessments = async (employeeId: string): Promise<AssessmentComparison> => {
  const response = await api.get(`/hr/skills/assessments/employee/${employeeId}/comparison`)
  return response.data
}

/**
 * Get assessment statistics
 * GET /hr/skills/assessments/stats
 */
export const getAssessmentStats = async (filters?: {
  departmentId?: string
  periodStart?: string
  periodEnd?: string
}): Promise<AssessmentStatistics> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.periodStart) params.append('periodStart', filters.periodStart)
  if (filters?.periodEnd) params.append('periodEnd', filters.periodEnd)

  const response = await api.get(`/hr/skills/assessments/stats?${params.toString()}`)
  return response.data
}

/**
 * Bulk create assessments
 * POST /hr/skills/assessments/bulk-create
 */
export const bulkCreateAssessments = async (data: {
  type: AssessmentType
  assessmentPeriodStart: string
  assessmentPeriodEnd: string
  dueDate: string
  employeeIds: string[]
  skillIds?: string[]
  competencyIds?: string[]
  includePeerReview?: boolean
}): Promise<{ created: number; assessments: SkillAssessment[] }> => {
  const response = await api.post('/hr/skills/assessments/bulk-create', data)
  return response.data
}

/**
 * Cancel assessment
 * POST /hr/skills/assessments/:id/cancel
 */
export const cancelAssessment = async (
  assessmentId: string,
  reason: string
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/cancel`, { reason })
  return response.data
}

/**
 * Reopen assessment (from completed to in progress)
 * POST /hr/skills/assessments/:id/reopen
 */
export const reopenAssessment = async (
  assessmentId: string,
  reason: string
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/reopen`, { reason })
  return response.data
}

/**
 * Export assessment as PDF
 * GET /hr/skills/assessments/:id/export
 */
export const exportAssessmentPdf = async (assessmentId: string): Promise<Blob> => {
  const response = await api.get(`/hr/skills/assessments/${assessmentId}/export`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Export multiple assessments
 * POST /hr/skills/assessments/export
 */
export const exportAssessments = async (filters?: AssessmentFilters): Promise<Blob> => {
  const response = await api.post('/hr/skills/assessments/export', filters || {}, {
    responseType: 'blob',
  })
  return response.data
}

// ==================== CALIBRATION FUNCTIONS ====================

/**
 * Create calibration session
 * POST /hr/skills/assessments/calibration
 */
export const createCalibrationSession = async (data: {
  assessmentIds: string[]
  departmentId?: string
  scheduledAt: string
  participantIds: Array<{ participantId: string; role: 'facilitator' | 'reviewer' | 'observer' }>
}): Promise<CalibrationSession> => {
  const response = await api.post('/hr/skills/assessments/calibration', data)
  return response.data
}

/**
 * Get calibration session
 * GET /hr/skills/assessments/calibration/:sessionId
 */
export const getCalibrationSession = async (sessionId: string): Promise<CalibrationSession> => {
  const response = await api.get(`/hr/skills/assessments/calibration/${sessionId}`)
  return response.data
}

/**
 * Update calibration session
 * PATCH /hr/skills/assessments/calibration/:sessionId
 */
export const updateCalibrationSession = async (
  sessionId: string,
  data: Partial<CalibrationSession>
): Promise<CalibrationSession> => {
  const response = await api.patch(`/hr/skills/assessments/calibration/${sessionId}`, data)
  return response.data
}

/**
 * Submit calibration adjustment
 * POST /hr/skills/assessments/calibration/:sessionId/adjust
 */
export const submitCalibrationAdjustment = async (
  sessionId: string,
  adjustment: {
    assessmentId: string
    adjustedScore: number
    adjustmentReason: string
  }
): Promise<CalibrationSession> => {
  const response = await api.post(`/hr/skills/assessments/calibration/${sessionId}/adjust`, adjustment)
  return response.data
}

/**
 * Complete calibration session
 * POST /hr/skills/assessments/calibration/:sessionId/complete
 */
export const completeCalibrationSession = async (
  sessionId: string,
  notes?: string
): Promise<CalibrationSession> => {
  const response = await api.post(`/hr/skills/assessments/calibration/${sessionId}/complete`, { notes })
  return response.data
}

// ==================== DEVELOPMENT PLAN FUNCTIONS ====================

/**
 * Get development plan for employee
 * GET /hr/skills/assessments/employee/:employeeId/development-plan
 */
export const getEmployeeDevelopmentPlan = async (employeeId: string): Promise<{
  employeeId: string
  employeeName: string
  currentAssessmentId?: string
  developmentItems: DevelopmentPlanItem[]
  completedItems: number
  inProgressItems: number
  totalItems: number
  overallProgress: number
}> => {
  const response = await api.get(`/hr/skills/assessments/employee/${employeeId}/development-plan`)
  return response.data
}

/**
 * Update development plan item status
 * PATCH /hr/skills/assessments/:assessmentId/development-plan/:itemIndex
 */
export const updateDevelopmentPlanItem = async (
  assessmentId: string,
  itemIndex: number,
  data: Partial<DevelopmentPlanItem>
): Promise<SkillAssessment> => {
  const response = await api.patch(
    `/hr/skills/assessments/${assessmentId}/development-plan/${itemIndex}`,
    data
  )
  return response.data
}

/**
 * Add development plan item
 * POST /hr/skills/assessments/:assessmentId/development-plan
 */
export const addDevelopmentPlanItem = async (
  assessmentId: string,
  item: DevelopmentPlanItem
): Promise<SkillAssessment> => {
  const response = await api.post(`/hr/skills/assessments/${assessmentId}/development-plan`, item)
  return response.data
}

/**
 * Remove development plan item
 * DELETE /hr/skills/assessments/:assessmentId/development-plan/:itemIndex
 */
export const removeDevelopmentPlanItem = async (
  assessmentId: string,
  itemIndex: number
): Promise<SkillAssessment> => {
  const response = await api.delete(`/hr/skills/assessments/${assessmentId}/development-plan/${itemIndex}`)
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const skillAssessmentService = {
  // List & Details
  getSkillAssessments,
  getSkillAssessment,
  getMyPendingAssessments,
  getEmployeeAssessmentHistory,
  compareAssessments,
  getAssessmentStats,
  // CRUD
  createSkillAssessment,
  updateSkillAssessment,
  deleteSkillAssessment,
  bulkCreateAssessments,
  cancelAssessment,
  reopenAssessment,
  // Assessment Workflow
  submitSelfAssessment,
  submitManagerReview,
  submitPeerReview,
  invitePeerReviewers,
  sendReviewerReminders,
  completeAssessment,
  acknowledgeAssessment,
  signOffAssessment,
  // Calibration
  createCalibrationSession,
  getCalibrationSession,
  updateCalibrationSession,
  submitCalibrationAdjustment,
  completeCalibrationSession,
  // Development Plan
  getEmployeeDevelopmentPlan,
  updateDevelopmentPlanItem,
  addDevelopmentPlanItem,
  removeDevelopmentPlanItem,
  // Export
  exportAssessmentPdf,
  exportAssessments,
  // Constants
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  REVIEWER_ROLE_LABELS,
  RATING_SCALE_LABELS,
}

export default skillAssessmentService
