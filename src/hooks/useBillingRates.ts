/**
 * Billing Rates React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import billingRatesService, {
  type BillingRate,
  type RateGroup,
  type RateCard,
  type TimeEntry,
  type RateFilters,
  type RateGroupFilters,
  type TimeEntryFilters,
  type CreateRateData,
  type UpdateRateData,
  type CreateRateGroupData,
  type UpdateRateGroupData,
  type CreateRateCardData,
  type UpdateRateCardData,
  type CreateTimeEntryData,
  type UpdateTimeEntryData,
} from '@/services/billingRatesService'

// ==================== QUERY KEYS ====================

export const billingKeys = {
  all: ['billing'] as const,
  // Rates
  rates: () => [...billingKeys.all, 'rates'] as const,
  ratesList: (filters?: RateFilters) => [...billingKeys.rates(), 'list', filters] as const,
  rateDetail: (id: string) => [...billingKeys.rates(), 'detail', id] as const,
  // Groups
  groups: () => [...billingKeys.all, 'groups'] as const,
  groupsList: (filters?: RateGroupFilters) => [...billingKeys.groups(), 'list', filters] as const,
  groupDetail: (id: string) => [...billingKeys.groups(), 'detail', id] as const,
  // Rate Cards
  rateCards: () => [...billingKeys.all, 'rate-cards'] as const,
  rateCardsList: (filters?: { entityType?: string; entityId?: string; isActive?: boolean }) =>
    [...billingKeys.rateCards(), 'list', filters] as const,
  rateCardForEntity: (entityType: string, entityId: string) =>
    [...billingKeys.rateCards(), 'entity', entityType, entityId] as const,
  // Time Entries
  timeEntries: () => [...billingKeys.all, 'time-entries'] as const,
  timeEntriesList: (filters?: TimeEntryFilters) => [...billingKeys.timeEntries(), 'list', filters] as const,
  // Statistics
  statistics: () => [...billingKeys.all, 'statistics'] as const,
}

// ==================== RATES QUERIES ====================

/**
 * Get all billing rates
 */
export function useBillingRates(filters?: RateFilters) {
  return useQuery({
    queryKey: billingKeys.ratesList(filters),
    queryFn: () => billingRatesService.getRates(filters),
  })
}

/**
 * Get single billing rate
 */
export function useBillingRate(id: string) {
  return useQuery({
    queryKey: billingKeys.rateDetail(id),
    queryFn: () => billingRatesService.getRate(id),
    enabled: !!id,
  })
}

// ==================== RATES MUTATIONS ====================

/**
 * Create billing rate
 */
export function useCreateRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRateData) => billingRatesService.createRate(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.rates() }, (old: any) => {
        if (!old) return old
        // Handle { rates: [...] } structure
        if (old.rates && Array.isArray(old.rates)) {
          return {
            ...old,
            rates: [data, ...old.rates]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.rates(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

/**
 * Update billing rate
 */
export function useUpdateRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRateData }) =>
      billingRatesService.updateRate(id, data),
    onSuccess: (rate) => {
      queryClient.setQueryData(billingKeys.rateDetail(rate._id), rate)
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.rates() })
    },
  })
}

/**
 * Delete billing rate
 */
export function useDeleteRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingRatesService.deleteRate(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.rates() }, (old: any) => {
        if (!old) return old
        // Handle { rates: [...] } structure
        if (old.rates && Array.isArray(old.rates)) {
          return {
            ...old,
            rates: old.rates.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.rates(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

// ==================== RATE GROUPS QUERIES ====================

/**
 * Get all rate groups
 */
export function useRateGroups(filters?: RateGroupFilters) {
  return useQuery({
    queryKey: billingKeys.groupsList(filters),
    queryFn: () => billingRatesService.getRateGroups(filters),
  })
}

/**
 * Get single rate group
 */
export function useRateGroup(id: string) {
  return useQuery({
    queryKey: billingKeys.groupDetail(id),
    queryFn: () => billingRatesService.getRateGroup(id),
    enabled: !!id,
  })
}

// ==================== RATE GROUPS MUTATIONS ====================

/**
 * Create rate group
 */
export function useCreateRateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRateGroupData) => billingRatesService.createRateGroup(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.groups() }, (old: any) => {
        if (!old) return old
        // Handle { groups: [...] } structure
        if (old.groups && Array.isArray(old.groups)) {
          return {
            ...old,
            groups: [data, ...old.groups]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.groups(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

/**
 * Update rate group
 */
export function useUpdateRateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRateGroupData }) =>
      billingRatesService.updateRateGroup(id, data),
    onSuccess: (group) => {
      queryClient.setQueryData(billingKeys.groupDetail(group._id), group)
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.groups() })
    },
  })
}

