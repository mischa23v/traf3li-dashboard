import { createFileRoute } from '@tanstack/react-router'
import { InvoiceDetailsView } from '@/features/finance/components/invoice-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/invoices/$invoiceId')({
    component: InvoiceDetailsView,
})
