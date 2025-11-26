import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Contacts } from '@/features/contacts'

const contactsSearchSchema = z.object({
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
        z.literal('individual'),
        z.literal('organization'),
        z.literal('court'),
        z.literal('attorney'),
        z.literal('expert'),
        z.literal('government'),
        z.literal('other'),
      ])
    )
    .optional()
    .catch([]),
  category: z
    .array(
      z.union([
        z.literal('client_contact'),
        z.literal('opposing_party'),
        z.literal('witness'),
        z.literal('expert_witness'),
        z.literal('judge'),
        z.literal('court_clerk'),
        z.literal('other'),
      ])
    )
    .optional()
    .catch([]),
  // Per-column text filter
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/contacts/')({
  validateSearch: contactsSearchSchema,
  component: Contacts,
})
