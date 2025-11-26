import { z } from 'zod'

// Tag entity types
export const tagEntityTypes = [
  'case',
  'client',
  'contact',
  'document',
  'all',
] as const

export type TagEntityType = (typeof tagEntityTypes)[number]

// Tag schema
export const tagSchema = z.object({
  _id: z.string(),
  lawyerId: z.string(),
  name: z.string().min(1, 'Tag name is required'),
  nameAr: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  description: z.string().optional(),
  entityType: z.enum(tagEntityTypes).optional().default('all'),
  usageCount: z.number().optional().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Tag = z.infer<typeof tagSchema>

// Create tag schema
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  nameAr: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  description: z.string().optional(),
  entityType: z.enum(tagEntityTypes).optional(),
})

export type CreateTagData = z.infer<typeof createTagSchema>

// Update tag schema
export const updateTagSchema = createTagSchema.partial()

export type UpdateTagData = z.infer<typeof updateTagSchema>

// Tag filters schema
export const tagFiltersSchema = z.object({
  entityType: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

export type TagFilters = z.infer<typeof tagFiltersSchema>
