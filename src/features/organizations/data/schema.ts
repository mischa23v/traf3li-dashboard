import { z } from 'zod'

// Organization type enum
export const organizationTypeSchema = z.enum([
  'company',
  'government',
  'court',
  'law_firm',
  'nonprofit',
  'other',
])
export type OrganizationType = z.infer<typeof organizationTypeSchema>

// Organization size enum
export const organizationSizeSchema = z.enum(['small', 'medium', 'large', 'enterprise'])
export type OrganizationSize = z.infer<typeof organizationSizeSchema>

// Organization status enum
export const organizationStatusSchema = z.enum(['active', 'inactive', 'archived'])
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>

// Organization schema
export const organizationSchema = z.object({
  _id: z.string(),
  lawyerId: z.string(),
  name: z.string(),
  nameAr: z.string().optional(),
  type: organizationTypeSchema,
  registrationNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  size: organizationSizeSchema.optional(),
  notes: z.string().optional(),
  linkedClients: z.array(z.string()).optional(),
  linkedContacts: z.array(z.string()).optional(),
  linkedCases: z.array(z.string()).optional(),
  status: organizationStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Organization = z.infer<typeof organizationSchema>

// Create organization form schema
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  type: organizationTypeSchema,
  registrationNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  size: organizationSizeSchema.optional(),
  notes: z.string().optional(),
  status: organizationStatusSchema.default('active'),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
