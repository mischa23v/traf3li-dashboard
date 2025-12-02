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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: conflictCheckKeys.lists() })
      if (variables.entityId) {
        queryClient.invalidateQueries({
          queryKey: conflictCheckKeys.entity(variables.entityType, variables.entityId),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conflictCheckKeys.detail(variables.checkId),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conflictCheckKeys.detail(variables.checkId),
      })
      queryClient.invalidateQueries({ queryKey: conflictCheckKeys.lists() })
    },
  })
}

// Clear conflict check
export function useClearConflictCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ checkId, notes }: { checkId: string; notes: string }) =>
      conflictCheckService.clearConflictCheck(checkId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conflictCheckKeys.detail(variables.checkId),
      })
      queryClient.invalidateQueries({ queryKey: conflictCheckKeys.lists() })
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
