import { z } from 'zod'
import {
  arabicNameSchema,
  nationalAddressSchema,
  sponsorSchema,
  poBoxSchema,
  najizPersonFieldsSchema,
  najizCompanyFieldsSchema,
} from '@/types/najiz'

// ═══════════════════════════════════════════════════════════════
// ENUMS & STATUS TYPES
// ═══════════════════════════════════════════════════════════════

const clientStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('archived'),
  z.literal('pending'),
])
export type ClientStatus = z.infer<typeof clientStatusSchema>

const preferredContactMethodSchema = z.union([
  z.literal('email'),
  z.literal('phone'),
  z.literal('sms'),
  z.literal('whatsapp'),
])
export type PreferredContactMethod = z.infer<typeof preferredContactMethodSchema>

const clientTypeSchema = z.union([
  z.literal('individual'),
  z.literal('company'),
])
export type ClientType = z.infer<typeof clientTypeSchema>

// Identity type schema (Najiz compliant)
const identityTypeSchema = z.enum([
  'national_id',
  'iqama',
  'gcc_id',
  'passport',
  'border_number',
  'visitor_id',
  'temporary_id',
  'diplomatic_id',
]).optional()

// Gender schema
const genderSchema = z.enum(['male', 'female']).optional()

// Marital status schema
const maritalStatusSchema = z.enum(['single', 'married', 'divorced', 'widowed']).optional()

// GCC country schema
const gccCountrySchema = z.enum(['SA', 'AE', 'KW', 'BH', 'OM', 'QA']).optional()

// ═══════════════════════════════════════════════════════════════
// CLIENT SCHEMA
// ═══════════════════════════════════════════════════════════════

const clientSchema = z.object({
  _id: z.string(),
  clientNumber: z.string().optional(),
  clientType: clientTypeSchema.optional(),
  lawyerId: z.string().optional(),

  // ─── Name Fields (Individual) ───
  fullNameArabic: z.string().optional(),
  fullNameEnglish: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  preferredName: z.string().optional(),
  salutation: z.string().optional(),
  suffix: z.string().optional(),

  // ─── Arabic Name (الاسم الرباعي) - Najiz ───
  arabicName: arabicNameSchema,
  salutationAr: z.string().optional(),

  // ─── Company Fields ───
  companyName: z.string().optional(),
  companyNameEnglish: z.string().optional(),
  companyNameAr: z.string().optional(),
  crNumber: z.string().optional(),
  unifiedNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  municipalityLicense: z.string().optional(),
  chamberNumber: z.string().optional(),
  legalForm: z.string().optional(),
  legalFormAr: z.string().optional(),
  capital: z.number().optional(),
  capitalCurrency: z.string().optional(),
  establishmentDate: z.string().optional(),
  crExpiryDate: z.string().optional(),

  // ─── Authorized Person (Company) ───
  authorizedPerson: z.string().optional(),
  authorizedPersonAr: z.string().optional(),
  authorizedPersonTitle: z.string().optional(),
  authorizedPersonIdentityType: identityTypeSchema,
  authorizedPersonIdentityNumber: z.string().optional(),

  // ─── Contact Info ───
  email: z.string().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  whatsapp: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().optional(),

  // ─── Identity Information (Najiz) ───
  identityType: identityTypeSchema,
  nationalId: z.string().optional(),
  iqamaNumber: z.string().optional(),
  gccId: z.string().optional(),
  gccCountry: gccCountrySchema,
  borderNumber: z.string().optional(),
  visitorId: z.string().optional(),
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  passportIssuePlace: z.string().optional(),
  identityIssueDate: z.string().optional(),
  identityExpiryDate: z.string().optional(),
  identityIssuePlace: z.string().optional(),

  // ─── Personal Details (Najiz) ───
  dateOfBirth: z.string().optional(),
  dateOfBirthHijri: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: genderSchema,
  maritalStatus: maritalStatusSchema,
  nationality: z.string().optional(),
  nationalityCode: z.string().optional(),

  // ─── Sponsor (for Iqama holders) ───
  sponsor: sponsorSchema,

  // ─── National Address (العنوان الوطني) - Najiz ───
  nationalAddress: nationalAddressSchema,
  workAddress: nationalAddressSchema,
  poBox: poBoxSchema,
  headquartersAddress: nationalAddressSchema,
  branchAddresses: z.array(nationalAddressSchema.unwrap()).optional(),

  // ─── Legacy Address Fields ───
  address: z.union([
    z.string(),
    z.object({
      city: z.string().optional(),
      district: z.string().optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
    })
  ]).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // ─── Preferences ───
  notes: z.string().optional(),
  generalNotes: z.string().optional(),
  preferredContact: preferredContactMethodSchema.optional(),
  preferredContactMethod: preferredContactMethodSchema.optional(),
  preferredLanguage: z.string().optional(),
  language: z.string().optional(),
  bestTimeToContact: z.string().optional(),
  doNotContact: z.boolean().optional(),
  doNotEmail: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
  doNotSMS: z.boolean().optional(),

  // ─── Status & Classification ───
  status: clientStatusSchema.optional(),
  priority: z.enum(['low', 'normal', 'high', 'vip']).optional(),
  vipStatus: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  practiceAreas: z.array(z.string()).optional(),

  // ─── Risk & Conflict ───
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  isBlacklisted: z.boolean().optional(),
  blacklistReason: z.string().optional(),
  conflictCheckStatus: z.enum(['not_checked', 'clear', 'potential_conflict', 'confirmed_conflict']).optional(),
  conflictNotes: z.string().optional(),
  conflictCheckDate: z.string().optional(),
  conflictCheckedBy: z.string().optional(),

  // ─── Billing & Balance ───
  billing: z.object({
    creditBalance: z.number(),
    currency: z.string().optional(),
  }).optional(),
  totalPaid: z.number().optional(),
  totalOutstanding: z.number().optional(),
  defaultBillingRate: z.number().optional(),
  billingCurrency: z.string().optional(),
  paymentTerms: z.string().optional(),

  // ─── Conversion Tracking ───
  convertedFromLead: z.boolean().optional(),
  convertedAt: z.string().optional(),
  leadId: z.string().optional(),

  // ─── Verification Status (Wathq/MOJ) ───
  isVerified: z.boolean().optional(),
  verificationSource: z.string().optional(),
  verifiedAt: z.string().optional(),
  verificationData: z.any().optional(),

  // ─── Timestamps ───
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})

