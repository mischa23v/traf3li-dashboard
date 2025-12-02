import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import organizationsService, {
  type OrganizationFilters,
  type CreateOrganizationData,
  type UpdateOrganizationData,
} from '@/services/organizationsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

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
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get single organization
export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: organizationsKeys.detail(id),
    queryFn: () => organizationsService.getOrganization(id),
    enabled: !!id,
  })
}

// Get organizations by client
export const useOrganizationsByClient = (clientId: string) => {
  return useQuery({
    queryKey: organizationsKeys.byClient(clientId),
    queryFn: () => organizationsService.getOrganizationsByClient(clientId),
    enabled: !!clientId,
  })
}

// Search organizations
export const useSearchOrganizations = (query: string) => {
  return useQuery({
    queryKey: organizationsKeys.search(query),
    queryFn: () => organizationsService.searchOrganizations(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Create organization
export const useCreateOrganization = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateOrganizationData) => organizationsService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all })
      toast({
        title: t('status.success'),
        description: t('status.createdSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(variables.id) })
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
  })
}

// Delete organization
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => organizationsService.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all })
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
  })
}

// Bulk delete organizations
export const useBulkDeleteOrganizations = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => organizationsService.bulkDeleteOrganizations(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all })
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
  })
}
