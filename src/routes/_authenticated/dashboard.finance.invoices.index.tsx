import { createFileRoute } from '@tanstack/react-router'
import InvoicesDashboard from '@/features/finance/components/invoices-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/invoices/')({
    component: InvoicesDashboard,
})
