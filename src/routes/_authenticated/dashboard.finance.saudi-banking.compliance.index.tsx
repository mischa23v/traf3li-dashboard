import { createFileRoute } from '@tanstack/react-router'
import { ComplianceDashboardView } from '@/features/finance/components/compliance-dashboard-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/compliance/')({
    component: ComplianceDashboardView,
})
