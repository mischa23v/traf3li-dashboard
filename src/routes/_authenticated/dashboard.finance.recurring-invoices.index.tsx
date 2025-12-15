import { createFileRoute } from '@tanstack/react-router'
import RecurringInvoicesList from '@/features/finance/components/recurring-invoices-list'

export const Route = createFileRoute('/_authenticated/dashboard/finance/recurring-invoices/')({
  component: RecurringInvoicesList,
})
