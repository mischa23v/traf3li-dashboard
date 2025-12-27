import { createFileRoute } from '@tanstack/react-router'
import { QuoteFormView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/quotes/new')({
  component: QuoteFormView,
})
