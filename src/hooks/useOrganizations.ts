import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import organizationsService, {
  type OrganizationFilters,
  type CreateOrganizationData,
  type UpdateOrganizationData,
} from '@/services/organizationsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query keys
export const organizationsKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationsKeys.all, 'list'] as const,
  list: (filters: OrganizationFilters) => [...organizationsKeys.lists(), filters] as const,
  details: () => [...organizationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
  byClient: (clientId: string) => [...organizationsKeys.all, 'client', clientId] as const,
  search: (query: string) => [...organizationsKeys.all, 'search', query] as const,
}

// Get all organizations
export const useOrganizations = (filters?: OrganizationFilters) => {
  return useQuery({
    queryKey: organizationsKeys.list(filters || {}),
    queryFn: () => organizationsService.getOrganizations(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single organization
export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: organizationsKeys.detail(id),
    queryFn: () => organizationsService.getOrganization(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get organizations by client
export const useOrganizationsByClient = (clientId: string) => {
  return useQuery({
    queryKey: organizationsKeys.byClient(clientId),
    queryFn: () => organizationsService.getOrganizationsByClient(clientId),
    enabled: !!clientId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Search organizations
export const useSearchOrganizations = (query: string) => {
  return useQuery({
    queryKey: organizationsKeys.search(query),
    queryFn: () => organizationsService.searchOrganizations(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: STATS_GC_TIME,
  })
}

// Create organization
export const useCreateOrganization = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateOrganizationData) => organizationsService.createOrganization(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast({
        title: t('status.success'),
        description: t('status.createdSuccessfully'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: organizationsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { organizations: [...] } structure
        if (old.organizations && Array.isArray(old.organizations)) {
          return {
            ...old,
            organizations: [data, ...old.organizations]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: organizationsKeys.all, refetchType: 'all' })
    },
  })
}

// Update organization
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationData }) =>
      organizationsService.updateOrganization(id, data),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: organizationsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(id) })
    },
  })
}

// Delete organization
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => organizationsService.deleteOrganization(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: organizationsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { organizations: [...] } structure
        if (old.organizations && Array.isArray(old.organizations)) {
          return {
            ...old,
            organizations: old.organizations.filter((o: any) => o._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((o: any) => o._id !== id)
        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: organizationsKeys.all, refetchType: 'all' })
    },
  })
}

// Bulk delete organizations
export const useBulkDeleteOrganizations = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => organizationsService.bulkDeleteOrganizations(ids),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, ids) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: organizationsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { organizations: [...] } structure
        if (old.organizations && Array.isArray(old.organizations)) {
          return {
            ...old,
            organizations: old.organizations.filter((o: any) => !ids.includes(o._id))
          }
        }
        if (Array.isArray(old)) return old.filter((o: any) => !ids.includes(o._id))
        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: organizationsKeys.all, refetchType: 'all' })
    },
  })
}
