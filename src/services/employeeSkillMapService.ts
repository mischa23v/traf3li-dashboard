import api from './api'
import type { SkillCategory } from './skillService'

// ==================== INTERFACES ====================

// Employee Skill Detail
export interface EmployeeSkillDetail {
  skillId: string
  skillName: string
  skillNameAr: string
  category: SkillCategory
  proficiency: number // 1-5
  lastEvaluationDate: string
  evaluatedBy?: string
  evaluatedByName?: string
  certificationId?: string
  certificationExpiry?: string
  notes?: string
  notesAr?: string
  yearsOfExperience?: number
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

  // Overall stats
  totalSkills: number
  avgProficiency: number
  skillsByCategory: Array<{
    category: SkillCategory
    count: number
    avgProficiency: number
  }>

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
  recommendedTraining?: {
    trainingId: string
    trainingName: string
    estimatedDuration: number
    provider?: string
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Skill Matrix Entry
export interface SkillMatrixEntry {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  skills: Record<string, number> // skillId -> proficiency level
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
    }>
  }>
  avgProficiency: number
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
    suggestedTrainings: Array<{
      trainingTitle: string
      trainingTitleAr: string
      provider?: string
      duration: number
      cost?: number
      priority: 'low' | 'medium' | 'high'
    }>
  }>
  totalRecommendations: number
}

// Add Skill Data
export interface AddEmployeeSkillData {
  skillId: string
  proficiency: number
  evaluatedBy?: string
  certificationId?: string
  certificationExpiry?: string
  notes?: string
  notesAr?: string
  yearsOfExperience?: number
}

// Update Skill Proficiency Data
export interface UpdateSkillProficiencyData {
  proficiency: number
  evaluatedBy: string
  notes?: string
  notesAr?: string
}

// Skill Map Filters
export interface SkillMapFilters {
  departmentId?: string
  designation?: string
  skillId?: string
  minProficiency?: number
  maxProficiency?: number
  hasSkill?: string
  search?: string
  page?: number
  limit?: number
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

// Get all employee skill maps
export const getEmployeeSkillMaps = async (filters?: SkillMapFilters): Promise<SkillMapResponse> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.designation) params.append('designation', filters.designation)
  if (filters?.skillId) params.append('skillId', filters.skillId)
  if (filters?.minProficiency) params.append('minProficiency', filters.minProficiency.toString())
  if (filters?.maxProficiency) params.append('maxProficiency', filters.maxProficiency.toString())
  if (filters?.hasSkill) params.append('hasSkill', filters.hasSkill)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/skill-maps?${params.toString()}`)
  return response.data
}

// Get employee skill map
export const getEmployeeSkillMap = async (employeeId: string): Promise<EmployeeSkillMap> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}`)
  return response.data
}

// Update employee skills (bulk update)
export const updateEmployeeSkills = async (
  employeeId: string,
  skills: EmployeeSkillDetail[]
): Promise<EmployeeSkillMap> => {
  const response = await api.put(`/hr/skill-maps/${employeeId}/skills`, { skills })
  return response.data
}

// Add skill to employee
export const addSkillToEmployee = async (
  employeeId: string,
  skillData: AddEmployeeSkillData
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skills`, skillData)
  return response.data
}

// Update skill proficiency
export const updateSkillProficiency = async (
  employeeId: string,
  skillId: string,
  data: UpdateSkillProficiencyData
): Promise<EmployeeSkillMap> => {
  const response = await api.patch(`/hr/skill-maps/${employeeId}/skills/${skillId}`, data)
  return response.data
}

// Remove skill from employee
export const removeSkillFromEmployee = async (
  employeeId: string,
  skillId: string
): Promise<EmployeeSkillMap> => {
  const response = await api.delete(`/hr/skill-maps/${employeeId}/skills/${skillId}`)
  return response.data
}

// Evaluate skill (add proficiency rating with evaluator)
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

// Get skill matrix (all employees with all skills in a department)
export const getSkillMatrix = async (departmentId?: string): Promise<SkillMatrix> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/matrix${params}`)
  return response.data
}

