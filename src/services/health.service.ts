import { apiClient } from '@/lib/api'

/**
 * Service Status from backend circuit breaker
 */
export interface ServiceStatus {
  isHealthy: boolean
  lastError?: string
  lastErrorTime?: string
  failureCount?: number
  recoveryTime?: string
}

/**
 * Circuit breaker status response
 */
export interface CircuitStatusResponse {
  status: 'healthy' | 'degraded' | 'recovering' | 'down'
  services: Record<string, ServiceStatus>
  timestamp: string
}

/**
 * Cache statistics response
 */
export interface CacheStatsResponse {
  hits: number
  misses: number
  total: number
  hitRate: number
  hitRatePercent: string
  cacheType: 'redis' | 'memory' | 'none'
  uptimeSeconds: number
  uptimeFormatted: string
  memoryUsage?: {
    used: number
    peak: number
    limit: number
  }
}

/**
 * Overall health response
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  uptimeFormatted: string
  circuits?: CircuitStatusResponse
  cache?: CacheStatsResponse
  database?: {
    connected: boolean
    latencyMs: number
  }
}

/**
 * Get overall backend health status
 */
export async function getHealth(): Promise<HealthResponse> {
  const response = await apiClient.get('/health')
  return response.data
}

/**
 * Get circuit breaker status for all services
 */
export async function getCircuitStatus(): Promise<CircuitStatusResponse> {
  const response = await apiClient.get('/health/circuits')
  return response.data
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStatsResponse> {
  const response = await apiClient.get('/health/cache')
  return response.data?.cache ?? response.data
}

/**
 * Check if a specific service is healthy
 */
export async function checkServiceHealth(serviceName: string): Promise<ServiceStatus> {
  const status = await getCircuitStatus()
  return status.services[serviceName] ?? { isHealthy: true }
}

/**
 * Get list of degraded services
 */
export async function getDegradedServices(): Promise<string[]> {
  const status = await getCircuitStatus()
  return Object.entries(status.services)
    .filter(([_, service]) => !service.isHealthy)
    .map(([name]) => name)
}

/**
 * Format uptime to human readable string
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days} يوم`)
  if (hours > 0) parts.push(`${hours} ساعة`)
  if (minutes > 0) parts.push(`${minutes} دقيقة`)

  return parts.join(' و ') || 'أقل من دقيقة'
}

/**
 * Get status color for health status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'text-green-600'
    case 'degraded':
    case 'recovering':
      return 'text-yellow-600'
    case 'unhealthy':
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'healthy':
      return 'default'
    case 'degraded':
    case 'recovering':
      return 'secondary'
    case 'unhealthy':
    case 'down':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default {
  getHealth,
  getCircuitStatus,
  getCacheStats,
  checkServiceHealth,
  getDegradedServices,
  formatUptime,
  getStatusColor,
  getStatusBadgeVariant,
}
