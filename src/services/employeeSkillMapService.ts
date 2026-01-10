import api from './api'
import type { SkillCategory, VerificationMethod } from './skillService'

// ==================== TYPES & ENUMS ====================

// Endorsement Status
export type EndorsementStatus = 'pending' | 'approved' | 'rejected' | 'expired'

// CPD Status
export type CpdStatus = 'compliant' | 'at_risk' | 'non_compliant' | 'exempt'

// Skill Verification Status
export type SkillVerificationStatus = 'unverified' | 'pending' | 'verified' | 'expired' | 'rejected'

// ==================== LABELS ====================

export const ENDORSEMENT_STATUS_LABELS: Record<EndorsementStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'yellow' },
  approved: { ar: 'موافق عليه', en: 'Approved', color: 'green' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  expired: { ar: 'منتهي الصلاحية', en: 'Expired', color: 'gray' },
}

export const CPD_STATUS_LABELS: Record<CpdStatus, { ar: string; en: string; color: string }> = {
  compliant: { ar: 'ملتزم', en: 'Compliant', color: 'green' },
  at_risk: { ar: 'معرض للخطر', en: 'At Risk', color: 'yellow' },
  non_compliant: { ar: 'غير ملتزم', en: 'Non-Compliant', color: 'red' },
  exempt: { ar: 'معفى', en: 'Exempt', color: 'gray' },
}

