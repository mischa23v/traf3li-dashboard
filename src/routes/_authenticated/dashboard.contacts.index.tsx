import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, TableSkeleton } from '@/utils/lazy-import'

// Lazy load the contacts component (heavy table with many contacts)
const Contacts = lazyImport(
  () => import('@/features/contacts').then(mod => ({ default: mod.Contacts })),
  <TableSkeleton />
)

// Stable fallback arrays to prevent infinite re-renders
// Match the pattern used in clients route which works correctly
const EMPTY_STATUS_ARRAY: ('active' | 'inactive' | 'archived')[] = []
const EMPTY_TYPE_ARRAY: ('individual' | 'organization' | 'court' | 'attorney' | 'expert' | 'government' | 'other')[] = []
const EMPTY_CATEGORY_ARRAY: ('client_contact' | 'opposing_party' | 'witness' | 'expert_witness' | 'judge' | 'court_clerk' | 'other')[] = []

// Use the same pattern as clients route - .optional().catch(FALLBACK)
const contactsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters - match clients pattern: .optional().catch(STABLE_ARRAY)
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

// Pass the schema directly to TanStack Router - it handles structural sharing internally
// Using a wrapper function breaks the router's internal memoization
export const Route = createFileRoute('/_authenticated/dashboard/contacts/')({
  validateSearch: contactsSearchSchema,
  component: Contacts,
})
