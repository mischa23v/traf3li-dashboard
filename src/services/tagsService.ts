import api from './api'

/**
 * Entity types that can have tags
 * Matches backend contract: contract2/types/tag.ts
 */
export type EntityType = 'case' | 'client' | 'invoice' | 'document' | 'task' | 'appointment' | 'contact' | 'lead' | 'expense' | 'note'

export interface Tag {
  _id: string
  name: string
  nameAr?: string
  color?: string // Hex color
  icon?: string
  description?: string
  category?: string
  entityTypes: EntityType[] // Which entities can use this tag
  usageCount: number
  isSystem: boolean
  firmId?: string
  lawyerId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TagFilters {
  entityType?: EntityType
  search?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'usageCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateTagData {
  name: string
  nameAr?: string
  color?: string
  icon?: string
  description?: string
  category?: string
  entityTypes?: EntityType[]
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TagsResponse {
  data: {
    tags: Tag[]
    pagination: Pagination
  }
}

const tagsService = {
  // Get all tags with optional filters
  getTags: async (filters?: TagFilters): Promise<TagsResponse> => {
    const params = new URLSearchParams()
    if (filters?.entityType) params.append('entityType', filters.entityType)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/tags?${params.toString()}`)
    return response.data
  },

  // Get single tag by ID
  getTag: async (id: string): Promise<Tag> => {
    const response = await api.get(`/tags/${id}`)
    return response.data
  },

  // Create new tag
  createTag: async (data: CreateTagData): Promise<Tag> => {
    const response = await api.post('/tags', data)
    return response.data
  },

  // Update tag (PUT /api/tags/:id)
  updateTag: async (id: string, data: UpdateTagData): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, data)
    return response.data?.data || response.data
  },

  // Delete tag
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`)
  },

  // Search tags (for autocomplete) - uses list endpoint with search param
  searchTags: async (query: string, entityType?: EntityType): Promise<Tag[]> => {
    const params = new URLSearchParams()
    params.append('search', query)
    if (entityType) params.append('entityType', entityType)
    const response = await api.get(`/tags?${params.toString()}`)
    return response.data?.data?.tags || response.data?.tags || response.data || []
  },

  // Get popular tags (GET /api/tags/popular)
  getPopularTags: async (entityType?: EntityType, limit?: number): Promise<Tag[]> => {
    const params = new URLSearchParams()
    if (entityType) params.append('entityType', entityType)
    if (limit) params.append('limit', limit.toString())
    const response = await api.get(`/tags/popular?${params.toString()}`)
    return response.data?.data?.tags || response.data?.tags || response.data || []
  },

  // Add tag to entity
  addTagToEntity: async (
    tagId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<void> => {
    await api.post(`/tags/${tagId}/attach`, { entityType, entityId })
  },

  // Remove tag from entity
  removeTagFromEntity: async (
    tagId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<void> => {
    await api.post(`/tags/${tagId}/detach`, { entityType, entityId })
  },

  // Get tags for entity type (GET /api/tags/entity/:entityType)
  getTagsForEntityType: async (entityType: EntityType): Promise<{ tags: Tag[]; count: number }> => {
    const response = await api.get(`/tags/entity/${entityType}`)
    return response.data?.data || { tags: response.data, count: response.data?.length || 0 }
  },

  // Merge tags (POST /api/tags/merge)
  mergeTags: async (sourceTagIds: string[], targetTagId: string): Promise<{ mergedTag: Tag; deletedCount: number; updatedEntitiesCount: number }> => {
    const response = await api.post('/tags/merge', { sourceTagIds, targetTagId })
    return response.data?.data || response.data
  },

  // Bulk tag operations (POST /api/tags/bulk)
  bulkTagOperation: async (
    operation: 'add' | 'remove',
    tagIds: string[],
    entityType: EntityType,
    entityIds: string[]
  ): Promise<{ processedCount: number; failedCount: number; errors?: Array<{ entityId: string; error: string }> }> => {
    const response = await api.post('/tags/bulk', { operation, tagIds, entityType, entityIds })
    return response.data?.data || response.data
  },
}

export default tagsService
