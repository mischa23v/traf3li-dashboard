import { createFileRoute } from '@tanstack/react-router'
import { RevenueByClientReport } from '@/features/finance/components/reports'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/revenue-by-client')({
    component: RevenueByClientReport,
})
