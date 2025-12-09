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
   * Update device heartbeat
   */
  updateHeartbeat: async (id: string, data?: {
    status?: string
    temperature?: number
    memoryUsage?: number
  }): Promise<void> => {
    try {
      await apiClient.post(`/biometric/devices/${id}/heartbeat`, data)
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
   * Set PIN for enrollment
   */
  setPIN: async (enrollmentId: string, data: {
    pin: string
  }): Promise<BiometricEnrollment> => {
    try {
      const response = await apiClient.post(`/biometric/enrollments/${enrollmentId}/pin`, data)
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

  /**
   * Get enrollment statistics
   */
  getEnrollmentStats: async (): Promise<{
    total: number
    active: number
    suspended: number
    byMethod: Record<string, number>
  }> => {
    try {
      const response = await apiClient.get('/biometric/enrollments/stats')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION & IDENTIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════
export const verificationService = {
  /**
   * Verify employee identity
   */
  verifyIdentity: async (data: {
    method: 'fingerprint' | 'facial' | 'card' | 'pin'
    deviceId?: string
    template?: string
    cardNumber?: string
    pin?: string
    employeeId?: string
  }): Promise<{
    success: boolean
    employeeId?: string
    confidence?: number
    message?: string
  }> => {
    try {
      const response = await apiClient.post('/biometric/verify', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Identify employee from biometric data
   */
  identifyEmployee: async (data: {
    method: 'fingerprint' | 'facial'
    deviceId?: string
    template: string
  }): Promise<{
    success: boolean
    employeeId?: string
    confidence?: number
    matches?: Array<{ employeeId: string; confidence: number }>
  }> => {
    try {
      const response = await apiClient.post('/biometric/identify', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check-in with GPS location
   */
  checkInWithGPS: async (data: {
    employeeId: string
    latitude: number
    longitude: number
    verificationType: 'check-in' | 'check-out'
  }): Promise<{
    success: boolean
    withinGeofence: boolean
    distance?: number
    zoneName?: string
  }> => {
    try {
      const response = await apiClient.post('/biometric/checkin-gps', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
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
   * Get failed verification attempts
   */
  getFailedAttempts: async (filters?: {
    startDate?: string
    endDate?: string
    employeeId?: string
    deviceId?: string
  }): Promise<{ data: VerificationLog[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/biometric/logs/failed', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get spoofing attempts
   */
  getSpoofingAttempts: async (filters?: {
    startDate?: string
    endDate?: string
    deviceId?: string
  }): Promise<{ data: VerificationLog[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/biometric/logs/spoofing', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get daily summary
   */
  getDailySummary: async (date?: string): Promise<{
    date: string
    totalVerifications: number
    successfulVerifications: number
    failedVerifications: number
    byMethod: Record<string, number>
    byEmployee: Array<{ employeeId: string; count: number }>
  }> => {
    try {
      const response = await apiClient.get('/biometric/logs/daily-summary', {
        params: { date }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Process logs (batch processing)
   */
  processLogs: async (data: {
    startDate: string
    endDate: string
    action?: string
  }): Promise<{
    processed: number
    errors: number
  }> => {
    try {
      const response = await apiClient.post('/biometric/logs/process', data)
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
      const response = await apiClient.get('/biometric/geofence', { params: filters })
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
      const response = await apiClient.get(`/biometric/geofence/${id}`)
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
      const response = await apiClient.post('/biometric/geofence', data)
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
      const response = await apiClient.put(`/biometric/geofence/${id}`, data)
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
      await apiClient.delete(`/biometric/geofence/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Validate geofence (check if location is within zones)
   */
  validateGeofence: async (data: {
    latitude: number
    longitude: number
    employeeId?: string
  }): Promise<LocationCheckResult> => {
    try {
      const response = await apiClient.post('/biometric/geofence/validate', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}
