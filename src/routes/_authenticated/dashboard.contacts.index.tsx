import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Contacts } from '@/features/contacts'

const contactsSearchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('archived'),
      ])
    )
    .optional(),
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
    .optional(),
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
    .optional(),
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

  // If parsing fails, return empty object (or cached if available)
  if (!parseResult.success) {
    if (cachedSearch !== null) {
      return cachedSearch
    }
    return {} as ContactsSearch
  }

  const result = parseResult.data

  // Create a stable key for comparison (only include defined values)
  const resultKey = JSON.stringify(result, (_, v) => v === undefined ? null : v)

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
