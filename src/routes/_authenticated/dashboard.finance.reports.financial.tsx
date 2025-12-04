import { createFileRoute } from '@tanstack/react-router'
import FinancialReportsDashboard from '@/features/finance/components/reports/financial-reports-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/financial')({
    component: FinancialReportsDashboard,
})