export type Client = z.infer<typeof clientSchema>

export const clientListSchema = z.array(clientSchema)

// ═══════════════════════════════════════════════════════════════
// CREATE CLIENT SCHEMA
// ═══════════════════════════════════════════════════════════════

export const createClientSchema = z.object({
  clientType: clientTypeSchema.optional(),

  // Individual fields
  fullNameArabic: z.string().optional(),
  fullNameEnglish: z.string().optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  preferredName: z.string().optional(),
  salutation: z.string().optional(),
  salutationAr: z.string().optional(),
  arabicName: arabicNameSchema,

  // Company fields
  companyName: z.string().optional(),
  companyNameEnglish: z.string().optional(),
  companyNameAr: z.string().optional(),
  crNumber: z.string().optional(),
  unifiedNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  legalForm: z.string().optional(),
  legalFormAr: z.string().optional(),
  authorizedPerson: z.string().optional(),
  authorizedPersonAr: z.string().optional(),
  authorizedPersonTitle: z.string().optional(),
  authorizedPersonIdentityType: identityTypeSchema,
  authorizedPersonIdentityNumber: z.string().optional(),

  // Contact
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  whatsapp: z.string().optional(),

  // Identity (Najiz)
  identityType: identityTypeSchema,
  nationalId: z.string().optional(),
  iqamaNumber: z.string().optional(),
  gccId: z.string().optional(),
  gccCountry: gccCountrySchema,
  borderNumber: z.string().optional(),
  visitorId: z.string().optional(),
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),

  // Personal details
  dateOfBirth: z.string().optional(),
  dateOfBirthHijri: z.string().optional(),
  gender: genderSchema,
  maritalStatus: maritalStatusSchema,
  nationality: z.string().optional(),
  nationalityCode: z.string().optional(),

  // Addresses
  nationalAddress: nationalAddressSchema,
  workAddress: nationalAddressSchema,
  headquartersAddress: nationalAddressSchema,
  poBox: poBoxSchema,
  sponsor: sponsorSchema,

  // Legacy address
  address: z.union([
    z.string(),
    z.object({
      city: z.string().optional(),
      district: z.string().optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
    })
  ]).optional(),
  city: z.string().optional(),
  country: z.string().optional(),

  // Preferences
  notes: z.string().optional(),
  generalNotes: z.string().optional(),
  preferredContact: preferredContactMethodSchema.optional(),
  preferredLanguage: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Status
  status: clientStatusSchema.optional(),
  priority: z.enum(['low', 'normal', 'high', 'vip']).optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
