import { createFileRoute } from '@tanstack/react-router'
import { ReportsDashboard } from '@/features/finance/components/reports'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/')({
    component: ReportsDashboard,
})
