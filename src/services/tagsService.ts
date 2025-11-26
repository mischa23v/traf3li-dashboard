import api from './api'

export interface Tag {
  _id: string
  lawyerId: string
  name: string
  nameAr?: string
  color: string // Hex color
  description?: string
  entityType: 'case' | 'client' | 'contact' | 'document' | 'all' // Which entities can use this tag
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface TagFilters {
  entityType?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateTagData {
  name: string
  nameAr?: string
  color: string
  description?: string
  entityType?: string
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export interface TagsResponse {
  data: Tag[]
  total: number
  page: number
  limit: number
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

  // Update tag
  updateTag: async (id: string, data: UpdateTagData): Promise<Tag> => {
    const response = await api.patch(`/tags/${id}`, data)
    return response.data
  },

  // Delete tag
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`)
  },

  // Search tags (for autocomplete)
  searchTags: async (query: string, entityType?: string): Promise<Tag[]> => {
    const params = new URLSearchParams()
    params.append('q', query)
    if (entityType) params.append('entityType', entityType)
    const response = await api.get(`/tags/search?${params.toString()}`)
    return response.data
  },

  // Get popular tags
  getPopularTags: async (entityType?: string, limit?: number): Promise<Tag[]> => {
    const params = new URLSearchParams()
    if (entityType) params.append('entityType', entityType)
    if (limit) params.append('limit', limit.toString())
    const response = await api.get(`/tags/popular?${params.toString()}`)
    return response.data
  },

  // Add tag to entity
  addTagToEntity: async (
    tagId: string,
    entityType: 'case' | 'client' | 'contact' | 'document',
    entityId: string
  ): Promise<void> => {
    await api.post(`/tags/${tagId}/attach`, { entityType, entityId })
  },

  // Remove tag from entity
  removeTagFromEntity: async (
    tagId: string,
    entityType: 'case' | 'client' | 'contact' | 'document',
    entityId: string
  ): Promise<void> => {
    await api.post(`/tags/${tagId}/detach`, { entityType, entityId })
  },

  // Get tags for entity
  getTagsForEntity: async (
    entityType: 'case' | 'client' | 'contact' | 'document',
    entityId: string
  ): Promise<Tag[]> => {
    const response = await api.get(`/tags/entity/${entityType}/${entityId}`)
    return response.data
  },
}

export default tagsService
