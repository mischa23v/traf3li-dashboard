import { createFileRoute } from '@tanstack/react-router'
import { CreateInvoiceView } from '@/features/finance/components/create-invoice-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/invoices/new',
)({
    component: CreateInvoiceView,
})
