import { z } from 'zod'

// Document categories
export const documentCategories = [
  'contract',
  'judgment',
  'evidence',
  'correspondence',
  'pleading',
  'other',
] as const

export type DocumentCategory = (typeof documentCategories)[number]

// Document modules for R2 bucket routing
export const documentModules = [
  'crm',
  'finance',
  'hr',
  'tasks',
  'judgments',
  'documents',
] as const

export type DocumentModule = (typeof documentModules)[number]

// Document schema
export const documentSchema = z.object({
  _id: z.string(),
  lawyerId: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  url: z.string(),
  category: z.enum(documentCategories),
  caseId: z
    .union([
      z.string(),
      z.object({
        _id: z.string(),
        caseNumber: z.string(),
        title: z.string(),
      }),
    ])
    .optional(),
  clientId: z
    .union([
      z.string(),
      z.object({
        _id: z.string(),
        fullName: z.string(),
      }),
    ])
    .optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isConfidential: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  uploadedBy: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      fullName: z.string(),
    }),
  ]),
  version: z.number().default(1),
  parentDocumentId: z.string().optional(),
  shareToken: z.string().optional(),
  shareExpiresAt: z.string().optional(),
  accessCount: z.number().optional(),
  lastAccessedAt: z.string().optional(),
  metadata: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      duration: z.number().optional(),
      pageCount: z.number().optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Document = z.infer<typeof documentSchema>

// Document version schema
export const documentVersionSchema = z.object({
  _id: z.string(),
  version: z.number(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  url: z.string(),
  uploadedBy: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      fullName: z.string(),
    }),
  ]),
  changeNote: z.string().optional(),
  createdAt: z.string(),
})

export type DocumentVersion = z.infer<typeof documentVersionSchema>

// Create document schema
export const createDocumentSchema = z.object({
  category: z.enum(documentCategories),
  module: z.enum(documentModules).optional(),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isConfidential: z.boolean().optional(),
})

export type CreateDocumentData = z.infer<typeof createDocumentSchema>

// Update document schema
export const updateDocumentSchema = z.object({
  category: z.enum(documentCategories).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isConfidential: z.boolean().optional(),
})

export type UpdateDocumentData = z.infer<typeof updateDocumentSchema>

// Document filters schema
export const documentFiltersSchema = z.object({
  category: z.string().optional(),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  search: z.string().optional(),
  isConfidential: z.boolean().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

export type DocumentFilters = z.infer<typeof documentFiltersSchema>
