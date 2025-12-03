import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  conflictCheckService,
  type ConflictCheckRequest,
  type ConflictStatus,
  type ConflictWaiver,
} from '@/services/conflictCheckService'

// Query key factory
export const conflictCheckKeys = {
  all: ['conflict-checks'] as const,
  lists: () => [...conflictCheckKeys.all, 'list'] as const,
  list: (filters?: { entityType?: string; status?: string }) =>
    [...conflictCheckKeys.lists(), filters] as const,
  details: () => [...conflictCheckKeys.all, 'detail'] as const,
  detail: (id: string) => [...conflictCheckKeys.details(), id] as const,
  entity: (entityType: string, entityId: string) =>
    [...conflictCheckKeys.all, 'entity', entityType, entityId] as const,
  quickSearch: (name: string) => [...conflictCheckKeys.all, 'quick-search', name] as const,
}

// Run conflict check
export function useRunConflictCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ConflictCheckRequest) =>
      conflictCheckService.runConflictCheck(request),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      // Manually update the cache for lists
      queryClient.setQueriesData({ queryKey: conflictCheckKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { checks: [...] } structure
        if (old.checks && Array.isArray(old.checks)) {
          return {
            ...old,
            checks: [data, ...old.checks]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async (data, error, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))

      await queryClient.invalidateQueries({ queryKey: conflictCheckKeys.lists(), refetchType: 'all' })
      if (variables.entityId) {
        await queryClient.invalidateQueries({
          queryKey: conflictCheckKeys.entity(variables.entityType, variables.entityId),
          refetchType: 'all'
        })
      }
    },
  })
}

// Get conflict check result
export function useConflictCheckResult(id: string) {
  return useQuery({
    queryKey: conflictCheckKeys.detail(id),
    queryFn: () => conflictCheckService.getConflictCheckResult(id),
    enabled: !!id,
  })
}

// Get conflict check history
export function useConflictCheckHistory(params?: {
  entityType?: 'client' | 'case' | 'matter'
  entityId?: string
  status?: ConflictStatus
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: conflictCheckKeys.list(params),
    queryFn: () => conflictCheckService.getConflictCheckHistory(params),
  })
}

// Get entity conflict checks
export function useEntityConflictChecks(
  entityType: 'client' | 'case' | 'matter',
  entityId: string
) {
  return useQuery({
    queryKey: conflictCheckKeys.entity(entityType, entityId),
    queryFn: () => conflictCheckService.getEntityConflictChecks(entityType, entityId),
    enabled: !!entityType && !!entityId,
  })
}

// Quick conflict search
export function useQuickConflictSearch(
  name: string,
  type?: 'individual' | 'organization'
) {
  return useQuery({
    queryKey: conflictCheckKeys.quickSearch(name),
    queryFn: () => conflictCheckService.quickConflictSearch(name, type),
    enabled: name.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Resolve conflict match
export function useResolveConflictMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      checkId,
      matchId,
      resolution,
    }: {
      checkId: string
      matchId: string
      resolution: { status: 'cleared' | 'flagged' | 'waived'; notes: string }
    }) => conflictCheckService.resolveConflictMatch(checkId, matchId, resolution),
    onSettled: async (data, error, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: conflictCheckKeys.detail(variables.checkId),
        refetchType: 'all'
      })
    },
  })
}

// Add conflict waiver
export function useAddConflictWaiver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      checkId,
      waiver,
    }: {
      checkId: string
      waiver: Omit<ConflictWaiver, 'waivedBy' | 'waivedAt'>
    }) => conflictCheckService.addConflictWaiver(checkId, waiver),
    onSettled: async (data, error, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: conflictCheckKeys.detail(variables.checkId),
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ queryKey: conflictCheckKeys.lists(), refetchType: 'all' })
    },
  })
}

// Clear conflict check
export function useClearConflictCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ checkId, notes }: { checkId: string; notes: string }) =>
      conflictCheckService.clearConflictCheck(checkId, notes),
    onSettled: async (data, error, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: conflictCheckKeys.detail(variables.checkId),
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ queryKey: conflictCheckKeys.lists(), refetchType: 'all' })
    },
  })
}

// Export conflict report
export function useExportConflictReport() {
  return useMutation({
    mutationFn: ({ checkId, format }: { checkId: string; format: 'pdf' | 'docx' }) =>
      conflictCheckService.exportConflictReport(checkId, format),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conflict-check-${variables.checkId}.${variables.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  })
}
