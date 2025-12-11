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

// Contact category/role enum (backend uses primaryRole)
export const contactCategorySchema = z.enum([
  'client_contact',
  'opposing_party',
  'opposing_counsel',
  'witness',
  'expert_witness',
  'judge',
  'court_clerk',
  'mediator',
  'arbitrator',
  'referral_source',
  'vendor',
  'other',
])
export type ContactCategory = z.infer<typeof contactCategorySchema>

// Contact status enum (includes deceased)
export const contactStatusSchema = z.enum(['active', 'inactive', 'archived', 'deceased'])
export type ContactStatus = z.infer<typeof contactStatusSchema>

// Arabic name schema
const arabicNameSchema = z.object({
  firstName: z.string().optional(),
  fatherName: z.string().optional(),
  grandfatherName: z.string().optional(),
  familyName: z.string().optional(),
  fullName: z.string().optional(),
}).optional()

// Contact schema - matches backend API (all fields optional)
export const contactSchema = z.object({
  _id: z.string(),
  lawyerId: z.string().optional(),
  // Name fields
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  preferredName: z.string().optional(),
  suffix: z.string().optional(),
  fullNameArabic: z.string().optional(),
  arabicName: arabicNameSchema,
  // Contact info
  email: z.string().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  // Classification
  type: contactTypeSchema.optional(),
  category: contactCategorySchema.optional(),
  primaryRole: contactCategorySchema.optional(),
  // Employment
  title: z.string().optional(),
  company: z.string().optional(),
  organizationId: z.string().optional(),
  department: z.string().optional(),
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  // Identification
  nationalId: z.string().optional(),
  iqamaNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  // Communication preferences
  preferredLanguage: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  // Status & flags
  status: contactStatusSchema.optional(),
  priority: z.string().optional(),
  vipStatus: z.boolean().optional(),
  riskLevel: z.string().optional(),
  isBlacklisted: z.boolean().optional(),
  blacklistReason: z.string().optional(),
  // Conflict check
  conflictCheckStatus: z.string().optional(),
  conflictNotes: z.string().optional(),
  conflictCheckDate: z.string().optional(),
  // Other
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  practiceAreas: z.array(z.string()).optional(),
  linkedCases: z.array(z.string()).optional(),
  linkedClients: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Contact = z.infer<typeof contactSchema>

// Create contact form schema (all optional for backend flexibility)
export const createContactSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  type: contactTypeSchema.optional(),
  category: contactCategorySchema.optional(),
  primaryRole: contactCategorySchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: contactStatusSchema.optional(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
