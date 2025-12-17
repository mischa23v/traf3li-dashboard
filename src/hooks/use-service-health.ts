import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface ServiceStatus {
  isHealthy: boolean
  lastError?: string
  lastErrorTime?: string
  failureCount?: number
}

interface CircuitStatus {
  status: 'healthy' | 'degraded' | 'recovering' | 'down'
  services: Record<string, ServiceStatus>
  timestamp: string
}

interface CacheStats {
  hits: number
  misses: number
  total: number
  hitRate: number
  hitRatePercent: string
  cacheType: string
  uptimeSeconds: number
  uptimeFormatted: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  circuits?: CircuitStatus
  cache?: CacheStats
  version?: string
  uptime?: number
}

interface UseServiceHealthOptions {
  /** Polling interval in ms (default: 60000 - 1 minute) */
  pollingInterval?: number
  /** Whether to show degraded service banner */
  showDegradedBanner?: boolean
  /** Enable polling (default: true) */
  enabled?: boolean
}

/**
 * Hook to monitor backend service health and circuit status
 */
export function useServiceHealth(options: UseServiceHealthOptions = {}) {
  const {
    pollingInterval = 60000,
    showDegradedBanner = true,
    enabled = true,
  } = options

  const [degradedServices, setDegradedServices] = useState<string[]>([])

  const { data: health, isLoading, error, refetch } = useQuery<HealthResponse>({
    queryKey: ['service-health'],
    queryFn: async () => {
      const response = await apiClient.get('/health/circuits')
      return response.data
    },
    refetchInterval: enabled ? pollingInterval : false,
    retry: 1,
    staleTime: pollingInterval / 2,
    enabled,
  })

  useEffect(() => {
    if (health?.circuits?.services) {
      const unhealthy = Object.entries(health.circuits.services)
        .filter(([_, status]) => !status.isHealthy)
        .map(([name]) => name)

      setDegradedServices(unhealthy)
    }
  }, [health])

  const isHealthy = health?.status === 'healthy'
  const isDegraded = health?.status === 'degraded' || degradedServices.length > 0
  const isDown = health?.status === 'unhealthy'

  const getServiceStatus = useCallback((serviceName: string): ServiceStatus | null => {
    return health?.circuits?.services?.[serviceName] ?? null
  }, [health])

  return {
    health,
    isLoading,
    error,
    refetch,
    isHealthy,
    isDegraded,
    isDown,
    degradedServices,
    getServiceStatus,
    circuitStatus: health?.circuits,
    cacheStats: health?.cache,
  }
}

/**
 * Hook to get cache statistics
 */
export function useCacheStats(options: { enabled?: boolean; pollingInterval?: number } = {}) {
  const { enabled = true, pollingInterval = 30000 } = options

  const { data, isLoading, error, refetch } = useQuery<CacheStats>({
    queryKey: ['cache-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/health/cache')
      return response.data?.cache ?? response.data
    },
    refetchInterval: enabled ? pollingInterval : false,
    retry: 1,
    staleTime: pollingInterval / 2,
    enabled,
  })

  return {
    stats: data,
    isLoading,
    error,
    refetch,
    hitRate: data?.hitRate ?? 0,
    hitRatePercent: data?.hitRatePercent ?? '0%',
  }
}

export default useServiceHealth
