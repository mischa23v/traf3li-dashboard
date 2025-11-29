import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Leaves } from '@/features/hr/leaves'

const leavesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('pending'),
        z.literal('approved'),
        z.literal('rejected'),
        z.literal('cancelled'),
      ])
    )
    .optional()
    .catch([]),
  leaveType: z
    .array(
      z.union([
        z.literal('annual'),
        z.literal('sick'),
        z.literal('unpaid'),
        z.literal('maternity'),
        z.literal('paternity'),
        z.literal('emergency'),
        z.literal('hajj'),
        z.literal('bereavement'),
        z.literal('marriage'),
        z.literal('study'),
        z.literal('other'),
      ])
    )
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/dashboard/hr/leaves/')({
  validateSearch: leavesSearchSchema,
  component: Leaves,
})
