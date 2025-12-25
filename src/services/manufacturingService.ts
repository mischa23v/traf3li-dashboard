/**
 * Manufacturing Service
 * API client for Manufacturing operations
 */

import api from '@/lib/api'
import type {
  BillOfMaterials,
  Workstation,
  WorkOrder,
  JobCard,
  ProductionPlan,
  ManufacturingSettings,
  ManufacturingFilters,
  ManufacturingStats,
  CreateBomData,
  CreateWorkOrderData,
} from '@/types/manufacturing'

// Bill of Materials
export const getBOMs = async (filters?: { itemId?: string; isActive?: boolean }) => {
  const response = await api.get<BillOfMaterials[]>('/manufacturing/boms', { params: filters })
  return response.data
}

export const getBOMById = async (id: string) => {
  const response = await api.get<BillOfMaterials>(`/manufacturing/boms/${id}`)
  return response.data
}

export const createBOM = async (data: CreateBomData) => {
  const response = await api.post<BillOfMaterials>('/manufacturing/boms', data)
  return response.data
}

export const updateBOM = async (id: string, data: Partial<CreateBomData>) => {
  const response = await api.put<BillOfMaterials>(`/manufacturing/boms/${id}`, data)
  return response.data
}

export const deleteBOM = async (id: string) => {
  const response = await api.delete(`/manufacturing/boms/${id}`)
  return response.data
}

// Workstations
export const getWorkstations = async (filters?: { status?: 'active' | 'inactive' }) => {
  const response = await api.get<Workstation[]>('/manufacturing/workstations', { params: filters })
  return response.data
}

export const getWorkstationById = async (id: string) => {
  const response = await api.get<Workstation>(`/manufacturing/workstations/${id}`)
  return response.data
}

export const createWorkstation = async (data: Omit<Workstation, '_id' | 'workstationId' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<Workstation>('/manufacturing/workstations', data)
  return response.data
}

export const updateWorkstation = async (id: string, data: Partial<Workstation>) => {
  const response = await api.put<Workstation>(`/manufacturing/workstations/${id}`, data)
  return response.data
}

export const deleteWorkstation = async (id: string) => {
  const response = await api.delete(`/manufacturing/workstations/${id}`)
  return response.data
}

// Work Orders
export const getWorkOrders = async (filters?: ManufacturingFilters) => {
  const response = await api.get<{ workOrders: WorkOrder[]; total: number; page: number; limit: number }>('/manufacturing/work-orders', { params: filters })
  return response.data
}

export const getWorkOrderById = async (id: string) => {
  const response = await api.get<WorkOrder>(`/manufacturing/work-orders/${id}`)
  return response.data
}

export const createWorkOrder = async (data: CreateWorkOrderData) => {
  const response = await api.post<WorkOrder>('/manufacturing/work-orders', data)
  return response.data
}

export const updateWorkOrder = async (id: string, data: Partial<CreateWorkOrderData>) => {
  const response = await api.put<WorkOrder>(`/manufacturing/work-orders/${id}`, data)
  return response.data
}

export const deleteWorkOrder = async (id: string) => {
  const response = await api.delete(`/manufacturing/work-orders/${id}`)
  return response.data
}

export const startWorkOrder = async (id: string) => {
  const response = await api.patch<WorkOrder>(`/manufacturing/work-orders/${id}/start`)
  return response.data
}

export const completeWorkOrder = async (id: string) => {
  const response = await api.patch<WorkOrder>(`/manufacturing/work-orders/${id}/complete`)
  return response.data
}

export const stopWorkOrder = async (id: string) => {
  const response = await api.patch<WorkOrder>(`/manufacturing/work-orders/${id}/stop`)
  return response.data
}

// Job Cards
export const getJobCards = async (filters?: { workOrderId?: string; status?: string }) => {
  const response = await api.get<JobCard[]>('/manufacturing/job-cards', { params: filters })
  return response.data
}

export const getJobCardById = async (id: string) => {
  const response = await api.get<JobCard>(`/manufacturing/job-cards/${id}`)
  return response.data
}

export const createJobCard = async (data: Omit<JobCard, '_id' | 'jobCardId' | 'jobCardNumber' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<JobCard>('/manufacturing/job-cards', data)
  return response.data
}

export const updateJobCard = async (id: string, data: Partial<JobCard>) => {
  const response = await api.put<JobCard>(`/manufacturing/job-cards/${id}`, data)
  return response.data
}

export const startJobCard = async (id: string) => {
  const response = await api.patch<JobCard>(`/manufacturing/job-cards/${id}/start`)
  return response.data
}

export const completeJobCard = async (id: string, completedQty: number) => {
  const response = await api.patch<JobCard>(`/manufacturing/job-cards/${id}/complete`, { completedQty })
  return response.data
}

// Production Plans
export const getProductionPlans = async () => {
  const response = await api.get<ProductionPlan[]>('/manufacturing/production-plans')
  return response.data
}

export const getProductionPlanById = async (id: string) => {
  const response = await api.get<ProductionPlan>(`/manufacturing/production-plans/${id}`)
  return response.data
}

export const createProductionPlan = async (data: Omit<ProductionPlan, '_id' | 'planId' | 'planNumber' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<ProductionPlan>('/manufacturing/production-plans', data)
  return response.data
}

// Stats
export const getManufacturingStats = async () => {
  const response = await api.get<ManufacturingStats>('/manufacturing/stats')
  return response.data
}

// Settings
export const getManufacturingSettings = async () => {
  const response = await api.get<ManufacturingSettings>('/manufacturing/settings')
  return response.data
}

export const updateManufacturingSettings = async (data: Partial<ManufacturingSettings>) => {
  const response = await api.put<ManufacturingSettings>('/manufacturing/settings', data)
  return response.data
}

export const manufacturingService = {
  getBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  getWorkstations,
  getWorkstationById,
  createWorkstation,
  updateWorkstation,
  deleteWorkstation,
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  stopWorkOrder,
  getJobCards,
  getJobCardById,
  createJobCard,
  updateJobCard,
  startJobCard,
  completeJobCard,
  getProductionPlans,
  getProductionPlanById,
  createProductionPlan,
  getManufacturingStats,
  getManufacturingSettings,
  updateManufacturingSettings,
}

export default manufacturingService
