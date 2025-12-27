/**
 * Shared Validation Schemas
 *
 * Comprehensive collection of reusable Zod validation schemas for the entire application.
 * Provides field-level, composite, entity-level, and form-ready validation schemas.
 *
 * Structure:
 * 1. Field Schemas - Individual reusable field validators
 * 2. Composite Schemas - Combinations of fields into logical groups
 * 3. Entity Schemas - Full entity definitions
 * 4. Form Schemas - Ready-to-use form validation schemas
 */

import { z } from 'zod'
import {
  saudiPhoneSchema,
  saudiNationalIdSchema,
  saudiIbanSchema,
  saudiCrNumberSchema,
  saudiVatNumberSchema,
} from './zod-validators'
import { validationPatterns, errorMessages } from '@/utils/validation-patterns'
import { TAX_CONFIG } from '@/config'

// ============================================================================
// FIELD SCHEMAS
// Individual reusable field validators that can be composed
// ============================================================================

export const fieldSchemas = {
  // ────────────────────────────────────────────────────────────
  // Contact Fields
  // ────────────────────────────────────────────────────────────

  /** Email field (optional) */
  email: z
    .string()
    .trim()
    .email(errorMessages.email.ar)
    .or(z.literal(''))
    .optional(),

  /** Email field (required) */
  emailRequired: z
    .string()
    .trim()
    .email(errorMessages.email.ar),

  /** Saudi phone number (optional) */
  phone: saudiPhoneSchema.optional().or(z.literal('')),

  /** Saudi phone number (required) */
  phoneRequired: saudiPhoneSchema,

  /** Alternate phone number (optional) */
  alternatePhone: saudiPhoneSchema.optional().or(z.literal('')),

  /** WhatsApp number (optional) */
  whatsapp: saudiPhoneSchema.optional().or(z.literal('')),

  /** Fax number (optional) */
  fax: z.string().optional(),

  /** Website URL (optional) */
  website: z.string().url('عنوان الموقع غير صحيح').optional().or(z.literal('')),

  // ────────────────────────────────────────────────────────────
  // Identity Fields (Saudi-specific)
  // ────────────────────────────────────────────────────────────

  /** Saudi National ID (optional) */
  nationalId: saudiNationalIdSchema.optional().or(z.literal('')),

  /** Saudi National ID (required) */
  nationalIdRequired: saudiNationalIdSchema,

  /** Iqama number (optional) */
  iqamaNumber: z.string().optional(),

  /** Passport number (optional) */
  passportNumber: z.string().optional(),

  /** GCC ID (optional) */
  gccId: z.string().optional(),

  /** Border number (optional) */
  borderNumber: z.string().optional(),

  /** Visitor ID (optional) */
  visitorId: z.string().optional(),

  /** Identity type enum */
  identityType: z.enum([
    'national_id',
    'iqama',
    'gcc_id',
    'passport',
    'border_number',
    'visitor_id',
    'temporary_id',
    'diplomatic_id',
  ]).optional(),

  // ────────────────────────────────────────────────────────────
  // Financial Fields (Saudi-specific)
  // ────────────────────────────────────────────────────────────

  /** Saudi IBAN (optional) */
  iban: saudiIbanSchema.optional().or(z.literal('')),

  /** Saudi IBAN (required) */
  ibanRequired: saudiIbanSchema,

  /** Saudi VAT number (optional) */
  vatNumber: saudiVatNumberSchema.optional().or(z.literal('')),

  /** Saudi VAT number (required) */
  vatNumberRequired: saudiVatNumberSchema,

  /** Commercial Registration number (optional) */
  crNumber: saudiCrNumberSchema.optional().or(z.literal('')),

  /** Commercial Registration number (required) */
  crNumberRequired: saudiCrNumberSchema,

  /** Unified number (optional) */
  unifiedNumber: z.string().optional(),

  /** Municipal license (optional) */
  municipalLicense: z.string().optional(),

  /** Chamber of Commerce membership number (optional) */
  chamberNumber: z.string().optional(),

  /** SWIFT/BIC code (optional) */
  swiftCode: z.string().optional(),

  // ────────────────────────────────────────────────────────────
  // Name Fields
  // ────────────────────────────────────────────────────────────

  /** Name field with minimum length (required) */
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),

  /** Name field (optional) */
  nameOptional: z.string().optional(),

  /** First name (required) */
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),

  /** First name (optional) */
  firstNameOptional: z.string().optional(),

  /** Last name (required) */
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),

  /** Last name (optional) */
  lastNameOptional: z.string().optional(),

  /** Middle name (optional) */
  middleName: z.string().optional(),

  /** Preferred name (optional) */
  preferredName: z.string().optional(),

  /** Arabic name (optional) */
  nameAr: z.string().optional(),

  /** Company name (required) */
  companyName: z.string().min(2, 'اسم الشركة مطلوب'),

  /** Company name (optional) */
  companyNameOptional: z.string().optional(),

  /** Legal name (optional) */
  legalName: z.string().optional(),

  /** Trade name (optional) */
  tradeName: z.string().optional(),

  // ────────────────────────────────────────────────────────────
  // Text Fields
  // ────────────────────────────────────────────────────────────

  /** Notes/comments (optional) */
  notes: z.string().optional(),

  /** Description (optional) */
  description: z.string().optional(),

  /** Username (required) */
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),

  /** Password (required, validated) */
  password: z
    .string()
    .min(8, errorMessages.password.ar)
    .regex(validationPatterns.password, errorMessages.password.ar),

  /** OTP code (required) */
  otp: z.string().regex(validationPatterns.otp, errorMessages.otp.ar),

  // ────────────────────────────────────────────────────────────
  // Date Fields
  // ────────────────────────────────────────────────────────────

  /** Date field (string or Date object) */
  date: z.union([z.string(), z.date()]),

  /** Date field (optional) */
  dateOptional: z.union([z.string(), z.date()]).optional(),

  /** Date field (coerced to Date object) */
  dateCoerced: z.coerce.date(),

  /** Date field (coerced, optional) */
  dateCoercedOptional: z.coerce.date().optional(),

  /** Hijri date (optional) */
  dateHijri: z.string().optional(),

  // ────────────────────────────────────────────────────────────
  // Numeric Fields
  // ────────────────────────────────────────────────────────────

  /** Positive amount (required) */
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),

  /** Non-negative amount (required) */
  amountNonNegative: z.number().nonnegative('المبلغ يجب ألا يكون سالباً'),

  /** Amount (optional) */
  amountOptional: z.number().optional(),

  /** Percentage (0-100) */
  percentage: z.number().min(0).max(100, 'النسبة يجب أن تكون بين 0 و 100'),

  /** VAT rate (0-1) */
  vatRate: z.number().min(0).max(1).default(TAX_CONFIG.SAUDI_VAT_RATE),

  /** Quantity (positive integer) */
  quantity: z.number().int().positive('الكمية يجب أن تكون أكبر من صفر'),

  /** Unit price (positive) */
  unitPrice: z.number().positive('السعر يجب أن يكون أكبر من صفر'),

  /** Credit limit (optional) */
  creditLimit: z.number().nonnegative().optional(),

  /** Capital amount (optional) */
  capital: z.number().nonnegative().optional(),

  /** Annual revenue (optional) */
  annualRevenue: z.number().nonnegative().optional(),

  /** Employee count (optional) */
  employeeCount: z.number().int().nonnegative().optional(),

  /** Payment terms (days) */
  paymentTerms: z.number().int().nonnegative().optional(),

  // ────────────────────────────────────────────────────────────
  // Currency & Location
  // ────────────────────────────────────────────────────────────

  /** Currency code (default: SAR) */
  currency: z.string().default('SAR'),

  /** Currency code (optional) */
  currencyOptional: z.string().optional(),

  /** Country code (default: SA) */
  country: z.string().default('SA'),

  /** Country code (optional) */
  countryOptional: z.string().optional(),

  /** GCC country code */
  gccCountry: z.enum(['SA', 'AE', 'KW', 'BH', 'OM', 'QA']).optional(),

  /** City name */
  city: z.string().optional(),

  /** Province/Region */
  province: z.string().optional(),

  /** District */
  district: z.string().optional(),

  /** Postal code */
  postalCode: z.string().optional(),

  /** Building number */
  buildingNumber: z.string().optional(),

  /** Street address */
  street: z.string().optional(),

  /** PO Box */
  poBox: z.string().optional(),

  // ────────────────────────────────────────────────────────────
  // Status & Classification
  // ────────────────────────────────────────────────────────────

  /** User status */
  userStatus: z.enum(['active', 'inactive', 'invited', 'suspended']),

  /** Client status */
  clientStatus: z.enum(['active', 'inactive', 'archived', 'pending']),

  /** Staff status */
  staffStatus: z.enum(['active', 'departed', 'suspended', 'pending', 'pending_approval']),

  /** Organization status */
  organizationStatus: z.enum(['active', 'inactive', 'suspended', 'dissolved', 'pending', 'archived']),

  /** Priority level */
  priority: z.enum(['low', 'normal', 'high', 'vip']).optional(),

  /** Risk level */
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),

  /** Client type */
  clientType: z.enum(['individual', 'company']),

  /** Organization type */
  organizationType: z.enum([
    'llc',
    'joint_stock',
    'partnership',
    'sole_proprietorship',
    'branch',
    'government',
    'nonprofit',
    'professional',
    'holding',
    'company',
    'court',
    'law_firm',
    'other',
  ]).optional(),

  /** Organization size */
  organizationSize: z.enum(['micro', 'small', 'medium', 'large', 'enterprise']).optional(),

  /** Gender */
  gender: z.enum(['male', 'female']).optional(),

  /** Marital status */
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),

  /** Conflict check status */
  conflictCheckStatus: z.enum([
    'not_checked',
    'clear',
    'potential_conflict',
    'confirmed_conflict',
  ]).optional(),

  /** Preferred contact method */
  preferredContactMethod: z.enum(['email', 'phone', 'sms', 'whatsapp']).optional(),

  /** Preferred language */
  preferredLanguage: z.string().optional(),

  // ────────────────────────────────────────────────────────────
  // IDs & References
  // ────────────────────────────────────────────────────────────

  /** MongoDB ObjectId */
  objectId: z.string().regex(validationPatterns.objectId, 'معرف غير صحيح'),

  /** ObjectId (optional) */
  objectIdOptional: z.string().regex(validationPatterns.objectId).optional(),

  /** Array of ObjectIds */
  objectIdArray: z.array(z.string()).optional(),

  /** Tags array */
  tags: z.array(z.string()).optional(),

  /** Practice areas array */
  practiceAreas: z.array(z.string()).optional(),

  // ────────────────────────────────────────────────────────────
  // Boolean Flags
  // ────────────────────────────────────────────────────────────

  /** VIP status flag */
  isVip: z.boolean().optional(),

  /** Blacklisted flag */
  isBlacklisted: z.boolean().optional(),

  /** Verified flag */
  isVerified: z.boolean().optional(),

  /** Primary contact flag */
  isPrimary: z.boolean().optional(),

  /** Do not contact flags */
  doNotContact: z.boolean().optional(),
  doNotEmail: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
  doNotSMS: z.boolean().optional(),
}

