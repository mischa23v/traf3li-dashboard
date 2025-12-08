import { z } from 'zod'

const clientStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('archived'),
])
export type ClientStatus = z.infer<typeof clientStatusSchema>

const preferredContactMethodSchema = z.union([
  z.literal('email'),
  z.literal('phone'),
  z.literal('sms'),
  z.literal('whatsapp'),
])
export type PreferredContactMethod = z.infer<typeof preferredContactMethodSchema>

const clientSchema = z.object({
  _id: z.string(),
  clientId: z.string(),
  lawyerId: z.string(),
  fullName: z.string(),
  email: z.string().optional(),
  phone: z.string(),
  alternatePhone: z.string().optional(),
  nationalId: z.string().optional(),
  companyName: z.string().optional(),
  companyRegistration: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string(),
  notes: z.string().optional(),
  preferredContactMethod: preferredContactMethodSchema,
  language: z.string(),
  status: clientStatusSchema,
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
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Client = z.infer<typeof clientSchema>

export const clientListSchema = z.array(clientSchema)
