import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Organizations } from '@/features/organizations'

const EMPTY_STATUS_ARRAY: ('active' | 'inactive' | 'archived')[] = []
const EMPTY_TYPE_ARRAY: ('company' | 'government' | 'court' | 'law_firm' | 'nonprofit' | 'other')[] = []

const organizationsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('archived'),
      ])
    )
    .optional()
    .catch(EMPTY_STATUS_ARRAY),
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
    .catch(EMPTY_TYPE_ARRAY),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/organizations/')({
  validateSearch: organizationsSearchSchema,
  component: Organizations,
})
