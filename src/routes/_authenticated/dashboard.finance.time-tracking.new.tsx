import { createFileRoute } from '@tanstack/react-router'
import { CreateTimeEntryView } from '@/features/finance/components/create-time-entry-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/time-tracking/new',
)({
    component: CreateTimeEntryView,
})
