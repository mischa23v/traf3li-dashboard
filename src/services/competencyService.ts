import api from './api'

// ==================== TYPES & ENUMS ====================

// Competency Type
export type CompetencyType = 'core' | 'leadership' | 'functional' | 'behavioral' | 'strategic'

// Competency Cluster
export type CompetencyCluster =
  | 'communication'
  | 'collaboration'
  | 'problem_solving'
  | 'decision_making'
  | 'innovation'
  | 'customer_focus'
  | 'results_orientation'
  | 'leadership'
  | 'people_development'
  | 'strategic_thinking'
  | 'change_management'
  | 'integrity'
  | 'adaptability'
  | 'accountability'

// Competency Importance
export type CompetencyImportance = 'critical' | 'important' | 'useful' | 'optional'

// Assessment Method
export type AssessmentMethod =
  | 'self_assessment'
  | 'manager_assessment'
  | 'peer_review'
  | 'peer_360'
  | 'behavioral_interview'
  | 'case_study'
  | 'observation'
  | 'simulation'

// ==================== LABELS ====================

export const COMPETENCY_TYPE_LABELS: Record<CompetencyType, { ar: string; en: string; color: string }> = {
  core: { ar: 'أساسي', en: 'Core', color: 'blue' },
  leadership: { ar: 'قيادي', en: 'Leadership', color: 'purple' },
  functional: { ar: 'وظيفي', en: 'Functional', color: 'green' },
  behavioral: { ar: 'سلوكي', en: 'Behavioral', color: 'orange' },
  strategic: { ar: 'استراتيجي', en: 'Strategic', color: 'red' },
}

export const COMPETENCY_CLUSTER_LABELS: Record<CompetencyCluster, { ar: string; en: string; icon: string }> = {
  communication: { ar: 'التواصل', en: 'Communication', icon: 'MessageSquare' },
  collaboration: { ar: 'التعاون', en: 'Collaboration', icon: 'Users' },
  problem_solving: { ar: 'حل المشكلات', en: 'Problem Solving', icon: 'Lightbulb' },
  decision_making: { ar: 'اتخاذ القرارات', en: 'Decision Making', icon: 'CheckCircle' },
  innovation: { ar: 'الابتكار', en: 'Innovation', icon: 'Sparkles' },
  customer_focus: { ar: 'التركيز على العميل', en: 'Customer Focus', icon: 'Heart' },
  results_orientation: { ar: 'التوجه نحو النتائج', en: 'Results Orientation', icon: 'Target' },
  leadership: { ar: 'القيادة', en: 'Leadership', icon: 'Crown' },
  people_development: { ar: 'تطوير الأشخاص', en: 'People Development', icon: 'GraduationCap' },
  strategic_thinking: { ar: 'التفكير الاستراتيجي', en: 'Strategic Thinking', icon: 'Compass' },
  change_management: { ar: 'إدارة التغيير', en: 'Change Management', icon: 'RefreshCw' },
  integrity: { ar: 'النزاهة', en: 'Integrity', icon: 'Shield' },
  adaptability: { ar: 'المرونة', en: 'Adaptability', icon: 'Puzzle' },
  accountability: { ar: 'المسؤولية', en: 'Accountability', icon: 'ClipboardCheck' },
}

export const COMPETENCY_IMPORTANCE_LABELS: Record<CompetencyImportance, { ar: string; en: string; color: string }> = {
  critical: { ar: 'حرج', en: 'Critical', color: 'red' },
  important: { ar: 'مهم', en: 'Important', color: 'orange' },
  useful: { ar: 'مفيد', en: 'Useful', color: 'yellow' },
  optional: { ar: 'اختياري', en: 'Optional', color: 'gray' },
}

export const ASSESSMENT_METHOD_LABELS: Record<AssessmentMethod, { ar: string; en: string }> = {
  self_assessment: { ar: 'التقييم الذاتي', en: 'Self Assessment' },
  manager_assessment: { ar: 'تقييم المدير', en: 'Manager Assessment' },
  peer_review: { ar: 'تقييم الزملاء', en: 'Peer Review' },
  peer_360: { ar: 'تقييم 360 درجة', en: '360-Degree Review' },
  behavioral_interview: { ar: 'مقابلة سلوكية', en: 'Behavioral Interview' },
  case_study: { ar: 'دراسة حالة', en: 'Case Study' },
  observation: { ar: 'ملاحظة', en: 'Observation' },
  simulation: { ar: 'محاكاة', en: 'Simulation' },
}

// ==================== INTERFACES ====================

// Behavioral Indicator for a level
export interface BehavioralIndicator {
  level: number // 1-7 (SFIA) or 1-5
  levelName: string
  levelNameAr?: string
  indicators: string[]
  indicatorsAr?: string[]
  examples?: string[]
  examplesAr?: string[]
  negativeIndicators?: string[]
  negativeIndicatorsAr?: string[]
}

