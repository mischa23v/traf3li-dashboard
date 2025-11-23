import { createFileRoute } from '@tanstack/react-router'
import TimeEntriesDashboard from '@/features/finance/components/time-entries-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/time-tracking/')({
    component: TimeEntriesDashboard,
})
