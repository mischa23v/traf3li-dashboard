import { createFileRoute } from '@tanstack/react-router'
import { EditInvoiceView } from '@/features/finance/components/edit-invoice-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/invoices/$invoiceId/edit')({
    component: EditInvoiceView,
})
