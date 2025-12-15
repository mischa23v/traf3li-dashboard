import { createFileRoute } from '@tanstack/react-router'
import { InvoiceApprovalsView } from '@/features/finance/components/invoice-approvals-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/invoices/approvals')({
  component: InvoiceApprovalsView,
})
