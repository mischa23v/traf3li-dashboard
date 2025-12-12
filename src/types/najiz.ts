/**
 * Najiz Integration Types
 * Shared TypeScript interfaces for Saudi Arabia Ministry of Justice (Najiz) integration
 *
 * These types are used by both Client and Lead models to ensure consistency
 * in handling Saudi-specific data across the application.
 */

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// IDENTITY TYPES
// ═══════════════════════════════════════════════════════════════

export type NajizIdentityType =
  | 'national_id'
  | 'iqama'
  | 'gcc_id'
  | 'passport'
  | 'border_number'
  | 'visitor_id'
  | 'temporary_id'
  | 'diplomatic_id'

export type GCCCountry = 'SA' | 'AE' | 'KW' | 'BH' | 'OM' | 'QA'

export type Gender = 'male' | 'female'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

// ═══════════════════════════════════════════════════════════════
// ARABIC NAME STRUCTURE (الاسم الرباعي)
// ═══════════════════════════════════════════════════════════════

/**
 * 4-Part Arabic Name Structure as used in Najiz system
 * Required for Saudi legal documents
 */
export interface ArabicName {
  /** الاسم الأول - First name */
  firstName?: string
  /** اسم الأب - Father's name */
  fatherName?: string
  /** اسم الجد - Grandfather's name */
  grandfatherName?: string
  /** اسم العائلة - Family name */
  familyName?: string
  /** الاسم الكامل - Auto-generated full name */
  fullName?: string
}

// Zod schema for ArabicName
export const arabicNameSchema = z.object({
  firstName: z.string().max(50).optional(),
  fatherName: z.string().max(50).optional(),
  grandfatherName: z.string().max(50).optional(),
  familyName: z.string().max(50).optional(),
  fullName: z.string().max(200).optional(),
}).optional()

// ═══════════════════════════════════════════════════════════════
// NATIONAL ADDRESS STRUCTURE (العنوان الوطني)
// ═══════════════════════════════════════════════════════════════

/**
 * Saudi National Address Structure
 * Compliant with Saudi Post requirements
 */
export interface NationalAddress {
  /** رقم المبنى - Building number (4 digits) */
  buildingNumber?: string
  /** اسم الشارع بالإنجليزية */
  streetName?: string
  /** اسم الشارع بالعربية */
  streetNameAr?: string
  /** الحي بالإنجليزية */
  district?: string
  /** الحي بالعربية */
  districtAr?: string
  /** المدينة بالإنجليزية */
  city?: string
  /** المدينة بالعربية */
  cityAr?: string
  /** المنطقة بالإنجليزية */
  region?: string
  /** المنطقة بالعربية */
  regionAr?: string
  /** رمز المنطقة (01-13) */
  regionCode?: string
  /** الرمز البريدي (5 digits) */
  postalCode?: string
  /** الرقم الإضافي (4 digits) */
  additionalNumber?: string
  /** رقم الوحدة */
  unitNumber?: string
  /** العنوان المختصر (XXXX9999) */
  shortAddress?: string
  /** خط العرض */
  latitude?: number
  /** خط الطول */
  longitude?: number
  /** التحقق من العنوان */
  isVerified?: boolean
  /** تاريخ التحقق */
  verifiedAt?: string
}

// Zod schema for NationalAddress
export const nationalAddressSchema = z.object({
  buildingNumber: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  streetName: z.string().max(100).optional(),
  streetNameAr: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  districtAr: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  cityAr: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  regionAr: z.string().max(100).optional(),
  regionCode: z.string().regex(/^(0[1-9]|1[0-3])$/).optional().or(z.literal('')),
  postalCode: z.string().regex(/^\d{5}$/).optional().or(z.literal('')),
  additionalNumber: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  unitNumber: z.string().max(10).optional(),
  shortAddress: z.string().max(8).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isVerified: z.boolean().optional(),
  verifiedAt: z.string().optional(),
}).optional()

// ═══════════════════════════════════════════════════════════════
// SPONSOR INFORMATION (for Iqama holders)
// ═══════════════════════════════════════════════════════════════

