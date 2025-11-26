import { z } from 'zod'

// Contact type enum
export const contactTypeSchema = z.enum([
  'individual',
  'organization',
  'court',
  'attorney',
  'expert',
  'government',
  'other',
])
export type ContactType = z.infer<typeof contactTypeSchema>

// Contact category enum
export const contactCategorySchema = z.enum([
  'client_contact',
  'opposing_party',
  'witness',
  'expert_witness',
  'judge',
  'court_clerk',
  'other',
])
export type ContactCategory = z.infer<typeof contactCategorySchema>

// Contact status enum
export const contactStatusSchema = z.enum(['active', 'inactive', 'archived'])
export type ContactStatus = z.infer<typeof contactStatusSchema>

// Contact schema
export const contactSchema = z.object({
  _id: z.string(),
  lawyerId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  title: z.string().optional(), // Job title
  company: z.string().optional(),
  type: contactTypeSchema,
  category: contactCategorySchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  linkedCases: z.array(z.string()).optional(),
  linkedClients: z.array(z.string()).optional(),
  status: contactStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Contact = z.infer<typeof contactSchema>

// Create contact form schema
export const createContactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  type: contactTypeSchema,
  category: contactCategorySchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: contactStatusSchema.default('active'),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