// Development Activity
export interface DevelopmentActivity {
  activity: string
  activityAr?: string
  type: 'training' | 'coaching' | 'project' | 'mentoring' | 'reading' | 'assignment' | 'workshop'
  forLevel: number
  estimatedDuration?: string
  cost?: number
  provider?: string
}

// Competency Interface
export interface Competency {
  _id: string
  competencyId: string
  name: string
  nameAr: string
  description: string
  descriptionAr?: string

  // Classification
  type: CompetencyType
  cluster: CompetencyCluster
  clusterAr?: string

  // Behavioral Indicators by Level
  behavioralIndicators: BehavioralIndicator[]

  // Assessment
  assessmentMethods: AssessmentMethod[]

  // Weighting
  importance: CompetencyImportance
  weight: number // percentage (0-100)

  // Development
  developmentActivities?: DevelopmentActivity[]

  // Flags
  isMandatory: boolean
  isActive: boolean

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy: string
  updatedBy?: string
}

// Create Competency Data
export interface CreateCompetencyData {
  name: string
  nameAr: string
  description: string
  descriptionAr?: string
  type: CompetencyType
  cluster: CompetencyCluster
  behavioralIndicators: BehavioralIndicator[]
  assessmentMethods: AssessmentMethod[]
  importance?: CompetencyImportance
  weight?: number
  developmentActivities?: DevelopmentActivity[]
  isMandatory?: boolean
  isActive?: boolean
}

// Update Competency Data
export interface UpdateCompetencyData extends Partial<CreateCompetencyData> {}

