import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Organizations } from '@/features/organizations'

const organizationsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('archived'),
      ])
    )
    .optional()
    .catch([]),
  type: z
    .array(
      z.union([
        z.literal('company'),
        z.literal('government'),
        z.literal('court'),
        z.literal('law_firm'),
        z.literal('nonprofit'),
        z.literal('other'),
      ])
    )
    .optional()
    .catch([]),
  // Per-column text filter
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/organizations/')({
  validateSearch: organizationsSearchSchema,
  component: Organizations,
})
