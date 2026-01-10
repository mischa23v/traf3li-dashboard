import api from './api'
import type { SkillClassification } from './skillService'

// ==================== INTERFACES ====================

/**
 * Skill Type - Hierarchical categorization for skills
 * (e.g., "Technical" → "Programming" → "Web Development")
 */
export interface SkillType {
  _id: string
  typeId: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string

  // Hierarchy
  parentTypeId?: string
  parentTypeName?: string

  // Classification
  classification: SkillClassification

  // Display
  icon?: string
  color?: string
  displayOrder: number

  // Status
  isActive: boolean

  // Children (populated in tree response)
  children?: SkillType[]

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy: string
  updatedBy?: string
}

// Create Skill Type Data
export interface CreateSkillTypeData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  parentTypeId?: string
  classification: SkillClassification
  icon?: string
  color?: string
  displayOrder?: number
  isActive?: boolean
}

// Update Skill Type Data
export interface UpdateSkillTypeData extends Partial<CreateSkillTypeData> {}

// Skill Type Filters
export interface SkillTypeFilters {
  classification?: SkillClassification
  parentTypeId?: string
  isActive?: boolean
  flat?: boolean // true = flat list, false = hierarchical tree
  search?: string
  page?: number
  limit?: number
}

// Skill Type Response (flat)
export interface SkillTypeResponse {
  data: SkillType[]
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// ==================== LABELS ====================

export const SKILL_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  technical: { icon: 'Code', color: '#3B82F6' },
  programming: { icon: 'Terminal', color: '#8B5CF6' },
  database: { icon: 'Database', color: '#10B981' },
  web_development: { icon: 'Globe', color: '#06B6D4' },
  legal: { icon: 'Scale', color: '#F59E0B' },
  litigation: { icon: 'Gavel', color: '#EF4444' },
  corporate_law: { icon: 'Building2', color: '#6366F1' },
  language: { icon: 'Languages', color: '#EC4899' },
  management: { icon: 'Briefcase', color: '#14B8A6' },
  regulatory: { icon: 'ShieldCheck', color: '#22C55E' },
}

// ==================== API FUNCTIONS ====================

/**
 * Get all skill types (hierarchical or flat)
 * GET /hr/skills/types
 */
export const getSkillTypes = async (filters?: SkillTypeFilters): Promise<SkillType[]> => {
  const params = new URLSearchParams()
  if (filters?.classification) params.append('classification', filters.classification)
  if (filters?.parentTypeId) params.append('parentTypeId', filters.parentTypeId)
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.flat !== undefined) params.append('flat', filters.flat.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/skills/types?${params.toString()}`)
  return response.data.data || response.data
}

/**
 * Get skill types as hierarchical tree
 * GET /hr/skills/types?flat=false
 */
export const getSkillTypesTree = async (classification?: SkillClassification): Promise<SkillType[]> => {
  const params = new URLSearchParams()
  params.append('flat', 'false')
  if (classification) params.append('classification', classification)

  const response = await api.get(`/hr/skills/types?${params.toString()}`)
  return response.data.data || response.data
}

/**
 * Get skill types as flat list
 * GET /hr/skills/types?flat=true
 */
export const getSkillTypesFlat = async (classification?: SkillClassification): Promise<SkillType[]> => {
  const params = new URLSearchParams()
  params.append('flat', 'true')
  if (classification) params.append('classification', classification)

  const response = await api.get(`/hr/skills/types?${params.toString()}`)
  return response.data.data || response.data
}

/**
 * Get single skill type by ID
 * GET /hr/skills/types/:id
 */
export const getSkillType = async (typeId: string): Promise<SkillType> => {
  const response = await api.get(`/hr/skills/types/${typeId}`)
  return response.data
}

/**
 * Create a new skill type
 * POST /hr/skills/types
 */
export const createSkillType = async (data: CreateSkillTypeData): Promise<SkillType> => {
  const response = await api.post('/hr/skills/types', data)
  return response.data
}

/**
 * Update an existing skill type
 * PATCH /hr/skills/types/:id
 */
export const updateSkillType = async (typeId: string, data: UpdateSkillTypeData): Promise<SkillType> => {
  const response = await api.patch(`/hr/skills/types/${typeId}`, data)
  return response.data
}

/**
 * Delete a skill type
 * DELETE /hr/skills/types/:id
 */
export const deleteSkillType = async (typeId: string): Promise<void> => {
  await api.delete(`/hr/skills/types/${typeId}`)
}

/**
 * Get children of a skill type
 * GET /hr/skills/types/:id/children
 */
export const getSkillTypeChildren = async (typeId: string): Promise<SkillType[]> => {
  const response = await api.get(`/hr/skills/types/${typeId}/children`)
  return response.data
}

/**
 * Reorder skill types
 * POST /hr/skills/types/reorder
 */
export const reorderSkillTypes = async (
  orderedIds: string[]
): Promise<{ success: boolean; updated: number }> => {
  const response = await api.post('/hr/skills/types/reorder', { orderedIds })
  return response.data
}

/**
 * Move skill type to new parent
 * POST /hr/skills/types/:id/move
 */
export const moveSkillType = async (
  typeId: string,
  newParentId: string | null
): Promise<SkillType> => {
  const response = await api.post(`/hr/skills/types/${typeId}/move`, {
    parentTypeId: newParentId,
  })
  return response.data
}

/**
 * Get skill types by classification
 * GET /hr/skills/types?classification=xxx
 */
export const getSkillTypesByClassification = async (
  classification: SkillClassification
): Promise<SkillType[]> => {
  const response = await api.get(`/hr/skills/types?classification=${classification}`)
  return response.data.data || response.data
}

/**
 * Get root skill types (no parent)
 * GET /hr/skills/types?parentTypeId=null
 */
export const getRootSkillTypes = async (): Promise<SkillType[]> => {
  const response = await api.get('/hr/skills/types?parentTypeId=null&flat=true')
  return response.data.data || response.data
}

/**
 * Bulk delete skill types
 * POST /hr/skills/types/bulk-delete
 */
export const bulkDeleteSkillTypes = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/skills/types/bulk-delete', { ids })
  return response.data
}

/**
 * Export skill types
 * GET /hr/skills/types/export
 */
export const exportSkillTypes = async (): Promise<Blob> => {
  const response = await api.get('/hr/skills/types/export', {
    responseType: 'blob',
  })
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const skillTypeService = {
  // List & Details
  getSkillTypes,
  getSkillTypesTree,
  getSkillTypesFlat,
  getSkillType,
  getSkillTypeChildren,
  getRootSkillTypes,
  getSkillTypesByClassification,
  // CRUD
  createSkillType,
  updateSkillType,
  deleteSkillType,
  bulkDeleteSkillTypes,
  // Hierarchy Operations
  reorderSkillTypes,
  moveSkillType,
  // Export
  exportSkillTypes,
  // Constants
  SKILL_TYPE_ICONS,
}

export default skillTypeService