export interface Sponsor {
  /** Sponsor's name in English */
  name?: string
  /** Sponsor's name in Arabic */
  nameAr?: string
  /** Sponsor's identity number */
  identityNumber?: string
  /** Relationship to sponsor */
  relationship?: string
}

export const sponsorSchema = z.object({
  name: z.string().max(100).optional(),
  nameAr: z.string().max(100).optional(),
  identityNumber: z.string().max(20).optional(),
  relationship: z.string().max(50).optional(),
}).optional()

// ═══════════════════════════════════════════════════════════════
// PO BOX
// ═══════════════════════════════════════════════════════════════

export interface POBox {
  number?: string
  city?: string
  postalCode?: string
}

export const poBoxSchema = z.object({
  number: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
}).optional()

// ═══════════════════════════════════════════════════════════════
// NAJIZ PERSON FIELDS (Shared between Client and Lead)
// ═══════════════════════════════════════════════════════════════

/**
 * Common Najiz-compliant fields for individuals
 * Used by both Client and Lead models
 */
export interface NajizPersonFields {
  // ─── Arabic Name (الاسم الرباعي) ───
  /** Structured Arabic name */
  arabicName?: ArabicName
  /** Arabic salutation (e.g., السيد, الدكتور) */
  salutationAr?: string

  // ─── Identity Information ───
  /** Type of identity document */
  identityType?: NajizIdentityType
  /** Saudi National ID (10 digits, starts with 1) */
  nationalId?: string
  /** Iqama/Resident ID (10 digits, starts with 2) */
  iqamaNumber?: string
  /** GCC ID number */
  gccId?: string
  /** GCC Country code */
  gccCountry?: GCCCountry
  /** Border number */
  borderNumber?: string
  /** Visitor ID */
  visitorId?: string
  /** Passport number */
  passportNumber?: string
  /** Passport issuing country */
  passportCountry?: string
  /** Passport issue date */
  passportIssueDate?: string
  /** Passport expiry date */
  passportExpiryDate?: string
  /** Passport issue place */
  passportIssuePlace?: string
  /** Identity document issue date */
  identityIssueDate?: string
  /** Identity document expiry date */
  identityExpiryDate?: string
  /** Identity document issue place */
  identityIssuePlace?: string

  // ─── Personal Details ───
  /** Date of birth (Gregorian) */
  dateOfBirth?: string
  /** Date of birth (Hijri format: YYYY/MM/DD) */
  dateOfBirthHijri?: string
  /** Place of birth */
  placeOfBirth?: string
  /** Gender */
  gender?: Gender
  /** Marital status */
  maritalStatus?: MaritalStatus
  /** Nationality (country name) */
  nationality?: string
  /** Nationality code (ISO 3166-1 alpha-3) */
  nationalityCode?: string

  // ─── Addresses ───
  /** Primary national address */
  nationalAddress?: NationalAddress
  /** Work/office address */
  workAddress?: NationalAddress
  /** PO Box */
  poBox?: POBox

  // ─── Sponsor (for Iqama holders) ───
  sponsor?: Sponsor
}

// Zod schema for NajizPersonFields
export const najizPersonFieldsSchema = z.object({
  // Arabic Name
  arabicName: arabicNameSchema,
  salutationAr: z.string().max(50).optional(),

  // Identity Information
  identityType: z.enum([
    'national_id', 'iqama', 'gcc_id', 'passport',
    'border_number', 'visitor_id', 'temporary_id', 'diplomatic_id'
  ]).optional(),
  nationalId: z.string().regex(/^1\d{9}$/).optional().or(z.literal('')),
  iqamaNumber: z.string().regex(/^2\d{9}$/).optional().or(z.literal('')),
  gccId: z.string().max(20).optional(),
  gccCountry: z.enum(['SA', 'AE', 'KW', 'BH', 'OM', 'QA']).optional(),
  borderNumber: z.string().max(20).optional(),
  visitorId: z.string().max(20).optional(),
  passportNumber: z.string().max(20).optional(),
  passportCountry: z.string().max(100).optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  passportIssuePlace: z.string().max(100).optional(),
  identityIssueDate: z.string().optional(),
  identityExpiryDate: z.string().optional(),
  identityIssuePlace: z.string().max(100).optional(),

  // Personal Details
  dateOfBirth: z.string().optional(),
  dateOfBirthHijri: z.string().regex(/^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|30)$/).optional().or(z.literal('')),
  placeOfBirth: z.string().max(100).optional(),
  gender: z.enum(['male', 'female']).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  nationality: z.string().max(100).optional(),
  nationalityCode: z.string().max(3).optional(),

  // Addresses
  nationalAddress: nationalAddressSchema,
  workAddress: nationalAddressSchema,
  poBox: poBoxSchema,

  // Sponsor
  sponsor: sponsorSchema,
})

