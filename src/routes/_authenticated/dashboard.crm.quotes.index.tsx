import { createFileRoute } from '@tanstack/react-router'
import { QuotesListView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/quotes/')({
  component: QuotesListView,
})
