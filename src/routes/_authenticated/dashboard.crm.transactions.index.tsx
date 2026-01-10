import { createFileRoute } from '@tanstack/react-router'
import { CrmTransactionsView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/transactions/')({
  component: CrmTransactionsView,
})
