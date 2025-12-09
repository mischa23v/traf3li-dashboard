import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Staff } from '@/features/staff'

// Stable fallback arrays to prevent infinite re-renders
const EMPTY_STATUS_ARRAY: ('active' | 'inactive' | 'suspended')[] = []
const EMPTY_ROLE_ARRAY: ('lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'admin' | 'intern')[] = []

const staffSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch(EMPTY_STATUS_ARRAY),
  role: z
    .array(
      z.union([
        z.literal('lawyer'),
        z.literal('paralegal'),
        z.literal('secretary'),
        z.literal('accountant'),
        z.literal('admin'),
        z.literal('intern'),
      ])
    )
    .optional()
    .catch(EMPTY_ROLE_ARRAY),
  // Per-column text filter
  email: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/staff/')({
  validateSearch: staffSearchSchema,
  component: Staff,
})
