import { createFileRoute } from '@tanstack/react-router'
import { TimeEntriesReport } from '@/features/finance/components/reports/time-entries-report'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/time-entries')({
    component: TimeEntriesReport,
})
