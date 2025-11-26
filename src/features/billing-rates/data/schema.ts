import { z } from 'zod'

/**
 * Rate Type Schema
 */
export const rateTypeSchema = z.enum([
  'hourly',
  'flat',
  'contingency',
  'retainer',
  'task_based',
  'milestone',
])

export type RateType = z.infer<typeof rateTypeSchema>

/**
 * Rate Category Schema
 */
export const rateCategorySchema = z.enum([
  'consultation',
  'court_appearance',
  'document_preparation',
  'research',
  'meeting',
  'travel',
  'administrative',
  'other',
])

export type RateCategory = z.infer<typeof rateCategorySchema>

/**
 * Currency Schema
 */
export const currencySchema = z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED'])

export type Currency = z.infer<typeof currencySchema>

/**
 * Billing Rate Schema
 */
export const billingRateSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  type: rateTypeSchema,
  category: rateCategorySchema,
  amount: z.number().positive(),
  currency: currencySchema,
  unit: z.string().optional(),
  minimumCharge: z.number().optional(),
  roundingIncrement: z.number().optional(),
  isActive: z.boolean().default(true),
  groupId: z.string().optional(),
  order: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type BillingRate = z.infer<typeof billingRateSchema>

/**
 * Rate Group Schema
 */
export const rateGroupSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  color: z.string(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  discount: z.number().optional(),
  rates: z.array(billingRateSchema).default([]),
  applicableTo: z.array(z.enum(['clients', 'cases', 'services'])).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type RateGroup = z.infer<typeof rateGroupSchema>

/**
 * Time Entry Status Schema
 */
export const timeEntryStatusSchema = z.enum(['draft', 'approved', 'billed', 'paid'])

export type TimeEntryStatus = z.infer<typeof timeEntryStatusSchema>

/**
 * Time Entry Schema
 */
export const timeEntrySchema = z.object({
  _id: z.string(),
  userId: z.string(),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  rateId: z.string(),
  rate: billingRateSchema.optional(),
  description: z.string(),
  duration: z.number(),
  startTime: z.string(),
  endTime: z.string().optional(),
  date: z.string(),
  isBillable: z.boolean().default(true),
  billedAmount: z.number().optional(),
  invoiceId: z.string().optional(),
  status: timeEntryStatusSchema,
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TimeEntry = z.infer<typeof timeEntrySchema>