// ============================================================================
// COMPOSITE SCHEMAS
// Reusable combinations of fields into logical groups
// ============================================================================

export const compositeSchemas = {
  // ────────────────────────────────────────────────────────────
  // Contact Information
  // ────────────────────────────────────────────────────────────

  /** Basic contact info (all optional) */
  contactInfo: z.object({
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
    alternatePhone: fieldSchemas.alternatePhone,
    whatsapp: fieldSchemas.whatsapp,
    fax: fieldSchemas.fax,
    website: fieldSchemas.website,
  }),

  /** Contact info with required email and phone */
  contactInfoRequired: z.object({
    email: fieldSchemas.emailRequired,
    phone: fieldSchemas.phoneRequired,
    alternatePhone: fieldSchemas.alternatePhone,
    whatsapp: fieldSchemas.whatsapp,
  }),

  /** Contact preferences */
  contactPreferences: z.object({
    preferredContactMethod: fieldSchemas.preferredContactMethod,
    preferredLanguage: fieldSchemas.preferredLanguage,
    doNotContact: fieldSchemas.doNotContact,
    doNotEmail: fieldSchemas.doNotEmail,
    doNotCall: fieldSchemas.doNotCall,
    doNotSMS: fieldSchemas.doNotSMS,
  }),

  // ────────────────────────────────────────────────────────────
  // Address Information
  // ────────────────────────────────────────────────────────────

  /** Legacy address structure */
  address: z.object({
    street: fieldSchemas.street,
    buildingNumber: fieldSchemas.buildingNumber,
    district: fieldSchemas.district,
    city: fieldSchemas.city,
    province: fieldSchemas.province,
    postalCode: fieldSchemas.postalCode,
    country: fieldSchemas.country,
  }),

  /** PO Box information */
  poBox: z.object({
    poBox: fieldSchemas.poBox,
    postalCode: fieldSchemas.postalCode,
    city: fieldSchemas.city,
  }),

  // ────────────────────────────────────────────────────────────
  // Person (Individual)
  // ────────────────────────────────────────────────────────────

  /** Basic person information */
  person: z.object({
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    middleName: fieldSchemas.middleName,
    preferredName: fieldSchemas.preferredName,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
    nationalId: fieldSchemas.nationalId,
  }),

  /** Person with required contact info */
  personRequired: z.object({
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    email: fieldSchemas.emailRequired,
    phone: fieldSchemas.phoneRequired,
  }),

  /** Person with Arabic name */
  personArabic: z.object({
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    firstNameAr: fieldSchemas.nameAr,
    lastNameAr: fieldSchemas.nameAr,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
  }),

  /** Personal details (demographics) */
  personalDetails: z.object({
    dateOfBirth: fieldSchemas.dateOptional,
    dateOfBirthHijri: fieldSchemas.dateHijri,
    gender: fieldSchemas.gender,
    maritalStatus: fieldSchemas.maritalStatus,
    nationality: z.string().optional(),
    nationalityCode: z.string().optional(),
  }),

  // ────────────────────────────────────────────────────────────
  // Company/Organization
  // ────────────────────────────────────────────────────────────

  /** Basic company information */
  company: z.object({
    companyName: fieldSchemas.companyName,
    companyNameAr: fieldSchemas.nameAr,
    crNumber: fieldSchemas.crNumber,
    vatNumber: fieldSchemas.vatNumber,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
  }),

  /** Company with required fields */
  companyRequired: z.object({
    companyName: fieldSchemas.companyName,
    crNumber: fieldSchemas.crNumberRequired,
    email: fieldSchemas.emailRequired,
    phone: fieldSchemas.phoneRequired,
  }),

  /** Saudi company registration details */
  saudiCompanyRegistration: z.object({
    crNumber: fieldSchemas.crNumber,
    unifiedNumber: fieldSchemas.unifiedNumber,
    vatNumber: fieldSchemas.vatNumber,
    municipalLicense: fieldSchemas.municipalLicense,
    chamberNumber: fieldSchemas.chamberNumber,
    legalName: fieldSchemas.legalName,
    tradeName: fieldSchemas.tradeName,
  }),

  /** Company financial details */
  companyFinancials: z.object({
    capital: fieldSchemas.capital,
    annualRevenue: fieldSchemas.annualRevenue,
    creditLimit: fieldSchemas.creditLimit,
    paymentTerms: fieldSchemas.paymentTerms,
    currency: fieldSchemas.currencyOptional,
  }),

  // ────────────────────────────────────────────────────────────
  // Identity Information
  // ────────────────────────────────────────────────────────────

  /** Saudi identity information */
  saudiIdentity: z.object({
    identityType: fieldSchemas.identityType,
    nationalId: fieldSchemas.nationalId,
    iqamaNumber: fieldSchemas.iqamaNumber,
    gccId: fieldSchemas.gccId,
    gccCountry: fieldSchemas.gccCountry,
    passportNumber: fieldSchemas.passportNumber,
    passportCountry: fieldSchemas.countryOptional,
  }),

  /** Passport information */
  passport: z.object({
    passportNumber: fieldSchemas.passportNumber,
    passportCountry: fieldSchemas.countryOptional,
    passportIssueDate: fieldSchemas.dateOptional,
    passportExpiryDate: fieldSchemas.dateOptional,
    passportIssuePlace: z.string().optional(),
  }),

  // ────────────────────────────────────────────────────────────
  // Banking Information
  // ────────────────────────────────────────────────────────────

  /** Bank account details */
  bankAccount: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountHolderName: z.string().optional(),
    iban: fieldSchemas.iban,
    swiftCode: fieldSchemas.swiftCode,
  }),

  /** Bank account (required IBAN) */
  bankAccountRequired: z.object({
    bankName: z.string().min(1, 'اسم البنك مطلوب'),
    accountHolderName: z.string().min(1, 'اسم صاحب الحساب مطلوب'),
    iban: fieldSchemas.ibanRequired,
  }),

  // ────────────────────────────────────────────────────────────
  // Financial & Billing
  // ────────────────────────────────────────────────────────────

  /** Financial transaction base */
  financialTransaction: z.object({
    amount: fieldSchemas.amount,
    currency: fieldSchemas.currency,
    date: fieldSchemas.date,
    notes: fieldSchemas.notes,
  }),

  /** Billing information */
  billingInfo: z.object({
    billingEmail: fieldSchemas.email,
    billingContact: z.string().optional(),
    billingCycle: z.string().optional(),
    billingType: z.string().optional(),
    preferredPaymentMethod: z.string().optional(),
    paymentTerms: fieldSchemas.paymentTerms,
  }),

  /** Credit balance */
  creditBalance: z.object({
    creditBalance: z.number(),
    currency: fieldSchemas.currencyOptional,
  }),

  // ────────────────────────────────────────────────────────────
  // Conflict & Risk Management
  // ────────────────────────────────────────────────────────────

  /** Conflict check information */
  conflictCheck: z.object({
    conflictCheckStatus: fieldSchemas.conflictCheckStatus,
    conflictNotes: fieldSchemas.notes,
    conflictCheckDate: fieldSchemas.dateOptional,
    conflictCheckedBy: fieldSchemas.objectIdOptional,
  }),

  /** Risk assessment */
  riskAssessment: z.object({
    riskLevel: fieldSchemas.riskLevel,
    isBlacklisted: fieldSchemas.isBlacklisted,
    blacklistReason: z.string().optional(),
  }),

  // ────────────────────────────────────────────────────────────
  // Timestamps & Audit
  // ────────────────────────────────────────────────────────────

  /** Audit timestamps */
  timestamps: z.object({
    createdAt: fieldSchemas.dateCoercedOptional,
    updatedAt: fieldSchemas.dateCoercedOptional,
  }),

  /** Audit trail with user references */
  auditTrail: z.object({
    createdAt: fieldSchemas.dateCoercedOptional,
    updatedAt: fieldSchemas.dateCoercedOptional,
    createdBy: fieldSchemas.objectIdOptional,
    updatedBy: fieldSchemas.objectIdOptional,
  }),
}

