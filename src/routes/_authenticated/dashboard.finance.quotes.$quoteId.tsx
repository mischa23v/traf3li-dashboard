import { createFileRoute } from '@tanstack/react-router'
import QuoteDetailsView from '@/features/finance/components/quote-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/quotes/$quoteId')({
  component: QuoteDetailsView,
})
