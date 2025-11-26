import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Clients } from '@/features/clients'

const clientsSearchSchema = z.object({
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
  contactMethod: z
    .array(
      z.union([
        z.literal('email'),
        z.literal('phone'),
        z.literal('sms'),
        z.literal('whatsapp'),
      ])
    )
    .optional()
    .catch([]),
  // Per-column text filter
  fullName: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/clients/')({
  validateSearch: clientsSearchSchema,
  component: Clients,
})
