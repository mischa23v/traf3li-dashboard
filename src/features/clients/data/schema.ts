import { z } from 'zod'

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

const clientSchema = z.object({
  _id: z.string(),
  clientNumber: z.string().optional(),
  clientType: clientTypeSchema.optional(),
  lawyerId: z.string().optional(),
  // Name fields - individual clients
  fullNameArabic: z.string().optional(),
  fullNameEnglish: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // Company fields
  companyName: z.string().optional(),
  companyNameEnglish: z.string().optional(),
  crNumber: z.string().optional(),
  // Contact info
  email: z.string().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  whatsapp: z.string().optional(),
  // Identification
  nationalId: z.string().optional(),
  // Address
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
  preferredContactMethod: preferredContactMethodSchema.optional(),
  preferredLanguage: z.string().optional(),
  language: z.string().optional(),
  status: clientStatusSchema.optional(),
  // Billing & Balance
  billing: z.object({
    creditBalance: z.number(),
    currency: z.string().optional(),
  }).optional(),
  totalPaid: z.number().optional(),
  totalOutstanding: z.number().optional(),
  // Conversion tracking
  convertedFromLead: z.boolean().optional(),
  convertedAt: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type Client = z.infer<typeof clientSchema>

export const clientListSchema = z.array(clientSchema)