// Find skill gaps
export const findSkillGaps = async (
  employeeId: string,
  requiredSkills: Array<{ skillId: string; proficiency: number }>
): Promise<SkillGap[]> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/skill-gaps`, { requiredSkills })
  return response.data
}

// Find skill gaps by department
export const findDepartmentSkillGaps = async (
  departmentId: string,
  requiredSkills: Array<{ skillId: string; proficiency: number }>
): Promise<SkillGap[]> => {
  const response = await api.post(`/hr/skill-maps/department/${departmentId}/skill-gaps`, {
    requiredSkills
  })
  return response.data
}

// Find employees with skill
export const findEmployeesWithSkill = async (
  skillId: string,
  minProficiency?: number
): Promise<Array<{
  employeeId: string
  employeeName: string
  employeeNameAr: string
  designation: string
  department: string
  proficiency: number
  yearsOfExperience?: number
  lastEvaluationDate: string
}>> => {
  const params = minProficiency ? `?minProficiency=${minProficiency}` : ''
  const response = await api.get(`/hr/skill-maps/find-by-skill/${skillId}${params}`)
  return response.data
}

// Get skill distribution
export const getSkillDistribution = async (skillId: string): Promise<SkillDistribution> => {
  const response = await api.get(`/hr/skill-maps/distribution/${skillId}`)
  return response.data
}

// Recommend training
export const recommendTraining = async (employeeId: string): Promise<TrainingRecommendation> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/training-recommendations`)
  return response.data
}

// Get department skill summary
export const getDepartmentSkillSummary = async (departmentId: string): Promise<{
  departmentId: string
  departmentName: string
  totalEmployees: number
  totalSkills: number
  avgProficiency: number
  topSkills: Array<{
    skillId: string
    skillName: string
    employeeCount: number
    avgProficiency: number
  }>
  skillGaps: Array<{
    skillId: string
    skillName: string
    needed: number
    avgProficiency: number
  }>
  byCategory: Array<{
    category: SkillCategory
    skillCount: number
    avgProficiency: number
  }>
}> => {
  const response = await api.get(`/hr/skill-maps/department/${departmentId}/summary`)
  return response.data
}

// Compare employees (skill comparison)
export const compareEmployeeSkills = async (employeeIds: string[]): Promise<{
  employees: Array<{
    employeeId: string
    employeeName: string
    designation: string
    department: string
  }>
  skills: Array<{
    skillId: string
    skillName: string
    category: SkillCategory
  }>
  comparison: Array<{
    skillId: string
    employeeProficiency: Record<string, number> // employeeId -> proficiency
  }>
}> => {
  const response = await api.post('/hr/skill-maps/compare', { employeeIds })
  return response.data
}

// Link training to skill map
export const linkTrainingToSkillMap = async (
  employeeId: string,
  trainingData: {
    trainingId: string
    trainingName: string
    trainingNameAr: string
    completionDate: string
    skillsAcquired: string[]
    proficiencyGain?: number
  }
): Promise<EmployeeSkillMap> => {
  const response = await api.post(`/hr/skill-maps/${employeeId}/trainings`, trainingData)
  return response.data
}

// Export skill matrix
export const exportSkillMatrix = async (departmentId?: string): Promise<Blob> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/matrix/export${params}`, {
    responseType: 'blob'
  })
  return response.data
}

// Export skill gaps
export const exportSkillGaps = async (departmentId?: string): Promise<Blob> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/skill-maps/skill-gaps/export${params}`, {
    responseType: 'blob'
  })
  return response.data
}

// Get skill trends (historical data)
export const getSkillTrends = async (
  employeeId: string,
  skillId: string
): Promise<{
  skillId: string
  skillName: string
  currentProficiency: number
  history: Array<{
    date: string
    proficiency: number
    evaluatedBy: string
    notes?: string
  }>
  trend: 'improving' | 'stable' | 'declining'
  growthRate: number
}> => {
  const response = await api.get(`/hr/skill-maps/${employeeId}/skills/${skillId}/trends`)
  return response.data
}

// Bulk update skills for multiple employees
export const bulkUpdateEmployeeSkills = async (data: Array<{
  employeeId: string
  skillId: string
  proficiency: number
  evaluatedBy: string
}>): Promise<{ updated: number }> => {
  const response = await api.post('/hr/skill-maps/bulk-update', { updates: data })
  return response.data
}