// ============================================================================
// ENTITY SCHEMAS
// Full entity definitions for common business objects
// ============================================================================

export const entitySchemas = {
  // ────────────────────────────────────────────────────────────
  // Client Entities
  // ────────────────────────────────────────────────────────────

  /** Individual client */
  clientIndividual: compositeSchemas.person.extend({
    clientType: z.literal('individual'),
    status: fieldSchemas.clientStatus.optional(),
    priority: fieldSchemas.priority,
    notes: fieldSchemas.notes,
    tags: fieldSchemas.tags,
  }),

  /** Company client */
  clientCompany: compositeSchemas.company.extend({
    clientType: z.literal('company'),
    status: fieldSchemas.clientStatus.optional(),
    priority: fieldSchemas.priority,
    notes: fieldSchemas.notes,
    tags: fieldSchemas.tags,
  }),

  // ────────────────────────────────────────────────────────────
  // Vendor Entity
  // ────────────────────────────────────────────────────────────

  /** Vendor (supplier) */
  vendor: compositeSchemas.company.extend({
    ...compositeSchemas.bankAccount.shape,
    ...compositeSchemas.address.shape,
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    notes: fieldSchemas.notes,
  }),

  // ────────────────────────────────────────────────────────────
  // Employee/Staff Entities
  // ────────────────────────────────────────────────────────────

  /** Employee/Staff member */
  employee: compositeSchemas.person.extend({
    employeeId: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    specialization: z.string().optional(),
    role: z.enum([
      'owner',
      'admin',
      'partner',
      'lawyer',
      'paralegal',
      'secretary',
      'accountant',
      'departed',
    ]).optional(),
    status: fieldSchemas.staffStatus.optional(),
    hireDate: fieldSchemas.dateOptional,
    joinedAt: fieldSchemas.dateOptional,
    departedAt: fieldSchemas.dateOptional,
    ...compositeSchemas.bankAccount.shape,
  }),

  // ────────────────────────────────────────────────────────────
  // User Entity
  // ────────────────────────────────────────────────────────────

  /** System user */
  user: z.object({
    username: fieldSchemas.username,
    email: fieldSchemas.emailRequired,
    phoneNumber: fieldSchemas.phoneRequired,
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    role: z.enum(['superadmin', 'admin', 'cashier', 'manager']),
    status: fieldSchemas.userStatus,
  }),

  // ────────────────────────────────────────────────────────────
  // Organization Entity
  // ────────────────────────────────────────────────────────────

  /** Organization/Company entity */
  organization: z.object({
    // Names
    legalName: fieldSchemas.legalName,
    legalNameAr: fieldSchemas.nameAr,
    tradeName: fieldSchemas.tradeName,
    tradeNameAr: fieldSchemas.nameAr,

    // Classification
    type: fieldSchemas.organizationType,
    status: fieldSchemas.organizationStatus,
    size: fieldSchemas.organizationSize,
    industry: z.string().optional(),

    // Registration
    ...compositeSchemas.saudiCompanyRegistration.shape,

    // Contact
    ...compositeSchemas.contactInfo.shape,

    // Address
    ...compositeSchemas.address.shape,

    // Banking
    ...compositeSchemas.bankAccount.shape,

    // Financial
    ...compositeSchemas.companyFinancials.shape,

    // Metadata
    tags: fieldSchemas.tags,
    practiceAreas: fieldSchemas.practiceAreas,
    notes: fieldSchemas.notes,
  }),

  // ────────────────────────────────────────────────────────────
  // Invoice Line Item
  // ────────────────────────────────────────────────────────────

  /** Invoice line item */
  invoiceLineItem: z.object({
    description: z.string().min(1, 'الوصف مطلوب'),
    quantity: fieldSchemas.quantity,
    unitPrice: fieldSchemas.unitPrice,
    vatRate: fieldSchemas.vatRate,
    discount: fieldSchemas.percentage.optional(),
    total: fieldSchemas.amountOptional,
  }),

  // ────────────────────────────────────────────────────────────
  // Payment Entity
  // ────────────────────────────────────────────────────────────

  /** Payment record */
  payment: compositeSchemas.financialTransaction.extend({
    paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'card', 'other']),
    referenceNumber: z.string().optional(),
    receivedBy: fieldSchemas.objectIdOptional,
  }),
}

