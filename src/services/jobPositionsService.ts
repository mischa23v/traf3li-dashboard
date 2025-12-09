import api from './api'

// ==================== TYPES & ENUMS ====================

// Position Type
export type PositionType = 'regular' | 'temporary' | 'project_based' | 'seasonal' |
  'acting' | 'secondment' | 'pool_position'

// Job Level
export type JobLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' |
  'manager' | 'senior_manager' | 'director' | 'vp' | 'c_level' | 'executive'

// Employment Type
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance'

// Position Status
export type PositionStatus = 'active' | 'vacant' | 'frozen' | 'eliminated' |
  'pending_approval' | 'proposed'

// Job Family
export type JobFamily = 'legal' | 'finance' | 'hr' | 'it' | 'operations' |
  'marketing' | 'sales' | 'administration' | 'management' | 'support' | 'other'

// Occupational Category
export type OccupationalCategory = 'executive' | 'management' | 'professional' |
  'technical' | 'administrative' | 'operational' | 'support'

// Work Environment Type
export type WorkEnvironmentType = 'office' | 'field' | 'hybrid' | 'remote' |
  'client_site' | 'court' | 'mixed'

// ==================== LABELS ====================

export const POSITION_TYPE_LABELS: Record<PositionType, { ar: string; en: string; color: string }> = {
  regular: { ar: 'دائم', en: 'Regular', color: 'emerald' },
  temporary: { ar: 'مؤقت', en: 'Temporary', color: 'amber' },
  project_based: { ar: 'مشروع', en: 'Project Based', color: 'blue' },
  seasonal: { ar: 'موسمي', en: 'Seasonal', color: 'orange' },
  acting: { ar: 'بالإنابة', en: 'Acting', color: 'purple' },
  secondment: { ar: 'انتداب', en: 'Secondment', color: 'cyan' },
  pool_position: { ar: 'احتياطي', en: 'Pool Position', color: 'slate' },
}

