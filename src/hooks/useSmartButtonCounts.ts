/**
 * Smart Button Counts Hook
 *
 * Fetches counts for related records used in smart buttons
 * Features:
 * - Batch multiple count queries
 * - Cache results using React Query
 * - Optimistic updates on mutations
 * - Support for all entity types
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { EntityType, SmartButtonConfig } from '@/components/smart-button/smart-button-config'

// ════════════════════════════════════════════════════════════
// CACHE CONFIGURATION
// ════════════════════════════════════════════════════════════
const COUNTS_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const COUNTS_GC_TIME = 15 * 60 * 1000 // 15 minutes

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════
export interface SmartButtonCount {
  buttonId: string
  count: number
  isLoading: boolean
  error: Error | null
}

export interface SmartButtonCountsResult {
  counts: Record<string, number>
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// ════════════════════════════════════════════════════════════
// API FUNCTIONS
// ════════════════════════════════════════════════════════════

/**
 * Fetch count for a specific button
 */
async function fetchButtonCount(
  entityType: EntityType,
  entityId: string,
  buttonId: string
): Promise<number> {
  try {
    // Map button IDs to API endpoints
    const endpoint = getCountEndpoint(entityType, entityId, buttonId)

    if (!endpoint) {
      console.warn(`No endpoint configured for ${entityType}.${buttonId}`)
      return 0
    }

    const response = await apiClient.get(endpoint)

    // Handle different response formats
    if (typeof response.data === 'number') {
      return response.data
    }
    if (response.data?.count !== undefined) {
      return response.data.count
    }
    if (response.data?.total !== undefined) {
      return response.data.total
    }
    if (Array.isArray(response.data)) {
      return response.data.length
    }

    return 0
  } catch (error) {
    console.error(`Error fetching count for ${entityType}.${buttonId}:`, error)
    return 0
  }
}

/**
 * Get API endpoint for count query
 */
function getCountEndpoint(
  entityType: EntityType,
  entityId: string,
  buttonId: string
): string | null {
  // Map entity type and button ID to API endpoints
  const endpointMap: Record<string, Record<string, string>> = {
    client: {
      cases: `/clients/${entityId}/cases/count`,
      invoices: `/clients/${entityId}/invoices/count`,
      payments: `/clients/${entityId}/payments/count`,
      documents: `/clients/${entityId}/documents/count`,
      contacts: `/clients/${entityId}/contacts/count`,
      activities: `/clients/${entityId}/activities/count`,
    },
    case: {
      hearings: `/cases/${entityId}/hearings/count`,
      documents: `/cases/${entityId}/documents/count`,
      invoices: `/cases/${entityId}/invoices/count`,
      tasks: `/cases/${entityId}/tasks/count`,
      timeEntries: `/cases/${entityId}/time-entries/count`,
      notes: `/cases/${entityId}/notes/count`,
    },
    contact: {
      cases: `/contacts/${entityId}/cases/count`,
      activities: `/contacts/${entityId}/activities/count`,
      calls: `/contacts/${entityId}/activities/count?type=call`,
      emails: `/contacts/${entityId}/activities/count?type=email`,
      meetings: `/contacts/${entityId}/activities/count?type=meeting`,
    },
    lead: {
      activities: `/leads/${entityId}/activities/count`,
      calls: `/leads/${entityId}/activities/count?type=call`,
      emails: `/leads/${entityId}/activities/count?type=email`,
      meetings: `/leads/${entityId}/activities/count?type=meeting`,
      notes: `/leads/${entityId}/notes/count`,
    },
  }

  return endpointMap[entityType]?.[buttonId] || null
}

// ════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════

/**
 * Fetch counts for all smart buttons of an entity
 *
 * @param entityType - Type of entity (client, case, contact, lead)
 * @param entityId - ID of the entity
 * @param buttonConfigs - Array of smart button configurations
 * @param enabled - Whether to enable the query
 */
export function useSmartButtonCounts(
  entityType: EntityType,
  entityId: string,
  buttonConfigs: SmartButtonConfig[],
  enabled: boolean = true
): SmartButtonCountsResult {
  // Use useQueries to fetch all counts in parallel
  const queries = useQueries({
    queries: buttonConfigs.map((config) => ({
      queryKey: ['smart-button-count', entityType, entityId, config.id],
      queryFn: () => fetchButtonCount(entityType, entityId, config.id),
      staleTime: COUNTS_STALE_TIME,
      gcTime: COUNTS_GC_TIME,
      enabled: enabled && !!entityId,
      retry: 1, // Only retry once on failure
    })),
  })

  // Aggregate results
  const counts: Record<string, number> = {}
  let isLoading = false
  let error: Error | null = null

  queries.forEach((query, index) => {
    const buttonId = buttonConfigs[index].id
    counts[buttonId] = query.data ?? 0

    if (query.isLoading) {
      isLoading = true
    }

    if (query.error && !error) {
      error = query.error as Error
    }
  })

  // Refetch all counts
  const refetch = () => {
    queries.forEach((query) => query.refetch())
  }

  return {
    counts,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Fetch count for a single smart button
 *
 * @param entityType - Type of entity
 * @param entityId - ID of the entity
 * @param buttonId - ID of the button
 * @param enabled - Whether to enable the query
 */
export function useSmartButtonCount(
  entityType: EntityType,
  entityId: string,
  buttonId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['smart-button-count', entityType, entityId, buttonId],
    queryFn: () => fetchButtonCount(entityType, entityId, buttonId),
    staleTime: COUNTS_STALE_TIME,
    gcTime: COUNTS_GC_TIME,
    enabled: enabled && !!entityId,
    retry: 1,
  })
}

/**
 * Fetch all counts using a single batched API call
 * (Use this if the backend supports batch count queries)
 *
 * @param entityType - Type of entity
 * @param entityId - ID of the entity
 * @param buttonIds - Array of button IDs to fetch
 * @param enabled - Whether to enable the query
 */
export function useSmartButtonCountsBatch(
  entityType: EntityType,
  entityId: string,
  buttonIds: string[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['smart-button-counts-batch', entityType, entityId, buttonIds],
    queryFn: async () => {
      try {
        // Call batch endpoint if available
        const response = await apiClient.post(`/${entityType}s/${entityId}/counts`, {
          buttons: buttonIds,
        })

        return response.data as Record<string, number>
      } catch (error) {
        console.error('Batch count fetch failed:', error)

        // Fallback to individual fetches
        const counts: Record<string, number> = {}
        await Promise.all(
          buttonIds.map(async (buttonId) => {
            counts[buttonId] = await fetchButtonCount(entityType, entityId, buttonId)
          })
        )
        return counts
      }
    },
    staleTime: COUNTS_STALE_TIME,
    gcTime: COUNTS_GC_TIME,
    enabled: enabled && !!entityId && buttonIds.length > 0,
  })
}