// ============================================================================
// FORM SCHEMAS
// Ready-to-use validation schemas for forms
// ============================================================================

export const formSchemas = {
  // ────────────────────────────────────────────────────────────
  // Client Forms
  // ────────────────────────────────────────────────────────────

  /** Create client (discriminated union for individual vs company) */
  createClient: z.discriminatedUnion('clientType', [
    entitySchemas.clientIndividual,
    entitySchemas.clientCompany,
  ]),

  /** Update client - all fields optional except ID */
  updateClient: z.object({
    _id: fieldSchemas.objectId,
    clientType: fieldSchemas.clientType.optional(),
    firstName: fieldSchemas.firstNameOptional,
    lastName: fieldSchemas.lastNameOptional,
    companyName: fieldSchemas.companyNameOptional,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
    status: fieldSchemas.clientStatus,
    notes: fieldSchemas.notes,
  }),

  // ────────────────────────────────────────────────────────────
  // Vendor Forms
  // ────────────────────────────────────────────────────────────

  /** Create vendor */
  createVendor: entitySchemas.vendor,

  /** Update vendor */
  updateVendor: entitySchemas.vendor.partial().extend({
    _id: fieldSchemas.objectId,
  }),

  // ────────────────────────────────────────────────────────────
  // Employee Forms
  // ────────────────────────────────────────────────────────────

  /** Create employee */
  createEmployee: entitySchemas.employee,

  /** Update employee */
  updateEmployee: entitySchemas.employee.partial().extend({
    _id: fieldSchemas.objectId,
  }),

  // ────────────────────────────────────────────────────────────
  // User Forms
  // ────────────────────────────────────────────────────────────

  /** Create user */
  createUser: entitySchemas.user.extend({
    password: fieldSchemas.password,
  }),

  /** Update user */
  updateUser: entitySchemas.user.partial().extend({
    id: fieldSchemas.objectId,
  }),

  /** Login form */
  login: z.object({
    email: fieldSchemas.emailRequired,
    password: z.string().min(1, 'كلمة المرور مطلوبة'),
  }),

  /** Register form */
  register: z.object({
    email: fieldSchemas.emailRequired,
    password: fieldSchemas.password,
    confirmPassword: z.string(),
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    phone: fieldSchemas.phoneRequired,
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'كلمات المرور غير متطابقة',
      path: ['confirmPassword'],
    }
  ),

  /** Reset password form */
  resetPassword: z.object({
    email: fieldSchemas.emailRequired,
  }),

  /** Change password form */
  changePassword: z.object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: fieldSchemas.password,
    confirmPassword: z.string(),
  }).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'كلمات المرور غير متطابقة',
      path: ['confirmPassword'],
    }
  ),

  // ────────────────────────────────────────────────────────────
  // Organization Forms
  // ────────────────────────────────────────────────────────────

  /** Create organization */
  createOrganization: entitySchemas.organization,

  /** Update organization */
  updateOrganization: entitySchemas.organization.partial().extend({
    _id: fieldSchemas.objectId,
  }),

  // ────────────────────────────────────────────────────────────
  // Invoice Forms
  // ────────────────────────────────────────────────────────────

  /** Create invoice */
  createInvoice: z.object({
    clientId: fieldSchemas.objectId,
    invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب'),
    issueDate: fieldSchemas.date,
    dueDate: fieldSchemas.date,
    lineItems: z.array(entitySchemas.invoiceLineItem).min(1, 'يجب إضافة عنصر واحد على الأقل'),
    subtotal: fieldSchemas.amount,
    vatAmount: fieldSchemas.amountNonNegative,
    total: fieldSchemas.amount,
    currency: fieldSchemas.currency,
    notes: fieldSchemas.notes,
  }),

  // ────────────────────────────────────────────────────────────
  // Payment Forms
  // ────────────────────────────────────────────────────────────

  /** Create payment */
  createPayment: entitySchemas.payment.extend({
    invoiceId: fieldSchemas.objectId.optional(),
    clientId: fieldSchemas.objectId,
  }),

  /** Record payment */
  recordPayment: z.object({
    amount: fieldSchemas.amount,
    paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'card', 'other']),
    paymentDate: fieldSchemas.date,
    referenceNumber: z.string().optional(),
    notes: fieldSchemas.notes,
  }),

  // ────────────────────────────────────────────────────────────
  // Contact Forms
  // ────────────────────────────────────────────────────────────

  /** Contact form (public) */
  contactForm: z.object({
    name: fieldSchemas.name,
    email: fieldSchemas.emailRequired,
    phone: fieldSchemas.phone,
    subject: z.string().min(1, 'الموضوع مطلوب'),
    message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
  }),

  // ────────────────────────────────────────────────────────────
  // Settings Forms
  // ────────────────────────────────────────────────────────────

  /** Profile settings */
  profileSettings: z.object({
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    email: fieldSchemas.emailRequired,
    phone: fieldSchemas.phoneRequired,
    preferredLanguage: fieldSchemas.preferredLanguage,
  }),

  /** Company settings */
  companySettings: z.object({
    companyName: fieldSchemas.companyName,
    companyNameAr: fieldSchemas.nameAr,
    crNumber: fieldSchemas.crNumber,
    vatNumber: fieldSchemas.vatNumber,
    email: fieldSchemas.emailRequired,
    phone: fieldSchemas.phoneRequired,
    ...compositeSchemas.address.shape,
    ...compositeSchemas.bankAccount.shape,
  }),
}