export const JOB_LEVEL_LABELS: Record<JobLevel, { ar: string; en: string; color: string; number: number }> = {
  entry: { ar: 'مبتدئ', en: 'Entry', color: 'slate', number: 1 },
  junior: { ar: 'مبتدئ متقدم', en: 'Junior', color: 'gray', number: 2 },
  mid: { ar: 'متوسط', en: 'Mid-Level', color: 'blue', number: 3 },
  senior: { ar: 'أول', en: 'Senior', color: 'indigo', number: 4 },
  lead: { ar: 'قائد فريق', en: 'Lead', color: 'purple', number: 5 },
  manager: { ar: 'مدير', en: 'Manager', color: 'violet', number: 6 },
  senior_manager: { ar: 'مدير أول', en: 'Senior Manager', color: 'fuchsia', number: 7 },
  director: { ar: 'مدير إدارة', en: 'Director', color: 'pink', number: 8 },
  vp: { ar: 'نائب رئيس', en: 'VP', color: 'rose', number: 9 },
  c_level: { ar: 'تنفيذي أعلى', en: 'C-Level', color: 'red', number: 10 },
  executive: { ar: 'تنفيذي', en: 'Executive', color: 'orange', number: 11 },
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, { ar: string; en: string; color: string }> = {
  full_time: { ar: 'دوام كامل', en: 'Full Time', color: 'emerald' },
  part_time: { ar: 'دوام جزئي', en: 'Part Time', color: 'blue' },
  contract: { ar: 'عقد', en: 'Contract', color: 'amber' },
  intern: { ar: 'متدرب', en: 'Intern', color: 'purple' },
  freelance: { ar: 'مستقل', en: 'Freelance', color: 'cyan' },
}

export const POSITION_STATUS_LABELS: Record<PositionStatus, { ar: string; en: string; color: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  vacant: { ar: 'شاغر', en: 'Vacant', color: 'amber' },
  frozen: { ar: 'مجمد', en: 'Frozen', color: 'blue' },
  eliminated: { ar: 'ملغى', en: 'Eliminated', color: 'red' },
  pending_approval: { ar: 'قيد الاعتماد', en: 'Pending Approval', color: 'purple' },
  proposed: { ar: 'مقترح', en: 'Proposed', color: 'slate' },
}

export const JOB_FAMILY_LABELS: Record<JobFamily, { ar: string; en: string; color: string; icon: string }> = {
  legal: { ar: 'قانوني', en: 'Legal', color: 'blue', icon: 'Scale' },
  finance: { ar: 'مالية', en: 'Finance', color: 'emerald', icon: 'Wallet' },
  hr: { ar: 'موارد بشرية', en: 'HR', color: 'purple', icon: 'Users' },
  it: { ar: 'تقنية المعلومات', en: 'IT', color: 'cyan', icon: 'Monitor' },
  operations: { ar: 'العمليات', en: 'Operations', color: 'orange', icon: 'Settings' },
  marketing: { ar: 'تسويق', en: 'Marketing', color: 'pink', icon: 'Megaphone' },
  sales: { ar: 'مبيعات', en: 'Sales', color: 'green', icon: 'TrendingUp' },
  administration: { ar: 'إدارية', en: 'Administration', color: 'slate', icon: 'Building' },
  management: { ar: 'إدارة', en: 'Management', color: 'indigo', icon: 'Briefcase' },
  support: { ar: 'دعم', en: 'Support', color: 'gray', icon: 'LifeBuoy' },
  other: { ar: 'أخرى', en: 'Other', color: 'stone', icon: 'MoreHorizontal' },
}

export const OCCUPATIONAL_CATEGORY_LABELS: Record<OccupationalCategory, { ar: string; en: string; color: string }> = {
  executive: { ar: 'تنفيذي', en: 'Executive', color: 'red' },
  management: { ar: 'إداري', en: 'Management', color: 'purple' },
  professional: { ar: 'مهني', en: 'Professional', color: 'blue' },
  technical: { ar: 'تقني', en: 'Technical', color: 'cyan' },
  administrative: { ar: 'إداري مكتبي', en: 'Administrative', color: 'slate' },
  operational: { ar: 'تشغيلي', en: 'Operational', color: 'orange' },
  support: { ar: 'دعم', en: 'Support', color: 'gray' },
}

export const WORK_ENVIRONMENT_LABELS: Record<WorkEnvironmentType, { ar: string; en: string }> = {
  office: { ar: 'مكتبي', en: 'Office' },
  field: { ar: 'ميداني', en: 'Field' },
  hybrid: { ar: 'هجين', en: 'Hybrid' },
  remote: { ar: 'عن بعد', en: 'Remote' },
  client_site: { ar: 'موقع العميل', en: 'Client Site' },
  court: { ar: 'محكمة', en: 'Court' },
  mixed: { ar: 'متنوع', en: 'Mixed' },
}

// ==================== INTERFACES ====================

// Salary Range
export interface SalaryRange {
  minimum: number
  midpoint: number
  maximum: number
  currency: string
  period: 'monthly' | 'annual'
}

// Qualification
export interface Qualification {
  minimumEducation: 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'doctorate' | 'professional'
  minimumEducationAr?: string
  requiredDegrees?: string[]
  minimumYearsExperience: number
  preferredYearsExperience?: number
  requiredCertifications?: string[]
  preferredCertifications?: string[]
  requiredSkills?: string[]
  preferredSkills?: string[]
  languageRequirements?: Array<{
    language: string
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native'
    required: boolean
  }>
}

// Responsibility
export interface Responsibility {
  responsibilityId?: string
  responsibility: string
  responsibilityAr?: string
  category?: 'primary' | 'secondary' | 'occasional'
  priority?: number
  timeAllocation?: number
  essentialFunction: boolean
}

// Direct Report
export interface DirectReport {
  positionId: string
  jobTitle: string
  jobTitleAr?: string
  incumbentName?: string
  filled: boolean
  fte?: number
}

// Career Path
export interface CareerPath {
  currentLevel: string
  previousLevel?: {
    jobTitle: string
    jobLevel: string
    typicalYearsInRole: number
  }
  nextLevel?: {
    jobTitle: string
    jobLevel: string
    typicalPromotionTime: number
    requirementsForPromotion: string[]
  }
  lateralMoves?: string[]
}

// Incumbent Info
export interface IncumbentInfo {
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  assignmentDate: string
  assignmentType: 'permanent' | 'acting' | 'temporary' | 'probation'
  probationEnd?: string
}

// Job Position
export interface JobPosition {
  _id: string
  positionId: string
  positionNumber: string
  positionCode?: string

  // Job Details
  jobTitle: string
  jobTitleAr?: string
  workingTitle?: string
  workingTitleAr?: string

  // Classification
  jobFamily: JobFamily
  jobSubFamily?: string
  occupationalCategory: OccupationalCategory
  jobLevel: JobLevel
  jobGrade: string
  gradeNumber?: number

  // Position Type
  positionType: PositionType
  employmentType: EmploymentType

  // Organization
  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  divisionId?: string
  divisionName?: string
  costCenter?: string
  costCenterName?: string

  // Location
  location?: string
  locationAr?: string
  city?: string
  country?: string
  remoteEligible: boolean
  remoteWorkType?: 'fully_remote' | 'hybrid' | 'on_site'
  travelRequired: boolean
  travelPercentage?: number

  // Reporting
  reportsToPositionId?: string
  reportsToPositionNumber?: string
  reportsToJobTitle?: string
  reportsToJobTitleAr?: string
  reportsToIncumbentName?: string
  directReportsCount: number
  directReports?: DirectReport[]
  indirectReportsCount?: number
  supervisoryPosition: boolean
  managementLevel?: number

  // Job Description
  jobSummary?: string
  jobSummaryAr?: string
  jobPurpose?: string
  jobPurposeAr?: string
  keyResponsibilities?: Responsibility[]
  keyChallenges?: string[]
  successFactors?: string[]

  // Qualifications
  qualifications?: Qualification

  // Compensation
  salaryGrade: string
  salaryRange?: SalaryRange

  // Working Conditions
  workEnvironment?: WorkEnvironmentType
  standardHours?: number
  scheduleType?: 'standard' | 'flexible' | 'shift' | 'compressed' | 'variable'
  overtimeExpected?: boolean
  onCallRequired?: boolean

  // Status
  status: PositionStatus
  statusEffectiveDate?: string
  statusReason?: string
  filled: boolean
  fte: number
  budgeted: boolean
  fiscalYear?: number

  // Incumbent
  incumbent?: IncumbentInfo
  vacantSince?: string
  vacancyReason?: string

  // Career Path
  careerPath?: CareerPath

  // Compliance
  saudiOnly?: boolean
  saudiPreferred?: boolean
  saudizationCompliant?: boolean

  // Dates
  effectiveDate?: string
  endDate?: string

  // Notes
  notes?: string
  notesAr?: string
  hrNotes?: string

  // Audit
  createdOn: string
  createdBy: string
  updatedOn?: string
  updatedBy?: string
}

// Filters
export interface JobPositionFilters {
  search?: string
  jobFamily?: JobFamily
  jobLevel?: JobLevel
  employmentType?: EmploymentType
  status?: PositionStatus
  departmentId?: string
  filled?: boolean
  supervisoryPosition?: boolean
  remoteEligible?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Stats
export interface JobPositionStats {
  totalPositions: number
  activePositions: number
  vacantPositions: number
  frozenPositions: number
  filledPositions: number
  vacancyRate: number
  byJobFamily: Record<JobFamily, number>
  byJobLevel: Record<JobLevel, number>
  byStatus: Record<PositionStatus, number>
  byEmploymentType: Record<EmploymentType, number>
  averageTimeToFill?: number
  totalHeadcount: number
  approvedHeadcount: number
}

// Create Position Data
export interface CreateJobPositionData {
  positionNumber?: string
  positionCode?: string
  jobTitle: string
  jobTitleAr?: string
  workingTitle?: string
  workingTitleAr?: string

  jobFamily: JobFamily
  jobSubFamily?: string
  occupationalCategory: OccupationalCategory
  jobLevel: JobLevel
  jobGrade: string
  gradeNumber?: number

  positionType: PositionType
  employmentType: EmploymentType

  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  divisionId?: string
  divisionName?: string
  costCenter?: string

  location?: string
  locationAr?: string
  city?: string
  country?: string
  remoteEligible?: boolean
  remoteWorkType?: 'fully_remote' | 'hybrid' | 'on_site'
  travelRequired?: boolean
  travelPercentage?: number

  reportsToPositionId?: string
  supervisoryPosition?: boolean

  jobSummary?: string
  jobSummaryAr?: string
  jobPurpose?: string
  jobPurposeAr?: string
  keyResponsibilities?: Omit<Responsibility, 'responsibilityId'>[]
  keyChallenges?: string[]
  successFactors?: string[]

  qualifications?: Qualification

  salaryGrade: string
  salaryRange?: Omit<SalaryRange, 'period'> & { period?: 'monthly' | 'annual' }

  workEnvironment?: WorkEnvironmentType
  standardHours?: number
  scheduleType?: 'standard' | 'flexible' | 'shift' | 'compressed' | 'variable'
  overtimeExpected?: boolean
  onCallRequired?: boolean

  fte?: number
  budgeted?: boolean
  fiscalYear?: number

  saudiOnly?: boolean
  saudiPreferred?: boolean

  effectiveDate?: string

  notes?: string
  notesAr?: string
}

// Update Position Data
export interface UpdateJobPositionData extends Partial<CreateJobPositionData> {
  status?: PositionStatus
  statusReason?: string
  endDate?: string
  hrNotes?: string
  careerPath?: CareerPath
}

// ==================== API FUNCTIONS ====================

// Get all positions
export const getJobPositions = async (filters?: JobPositionFilters) => {
  const response = await api.get<{ data: JobPosition[]; total: number; page: number; totalPages: number }>('/hr/job-positions', { params: filters })
  return response.data
}

// Get single position
export const getJobPosition = async (positionId: string) => {
  const response = await api.get<JobPosition>(`/hr/job-positions/${positionId}`)
  return response.data
}

// Get stats
export const getJobPositionStats = async () => {
  const response = await api.get<JobPositionStats>('/hr/job-positions/stats')
  return response.data
}

// Get vacant positions
export const getVacantPositions = async () => {
  const response = await api.get<JobPosition[]>('/hr/job-positions/vacant')
  return response.data
}

// Get positions by department
export const getPositionsByDepartment = async (departmentId: string) => {
  const response = await api.get<JobPosition[]>(`/hr/job-positions/department/${departmentId}`)
  return response.data
}

// Get reporting hierarchy
export const getReportingHierarchy = async (positionId: string) => {
  const response = await api.get<{ upward: JobPosition[]; downward: JobPosition[] }>(`/hr/job-positions/${positionId}/hierarchy`)
  return response.data
}

// Get org chart
export const getOrgChart = async () => {
  const response = await api.get<any>('/hr/job-positions/org-chart')
  return response.data
}

// Create position
export const createJobPosition = async (data: CreateJobPositionData) => {
  const response = await api.post<JobPosition>('/hr/job-positions', data)
  return response.data
}

// Update position
export const updateJobPosition = async (positionId: string, data: UpdateJobPositionData) => {
  const response = await api.patch<JobPosition>(`/hr/job-positions/${positionId}`, data)
  return response.data
}

// Delete position
export const deleteJobPosition = async (positionId: string) => {
  const response = await api.delete(`/hr/job-positions/${positionId}`)
  return response.data
}

// Bulk delete positions
export const bulkDeleteJobPositions = async (ids: string[]) => {
  const response = await api.post('/hr/job-positions/bulk-delete', { ids })
  return response.data
}

// Freeze position
export const freezeJobPosition = async (positionId: string, data: { reason: string; effectiveDate?: string }) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/freeze`, data)
  return response.data
}

// Unfreeze position
export const unfreezeJobPosition = async (positionId: string) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/unfreeze`)
  return response.data
}