export const VERIFICATION_STATUS_LABELS: Record<SkillVerificationStatus, { ar: string; en: string; color: string }> = {
  unverified: { ar: 'غير موثق', en: 'Unverified', color: 'gray' },
  pending: { ar: 'قيد التحقق', en: 'Pending', color: 'yellow' },
  verified: { ar: 'موثق', en: 'Verified', color: 'green' },
  expired: { ar: 'منتهي الصلاحية', en: 'Expired', color: 'orange' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
}

// ==================== INTERFACES ====================

// Skill Endorsement
export interface SkillEndorsement {
  endorsementId: string
  endorserId: string
  endorserName: string
  endorserNameAr?: string
  endorserTitle?: string
  endorserDepartment?: string
  relationship: 'manager' | 'peer' | 'direct_report' | 'external' | 'client'
  endorsementText?: string
  endorsementTextAr?: string
  rating?: number // 1-5 endorsement strength
  status: EndorsementStatus
  endorsedAt: string
  expiresAt?: string
  verifiedBy?: string
  verifiedAt?: string
}

// Skill Verification Record
export interface SkillVerification {
  verificationId: string
  method: VerificationMethod
  verifiedBy: string
  verifiedByName?: string
  verifiedAt: string
  expiresAt?: string
  status: SkillVerificationStatus
  documentUrl?: string
  documentName?: string
  notes?: string
  notesAr?: string
  // For certification verification
  certificationNumber?: string
  issuingBody?: string
  issuingBodyAr?: string
  issueDate?: string
  expiryDate?: string
}

// CPD Activity
export interface CpdActivity {
  activityId: string
  title: string
  titleAr?: string
  type: 'training' | 'conference' | 'seminar' | 'workshop' | 'self_study' | 'publication' | 'mentoring' | 'other'
  provider?: string
  providerAr?: string
  completedAt: string
  hours: number
  points?: number
  skillsLinked: string[] // skill IDs
  certificateUrl?: string
  verified: boolean
  verifiedBy?: string
  verifiedAt?: string
  notes?: string
}

// CPD Summary
export interface CpdSummary {
  employeeId: string
  employeeName: string
  periodStart: string
  periodEnd: string
  requiredPoints: number
  earnedPoints: number
  remainingPoints: number
  status: CpdStatus
  activities: CpdActivity[]
  expiringCertifications: Array<{
    skillId: string
    skillName: string
    certificationName: string
    expiresAt: string
    daysUntilExpiry: number
  }>
  upcomingDeadlines: Array<{
    requirement: string
    dueDate: string
    daysRemaining: number
  }>
}

// Enhanced Employee Skill Detail with Verification & Endorsements
export interface EmployeeSkillDetail {
  skillId: string
  skillName: string
  skillNameAr: string
  category: SkillCategory
  proficiency: number // 1-7 (SFIA)
  sfiaLevelCode?: string // SFIA level code (Follow, Assist, etc.)
  lastEvaluationDate: string
  evaluatedBy?: string
  evaluatedByName?: string
  // Certification & Verification
  certificationId?: string
  certificationName?: string
  certificationExpiry?: string
  verificationStatus: SkillVerificationStatus
  verifications: SkillVerification[]
  // Endorsements
  endorsements: SkillEndorsement[]
  endorsementCount: number
  avgEndorsementRating?: number
  // Experience
  yearsOfExperience?: number
  firstAcquiredDate?: string
  // Notes
  notes?: string
  notesAr?: string
  // History
  evaluationHistory?: Array<{
    evaluationDate: string
    proficiency: number
    evaluatedBy: string
    evaluatedByName: string
    notes?: string
  }>
}

// Training linked to skill
export interface SkillTraining {
  trainingId: string
  trainingName: string
  trainingNameAr: string
  completionDate: string
  skillsAcquired: string[] // skill IDs
  proficiencyGain?: number
  certificateIssued: boolean
  certificateUrl?: string
  provider?: string
  duration?: number // hours
  cpdPoints?: number
}

// Employee Skill Map
export interface EmployeeSkillMap {
  _id: string
  skillMapId: string

  // Employee info
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  designationAr?: string
  departmentId: string
  departmentName: string
  departmentNameAr?: string

  // Skills (child table)
  skills: EmployeeSkillDetail[]

  // Trainings linked
  trainings: SkillTraining[]

  // CPD Tracking
  cpdSummary?: CpdSummary

  // Overall stats
  totalSkills: number
  avgProficiency: number
  verifiedSkillsCount: number
  endorsedSkillsCount: number
  skillsByCategory: Array<{
    category: SkillCategory
    count: number
    avgProficiency: number
  }>

  // Verification Summary
  verificationSummary: {
    verified: number
    pending: number
    unverified: number
    expired: number
  }

  // Metadata
  lastUpdated: string
  updatedBy: string
  updatedByName?: string
  createdAt: string
  createdBy: string
}

// Skill Gap
export interface SkillGap {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  departmentName: string
  requiredSkillId: string
  requiredSkillName: string
  requiredSkillNameAr: string
  requiredProficiency: number
  currentProficiency: number
  gap: number
  verificationRequired: boolean
  recommendedTraining?: {
    trainingId: string
    trainingName: string
    estimatedDuration: number
    provider?: string
    cost?: number
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedTimeToClose?: string // e.g., "3 months"
}

// Skill Matrix Entry
export interface SkillMatrixEntry {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  skills: Record<string, {
    proficiency: number
    verified: boolean
    endorsementCount: number
  }>
}

// Skill Matrix
export interface SkillMatrix {
  departmentId: string
  departmentName: string
  departmentNameAr?: string
  skills: Array<{
    skillId: string
    skillName: string
    skillNameAr: string
    category: SkillCategory
  }>
  employees: SkillMatrixEntry[]
  summary: {
    totalEmployees: number
    totalSkills: number
    avgProficiency: number
    skillCoverage: number // percentage
    verificationRate: number // percentage of verified skills
    avgEndorsements: number
  }
}

// Skill Distribution
export interface SkillDistribution {
  skillId: string
  skillName: string
  skillNameAr: string
  category: SkillCategory
  totalEmployees: number
  byProficiency: Array<{
    level: number
    count: number
    percentage: number
    employees: Array<{
      employeeId: string
      employeeName: string
      designation: string
      verified: boolean
    }>
  }>
  avgProficiency: number
  verifiedCount: number
  verificationRate: number
  departments: Array<{
    departmentId: string
    departmentName: string
    employeeCount: number
    avgProficiency: number
  }>
}

// Training Recommendation
export interface TrainingRecommendation {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  recommendations: Array<{
    skillId: string
    skillName: string
    skillNameAr: string
    currentProficiency: number
    targetProficiency: number
    reason: string
    reasonAr: string
    verificationRequired: boolean
    suggestedTrainings: Array<{
      trainingTitle: string
      trainingTitleAr: string
      provider?: string
      duration: number
      cost?: number
      priority: 'low' | 'medium' | 'high'
      cpdPoints?: number
    }>
  }>
  totalRecommendations: number
  estimatedTotalHours: number
  estimatedTotalCost: number
}

// Add Skill Data
export interface AddEmployeeSkillData {
  skillId: string
  proficiency: number
  evaluatedBy?: string
  certificationId?: string
  certificationName?: string
  certificationExpiry?: string
  notes?: string
  notesAr?: string
  yearsOfExperience?: number
  firstAcquiredDate?: string
  requestVerification?: boolean
  verificationMethod?: VerificationMethod
}

// Update Skill Proficiency Data
export interface UpdateSkillProficiencyData {
  proficiency: number
  evaluatedBy: string
  notes?: string
  notesAr?: string
}

// Request Verification Data
export interface RequestVerificationData {
  method: VerificationMethod
  documentUrl?: string
  documentName?: string
  certificationNumber?: string
  issuingBody?: string
  issueDate?: string
  expiryDate?: string
  notes?: string
}

// Add Endorsement Data
export interface AddEndorsementData {
  endorserId: string
  relationship: 'manager' | 'peer' | 'direct_report' | 'external' | 'client'
  endorsementText?: string
  endorsementTextAr?: string
  rating?: number
}

// Add CPD Activity Data
export interface AddCpdActivityData {
  title: string
  titleAr?: string
  type: 'training' | 'conference' | 'seminar' | 'workshop' | 'self_study' | 'publication' | 'mentoring' | 'other'
  provider?: string
  completedAt: string
  hours: number
  points?: number
  skillsLinked?: string[]
  certificateUrl?: string
  notes?: string
}

// Skill Map Filters
export interface SkillMapFilters {
  departmentId?: string
  designation?: string
  skillId?: string
  minProficiency?: number
  maxProficiency?: number
  hasSkill?: string
  verificationStatus?: SkillVerificationStatus
  hasEndorsements?: boolean
  cpdStatus?: CpdStatus
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Skill Map Response
export interface SkillMapResponse {
  data: EmployeeSkillMap[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// ==================== API FUNCTIONS ====================

/**
 * Get all employee skill maps
 * GET /hr/skill-maps
 */
export const getEmployeeSkillMaps = async (filters?: SkillMapFilters): Promise<SkillMapResponse> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.designation) params.append('designation', filters.designation)
  if (filters?.skillId) params.append('skillId', filters.skillId)
  if (filters?.minProficiency) params.append('minProficiency', filters.minProficiency.toString())
  if (filters?.maxProficiency) params.append('maxProficiency', filters.maxProficiency.toString())
  if (filters?.hasSkill) params.append('hasSkill', filters.hasSkill)
  if (filters?.verificationStatus) params.append('verificationStatus', filters.verificationStatus)
  if (filters?.hasEndorsements !== undefined) params.append('hasEndorsements', filters.hasEndorsements.toString())
  if (filters?.cpdStatus) params.append('cpdStatus', filters.cpdStatus)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/hr/skill-maps?${params.toString()}`)
  return response.data
}

/**
 * Get employee skill map
 * GET /hr/skill-maps/:employeeId
 */
export const getEmployeeSkillMap = async (employeeId: string): Promise<EmployeeSkillMap> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}`)
  return response.data
}

/**
 * Update employee skills (bulk update)
 * PUT /hr/skill-maps/:employeeId/skills
 */
export const updateEmployeeSkills = async (
  employeeId: string,
  skills: EmployeeSkillDetail[]
): Promise<EmployeeSkillMap> => {
  const response = await api.put(`/hr/skill-maps/${employeeId}/skills`, { skills })
  return response.data
}

/**
 * Add skill to employee
 * POST /hr/skill-maps/:employeeId/skills
 */
export const addSkillToEmployee = async (
  employeeId: string,
  skillData: AddEmployeeSkillData
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skills`, skillData)
  return response.data
}

/**
 * Update skill proficiency
 * PATCH /hr/skill-maps/:employeeId/skills/:skillId
 */
export const updateSkillProficiency = async (
  employeeId: string,
  skillId: string,
  data: UpdateSkillProficiencyData
): Promise<EmployeeSkillMap> => {
  const response = await api.patch(`/hr/skill-maps/${employeeId}/skills/${skillId}`, data)
  return response.data
}

/**
 * Remove skill from employee
 * DELETE /hr/skill-maps/:employeeId/skills/:skillId
 */
export const removeSkillFromEmployee = async (
  employeeId: string,
  skillId: string
): Promise<EmployeeSkillMap> => {
  const response = await api.delete(`/hr/skill-maps/${employeeId}/skills/${skillId}`)
  return response.data
}

/**
 * Evaluate skill (add proficiency rating with evaluator)
 * POST /hr/skill-maps/:employeeId/skills/:skillId/evaluate
 */
export const evaluateSkill = async (
  employeeId: string,
  skillId: string,
  proficiency: number,
  evaluatorId: string,
  notes?: string
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skills/${skillId}/evaluate`, {
    proficiency,
    evaluatorId,
    notes
  })
  return response.data
}

// ==================== VERIFICATION FUNCTIONS ====================

/**
 * Request skill verification
 * POST /hr/skill-maps/:employeeId/skills/:skillId/verify
 */
export const requestSkillVerification = async (
  employeeId: string,
  skillId: string,
  data: RequestVerificationData
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skills/${skillId}/verify`, data)
  return response.data
}

/**
 * Approve skill verification (manager/HR)
 * POST /hr/skill-maps/:employeeId/skills/:skillId/verify/:verificationId/approve
 */
export const approveSkillVerification = async (
  employeeId: string,
  skillId: string,
  verificationId: string,
  notes?: string
): Promise<EmployeeSkillMap> => {
  const response = await api.post(
    `/hr/skill-maps/${employeeId}/skills/${skillId}/verify/${verificationId}/approve`,
    { notes }
  )
  return response.data
}

/**
 * Reject skill verification
 * POST /hr/skill-maps/:employeeId/skills/:skillId/verify/:verificationId/reject
 */
export const rejectSkillVerification = async (
  employeeId: string,
  skillId: string,
  verificationId: string,
  reason: string
): Promise<EmployeeSkillMap> => {
  const response = await api.post(
    `/hr/skill-maps/${employeeId}/skills/${skillId}/verify/${verificationId}/reject`,
    { reason }
  )
  return response.data
}

/**
 * Get pending verifications (for manager/HR)
 * GET /hr/skill-maps/verifications/pending
 */
export const getPendingVerifications = async (departmentId?: string): Promise<Array<{
  employeeId: string
  employeeName: string
  skillId: string
  skillName: string
  verification: SkillVerification
  requestedAt: string
}>> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/verifications/pending${params}`)
  return response.data
}

