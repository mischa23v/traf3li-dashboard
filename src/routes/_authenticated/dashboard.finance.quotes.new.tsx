import { createFileRoute } from '@tanstack/react-router'
import CreateQuoteView from '@/features/finance/components/create-quote-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/quotes/new')({
  component: CreateQuoteView,
})
