import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Contacts } from '@/features/contacts'

// Stable fallback arrays to prevent infinite re-renders
// Using .catch([]) creates new array references on every validation,
// causing TanStack Router to detect "changes" and trigger re-validation loops
const EMPTY_STATUS_ARRAY: ('active' | 'inactive' | 'archived')[] = []
const EMPTY_TYPE_ARRAY: ('individual' | 'organization' | 'court' | 'attorney' | 'expert' | 'government' | 'other')[] = []
const EMPTY_CATEGORY_ARRAY: ('client_contact' | 'opposing_party' | 'witness' | 'expert_witness' | 'judge' | 'court_clerk' | 'other')[] = []

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
    .catch(EMPTY_STATUS_ARRAY),
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
    .catch(EMPTY_TYPE_ARRAY),
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
    .catch(EMPTY_CATEGORY_ARRAY),
  // Per-column text filter
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/contacts/')({
  validateSearch: contactsSearchSchema,
  component: Contacts,
})
