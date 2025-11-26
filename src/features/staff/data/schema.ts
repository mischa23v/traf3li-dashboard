import { z } from 'zod'

const staffStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type StaffStatus = z.infer<typeof staffStatusSchema>

const staffRoleSchema = z.union([
  z.literal('admin'),
  z.literal('lawyer'),
  z.literal('paralegal'),
  z.literal('assistant'),
])
export type StaffRole = z.infer<typeof staffRoleSchema>

const staffSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  role: staffRoleSchema,
  avatar: z.string().optional(),
  specialization: z.string().optional(),
  status: staffStatusSchema,
  createdAt: z.coerce.date(),
})
export type Staff = z.infer<typeof staffSchema>

export const staffListSchema = z.array(staffSchema)