// ============================================================================
// HELPER FUNCTIONS
// Utility functions for common validation scenarios
// ============================================================================

/**
 * Creates a schema with all fields optional (for updates/patches)
 */
export function makeOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.partial()
}

/**
 * Creates a schema that requires an _id field (for updates)
 */
export function withId<T extends z.ZodObject<any>>(schema: T) {
  return schema.extend({
    _id: fieldSchemas.objectId,
  })
}

/**
 * Creates a schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

/**
 * Creates a schema for search/filter parameters
 */
export const searchSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  dateFrom: fieldSchemas.dateOptional,
  dateTo: fieldSchemas.dateOptional,
  tags: z.array(z.string()).optional(),
})

/**
 * Creates a schema for bulk operations
 */
export const bulkOperationSchema = z.object({
  ids: z.array(fieldSchemas.objectId).min(1, 'يجب تحديد عنصر واحد على الأقل'),
  action: z.enum(['delete', 'archive', 'activate', 'deactivate']),
})

// ============================================================================
// EXPORTS
// Export all schemas for use throughout the application
// ============================================================================

export {
  fieldSchemas,
  compositeSchemas,
  entitySchemas,
  formSchemas,
}

// Export types for common schemas
export type FieldSchemas = typeof fieldSchemas
export type CompositeSchemas = typeof compositeSchemas
export type EntitySchemas = typeof entitySchemas
export type FormSchemas = typeof formSchemas

