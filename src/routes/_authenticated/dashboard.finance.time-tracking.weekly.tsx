import { createFileRoute } from '@tanstack/react-router'
import { WeeklyTimeEntriesView } from '@/features/finance/components/weekly-time-entries-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/time-tracking/weekly')({
    component: WeeklyTimeEntriesView,
})