/**
 * Get expiring verifications
 * GET /hr/skill-maps/verifications/expiring
 */
export const getExpiringVerifications = async (daysAhead: number = 30): Promise<Array<{
  employeeId: string
  employeeName: string
  skillId: string
  skillName: string
  verification: SkillVerification
  expiresAt: string
  daysUntilExpiry: number
}>> => {
  const response = await api.get(`/hr/skill-maps/verifications/expiring?days=${daysAhead}`)
  return response.data
}

// ==================== ENDORSEMENT FUNCTIONS ====================

/**
 * Add skill endorsement
 * POST /hr/skill-maps/:employeeId/skills/:skillId/endorse
 */
export const addSkillEndorsement = async (
  employeeId: string,
  skillId: string,
  data: AddEndorsementData
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skills/${skillId}/endorse`, data)
  return response.data
}

/**
 * Request endorsement from someone
 * POST /hr/skill-maps/:employeeId/skills/:skillId/request-endorsement
 */
export const requestEndorsement = async (
  employeeId: string,
  skillId: string,
  endorserIds: string[],
  message?: string
): Promise<{ sent: number }> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skills/${skillId}/request-endorsement`, {
    endorserIds,
    message
  })
  return response.data
}

/**
 * Get pending endorsement requests (for the logged-in user)
 * GET /hr/skill-maps/endorsements/pending
 */