// Export inferred types for common entities
export type ClientIndividual = z.infer<typeof entitySchemas.clientIndividual>
export type ClientCompany = z.infer<typeof entitySchemas.clientCompany>
export type Vendor = z.infer<typeof entitySchemas.vendor>
export type Employee = z.infer<typeof entitySchemas.employee>
export type User = z.infer<typeof entitySchemas.user>
export type Organization = z.infer<typeof entitySchemas.organization>
export type InvoiceLineItem = z.infer<typeof entitySchemas.invoiceLineItem>
export type Payment = z.infer<typeof entitySchemas.payment>

// Export inferred types for common forms
export type CreateClientInput = z.infer<typeof formSchemas.createClient>
export type UpdateClientInput = z.infer<typeof formSchemas.updateClient>
export type CreateVendorInput = z.infer<typeof formSchemas.createVendor>
export type CreateEmployeeInput = z.infer<typeof formSchemas.createEmployee>
export type CreateUserInput = z.infer<typeof formSchemas.createUser>
export type LoginInput = z.infer<typeof formSchemas.login>
export type RegisterInput = z.infer<typeof formSchemas.register>
export type CreateInvoiceInput = z.infer<typeof formSchemas.createInvoice>
export type CreatePaymentInput = z.infer<typeof formSchemas.createPayment>

// Default export with all schemas
export default {
  fields: fieldSchemas,
  composite: compositeSchemas,
  entities: entitySchemas,
  forms: formSchemas,
  helpers: {
    makeOptional,
    withId,
    paginationSchema,
    searchSchema,
    bulkOperationSchema,
  },
}
