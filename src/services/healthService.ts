/**
 * Health Service
 * Handles all health check API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Health Status Response
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'alive' | 'dead' | 'ready' | 'not_ready' | 'degraded'
  timestamp: string
  uptime?: number
  error?: string
}

/**
 * Detailed Health Status Response
 */
export interface DetailedHealthStatus extends HealthStatus {
  checks?: {
    database?: string
    redis?: string
    [key: string]: any
  }
  system?: {
    platform?: string
    nodeVersion?: string
    memory?: {
      total: number
      used: number
      free: number
    }
    cpu?: {
      model: string
      cores: number
    }
  }
  reason?: string
}

/**
 * Ping Response
 */
export interface PingResponse {
  message: string
  timestamp: string
}

/**
 * Health Service
 */
const healthService = {
  /**
   * Basic health check
   * GET /api/health
   */
  getHealth: async (): Promise<HealthStatus> => {
    try {
      const response = await apiClient.get<HealthStatus>('/health')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Kubernetes liveness probe
   * GET /api/health/live
   */
  getLiveness: async (): Promise<HealthStatus> => {
    try {
      const response = await apiClient.get<HealthStatus>('/health/live')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Kubernetes readiness probe
   * GET /api/health/ready
   */
  getReadiness: async (): Promise<DetailedHealthStatus> => {
    try {
      const response = await apiClient.get<DetailedHealthStatus>('/health/ready')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Detailed health check (requires authentication)
   * GET /api/health/detailed
   */
  getDetailedHealth: async (): Promise<DetailedHealthStatus> => {
    try {
      const response = await apiClient.get<DetailedHealthStatus>('/health/detailed')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Simple ping endpoint
   * GET /api/health/ping
   */
  ping: async (): Promise<PingResponse> => {
    try {
      const response = await apiClient.get<PingResponse>('/health/ping')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default healthService