export const getPendingEndorsementRequests = async (): Promise<Array<{
  employeeId: string
  employeeName: string
  skillId: string
  skillName: string
  requestedAt: string
  message?: string
}>> => {
  const response = await api.get('/hr/skill-maps/endorsements/pending')
  return response.data
}

/**
 * Approve endorsement
 * POST /hr/skill-maps/:employeeId/skills/:skillId/endorsements/:endorsementId/approve
 */
export const approveEndorsement = async (
  employeeId: string,
  skillId: string,
  endorsementId: string
): Promise<EmployeeSkillMap> => {
  const response = await api.post(
    `/hr/skill-maps/${employeeId}/skills/${skillId}/endorsements/${endorsementId}/approve`
  )
  return response.data
}

/**
 * Remove endorsement
 * DELETE /hr/skill-maps/:employeeId/skills/:skillId/endorsements/:endorsementId
 */
export const removeEndorsement = async (
  employeeId: string,
  skillId: string,
  endorsementId: string
): Promise<EmployeeSkillMap> => {
  const response = await api.delete(
    `/hr/skill-maps/${employeeId}/skills/${skillId}/endorsements/${endorsementId}`
  )
  return response.data
}

// ==================== CPD FUNCTIONS ====================

/**
 * Get employee CPD summary
 * GET /hr/skill-maps/:employeeId/cpd
 */
