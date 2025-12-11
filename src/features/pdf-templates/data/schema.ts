import { z } from 'zod'

// Template categories enum
export const templateCategorySchema = z.enum([
  'invoice',
  'contract',
  'receipt',
  'report',
  'statement',
  'letter',
  'certificate',
  'custom',
])

// Template types enum
export const templateTypeSchema = z.enum([
  'standard',
  'detailed',
  'summary',
  'minimal',
  'custom',
])

// Position schema for field placement
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

// Body range schema for table fields
export const bodyRangeSchema = z.object({
  start: z.number(),
  end: z.number().optional(),
})

// PDFMe schema field structure
export const schemaFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  content: z.string().optional(),
  position: positionSchema,
  width: z.number(),
  height: z.number(),
  rotate: z.number().optional(),
  opacity: z.number().optional(),
  readOnly: z.boolean().optional(),
  required: z.boolean().optional(),
  __bodyRange: bodyRangeSchema.optional(),
  __isSplit: z.boolean().optional(),
})

// Blank PDF configuration
export const blankPdfSchema = z.object({
  width: z.number(),
  height: z.number(),
  padding: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  staticSchema: z.array(schemaFieldSchema).optional(),
})

// Base PDF - can be a string (base64/URL), ArrayBuffer, Uint8Array, or BlankPdf object
export const basePdfSchema = z.union([
  z.string(),
  z.instanceof(ArrayBuffer),
  z.instanceof(Uint8Array),
  blankPdfSchema,
])

// PDFMe template core structure (from @pdfme/common)
export const pdfmeTemplateSchema = z.object({
  basePdf: basePdfSchema,
  schemas: z.array(z.array(schemaFieldSchema)),
  pdfmeVersion: z.string().optional(),
})

// Extended template with metadata for our application
export const extendedPdfmeTemplateSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  category: templateCategorySchema,
  type: templateTypeSchema,
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // PDFMe template structure
  template: pdfmeTemplateSchema,
  // Metadata
  tags: z.array(z.string()).optional(),
  tagsAr: z.array(z.string()).optional(),
  thumbnail: z.string().optional(), // Base64 or URL
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
})

// Type exports
export type TemplateCategory = z.infer<typeof templateCategorySchema>
export type TemplateType = z.infer<typeof templateTypeSchema>
export type Position = z.infer<typeof positionSchema>
export type BodyRange = z.infer<typeof bodyRangeSchema>
export type SchemaField = z.infer<typeof schemaFieldSchema>
export type BlankPdf = z.infer<typeof blankPdfSchema>
export type BasePdf = z.infer<typeof basePdfSchema>
export type PdfmeTemplate = z.infer<typeof pdfmeTemplateSchema>
export type ExtendedPdfmeTemplate = z.infer<typeof extendedPdfmeTemplateSchema>

// Convenience type for template creation (without _id, timestamps)
export const createTemplateSchema = extendedPdfmeTemplateSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>

// Convenience type for template update (partial, without _id, createdAt)
export const updateTemplateSchema = extendedPdfmeTemplateSchema
  .omit({
    _id: true,
    createdAt: true,
  })
  .partial()

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