// ═══════════════════════════════════════════════════════════════
// NAJIZ COMPANY FIELDS (Shared between Client and Lead)
// ═══════════════════════════════════════════════════════════════

/**
 * Common Najiz-compliant fields for companies/organizations
 * Used by both Client and Lead models
 */
export interface NajizCompanyFields {
  // ─── Company Identification ───
  /** Commercial Registration Number (10 digits) */
  crNumber?: string
  /** Unified Number (700 number) */
  unifiedNumber?: string
  /** VAT Registration Number (15 digits, starts with 3) */
  vatNumber?: string
  /** Municipality License Number */
  municipalityLicense?: string
  /** Chamber of Commerce Number */
  chamberNumber?: string

  // ─── Company Details ───
  /** Legal form (e.g., LLC, JSC) */
  legalForm?: string
  /** Legal form in Arabic */
  legalFormAr?: string
  /** Company capital */
  capital?: number
  /** Capital currency */
  capitalCurrency?: string
  /** Date of establishment */
  establishmentDate?: string
  /** CR expiry date */
  crExpiryDate?: string

  // ─── Authorized Person ───
  /** Authorized signatory name */
  authorizedPerson?: string
  /** Authorized signatory name in Arabic */
  authorizedPersonAr?: string
  /** Authorized signatory position */
  authorizedPersonTitle?: string
  /** Authorized signatory identity type */
  authorizedPersonIdentityType?: NajizIdentityType
  /** Authorized signatory identity number */
  authorizedPersonIdentityNumber?: string

  // ─── Addresses ───
  /** Headquarters national address */
  headquartersAddress?: NationalAddress
  /** Branches addresses */
  branchAddresses?: NationalAddress[]
}

// Zod schema for NajizCompanyFields
export const najizCompanyFieldsSchema = z.object({
  // Company Identification
  crNumber: z.string().regex(/^\d{10}$/).optional().or(z.literal('')),
  unifiedNumber: z.string().max(20).optional(),
  vatNumber: z.string().regex(/^3\d{14}$/).optional().or(z.literal('')),
  municipalityLicense: z.string().max(50).optional(),
  chamberNumber: z.string().max(50).optional(),

  // Company Details
  legalForm: z.string().max(100).optional(),
  legalFormAr: z.string().max(100).optional(),
  capital: z.number().positive().optional(),
  capitalCurrency: z.string().max(10).optional(),
  establishmentDate: z.string().optional(),
  crExpiryDate: z.string().optional(),

  // Authorized Person
  authorizedPerson: z.string().max(200).optional(),
  authorizedPersonAr: z.string().max(200).optional(),
  authorizedPersonTitle: z.string().max(100).optional(),
  authorizedPersonIdentityType: z.enum([
    'national_id', 'iqama', 'gcc_id', 'passport',
    'border_number', 'visitor_id', 'temporary_id', 'diplomatic_id'
  ]).optional(),
  authorizedPersonIdentityNumber: z.string().max(20).optional(),

  // Addresses
  headquartersAddress: nationalAddressSchema,
  branchAddresses: z.array(nationalAddressSchema.unwrap()).optional(),
})

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Combined Najiz fields for entities that can be individuals or companies
 */
export type NajizFields = NajizPersonFields & NajizCompanyFields

/**
 * Type guard to check if entity is an individual
 */
export function isIndividualEntity(entity: { type?: string; clientType?: string }): boolean {
  return entity.type === 'individual' || entity.clientType === 'individual'
}

/**
 * Type guard to check if entity is a company
 */
export function isCompanyEntity(entity: { type?: string; clientType?: string }): boolean {
  return entity.type === 'company' || entity.clientType === 'company'
}