export const getEmployeeCpdSummary = async (employeeId: string): Promise<CpdSummary> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/cpd`)
  return response.data
}

/**
 * Add CPD activity
 * POST /hr/skill-maps/:employeeId/cpd/activities
 */
export const addCpdActivity = async (
  employeeId: string,
  data: AddCpdActivityData
): Promise<CpdSummary> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/cpd/activities`, data)
  return response.data
}

/**
 * Update CPD activity
 * PATCH /hr/skill-maps/:employeeId/cpd/activities/:activityId
 */
export const updateCpdActivity = async (
  employeeId: string,
  activityId: string,
  data: Partial<AddCpdActivityData>
): Promise<CpdSummary> => {
  const response = await api.patch(`/hr/skill-maps/${employeeId}/cpd/activities/${activityId}`, data)
  return response.data
}

/**
 * Delete CPD activity
 * DELETE /hr/skill-maps/:employeeId/cpd/activities/:activityId
 */
export const deleteCpdActivity = async (
  employeeId: string,
  activityId: string
): Promise<CpdSummary> => {
  const response = await api.delete(`/hr/skill-maps/${employeeId}/cpd/activities/${activityId}`)
  return response.data
}

/**
 * Verify CPD activity (manager/HR)
 * POST /hr/skill-maps/:employeeId/cpd/activities/:activityId/verify
 */
export const verifyCpdActivity = async (
  employeeId: string,
  activityId: string
): Promise<CpdSummary> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/cpd/activities/${activityId}/verify`)
  return response.data
}

/**
 * Get CPD non-compliant employees
 * GET /hr/skill-maps/cpd/non-compliant
 */
export const getCpdNonCompliantEmployees = async (departmentId?: string): Promise<Array<{
  employeeId: string
  employeeName: string
  department: string
  cpdStatus: CpdStatus
  requiredPoints: number
  earnedPoints: number
  shortfall: number
  deadline: string
}>> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/cpd/non-compliant${params}`)
  return response.data
}

/**
 * Export CPD report
 * GET /hr/skill-maps/:employeeId/cpd/export
 */
