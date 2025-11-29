import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Salaries } from '@/features/hr/salaries'

const salariesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('pending'),
      ])
    )
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/dashboard/hr/salaries/')({
  validateSearch: salariesSearchSchema,
  component: Salaries,
})
