import api from './api'

// ==================== TYPES & ENUMS ====================

// Skill Category (Part 7 expanded)
export type SkillCategory =
  | 'technical'
  | 'legal'
  | 'language'
  | 'software'
  | 'management'
  | 'communication'
  | 'analytical'
  | 'interpersonal'
  | 'industry_specific'
  | 'certification'
  | 'other'

// Skill Classification (for Skill Types hierarchy)
export type SkillClassification =
  | 'technical'
  | 'functional'
  | 'behavioral'
  | 'leadership'
  | 'industry'
  | 'certification'
  | 'language'
  | 'tool'
  | 'regulatory'

// Verification Method
export type VerificationMethod =
  | 'certification'
  | 'assessment'
  | 'observation'
  | 'peer_review'
  | 'manager_attestation'
  | 'self_declared'

// Skill Relationship Type
export type SkillRelationship = 'prerequisite' | 'complementary' | 'related' | 'successor'

// ==================== SFIA 7-LEVEL FRAMEWORK ====================

export interface SfiaLevel {
  level: number // 1-7
  code: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  autonomy: string
  complexity: string
  businessSkills: string
  influence: string
}

export const SFIA_LEVELS: SfiaLevel[] = [
  {
    level: 1,
    code: 'Follow',
    name: 'Follow',
    nameAr: 'متابع',
    description: 'Works under close direction. Uses little discretion. Expected to seek guidance.',
    descriptionAr: 'يعمل تحت إشراف وثيق. يستخدم القليل من التقدير. يتوقع طلب التوجيه.',
    autonomy: 'Works under supervision',
    complexity: 'Routine tasks',
    businessSkills: 'Learning basic business processes',
    influence: 'Minimal impact on team',
  },
  {
    level: 2,
    code: 'Assist',
    name: 'Assist',
    nameAr: 'مساعد',
    description: 'Works under routine direction. Uses limited discretion. Work is reviewed frequently.',
    descriptionAr: 'يعمل تحت توجيه روتيني. يستخدم تقدير محدود. يتم مراجعة العمل بشكل متكرر.',
    autonomy: 'Works with moderate supervision',
    complexity: 'Routine and straightforward tasks',
    businessSkills: 'Understands basic business processes',
    influence: 'Limited impact within team',
  },
  {
    level: 3,
    code: 'Apply',
    name: 'Apply',
    nameAr: 'تطبيق',
    description: 'Works under general direction. Uses discretion in identifying and responding to complex issues.',
    descriptionAr: 'يعمل تحت توجيه عام. يستخدم التقدير في تحديد المشاكل المعقدة والاستجابة لها.',
    autonomy: 'Works with limited supervision',
    complexity: 'Varied work activities',
    businessSkills: 'Demonstrates effective communication',
    influence: 'Interacts with and influences immediate team',
  },
  {
    level: 4,
    code: 'Enable',
    name: 'Enable',
    nameAr: 'تمكين',
    description: 'Works under general guidance. Substantial responsibility. Influences team practices.',
    descriptionAr: 'يعمل تحت توجيه عام. مسؤولية كبيرة. يؤثر على ممارسات الفريق.',
    autonomy: 'Works with broad guidance',
    complexity: 'Complex technical activities',
    businessSkills: 'Facilitates collaboration within team',
    influence: 'Influences practices of immediate team',
  },
  {
    level: 5,
    code: 'Ensure/Advise',
    name: 'Ensure & Advise',
    nameAr: 'ضمان وإرشاد',
    description: 'Works under broad direction. Full accountability for technical work. Advises on scope of work.',
    descriptionAr: 'يعمل تحت توجيه واسع. المساءلة الكاملة عن العمل الفني. ينصح في نطاق العمل.',
    autonomy: 'Full accountability for actions',
    complexity: 'Broad range of complex activities',
    businessSkills: 'Communicates effectively to all levels',
    influence: 'Influences across the organization',
  },
  {
    level: 6,
    code: 'Initiate/Influence',
    name: 'Initiate & Influence',
    nameAr: 'مبادرة وتأثير',
    description: 'Has defined authority and accountability. Establishes organizational objectives.',
    descriptionAr: 'لديه سلطة ومسؤولية محددة. يحدد الأهداف التنظيمية.',
    autonomy: 'Defined authority within organization',
    complexity: 'Highly complex work involving innovation',
    businessSkills: 'Champions organizational initiatives',
    influence: 'Significant influence on organizational policy',
  },
  {
    level: 7,
    code: 'Set Strategy/Inspire',
    name: 'Set Strategy & Inspire',
    nameAr: 'وضع استراتيجية وإلهام',
    description: 'Has authority and accountability for all aspects. Sets direction and shapes culture.',
    descriptionAr: 'لديه السلطة والمساءلة على جميع الجوانب. يحدد الاتجاه ويشكل الثقافة.',
    autonomy: 'Highest level of authority',
    complexity: 'Strategic leadership and innovation',
    businessSkills: 'Shapes organizational culture',
    influence: 'Inspires and influences across industry',
  },
]

