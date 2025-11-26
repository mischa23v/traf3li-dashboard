import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import tagsService, {
  type TagFilters,
  type CreateTagData,
  type UpdateTagData,
} from '@/services/tagsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

// Query keys
export const tagsKeys = {
  all: ['tags'] as const,
  lists: () => [...tagsKeys.all, 'list'] as const,
  list: (filters: TagFilters) => [...tagsKeys.lists(), filters] as const,
  details: () => [...tagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagsKeys.details(), id] as const,
  search: (query: string, entityType?: string) => [...tagsKeys.all, 'search', query, entityType] as const,
  popular: (entityType?: string) => [...tagsKeys.all, 'popular', entityType] as const,
  entity: (entityType: string, entityId: string) => [...tagsKeys.all, 'entity', entityType, entityId] as const,
}

// Get all tags
export const useTags = (filters?: TagFilters) => {
  return useQuery({
    queryKey: tagsKeys.list(filters || {}),
    queryFn: () => tagsService.getTags(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single tag
export const useTag = (id: string) => {
  return useQuery({
    queryKey: tagsKeys.detail(id),
    queryFn: () => tagsService.getTag(id),
    enabled: !!id,
  })
}

// Search tags (for autocomplete)
export const useSearchTags = (query: string, entityType?: string) => {
  return useQuery({
    queryKey: tagsKeys.search(query, entityType),
    queryFn: () => tagsService.searchTags(query, entityType),
    enabled: query.length >= 1,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Get popular tags
export const usePopularTags = (entityType?: string, limit?: number) => {
  return useQuery({
    queryKey: tagsKeys.popular(entityType),
    queryFn: () => tagsService.getPopularTags(entityType, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get tags for entity
export const useTagsForEntity = (
  entityType: 'case' | 'client' | 'contact' | 'document',
  entityId: string
) => {
  return useQuery({
    queryKey: tagsKeys.entity(entityType, entityId),
    queryFn: () => tagsService.getTagsForEntity(entityType, entityId),
    enabled: !!entityId,
  })
}

// Create tag
export const useCreateTag = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateTagData) => tagsService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.all })
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

// Update tag
export const useUpdateTag = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagData }) =>
      tagsService.updateTag(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.all })
      queryClient.invalidateQueries({ queryKey: tagsKeys.detail(variables.id) })
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

// Delete tag
export const useDeleteTag = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => tagsService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.all })
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

// Add tag to entity
export const useAddTagToEntity = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      tagId,
      entityType,
      entityId,
    }: {
      tagId: string
      entityType: 'case' | 'client' | 'contact' | 'document'
      entityId: string
    }) => tagsService.addTagToEntity(tagId, entityType, entityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tagsKeys.entity(variables.entityType, variables.entityId),
      })
      queryClient.invalidateQueries({ queryKey: tagsKeys.all })
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

// Remove tag from entity
export const useRemoveTagFromEntity = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      tagId,
      entityType,
      entityId,
    }: {
      tagId: string
      entityType: 'case' | 'client' | 'contact' | 'document'
      entityId: string
    }) => tagsService.removeTagFromEntity(tagId, entityType, entityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tagsKeys.entity(variables.entityType, variables.entityId),
      })
      queryClient.invalidateQueries({ queryKey: tagsKeys.all })
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
