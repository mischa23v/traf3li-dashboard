import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Evaluations } from '@/features/hr/evaluations'

const evaluationsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('draft'),
        z.literal('self_assessment'),
        z.literal('manager_review'),
        z.literal('hr_review'),
        z.literal('completed'),
        z.literal('acknowledged'),
      ])
    )
    .optional()
    .catch([]),
  evaluationType: z
    .array(
      z.union([
        z.literal('annual'),
        z.literal('semi_annual'),
        z.literal('quarterly'),
        z.literal('probation'),
        z.literal('project'),
        z.literal('promotion'),
        z.literal('performance_improvement'),
        z.literal('special'),
      ])
    )
    .optional()
    .catch([]),
})

export const Route = createFileRoute(
  '/_authenticated/dashboard/hr/evaluations/'
)({
  validateSearch: evaluationsSearchSchema,
  component: Evaluations,
})
