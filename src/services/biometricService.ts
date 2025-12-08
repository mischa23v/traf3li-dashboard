/**
 * Biometric Service
 * Handles all biometric-related API calls (Devices, Enrollments, Logs, Geofences)
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  // Device types
  BiometricDevice,
  CreateDeviceData,
  UpdateDeviceData,
  DeviceFilters,
  // Enrollment types
  BiometricEnrollment,
  CreateEnrollmentData,
  EnrollmentFilters,
  // Verification types
  VerificationLog,
  VerificationFilters,
  // Geofence types
  GeofenceZone,
  CreateGeofenceData,
  GeofenceFilters,
  LocationCheckResult,
} from '@/types/biometric'

// ═══════════════════════════════════════════════════════════════
// DEVICE SERVICE
// ═══════════════════════════════════════════════════════════════
export const deviceService = {
  /**
   * Get all biometric devices
   */
  getDevices: async (
    filters?: DeviceFilters
  ): Promise<{ data: BiometricDevice[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/biometric/devices', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single device
   */
  getDevice: async (id: string): Promise<BiometricDevice> => {
    try {
      const response = await apiClient.get(`/biometric/devices/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Register new device
   */
  createDevice: async (data: CreateDeviceData): Promise<BiometricDevice> => {
    try {
      const response = await apiClient.post('/biometric/devices', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update device
   */
  updateDevice: async (id: string, data: UpdateDeviceData): Promise<BiometricDevice> => {
    try {
      const response = await apiClient.put(`/biometric/devices/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete device
   */
  deleteDevice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/biometric/devices/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Sync device data
   */
  syncDevice: async (id: string): Promise<{ synced: number; errors: number }> => {
    try {
      const response = await apiClient.post(`/biometric/devices/${id}/sync`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Test device connection
   */
  testConnection: async (id: string): Promise<{ success: boolean; latency: number }> => {
    try {
      const response = await apiClient.post(`/biometric/devices/${id}/test`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get device health status
   */
  getDeviceHealth: async (id: string): Promise<{
    status: string
    lastHeartbeat: Date
    uptime: number
    temperature?: number
    memoryUsage?: number
  }> => {
    try {
      const response = await apiClient.get(`/biometric/devices/${id}/health`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// ENROLLMENT SERVICE
// ═══════════════════════════════════════════════════════════════
export const enrollmentService = {
  /**
   * Get all enrollments
   */
  getEnrollments: async (
    filters?: EnrollmentFilters
  ): Promise<{ data: BiometricEnrollment[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/biometric/enrollments', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single enrollment
   */
  getEnrollment: async (id: string): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.get(`/biometric/enrollments/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get enrollment by employee
   */
  getEnrollmentByEmployee: async (employeeId: string): Promise<BiometricEnrollment | null> => {
    try {
      const response = await apiClient.get(`/biometric/enrollments/employee/${employeeId}`)
      return response.data.data
    } catch (error: any) {
      // Return null if not found
      if (error.response?.status === 404) return null
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create enrollment
   */
  createEnrollment: async (data: CreateEnrollmentData): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post('/biometric/enrollments', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add fingerprint to enrollment
   */
  addFingerprint: async (enrollmentId: string, data: {
    finger: string
    template: string
    quality: number
  }): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post(`/biometric/enrollments/${enrollmentId}/fingerprint`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add facial data to enrollment
   */
  addFacial: async (enrollmentId: string, data: {
    photo: string
    template: string
    quality: number
  }): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post(`/biometric/enrollments/${enrollmentId}/facial`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Assign card to enrollment
   */
  assignCard: async (enrollmentId: string, data: {
    cardNumber: string
    cardType: string
    expiresAt?: Date
  }): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post(`/biometric/enrollments/${enrollmentId}/card`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Suspend enrollment
   */
  suspendEnrollment: async (id: string, reason: string): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post(`/biometric/enrollments/${id}/suspend`, { reason })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reactivate enrollment
   */
  reactivateEnrollment: async (id: string): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post(`/biometric/enrollments/${id}/reactivate`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke enrollment
   */
  revokeEnrollment: async (id: string, reason: string): Promise<void> => {
    try {
      await apiClient.post(`/biometric/enrollments/${id}/revoke`, { reason })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION LOG SERVICE
// ═══════════════════════════════════════════════════════════════
export const verificationService = {
  /**
   * Get verification logs
   */
  getLogs: async (
    filters?: VerificationFilters
  ): Promise<{ data: VerificationLog[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/biometric/logs', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get live verification feed (most recent)
   */
  getLiveFeed: async (limit: number = 20): Promise<VerificationLog[]> => {
    try {
      const response = await apiClient.get('/biometric/logs/live', { params: { limit } })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get verification stats
   */
  getStats: async (startDate?: string, endDate?: string): Promise<{
    totalVerifications: number
    successRate: number
    byMethod: Record<string, number>
    byType: Record<string, number>
    hourlyDistribution: Array<{ hour: number; count: number }>
  }> => {
    try {
      const response = await apiClient.get('/biometric/logs/stats', {
        params: { startDate, endDate }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export logs to CSV
   */
  exportLogs: async (filters?: VerificationFilters): Promise<Blob> => {
    try {
      const response = await apiClient.get('/biometric/logs/export', {
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Manual verification entry
   */
  createManualEntry: async (data: {
    employeeId: string
    verificationType: string
    timestamp: Date
    notes?: string
  }): Promise<VerificationLog> => {
    try {
      const response = await apiClient.post('/biometric/logs/manual', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// GEOFENCE SERVICE
// ═══════════════════════════════════════════════════════════════
export const geofenceService = {
  /**
   * Get all geofence zones
   */
  getZones: async (
    filters?: GeofenceFilters
  ): Promise<{ data: GeofenceZone[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/biometric/geofences', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single zone
   */
  getZone: async (id: string): Promise<GeofenceZone> => {
    try {
      const response = await apiClient.get(`/biometric/geofences/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create geofence zone
   */
  createZone: async (data: CreateGeofenceData): Promise<GeofenceZone> => {
    try {
      const response = await apiClient.post('/biometric/geofences', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update geofence zone
   */
  updateZone: async (id: string, data: Partial<CreateGeofenceData>): Promise<GeofenceZone> => {
    try {
      const response = await apiClient.put(`/biometric/geofences/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete geofence zone
   */
  deleteZone: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/biometric/geofences/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle zone active status
   */
  toggleZone: async (id: string): Promise<GeofenceZone> => {
    try {
      const response = await apiClient.post(`/biometric/geofences/${id}/toggle`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if location is within zones
   */
  checkLocation: async (latitude: number, longitude: number): Promise<LocationCheckResult> => {
    try {
      const response = await apiClient.post('/biometric/geofences/check', {
        latitude,
        longitude
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Assign employees to zone
   */
  assignEmployees: async (zoneId: string, employeeIds: string[]): Promise<GeofenceZone> => {
    try {
      const response = await apiClient.post(`/biometric/geofences/${zoneId}/assign`, {
        employeeIds
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}
