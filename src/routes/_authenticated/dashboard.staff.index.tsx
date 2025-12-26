import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Staff } from '@/features/staff'

// Stable fallback arrays to prevent infinite re-renders
const EMPTY_STATUS_ARRAY: ('active' | 'departed' | 'suspended' | 'pending' | 'pending_approval')[] = []
const EMPTY_ROLE_ARRAY: ('owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'departed')[] = []

const staffSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('departed'),
        z.literal('suspended'),
        z.literal('pending'),
        z.literal('pending_approval'),
      ])
    )
    .optional()
    .catch(EMPTY_STATUS_ARRAY),
  role: z
    .array(
      z.union([
        z.literal('owner'),
        z.literal('admin'),
        z.literal('partner'),
        z.literal('lawyer'),
        z.literal('paralegal'),
        z.literal('secretary'),
        z.literal('accountant'),
        z.literal('departed'),
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
