import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Contacts } from '@/features/contacts'

// Stable fallback arrays - using .default() ensures these exact references are returned
// when URL params are missing, preventing the router from detecting "changes"
const EMPTY_STATUS_ARRAY: ('active' | 'inactive' | 'archived')[] = []
const EMPTY_TYPE_ARRAY: ('individual' | 'organization' | 'court' | 'attorney' | 'expert' | 'government' | 'other')[] = []
const EMPTY_CATEGORY_ARRAY: ('client_contact' | 'opposing_party' | 'witness' | 'expert_witness' | 'judge' | 'court_clerk' | 'other')[] = []

const contactsSearchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  // Facet filters - .catch() handles invalid input, .default() handles missing input
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('archived'),
      ])
    )
    .catch(EMPTY_STATUS_ARRAY)
    .default(EMPTY_STATUS_ARRAY),
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
    .catch(EMPTY_TYPE_ARRAY)
    .default(EMPTY_TYPE_ARRAY),
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
    .catch(EMPTY_CATEGORY_ARRAY)
    .default(EMPTY_CATEGORY_ARRAY),
  // Per-column text filter
  name: z.string().optional(),
})

type ContactsSearch = z.infer<typeof contactsSearchSchema>

// Structural sharing: cache the last result and return it if contents are identical
// This prevents TanStack Router from detecting "changes" when the object reference changes
let cachedSearch: ContactsSearch | null = null
let cachedSearchKey: string | null = null

function validateSearchWithStructuralSharing(search: unknown): ContactsSearch {
  // Parse the incoming search params (handles validation)
  const parseResult = contactsSearchSchema.safeParse(search)

  // If parsing fails, return cached or default
  if (!parseResult.success) {
    if (cachedSearch !== null) {
      return cachedSearch
    }
    // Return a stable default with the constant arrays
    const defaultResult: ContactsSearch = {
      status: EMPTY_STATUS_ARRAY,
      type: EMPTY_TYPE_ARRAY,
      category: EMPTY_CATEGORY_ARRAY,
    }
    cachedSearch = defaultResult
    cachedSearchKey = JSON.stringify(defaultResult)
    return defaultResult
  }

  const result = parseResult.data

  // Create a stable key for comparison
  const resultKey = JSON.stringify(result)

  // If the result is identical to cached, return the cached reference
  if (cachedSearchKey === resultKey && cachedSearch !== null) {
    return cachedSearch
  }

  // Update cache and return new result
  cachedSearch = result
  cachedSearchKey = resultKey
  return result
}

export const Route = createFileRoute('/_authenticated/dashboard/contacts/')({
  validateSearch: validateSearchWithStructuralSharing,
  component: Contacts,
})
