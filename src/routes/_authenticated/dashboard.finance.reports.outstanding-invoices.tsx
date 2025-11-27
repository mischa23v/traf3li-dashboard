import { createFileRoute } from '@tanstack/react-router'
import { OutstandingInvoicesReport } from '@/features/finance/components/reports/outstanding-invoices-report'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/outstanding-invoices')({
    component: OutstandingInvoicesReport,
})
