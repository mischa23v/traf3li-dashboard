import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Payroll } from '@/features/hr/payroll'

const payrollSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('draft'),
        z.literal('pending_approval'),
        z.literal('approved'),
        z.literal('processing'),
        z.literal('completed'),
        z.literal('cancelled'),
      ])
    )
    .optional()
    .catch([]),
  // Period filter
  periodMonth: z.number().optional().catch(undefined),
  periodYear: z.number().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/')({
  validateSearch: payrollSearchSchema,
  component: Payroll,
})
