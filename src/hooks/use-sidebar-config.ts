/**
 * useSidebarConfig Hook
 * Fetches and caches sidebar configuration from the API
 *
 * Features:
 * - React Query for caching and automatic refresh
 * - Fallback to SIDEBAR_DEFAULTS when API unavailable
 * - 5-minute stale time for performance
 * - Fast retry (1 attempt) to quickly fall back to defaults
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getSidebarConfig } from '@/services/sidebarService'
import { QueryKeys } from '@/lib/query-keys'
import { CACHE_TIMES } from '@/config/cache'
import { SIDEBAR_DEFAULTS } from '@/constants/sidebar-defaults'
import type { SidebarConfig } from '@/types/sidebar'

//
// HOOK OPTIONS
//

export interface UseSidebarConfigOptions {
  /** Whether to enable the query (default: true) */
  enabled?: boolean
}

//
// HOOK IMPLEMENTATION
//

/**
 * Hook to fetch sidebar configuration
 *
 * @param options - Hook options
 * @returns React Query result with SidebarConfig
 *
 * @example
 * ```tsx
 * const { data: config, isLoading } = useSidebarConfig()
 *
 * // Config is never undefined due to placeholderData
 * const firmType = config.firmType
 * ```
 */
export function useSidebarConfig(
  options: UseSidebarConfigOptions = {}
): UseQueryResult<SidebarConfig | null, Error> {
  const { enabled = true } = options

  return useQuery<SidebarConfig | null, Error>({
    queryKey: QueryKeys.sidebar.config(),
    queryFn: getSidebarConfig,
    enabled,
    // 5 minutes - sidebar config rarely changes
    staleTime: CACHE_TIMES.MEDIUM,
    // Keep in cache for 30 minutes
    gcTime: CACHE_TIMES.GC_MEDIUM,
    // Fail fast to fallback - only 1 retry
    retry: 1,
    // Provide defaults immediately while fetching
    placeholderData: SIDEBAR_DEFAULTS,
    // Don't refetch on window focus (config rarely changes)
    refetchOnWindowFocus: false,
  })
}

//
// SELECTOR HOOKS
//

/**
 * Hook to get just the firm type from sidebar config
 * Useful when you only need the firm type, not the full config
 *
 * @returns Current firm type or 'solo' as default
 */
export function useFirmType(): 'solo' | 'small' | 'large' {
  const { data: config } = useSidebarConfig()
  return config?.firmType ?? 'solo'
}

export default useSidebarConfig
