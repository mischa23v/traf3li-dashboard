import { createFileRoute } from '@tanstack/react-router'
import { EditTimeEntryView } from '@/features/finance/components/edit-time-entry-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/time-tracking/$entryId/edit')({
    component: EditTimeEntryView,
})