export const exportCpdReport = async (employeeId: string): Promise<Blob> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/cpd/export`, {
    responseType: 'blob'
  })
  return response.data
}

// ==================== MATRIX & ANALYSIS FUNCTIONS ====================

/**
 * Get skill matrix (all employees with all skills in a department)
 * GET /hr/skill-maps/matrix
 */
export const getSkillMatrix = async (departmentId?: string): Promise<SkillMatrix> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/matrix${params}`)
  return response.data
}

/**
 * Find skill gaps
 * POST /hr/skill-maps/:employeeId/skill-gaps
 */
export const findSkillGaps = async (
  employeeId: string,
  requiredSkills: Array<{ skillId: string; proficiency: number; verificationRequired?: boolean }>
): Promise<SkillGap[]> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skill-gaps`, { requiredSkills })
  return response.data
}

/**
 * Find skill gaps by department
 * POST /hr/skill-maps/department/:departmentId/skill-gaps
 */
export const findDepartmentSkillGaps = async (
  departmentId: string,
  requiredSkills: Array<{ skillId: string; proficiency: number; verificationRequired?: boolean }>
): Promise<SkillGap[]> => {
  const response = await api.post(`/hr/skill-maps/department/${departmentId}/skill-gaps`, {
    requiredSkills
  })
  return response.data
}

/**
 * Find employees with skill
 * GET /hr/skill-maps/find-by-skill/:skillId
 */
export const findEmployeesWithSkill = async (
  skillId: string,
  options?: {
    minProficiency?: number
    verifiedOnly?: boolean
    minEndorsements?: number
  }
): Promise<Array<{
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  department: string
  proficiency: number
  verified: boolean
  endorsementCount: number
  yearsOfExperience?: number
  lastEvaluationDate: string
}>> => {
  const params = new URLSearchParams()
  if (options?.minProficiency) params.append('minProficiency', options.minProficiency.toString())
  if (options?.verifiedOnly) params.append('verifiedOnly', 'true')
  if (options?.minEndorsements) params.append('minEndorsements', options.minEndorsements.toString())

  const response = await api.get(`/hr/skill-maps/find-by-skill/${skillId}?${params.toString()}`)
  return response.data
}

/**
 * Get skill distribution
 * GET /hr/skill-maps/distribution/:skillId
 */
export const getSkillDistribution = async (skillId: string): Promise<SkillDistribution> => {
  const response = await api.get(`/hr/skill-maps/distribution/${skillId}`)
  return response.data
}

/**
 * Recommend training
 * GET /hr/skill-maps/:employeeId/training-recommendations
 */
export const recommendTraining = async (employeeId: string): Promise<TrainingRecommendation> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/training-recommendations`)
  return response.data
}

/**
 * Get department skill summary
 * GET /hr/skill-maps/department/:departmentId/summary
 */
export const getDepartmentSkillSummary = async (departmentId: string): Promise<{
  departmentId: string
  departmentName: string
  totalEmployees: number
  totalSkills: number
  avgProficiency: number
  verificationRate: number
  avgEndorsements: number
  topSkills: Array<{
    skillId: string
    skillName: string
    employeeCount: number
    avgProficiency: number
    verifiedCount: number
  }>
  skillGaps: Array<{
    skillId: string
    skillName: string
    needed: number
    avgProficiency: number
    criticality: 'low' | 'medium' | 'high' | 'critical'
  }>
  byCategory: Array<{
    category: SkillCategory
    skillCount: number
    avgProficiency: number
  }>
  cpdCompliance: {
    compliant: number
    atRisk: number
    nonCompliant: number
    exempt: number
  }
}> => {
  const response = await api.get(`/hr/skill-maps/department/${departmentId}/summary`)
  return response.data
}

/**
 * Compare employees (skill comparison)
 * POST /hr/skill-maps/compare
 */