// Eliminate position
export const eliminateJobPosition = async (positionId: string, data: { reason: string; effectiveDate?: string }) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/eliminate`, data)
  return response.data
}

// Mark as vacant
export const markPositionVacant = async (positionId: string, data: { reason: string; vacantSince?: string }) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/vacant`, data)
  return response.data
}

// Fill position
export const fillJobPosition = async (positionId: string, data: {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  assignmentType: 'permanent' | 'acting' | 'temporary' | 'probation'
  assignmentDate: string
  probationEnd?: string
}) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/fill`, data)
  return response.data
}

// Vacate position (remove incumbent)
export const vacateJobPosition = async (positionId: string, data: { reason: string; effectiveDate?: string }) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/vacate`, data)
  return response.data
}

// Clone position
export const cloneJobPosition = async (positionId: string, data?: { newPositionNumber?: string }) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/clone`, data)
  return response.data
}

// Update responsibilities
export const updateResponsibilities = async (positionId: string, responsibilities: Omit<Responsibility, 'responsibilityId'>[]) => {
  const response = await api.put<JobPosition>(`/hr/job-positions/${positionId}/responsibilities`, { responsibilities })
  return response.data
}

// Update qualifications
export const updateQualifications = async (positionId: string, qualifications: Qualification) => {
  const response = await api.put<JobPosition>(`/hr/job-positions/${positionId}/qualifications`, qualifications)
  return response.data
}

// Update salary range
export const updateSalaryRange = async (positionId: string, salaryRange: SalaryRange) => {
  const response = await api.put<JobPosition>(`/hr/job-positions/${positionId}/salary-range`, salaryRange)
  return response.data
}

// Update competencies
export const updateCompetencies = async (positionId: string, competencies: any) => {
  const response = await api.put<JobPosition>(`/hr/job-positions/${positionId}/competencies`, competencies)
  return response.data
}

// Add document
export const addDocument = async (positionId: string, document: any) => {
  const response = await api.post<JobPosition>(`/hr/job-positions/${positionId}/documents`, document)
  return response.data
}

// Export positions
export const exportJobPositions = async (filters?: JobPositionFilters) => {
  const response = await api.get('/hr/job-positions/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}

export default {
  getJobPositions,
  getJobPosition,
  getJobPositionStats,
  getVacantPositions,
  getPositionsByDepartment,
  getReportingHierarchy,
  getOrgChart,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  bulkDeleteJobPositions,
  freezeJobPosition,
  unfreezeJobPosition,
  eliminateJobPosition,
  markPositionVacant,
  fillJobPosition,
  vacateJobPosition,
  cloneJobPosition,
  updateResponsibilities,
  updateQualifications,
  updateSalaryRange,
  updateCompetencies,
  addDocument,
  exportJobPositions,
}
