import { z } from 'zod'

// Organization type enum
export const organizationTypeSchema = z.enum([
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
])
export type OrganizationType = z.infer<typeof organizationTypeSchema>

// Organization size enum
export const organizationSizeSchema = z.enum([
  'micro',
  'small',
  'medium',
  'large',
  'enterprise',
])
export type OrganizationSize = z.infer<typeof organizationSizeSchema>

// Organization status enum
export const organizationStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'dissolved',
  'pending',
  'archived',
])
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>

// Conflict check status enum
export const conflictCheckStatusSchema = z.enum([
  'not_checked',
  'clear',
  'potential_conflict',
  'confirmed_conflict',
])
export type ConflictCheckStatus = z.infer<typeof conflictCheckStatusSchema>

// Key contact schema
const keyContactSchema = z.object({
  contactId: z.string(),
  role: z.string().optional(),
  isPrimary: z.boolean().optional(),
})

// Organization schema - matches backend API
export const organizationSchema = z.object({
  _id: z.string(),
  lawyerId: z.string().optional(),
  firmId: z.string().optional(),
  // Legal names
  legalName: z.string().optional(),
  legalNameAr: z.string().optional(),
  tradeName: z.string().optional(),
  tradeNameAr: z.string().optional(),
  name: z.string().optional(),
  nameAr: z.string().optional(),
  // Classification
  type: organizationTypeSchema.optional(),
  status: organizationStatusSchema.optional(),
  industry: z.string().optional(),
  subIndustry: z.string().optional(),
  size: organizationSizeSchema.optional(),
  employeeCount: z.number().optional(),
  // Saudi Registration
  commercialRegistration: z.string().optional(),
  crIssueDate: z.string().optional(),
  crExpiryDate: z.string().optional(),
  crIssuingCity: z.string().optional(),
  vatNumber: z.string().optional(),
  unifiedNumber: z.string().optional(),
  municipalLicense: z.string().optional(),
  chamberMembership: z.string().optional(),
  // Contact info
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  // Address
  address: z.string().optional(),
  buildingNumber: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  nationalAddress: z.string().optional(),
  poBox: z.string().optional(),
  // Corporate structure
  parentCompany: z.string().optional(),
  subsidiaries: z.array(z.string()).optional(),
  foundedDate: z.string().optional(),
  // Financial
  capital: z.number().optional(),
  annualRevenue: z.number().optional(),
  creditLimit: z.number().optional(),
  paymentTerms: z.number().optional(),
  // Banking
  bankName: z.string().optional(),
  iban: z.string().optional(),
  accountHolderName: z.string().optional(),
  swiftCode: z.string().optional(),
  // Billing
  billingType: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
  billingCycle: z.string().optional(),
  billingEmail: z.string().optional(),
  billingContact: z.string().optional(),
  // Conflict check
  conflictCheckStatus: conflictCheckStatusSchema.optional(),
  conflictNotes: z.string().optional(),
  conflictCheckDate: z.string().optional(),
  conflictCheckedBy: z.string().optional(),
  // Key contacts
  keyContacts: z.array(keyContactSchema).optional(),
  // Linked entities
  linkedClients: z.array(z.string()).optional(),
  linkedContacts: z.array(z.string()).optional(),
  linkedCases: z.array(z.string()).optional(),
  // Tags & Notes
  tags: z.array(z.string()).optional(),
  practiceAreas: z.array(z.string()).optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Organization = z.infer<typeof organizationSchema>