/**
 * Delete rate group
 */
export function useDeleteRateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingRatesService.deleteRateGroup(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.groups() }, (old: any) => {
        if (!old) return old
        // Handle { groups: [...] } structure
        if (old.groups && Array.isArray(old.groups)) {
          return {
            ...old,
            groups: old.groups.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.groups(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

/**
 * Add rate to group
 */
export function useAddRateToGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, rateId }: { groupId: string; rateId: string }) =>
      billingRatesService.addRateToGroup(groupId, rateId),
    onSuccess: (group) => {
      queryClient.setQueryData(billingKeys.groupDetail(group._id), group)
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.groups() })
    },
  })
}

/**
 * Remove rate from group
 */
export function useRemoveRateFromGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, rateId }: { groupId: string; rateId: string }) =>
      billingRatesService.removeRateFromGroup(groupId, rateId),
    onSuccess: (group) => {
      queryClient.setQueryData(billingKeys.groupDetail(group._id), group)
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.groups() })
    },
  })
}

// ==================== RATE CARDS QUERIES ====================

/**
 * Get all rate cards
 */
export function useRateCards(filters?: { entityType?: string; entityId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: billingKeys.rateCardsList(filters),
    queryFn: () => billingRatesService.getRateCards(filters),
  })
}

/**
 * Get rate card for entity
 */
export function useRateCardForEntity(entityType: string, entityId: string) {
  return useQuery({
    queryKey: billingKeys.rateCardForEntity(entityType, entityId),
    queryFn: () => billingRatesService.getRateCardForEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  })
}

// ==================== RATE CARDS MUTATIONS ====================

/**
 * Create rate card
 */
export function useCreateRateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRateCardData) => billingRatesService.createRateCard(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.rateCards() }, (old: any) => {
        if (!old) return old
        // Handle { rateCards: [...] } structure
        if (old.rateCards && Array.isArray(old.rateCards)) {
          return {
            ...old,
            rateCards: [data, ...old.rateCards]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.rateCards(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

/**
 * Update rate card
 */
export function useUpdateRateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRateCardData }) =>
      billingRatesService.updateRateCard(id, data),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.rateCards() })
    },
  })
}

/**
 * Delete rate card
 */
export function useDeleteRateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingRatesService.deleteRateCard(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.rateCards() }, (old: any) => {
        if (!old) return old
        // Handle { rateCards: [...] } structure
        if (old.rateCards && Array.isArray(old.rateCards)) {
          return {
            ...old,
            rateCards: old.rateCards.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.rateCards(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

// ==================== TIME ENTRIES QUERIES ====================

/**
 * Get time entries
 */
export function useTimeEntries(filters?: TimeEntryFilters) {
  return useQuery({
    queryKey: billingKeys.timeEntriesList(filters),
    queryFn: () => billingRatesService.getTimeEntries(filters),
  })
}

// ==================== TIME ENTRIES MUTATIONS ====================

/**
 * Create time entry
 */
export function useCreateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTimeEntryData) => billingRatesService.createTimeEntry(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.timeEntries() }, (old: any) => {
        if (!old) return old
        // Handle { timeEntries: [...] } structure
        if (old.timeEntries && Array.isArray(old.timeEntries)) {
          return {
            ...old,
            timeEntries: [data, ...old.timeEntries]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

/**
 * Update time entry
 */
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeEntryData }) =>
      billingRatesService.updateTimeEntry(id, data),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries() })
    },
  })
}

/**
 * Delete time entry
 */
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingRatesService.deleteTimeEntry(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      // Manually update the cache
      queryClient.setQueriesData({ queryKey: billingKeys.timeEntries() }, (old: any) => {
        if (!old) return old
        // Handle { timeEntries: [...] } structure
        if (old.timeEntries && Array.isArray(old.timeEntries)) {
          return {
            ...old,
            timeEntries: old.timeEntries.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries(), refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: billingKeys.statistics(), refetchType: 'all' })
    },
  })
}

/**
 * Approve time entries
 */
export function useApproveTimeEntries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => billingRatesService.approveTimeEntries(ids),
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: billingKeys.timeEntries() })
    },
  })
}

// ==================== STATISTICS ====================

/**
 * Get billing statistics
 */
export function useBillingStatistics() {
  return useQuery({
    queryKey: billingKeys.statistics(),
    queryFn: () => billingRatesService.getStatistics(),
  })
}