// Competency Filters
export interface CompetencyFilters {
  type?: CompetencyType
  cluster?: CompetencyCluster
  isMandatory?: boolean
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Competency Response
export interface CompetencyResponse {
  data: Competency[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Competency Statistics
export interface CompetencyStatistics {
  totalCompetencies: number
  activeCompetencies: number
  mandatoryCompetencies: number
  byType: Record<CompetencyType, number>
  byCluster: Record<CompetencyCluster, number>
  byImportance: Record<CompetencyImportance, number>
  totalWeight: number
}

// Employee Competency (for assignment)
export interface EmployeeCompetency {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  competencyId: string
  competencyName: string
  competencyNameAr?: string
  type: CompetencyType
  proficiencyLevel: number
  proficiencyLevelName?: string
  selfRating?: number
  managerRating?: number
  peerRating?: number
  finalRating?: number
  lastAssessedDate?: string
  lastAssessedBy?: string
  targetLevel: number
  gap: number
  behavioralExamples?: Array<{
    behavior: string
    situation?: string
    action?: string
    result?: string
    observedBy?: string
    observedAt?: string
  }>
}

// ==================== API FUNCTIONS ====================

/**
 * Get all competencies with filters
 * GET /hr/skills/competencies
 */
export const getCompetencies = async (filters?: CompetencyFilters): Promise<CompetencyResponse> => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.cluster) params.append('cluster', filters.cluster)
  if (filters?.isMandatory !== undefined) params.append('isMandatory', filters.isMandatory.toString())
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/hr/skills/competencies?${params.toString()}`)
  return response.data
}

/**
 * Get single competency by ID
 * GET /hr/skills/competencies/:id
 */
export const getCompetency = async (competencyId: string): Promise<Competency> => {
  const response = await api.get(`/hr/skills/competencies/${competencyId}`)
  return response.data
}

/**
 * Create a new competency
 * POST /hr/skills/competencies
 */
export const createCompetency = async (data: CreateCompetencyData): Promise<Competency> => {
  const response = await api.post('/hr/skills/competencies', data)
  return response.data
}

/**
 * Update an existing competency
 * PATCH /hr/skills/competencies/:id
 */
export const updateCompetency = async (
  competencyId: string,
  data: UpdateCompetencyData
): Promise<Competency> => {
  const response = await api.patch(`/hr/skills/competencies/${competencyId}`, data)
  return response.data
}

/**
 * Delete a competency
 * DELETE /hr/skills/competencies/:id
 */
export const deleteCompetency = async (competencyId: string): Promise<void> => {
  await api.delete(`/hr/skills/competencies/${competencyId}`)
}

/**
 * Get competencies by type
 * GET /hr/skills/competencies?type=xxx
 */
export const getCompetenciesByType = async (type: CompetencyType): Promise<Competency[]> => {
  const response = await api.get(`/hr/skills/competencies?type=${type}`)
  return response.data.data
}

/**
 * Get competencies by cluster
 * GET /hr/skills/competencies?cluster=xxx
 */
export const getCompetenciesByCluster = async (cluster: CompetencyCluster): Promise<Competency[]> => {
  const response = await api.get(`/hr/skills/competencies?cluster=${cluster}`)
  return response.data.data
}

/**
 * Get mandatory competencies
 * GET /hr/skills/competencies?isMandatory=true
 */
export const getMandatoryCompetencies = async (): Promise<Competency[]> => {
  const response = await api.get('/hr/skills/competencies?isMandatory=true')
  return response.data.data
}

/**
 * Get core competencies (type=core)
 * GET /hr/skills/competencies?type=core
 */
export const getCoreCompetencies = async (): Promise<Competency[]> => {
  const response = await api.get('/hr/skills/competencies?type=core')
  return response.data.data
}

/**
 * Get leadership competencies (type=leadership)
 * GET /hr/skills/competencies?type=leadership
 */
export const getLeadershipCompetencies = async (): Promise<Competency[]> => {
  const response = await api.get('/hr/skills/competencies?type=leadership')
  return response.data.data
}

/**
 * Get competency statistics
 * GET /hr/skills/competencies/stats
 */
export const getCompetencyStats = async (): Promise<CompetencyStatistics> => {
  const response = await api.get('/hr/skills/competencies/stats')
  return response.data
}

/**
 * Bulk delete competencies
 * POST /hr/skills/competencies/bulk-delete
 */
export const bulkDeleteCompetencies = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/skills/competencies/bulk-delete', { ids })
  return response.data
}

/**
 * Export competencies
 * GET /hr/skills/competencies/export
 */
export const exportCompetencies = async (filters?: CompetencyFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.cluster) params.append('cluster', filters.cluster)

  const response = await api.get(`/hr/skills/competencies/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get employee competencies
 * GET /hr/skills/competencies/employee/:employeeId
 */
export const getEmployeeCompetencies = async (employeeId: string): Promise<EmployeeCompetency[]> => {
  const response = await api.get(`/hr/skills/competencies/employee/${employeeId}`)
  return response.data
}

/**
 * Assign competency to employee
 * POST /hr/skills/competencies/assign
 */
export const assignCompetencyToEmployee = async (data: {
  employeeId: string
  competencyId: string
  targetLevel: number
  proficiencyLevel?: number
  notes?: string
}): Promise<EmployeeCompetency> => {
  const response = await api.post('/hr/skills/competencies/assign', data)
  return response.data
}

/**
 * Update employee competency rating
 * PATCH /hr/skills/competencies/employee/:employeeId/:competencyId
 */
export const updateEmployeeCompetencyRating = async (
  employeeId: string,
  competencyId: string,
  data: {
    proficiencyLevel?: number
    selfRating?: number
    managerRating?: number
    peerRating?: number
    behavioralExamples?: Array<{
      behavior: string
      situation?: string
      action?: string
      result?: string
    }>
    notes?: string
  }
): Promise<EmployeeCompetency> => {
  const response = await api.patch(
    `/hr/skills/competencies/employee/${employeeId}/${competencyId}`,
    data
  )
  return response.data
}

/**
 * Remove competency from employee
 * DELETE /hr/skills/competencies/employee/:employeeId/:competencyId
 */
export const removeCompetencyFromEmployee = async (
  employeeId: string,
  competencyId: string
): Promise<void> => {
  await api.delete(`/hr/skills/competencies/employee/${employeeId}/${competencyId}`)
}

/**
 * Get competency gap analysis for employee
 * GET /hr/skills/competencies/employee/:employeeId/gap-analysis
 */
export const getEmployeeCompetencyGapAnalysis = async (
  employeeId: string
): Promise<{
  employeeId: string
  employeeName: string
  competencyGaps: Array<{
    competencyId: string
    competencyName: string
    type: CompetencyType
    targetLevel: number
    currentLevel: number
    gap: number
    priority: 'high' | 'medium' | 'low'
    recommendedActions: string[]
  }>
  overallGapScore: number
  developmentPlan: Array<{
    competencyId: string
    competencyName: string
    activities: DevelopmentActivity[]
  }>
}> => {
  const response = await api.get(`/hr/skills/competencies/employee/${employeeId}/gap-analysis`)
  return response.data
}

/**
 * Get competency framework (all competencies organized by type/cluster)
 * GET /hr/skills/competencies/framework
 */
export const getCompetencyFramework = async (): Promise<{
  byType: Record<CompetencyType, Competency[]>
  byCluster: Record<CompetencyCluster, Competency[]>
  mandatory: Competency[]
  totalWeight: number
}> => {
  const response = await api.get('/hr/skills/competencies/framework')
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const competencyService = {
  // List & Details
  getCompetencies,
  getCompetency,
  getCompetencyStats,
  getCompetenciesByType,
  getCompetenciesByCluster,
  getMandatoryCompetencies,
  getCoreCompetencies,
  getLeadershipCompetencies,
  getCompetencyFramework,
  // CRUD
  createCompetency,
  updateCompetency,
  deleteCompetency,
  bulkDeleteCompetencies,
  // Employee Competencies
  getEmployeeCompetencies,
  assignCompetencyToEmployee,
  updateEmployeeCompetencyRating,
  removeCompetencyFromEmployee,
  getEmployeeCompetencyGapAnalysis,
  // Export
  exportCompetencies,
  // Constants
  COMPETENCY_TYPE_LABELS,
  COMPETENCY_CLUSTER_LABELS,
  COMPETENCY_IMPORTANCE_LABELS,
  ASSESSMENT_METHOD_LABELS,
}

export default competencyService