export const compareEmployeeSkills = async (employeeIds: string[]): Promise<{
  employees: Array<{
    employeeId: string
    employeeName: string
    designation: string
    department: string
    overallAvgProficiency: number
    verifiedSkillsCount: number
  }>
  skills: Array<{
    skillId: string
    skillName: string
    category: SkillCategory
  }>
  comparison: Array<{
    skillId: string
    employeeProficiency: Record<string, {
      proficiency: number
      verified: boolean
      endorsementCount: number
    }>
  }>
}> => {
  const response = await api.post('/hr/skill-maps/compare', { employeeIds })
  return response.data
}

/**
 * Link training to skill map
 * POST /hr/skill-maps/:employeeId/trainings
 */
export const linkTrainingToSkillMap = async (
  employeeId: string,
  trainingData: {
    trainingId: string
    trainingName: string
    trainingNameAr: string
    completionDate: string
    skillsAcquired: string[]
    proficiencyGain?: number
    cpdPoints?: number
    certificateUrl?: string
  }
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/trainings`, trainingData)
  return response.data
}

/**
 * Get skill trends (historical data)
 * GET /hr/skill-maps/:employeeId/skills/:skillId/trends
 */
export const getSkillTrends = async (
  employeeId: string,
  skillId: string
): Promise<{
  skillId: string
  skillName: string
  currentProficiency: number
  currentlyVerified: boolean
  endorsementCount: number
  history: Array<{
    date: string
    proficiency: number
    evaluatedBy: string
    verificationStatus?: SkillVerificationStatus
    notes?: string
  }>
  trend: 'improving' | 'stable' | 'declining'
  growthRate: number
  timeToNextLevel?: string
}> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/skills/${skillId}/trends`)
  return response.data
}

/**
 * Bulk update skills for multiple employees
 * POST /hr/skill-maps/bulk-update
 */
export const bulkUpdateEmployeeSkills = async (data: Array<{
  employeeId: string
  skillId: string
  proficiency: number
  evaluatedBy: string
}>): Promise<{ updated: number }> => {
  const response = await api.post('/hr/skill-maps/bulk-update', { updates: data })
  return response.data
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Export skill matrix
 * GET /hr/skill-maps/matrix/export
 */
export const exportSkillMatrix = async (departmentId?: string): Promise<Blob> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/matrix/export${params}`, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Export skill gaps
 * GET /hr/skill-maps/skill-gaps/export
 */
export const exportSkillGaps = async (departmentId?: string): Promise<Blob> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/skill-gaps/export${params}`, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Export employee skill profile
 * GET /hr/skill-maps/:employeeId/export
 */
export const exportEmployeeSkillProfile = async (employeeId: string): Promise<Blob> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/export`, {
    responseType: 'blob'
  })
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const employeeSkillMapService = {
  // List & Details
  getEmployeeSkillMaps,
  getEmployeeSkillMap,
  // Employee Skill Operations
  updateEmployeeSkills,
  addSkillToEmployee,
  updateSkillProficiency,
  removeSkillFromEmployee,
  evaluateSkill,
  bulkUpdateEmployeeSkills,
  // Verification
  requestSkillVerification,
  approveSkillVerification,
  rejectSkillVerification,
  getPendingVerifications,
  getExpiringVerifications,
  // Endorsements
  addSkillEndorsement,
  requestEndorsement,
  getPendingEndorsementRequests,
  approveEndorsement,
  removeEndorsement,
  // CPD
  getEmployeeCpdSummary,
  addCpdActivity,
  updateCpdActivity,
  deleteCpdActivity,
  verifyCpdActivity,
  getCpdNonCompliantEmployees,
  exportCpdReport,
  // Skill Matrix & Analysis
  getSkillMatrix,
  findSkillGaps,
  findDepartmentSkillGaps,
  findEmployeesWithSkill,
  getSkillDistribution,
  getDepartmentSkillSummary,
  compareEmployeeSkills,
  getSkillTrends,
  // Training Integration
  recommendTraining,
  linkTrainingToSkillMap,
  // Export
  exportSkillMatrix,
  exportSkillGaps,
  exportEmployeeSkillProfile,
  // Constants
  ENDORSEMENT_STATUS_LABELS,
  CPD_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
}

export default employeeSkillMapService
