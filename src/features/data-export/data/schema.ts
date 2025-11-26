import { z } from 'zod'

/**
 * Export Format Schema
 */
export const exportFormatSchema = z.enum(['xlsx', 'csv', 'pdf', 'json'])
export type ExportFormat = z.infer<typeof exportFormatSchema>

/**
 * Entity Type Schema
 */
export const entityTypeSchema = z.enum([
  'clients',
  'cases',
  'contacts',
  'organizations',
  'staff',
  'invoices',
  'time_entries',
  'documents',
  'followups',
  'tags',
])
export type EntityType = z.infer<typeof entityTypeSchema>

/**
 * Export Job Status Schema
 */
export const exportJobStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed'])
export type ExportJobStatus = z.infer<typeof exportJobStatusSchema>

/**
 * Import Job Status Schema
 */
export const importJobStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed', 'partial'])
export type ImportJobStatus = z.infer<typeof importJobStatusSchema>

/**
 * Export Options Schema
 */
export const exportOptionsSchema = z.object({
  format: exportFormatSchema,
  entityType: entityTypeSchema,
  filters: z.record(z.string(), z.unknown()).optional(),
  columns: z.array(z.string()).optional(),
  includeRelated: z.boolean().optional(),
  dateRange: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .optional(),
  language: z.enum(['en', 'ar']).optional(),
})
export type ExportOptions = z.infer<typeof exportOptionsSchema>

/**
 * Export Job Schema
 */
export const exportJobSchema = z.object({
  _id: z.string(),
  entityType: entityTypeSchema,
  format: exportFormatSchema,
  status: exportJobStatusSchema,
  progress: z.number().min(0).max(100),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  totalRecords: z.number().optional(),
  error: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  expiresAt: z.string().optional(),
})
export type ExportJob = z.infer<typeof exportJobSchema>

/**
 * Import Options Schema
 */
export const importOptionsSchema = z.object({
  entityType: entityTypeSchema,
  file: z.instanceof(File),
  mapping: z.record(z.string(), z.string()).optional(),
  skipDuplicates: z.boolean().optional(),
  updateExisting: z.boolean().optional(),
  dryRun: z.boolean().optional(),
})
export type ImportOptions = z.infer<typeof importOptionsSchema>

/**
 * Import Error Schema
 */
export const importErrorSchema = z.object({
  row: z.number(),
  field: z.string(),
  message: z.string(),
})
export type ImportError = z.infer<typeof importErrorSchema>

/**
 * Import Job Schema
 */
export const importJobSchema = z.object({
  _id: z.string(),
  entityType: entityTypeSchema,
  status: importJobStatusSchema,
  progress: z.number().min(0).max(100),
  totalRecords: z.number(),
  successCount: z.number(),
  errorCount: z.number(),
  skippedCount: z.number(),
  errors: z.array(importErrorSchema).optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
})
export type ImportJob = z.infer<typeof importJobSchema>

/**
 * Import Preview Schema
 */
export const importPreviewSchema = z.object({
  columns: z.array(z.string()),
  sampleData: z.array(z.record(z.string(), z.unknown())),
  suggestedMapping: z.record(z.string(), z.string()),
  totalRows: z.number(),
})
export type ImportPreview = z.infer<typeof importPreviewSchema>

/**
 * Export Template Schema
 */
export const exportTemplateSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, 'Template name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  entityType: entityTypeSchema,
  format: exportFormatSchema,
  columns: z.array(z.string()),
  filters: z.record(z.string(), z.unknown()).optional(),
  isDefault: z.boolean().optional(),
  createdAt: z.string(),
})
export type ExportTemplate = z.infer<typeof exportTemplateSchema>

/**
 * Create Export Template Schema (for form validation)
 */
export const createExportTemplateSchema = exportTemplateSchema.omit({
  _id: true,
  createdAt: true,
})
export type CreateExportTemplateData = z.infer<typeof createExportTemplateSchema>

/**
 * Entity Column Schema
 */
export const entityColumnSchema = z.object({
  field: z.string(),
  label: z.string(),
  labelAr: z.string(),
  type: z.string().optional(),
  required: z.boolean().optional(),
})
export type EntityColumn = z.infer<typeof entityColumnSchema>
