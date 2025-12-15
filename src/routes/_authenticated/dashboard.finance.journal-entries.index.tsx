import { createFileRoute } from '@tanstack/react-router'
import JournalEntriesDashboard from '@/features/finance/components/journal-entries-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/journal-entries/')({
  component: JournalEntriesDashboard,
})