// ==================== LABELS ====================

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, { ar: string; en: string; color: string; icon: string }> = {
  technical: { ar: 'تقني', en: 'Technical', color: 'blue', icon: 'Code' },
  legal: { ar: 'قانوني', en: 'Legal', color: 'amber', icon: 'Scale' },
  language: { ar: 'لغات', en: 'Language', color: 'violet', icon: 'Languages' },
  software: { ar: 'برمجيات', en: 'Software', color: 'cyan', icon: 'Monitor' },
  management: { ar: 'إدارة', en: 'Management', color: 'indigo', icon: 'Briefcase' },
  communication: { ar: 'تواصل', en: 'Communication', color: 'pink', icon: 'MessageSquare' },
  analytical: { ar: 'تحليلي', en: 'Analytical', color: 'orange', icon: 'BarChart' },
  interpersonal: { ar: 'شخصي', en: 'Interpersonal', color: 'rose', icon: 'Users' },
  industry_specific: { ar: 'صناعي', en: 'Industry Specific', color: 'emerald', icon: 'Building' },
  certification: { ar: 'شهادة', en: 'Certification', color: 'teal', icon: 'Award' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray', icon: 'MoreHorizontal' },
}

export const SKILL_CLASSIFICATION_LABELS: Record<SkillClassification, { ar: string; en: string }> = {
  technical: { ar: 'تقني', en: 'Technical' },
  functional: { ar: 'وظيفي', en: 'Functional' },
  behavioral: { ar: 'سلوكي', en: 'Behavioral' },
  leadership: { ar: 'قيادي', en: 'Leadership' },
  industry: { ar: 'صناعي', en: 'Industry' },
  certification: { ar: 'شهادة', en: 'Certification' },
  language: { ar: 'لغة', en: 'Language' },
  tool: { ar: 'أداة', en: 'Tool' },
  regulatory: { ar: 'تنظيمي', en: 'Regulatory' },
}

// Legacy proficiency levels (for backward compatibility)
export const PROFICIENCY_LEVELS = [
  { level: 1, ar: 'مبتدئ', en: 'Beginner', description: 'Basic knowledge and skills', color: 'red' },
  { level: 2, ar: 'متوسط', en: 'Intermediate', description: 'Working knowledge with some experience', color: 'orange' },
  { level: 3, ar: 'كفء', en: 'Competent', description: 'Good working knowledge and can work independently', color: 'yellow' },
  { level: 4, ar: 'متقدم', en: 'Advanced', description: 'Expert level with extensive experience', color: 'teal' },
  { level: 5, ar: 'خبير', en: 'Expert', description: 'Master level, can teach and mentor others', color: 'emerald' },
]

// ==================== INTERFACES ====================

// Skill Proficiency Level (custom per skill)
export interface SkillProficiencyLevel {
  level: number // 1-7 if SFIA, 1-5 for legacy
  code?: string
  name: string
  nameAr: string
  description: string
  descriptionAr?: string
  autonomy?: string
  complexity?: string
}

// Learning Resource
export interface LearningResource {
  type: 'course' | 'book' | 'video' | 'workshop' | 'certification' | 'on_the_job' | 'mentoring'
  title: string
  titleAr?: string
  provider?: string
  url?: string
  duration?: string // e.g., "20 hours", "2 days"
  cost?: number
  forLevel: number // which proficiency level this resource targets
}

// Certification Info
export interface CertificationInfo {
  certificationName: string
  certificationNameAr?: string
  issuingBody: string
  issuingBodyAr?: string
  validityPeriodMonths?: number
  renewalRequired: boolean
  cpdCredits?: number
  examRequired?: boolean
  estimatedCost?: number
}

// Related Skill
export interface RelatedSkill {
  skillId: string
  skillName?: string
  relationship: SkillRelationship
}

// Industry Standard
export interface IndustryStandard {
  framework: string // e.g., "SFIA", "O*NET", "ESCO"
  standardCode: string
  standardName: string
}

// Required for Role
export interface RequiredForRole {
  roleId: string
  roleName: string
  roleNameAr?: string
  requiredLevel: number
}

// Skill Stats
export interface SkillStats {
  employeesWithSkill: number
  avgProficiency: number
  verifiedCount: number
  lastUpdated?: string
}

// Skill Interface (Part 7 compliant)
export interface Skill {
  _id: string
  skillId: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string

  // Classification
  skillTypeId?: string
  skillTypeName?: string
  category: SkillCategory
  subcategory?: string

  // Proficiency Framework
  useSfiaLevels: boolean
  proficiencyLevels?: SkillProficiencyLevel[]
  targetProficiency: number

  // Tags
  tags: string[]
  tagsAr?: string[]

  // Related Skills
  relatedSkills?: RelatedSkill[]

  // Verification
  isVerifiable: boolean
  verificationMethod?: VerificationMethod

  // Certification
  certificationInfo?: CertificationInfo

  // Learning Resources
  learningResources?: LearningResource[]

  // Related Trainings
  relatedTrainings?: string[] // training IDs

  // Required for Roles
  requiredForRoles?: RequiredForRole[]

  // Industry Standards
  industryStandards?: IndustryStandard[]

  // Stats
  stats?: SkillStats

  // Flags
  isCoreSkill: boolean
  isActive: boolean

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy: string
  updatedBy?: string
}

// Create Skill Data
export interface CreateSkillData {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  skillTypeId?: string
  category: SkillCategory
  subcategory?: string
  useSfiaLevels?: boolean
  proficiencyLevels?: SkillProficiencyLevel[]
  targetProficiency?: number
  tags?: string[]
  tagsAr?: string[]
  relatedSkills?: RelatedSkill[]
  isVerifiable?: boolean
  verificationMethod?: VerificationMethod
  certificationInfo?: CertificationInfo
  learningResources?: LearningResource[]
  relatedTrainings?: string[]
  requiredForRoles?: RequiredForRole[]
  industryStandards?: IndustryStandard[]
  isCoreSkill?: boolean
  isActive?: boolean
}

// Update Skill Data
export interface UpdateSkillData extends Partial<CreateSkillData> {}

// Skill Filters
export interface SkillFilters {
  category?: SkillCategory
  skillTypeId?: string
  isVerifiable?: boolean
  isCoreSkill?: boolean
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Skill Response
export interface SkillResponse {
  data: Skill[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Skill Statistics
export interface SkillStatistics {
  totalSkills: number
  activeSkills: number
  coreSkills: number
  verifiableSkills: number
  byCategory: Record<SkillCategory, number>
  byClassification: Record<SkillClassification, number>
  certificationStats: {
    totalCertifiable: number
    expiringIn30Days: number
    expiringIn90Days: number
  }
  topSkillsByEmployees: Array<{
    skillId: string
    skillName: string
    employeeCount: number
    avgProficiency: number
  }>
}

// Skills by Category Response
export interface SkillsByCategory {
  _id: SkillCategory
  skills: Array<{
    _id: string
    name: string
    nameAr: string
  }>
  count: number
}

// Expiring Certification
export interface ExpiringCertification {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  skillId: string
  skillName: string
  skillNameAr: string
  certification: {
    certificationName: string
    issuingBody: string
    expiryDate: string
    daysUntilExpiry: number
  }
}

// CPD Non-Compliant Employee
export interface CpdNonCompliantEmployee {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  requiredCpdCredits: number
  earnedCpdCredits: number
  shortfall: number
  deadline: string
  daysRemaining: number
}

// Skill Needing Review
export interface SkillNeedingReview {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  skillId: string
  skillName: string
  skillNameAr: string
  lastAssessedDate: string
  nextReviewDate: string
  status: 'overdue' | 'upcoming'
  daysOverdue?: number
  daysUntilReview?: number
}

// ==================== API FUNCTIONS ====================

/**
 * Get SFIA proficiency levels
 * GET /hr/skills/sfia-levels
 */
export const getSfiaLevels = async (): Promise<SfiaLevel[]> => {
  const response = await api.get('/hr/skills/sfia-levels')
  return response.data
}

/**
 * Get all skills with filters
 * GET /hr/skills
 */
export const getSkills = async (filters?: SkillFilters): Promise<SkillResponse> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.skillTypeId) params.append('skillTypeId', filters.skillTypeId)
  if (filters?.isVerifiable !== undefined) params.append('isVerifiable', filters.isVerifiable.toString())
  if (filters?.isCoreSkill !== undefined) params.append('isCoreSkill', filters.isCoreSkill.toString())
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/hr/skills?${params.toString()}`)
  return response.data
}

/**
 * Get single skill by ID
 * GET /hr/skills/:id
 */
export const getSkill = async (skillId: string): Promise<Skill> => {
  const response = await api.get(`/hr/skills/${skillId}`)
  return response.data
}

/**
 * Create a new skill
 * POST /hr/skills
 */
export const createSkill = async (data: CreateSkillData): Promise<Skill> => {
  const response = await api.post('/hr/skills', data)
  return response.data
}

/**
 * Update an existing skill
 * PATCH /hr/skills/:id
 */
export const updateSkill = async (skillId: string, data: UpdateSkillData): Promise<Skill> => {
  const response = await api.patch(`/hr/skills/${skillId}`, data)
  return response.data
}

/**
 * Delete a skill
 * DELETE /hr/skills/:id
 */
export const deleteSkill = async (skillId: string): Promise<void> => {
  await api.delete(`/hr/skills/${skillId}`)
}

/**
 * Get skills by category
 * GET /hr/skills/by-category
 */
export const getSkillsByCategory = async (): Promise<SkillsByCategory[]> => {
  const response = await api.get('/hr/skills/by-category')
  return response.data
}

/**
 * Get skill statistics
 * GET /hr/skills/stats
 */
export const getSkillStats = async (): Promise<SkillStatistics> => {
  const response = await api.get('/hr/skills/stats')
  return response.data
}

/**
 * Bulk delete skills
 * POST /hr/skills/bulk-delete
 */
export const bulkDeleteSkills = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/skills/bulk-delete', { ids })
  return response.data
}

/**
 * Get active skills only
 * GET /hr/skills?isActive=true
 */
export const getActiveSkills = async (): Promise<Skill[]> => {
  const response = await api.get('/hr/skills?isActive=true')
  return response.data.data
}

/**
 * Get core skills only
 * GET /hr/skills?isCoreSkill=true
 */
export const getCoreSkills = async (): Promise<Skill[]> => {
  const response = await api.get('/hr/skills?isCoreSkill=true')
  return response.data.data
}

/**
 * Get verifiable skills only
 * GET /hr/skills?isVerifiable=true
 */
export const getVerifiableSkills = async (): Promise<Skill[]> => {
  const response = await api.get('/hr/skills?isVerifiable=true')
  return response.data.data
}

/**
 * Get expiring certifications
 * GET /hr/skills/expiring-certifications
 */
export const getExpiringCertifications = async (days: number = 30): Promise<ExpiringCertification[]> => {
  const response = await api.get(`/hr/skills/expiring-certifications?days=${days}`)
  return response.data
}

/**
 * Get CPD non-compliant employees
 * GET /hr/skills/cpd-non-compliant
 */
export const getCpdNonCompliantEmployees = async (): Promise<CpdNonCompliantEmployee[]> => {
  const response = await api.get('/hr/skills/cpd-non-compliant')
  return response.data
}

/**
 * Get skills needing review
 * GET /hr/skills/needing-review
 */
export const getSkillsNeedingReview = async (days: number = 0): Promise<SkillNeedingReview[]> => {
  const response = await api.get(`/hr/skills/needing-review?days=${days}`)
  return response.data
}

/**
 * Export skills
 * GET /hr/skills/export
 */
export const exportSkills = async (filters?: SkillFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

  const response = await api.get(`/hr/skills/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const skillService = {
  // SFIA Framework
  getSfiaLevels,
  // List & Details
  getSkills,
  getSkill,
  getSkillStats,
  getSkillsByCategory,
  getActiveSkills,
  getCoreSkills,
  getVerifiableSkills,
  // CRUD
  createSkill,
  updateSkill,
  deleteSkill,
  bulkDeleteSkills,
  // Certification & CPD
  getExpiringCertifications,
  getCpdNonCompliantEmployees,
  getSkillsNeedingReview,
  // Export
  exportSkills,
  // Constants
  SFIA_LEVELS,
  SKILL_CATEGORY_LABELS,
  SKILL_CLASSIFICATION_LABELS,
  PROFICIENCY_LEVELS,
}

export default skillService
