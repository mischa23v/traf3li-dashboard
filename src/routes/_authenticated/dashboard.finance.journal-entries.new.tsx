import { createFileRoute } from '@tanstack/react-router'
import CreateJournalEntryView from '@/features/finance/components/create-journal-entry-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/journal-entries/new')({
  component: CreateJournalEntryView,
})
