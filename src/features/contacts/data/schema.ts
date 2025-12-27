import { z } from 'zod'
import { fieldSchemas } from '@/lib/shared-schemas'

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
  firstName: fieldSchemas.nameOptional,
  fatherName: fieldSchemas.nameOptional,
  grandfatherName: fieldSchemas.nameOptional,
  familyName: fieldSchemas.nameOptional,
  fullName: fieldSchemas.nameOptional,
}).optional()

// Contact schema - matches backend API (all fields optional)
export const contactSchema = z.object({
  _id: z.string(),
  lawyerId: z.string().optional(),
  // Name fields
  salutation: z.string().optional(),
  firstName: fieldSchemas.firstNameOptional,
  middleName: fieldSchemas.middleName,
  lastName: fieldSchemas.lastNameOptional,
  preferredName: fieldSchemas.preferredName,
  suffix: z.string().optional(),
  fullNameArabic: z.string().optional(),
  arabicName: arabicNameSchema,
  // Contact info
  email: fieldSchemas.email,
  phone: fieldSchemas.phone,
  alternatePhone: fieldSchemas.alternatePhone,
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
  city: fieldSchemas.city,
  district: fieldSchemas.district,
  postalCode: fieldSchemas.postalCode,
  country: fieldSchemas.countryOptional,
  // Identification
  nationalId: fieldSchemas.nationalId,
  iqamaNumber: fieldSchemas.iqamaNumber,
  passportNumber: fieldSchemas.passportNumber,
  passportCountry: fieldSchemas.countryOptional,
  dateOfBirth: fieldSchemas.dateOptional,
  nationality: z.string().optional(),
  // Communication preferences
  preferredLanguage: fieldSchemas.preferredLanguage,
  preferredContactMethod: fieldSchemas.preferredContactMethod,
  // Status & flags
  status: contactStatusSchema.optional(),
  priority: fieldSchemas.priority,
  vipStatus: fieldSchemas.isVip,
  riskLevel: fieldSchemas.riskLevel,
  isBlacklisted: fieldSchemas.isBlacklisted,
  blacklistReason: z.string().optional(),
  // Conflict check
  conflictCheckStatus: fieldSchemas.conflictCheckStatus,
  conflictNotes: fieldSchemas.notes,
  conflictCheckDate: fieldSchemas.dateOptional,
  // Other
  notes: fieldSchemas.notes,
  tags: fieldSchemas.tags,
  practiceAreas: fieldSchemas.practiceAreas,
  linkedCases: fieldSchemas.objectIdArray,
  linkedClients: fieldSchemas.objectIdArray,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Contact = z.infer<typeof contactSchema>

// Create contact form schema (all optional for backend flexibility)
export const createContactSchema = z.object({
  firstName: fieldSchemas.firstNameOptional,
  lastName: fieldSchemas.lastNameOptional,
  email: fieldSchemas.email,
  phone: fieldSchemas.phone,
  alternatePhone: fieldSchemas.alternatePhone,
  title: z.string().optional(),
  company: z.string().optional(),
  type: contactTypeSchema.optional(),
  category: contactCategorySchema.optional(),
  primaryRole: contactCategorySchema.optional(),
  address: z.string().optional(),
  city: fieldSchemas.city,
  postalCode: fieldSchemas.postalCode,
  country: fieldSchemas.countryOptional,
  notes: fieldSchemas.notes,
  tags: fieldSchemas.tags,
  status: contactStatusSchema.optional(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
