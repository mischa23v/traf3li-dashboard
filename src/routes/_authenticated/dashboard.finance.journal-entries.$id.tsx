import { createFileRoute } from '@tanstack/react-router'
import JournalEntryDetailsView from '@/features/finance/components/journal-entry-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/journal-entries/$id')({
  component: JournalEntryDetailsView,
})
