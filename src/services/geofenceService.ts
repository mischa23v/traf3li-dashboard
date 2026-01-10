/**
 * Geofence Service
 * API endpoints for geofencing management per HR API Documentation Part 2 - Section 8
 */

import api from './api'
import type {
  Geofence,
  CreateGeofenceData,
  GeofenceFilters,
  GeofenceType,
  LocationVerificationResponse,
} from '@/types/hr'

// ==================== TYPES ====================

export interface GeofenceListResponse {
  data: Geofence[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GeofenceStats {
  total: number
  active: number
  inactive: number
  byType: Record<GeofenceType, number>
}

// ==================== LABELS ====================

export const GEOFENCE_TYPE_LABELS: Record<GeofenceType, { ar: string; en: string; color: string }> = {
  office: { ar: 'مكتب رئيسي', en: 'Main Office', color: 'blue' },
  branch: { ar: 'فرع', en: 'Branch', color: 'green' },
  warehouse: { ar: 'مستودع', en: 'Warehouse', color: 'amber' },
  client_site: { ar: 'موقع عميل', en: 'Client Site', color: 'purple' },
  project_site: { ar: 'موقع مشروع', en: 'Project Site', color: 'cyan' },
  custom: { ar: 'موقع مخصص', en: 'Custom Location', color: 'slate' },
}

// ==================== API FUNCTIONS ====================

/**
 * Get all geofences
 * GET /geofences
 */
export const getGeofences = async (filters?: GeofenceFilters): Promise<GeofenceListResponse> => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
  if (filters?.search) params.append('search', filters.search)

  const response = await api.get(`/hr/geofences?${params.toString()}`)
  return response.data
}

/**
 * Get single geofence
 * GET /geofences/:id
 */
export const getGeofence = async (id: string): Promise<Geofence> => {
  const response = await api.get(`/hr/geofences/${id}`)
  return response.data
}

/**
 * Create geofence
 * POST /geofences
 */
export const createGeofence = async (data: CreateGeofenceData): Promise<Geofence> => {
  const response = await api.post('/hr/geofences', data)
  return response.data
}

/**
 * Update geofence
 * PATCH /geofences/:id
 */
export const updateGeofence = async (id: string, data: Partial<CreateGeofenceData>): Promise<Geofence> => {
  const response = await api.patch(`/hr/geofences/${id}`, data)
  return response.data
}

/**
 * Delete geofence
 * DELETE /geofences/:id
 */
export const deleteGeofence = async (id: string): Promise<void> => {
  await api.delete(`/hr/geofences/${id}`)
}

/**
 * Activate geofence
 * POST /geofences/:id/activate
 */
export const activateGeofence = async (id: string): Promise<Geofence> => {
  const response = await api.post(`/hr/geofences/${id}/activate`)
  return response.data
}

/**
 * Deactivate geofence
 * POST /geofences/:id/deactivate
 */
export const deactivateGeofence = async (id: string): Promise<Geofence> => {
  const response = await api.post(`/hr/geofences/${id}/deactivate`)
  return response.data
}

/**
 * Verify if coordinates are within any geofence
 * POST /attendance/verify-location
 */
export const verifyLocation = async (coordinates: [number, number]): Promise<LocationVerificationResponse> => {
  const response = await api.post('/hr/attendance/verify-location', { coordinates })
  return response.data
}

/**
 * Get geofence statistics
 * GET /geofences/stats
 */
export const getGeofenceStats = async (): Promise<GeofenceStats> => {
  const response = await api.get('/hr/geofences/stats')
  return response.data
}

/**
 * Get active geofences only
 * GET /geofences?isActive=true
 */
export const getActiveGeofences = async (): Promise<Geofence[]> => {
  const response = await api.get('/hr/geofences?isActive=true')
  return response.data.data || response.data
}

/**
 * Get geofences by type
 * GET /geofences?type={type}
 */
export const getGeofencesByType = async (type: GeofenceType): Promise<Geofence[]> => {
  const response = await api.get(`/hr/geofences?type=${type}`)
  return response.data.data || response.data
}

/**
 * Bulk delete geofences
 * POST /geofences/bulk-delete
 */
export const bulkDeleteGeofences = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/geofences/bulk-delete', { ids })
  return response.data
}

/**
 * Check if employee is within any geofence
 * POST /geofences/check-employee
 */
export const checkEmployeeLocation = async (
  employeeId: string,
  coordinates: [number, number]
): Promise<{
  employeeId: string
  isWithinGeofence: boolean
  matchedGeofences: Array<{
    _id: string
    name: string
    type: GeofenceType
    distance: number
  }>
}> => {
  const response = await api.post('/hr/geofences/check-employee', { employeeId, coordinates })
  return response.data
}

/**
 * Get nearby geofences
 * POST /geofences/nearby
 */
export const getNearbyGeofences = async (
  coordinates: [number, number],
  maxDistance?: number
): Promise<Array<Geofence & { distance: number }>> => {
  const response = await api.post('/hr/geofences/nearby', {
    coordinates,
    maxDistance: maxDistance || 5000, // Default 5km
  })
  return response.data
}

// Default export
export default {
  getGeofences,
  getGeofence,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  activateGeofence,
  deactivateGeofence,
  verifyLocation,
  getGeofenceStats,
  getActiveGeofences,
  getGeofencesByType,
  bulkDeleteGeofences,
  checkEmployeeLocation,
  getNearbyGeofences,
}
