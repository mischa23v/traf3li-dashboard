import { z } from 'zod'

const staffStatusSchema = z.union([
  z.literal('active'),
  z.literal('departed'),
  z.literal('suspended'),
  z.literal('pending'),
  z.literal('pending_approval'),
])
export type StaffStatus = z.infer<typeof staffStatusSchema>

const staffRoleSchema = z.union([
  z.literal('owner'),
  z.literal('admin'),
  z.literal('partner'),
  z.literal('lawyer'),
  z.literal('paralegal'),
  z.literal('secretary'),
  z.literal('accountant'),
  z.literal('departed'),
])
export type StaffRole = z.infer<typeof staffRoleSchema>

const departureReasonSchema = z.union([
  z.literal('resignation'),
  z.literal('termination'),
  z.literal('retirement'),
  z.literal('transfer'),
  z.literal('other'),
])
export type DepartureReason = z.infer<typeof departureReasonSchema>

const staffSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  role: staffRoleSchema,
  previousRole: staffRoleSchema.optional(),
  avatar: z.string().optional(),
  specialization: z.string().optional(),
  status: staffStatusSchema,
  joinedAt: z.coerce.date().optional(),
  departedAt: z.coerce.date().optional().nullable(),
  departureReason: departureReasonSchema.optional().nullable(),
  departureNotes: z.string().optional().nullable(),
  assignedCases: z.array(z.string()).optional(),
  createdAt: z.coerce.date(),
})
export type Staff = z.infer<typeof staffSchema>

export const staffListSchema = z.array(staffSchema)

// Schema for processing departure
export const processDepartureSchema = z.object({
  reason: departureReasonSchema,
  notes: z.string().optional(),
})
export type ProcessDepartureData = z.infer<typeof processDepartureSchema>
