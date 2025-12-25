/**
 * Quality Service
 * API client for Quality Management operations
 */

import api from '@/lib/api'
import type {
  QualityInspection,
  QualityInspectionTemplate,
  QualityParameter,
  QualityAction,
  NonConformanceReport,
  QualitySettings,
  QualityFilters,
  QualityStats,
  CreateQualityInspectionData,
} from '@/types/quality'

// Quality Inspections
export const getInspections = async (filters?: QualityFilters) => {
  const response = await api.get<{ inspections: QualityInspection[]; total: number; page: number; limit: number }>('/quality/inspections', { params: filters })
  return response.data
}

export const getInspectionById = async (id: string) => {
  const response = await api.get<QualityInspection>(`/quality/inspections/${id}`)
  return response.data
}

export const createInspection = async (data: CreateQualityInspectionData) => {
  const response = await api.post<QualityInspection>('/quality/inspections', data)
  return response.data
}

export const updateInspection = async (id: string, data: Partial<CreateQualityInspectionData>) => {
  const response = await api.put<QualityInspection>(`/quality/inspections/${id}`, data)
  return response.data
}

export const deleteInspection = async (id: string) => {
  const response = await api.delete(`/quality/inspections/${id}`)
  return response.data
}

export const submitInspection = async (id: string, status: QualityInspection['status']) => {
  const response = await api.patch<QualityInspection>(`/quality/inspections/${id}/submit`, { status })
  return response.data
}

// Inspection Templates
export const getTemplates = async () => {
  const response = await api.get<QualityInspectionTemplate[]>('/quality/templates')
  return response.data
}

export const getTemplateById = async (id: string) => {
  const response = await api.get<QualityInspectionTemplate>(`/quality/templates/${id}`)
  return response.data
}

export const createTemplate = async (data: Omit<QualityInspectionTemplate, '_id' | 'templateId' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<QualityInspectionTemplate>('/quality/templates', data)
  return response.data
}

export const updateTemplate = async (id: string, data: Partial<QualityInspectionTemplate>) => {
  const response = await api.put<QualityInspectionTemplate>(`/quality/templates/${id}`, data)
  return response.data
}

export const deleteTemplate = async (id: string) => {
  const response = await api.delete(`/quality/templates/${id}`)
  return response.data
}

// Quality Parameters
export const getParameters = async () => {
  const response = await api.get<QualityParameter[]>('/quality/parameters')
  return response.data
}

export const createParameter = async (data: Omit<QualityParameter, '_id' | 'parameterId' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<QualityParameter>('/quality/parameters', data)
  return response.data
}

// Quality Actions
export const getActions = async (filters?: { status?: string; type?: string }) => {
  const response = await api.get<QualityAction[]>('/quality/actions', { params: filters })
  return response.data
}

export const getActionById = async (id: string) => {
  const response = await api.get<QualityAction>(`/quality/actions/${id}`)
  return response.data
}

export const createAction = async (data: Omit<QualityAction, '_id' | 'actionId' | 'actionNumber' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<QualityAction>('/quality/actions', data)
  return response.data
}

export const updateAction = async (id: string, data: Partial<QualityAction>) => {
  const response = await api.put<QualityAction>(`/quality/actions/${id}`, data)
  return response.data
}

// Non-Conformance Reports
export const getNCRs = async (filters?: { status?: string }) => {
  const response = await api.get<NonConformanceReport[]>('/quality/ncrs', { params: filters })
  return response.data
}

export const getNCRById = async (id: string) => {
  const response = await api.get<NonConformanceReport>(`/quality/ncrs/${id}`)
  return response.data
}

export const createNCR = async (data: Omit<NonConformanceReport, '_id' | 'ncrId' | 'ncrNumber' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<NonConformanceReport>('/quality/ncrs', data)
  return response.data
}

export const updateNCR = async (id: string, data: Partial<NonConformanceReport>) => {
  const response = await api.put<NonConformanceReport>(`/quality/ncrs/${id}`, data)
  return response.data
}

// Stats
export const getQualityStats = async () => {
  const response = await api.get<QualityStats>('/quality/stats')
  return response.data
}

// Settings
export const getQualitySettings = async () => {
  const response = await api.get<QualitySettings>('/quality/settings')
  return response.data
}

export const updateQualitySettings = async (data: Partial<QualitySettings>) => {
  const response = await api.put<QualitySettings>('/quality/settings', data)
  return response.data
}

export const qualityService = {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  submitInspection,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getParameters,
  createParameter,
  getActions,
  getActionById,
  createAction,
  updateAction,
  getNCRs,
  getNCRById,
  createNCR,
  updateNCR,
  getQualityStats,
  getQualitySettings,
  updateQualitySettings,
}

export default qualityService
