import api from './api'

// ==================== TYPES & ENUMS ====================

// Skill Category
export type SkillCategory = 'technical' | 'soft_skill' | 'language' | 'legal' | 'management' | 'industry'

// ==================== LABELS ====================

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, { ar: string; en: string; color: string; icon: string }> = {
  technical: { ar: 'تقني', en: 'Technical', color: 'blue', icon: 'Code' },
  soft_skill: { ar: 'مهارات شخصية', en: 'Soft Skills', color: 'pink', icon: 'Heart' },
  language: { ar: 'لغات', en: 'Language', color: 'violet', icon: 'Languages' },
  legal: { ar: 'قانوني', en: 'Legal', color: 'amber', icon: 'Scale' },
  management: { ar: 'إدارة', en: 'Management', color: 'indigo', icon: 'Briefcase' },
  industry: { ar: 'صناعة', en: 'Industry', color: 'emerald', icon: 'Building' },
}

export const PROFICIENCY_LEVELS = [
  { level: 1, ar: 'مبتدئ', en: 'Beginner', description: 'Basic knowledge and skills', color: 'red' },
  { level: 2, ar: 'متوسط', en: 'Intermediate', description: 'Working knowledge with some experience', color: 'orange' },
  { level: 3, ar: 'كفء', en: 'Competent', description: 'Good working knowledge and can work independently', color: 'yellow' },
  { level: 4, ar: 'متقدم', en: 'Advanced', description: 'Expert level with extensive experience', color: 'teal' },
  { level: 5, ar: 'خبير', en: 'Expert', description: 'Master level, can teach and mentor others', color: 'emerald' },
]

// ==================== INTERFACES ====================

// Proficiency Level
export interface ProficiencyLevel {
  level: number // 1-5
  name: string
  nameAr: string
  description: string
}

// Skill
export interface Skill {
  _id: string
  skillId: string
  name: string
  nameAr: string

  category: SkillCategory

  description: string
  descriptionAr: string

  // Proficiency levels (default 1-5, but can be customized)
  proficiencyLevels: ProficiencyLevel[]

  // For legal skills
  requiresCertification: boolean
  certificationName?: string
  certificationNameAr?: string

  // Related skills
  relatedSkills?: string[] // skill IDs

  isActive: boolean

  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

// Create Skill Data
export interface CreateSkillData {
  name: string
  nameAr: string
  category: SkillCategory
  description: string
  descriptionAr: string
  proficiencyLevels?: ProficiencyLevel[]
  requiresCertification?: boolean
  certificationName?: string
  certificationNameAr?: string
  relatedSkills?: string[]
  isActive?: boolean
}

// Update Skill Data
export interface UpdateSkillData {
  name?: string
  nameAr?: string
  category?: SkillCategory
  description?: string
  descriptionAr?: string
  proficiencyLevels?: ProficiencyLevel[]
  requiresCertification?: boolean
  certificationName?: string
  certificationNameAr?: string
  relatedSkills?: string[]
  isActive?: boolean
}

// Skill Filters
export interface SkillFilters {
  category?: SkillCategory
  requiresCertification?: boolean
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
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

// Skill Stats
export interface SkillStats {
  totalSkills: number
  activeSkills: number
  byCategory: Array<{ category: SkillCategory; count: number }>
  skillsRequiringCertification: number
  mostDemandedSkills: Array<{
    skillId: string
    skillName: string
    skillNameAr: string
    employeeCount: number
    avgProficiency: number
  }>
  skillGaps: Array<{
    skillId: string
    skillName: string
    employeesNeeded: number
    avgProficiency: number
  }>
}

// ==================== API FUNCTIONS ====================

// Get all skills
export const getSkills = async (filters?: SkillFilters): Promise<SkillResponse> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.requiresCertification !== undefined)
    params.append('requiresCertification', filters.requiresCertification.toString())
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/skills?${params.toString()}`)
  return response.data
}

// Get single skill
export const getSkill = async (skillId: string): Promise<Skill> => {
  const response = await api.get(`/hr/skills/${skillId}`)
  return response.data
}

// Create skill
export const createSkill = async (data: CreateSkillData): Promise<Skill> => {
  const response = await api.post('/hr/skills', data)
  return response.data
}

// Update skill
export const updateSkill = async (skillId: string, data: UpdateSkillData): Promise<Skill> => {
  const response = await api.patch(`/hr/skills/${skillId}`, data)
  return response.data
}

// Delete skill
export const deleteSkill = async (skillId: string): Promise<void> => {
  await api.delete(`/hr/skills/${skillId}`)
}

// Get skills by category
export const getSkillsByCategory = async (category: SkillCategory): Promise<Skill[]> => {
  const response = await api.get(`/hr/skills/by-category/${category}`)
  return response.data
}

// Get skill stats
export const getSkillStats = async (): Promise<SkillStats> => {
  const response = await api.get('/hr/skills/stats')
  return response.data
}

// Bulk delete skills
export const bulkDeleteSkills = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/skills/bulk-delete', { ids })
  return response.data
}

// Get active skills (common helper)
export const getActiveSkills = async (): Promise<Skill[]> => {
  const response = await api.get('/hr/skills?isActive=true')
  return response.data.data
}

// Export skills
export const exportSkills = async (filters?: SkillFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

  const response = await api.get(`/hr/skills/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}
