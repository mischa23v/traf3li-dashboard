import { createFileRoute } from '@tanstack/react-router'
import { TimeEntryDetailsView } from '@/features/finance/components/time-entry-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/time-tracking/$entryId')({
    component: TimeEntryDetailsView,
})
