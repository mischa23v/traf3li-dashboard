import { createFileRoute } from '@tanstack/react-router'
import QuotesDashboard from '@/features/finance/components/quotes-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/quotes/')({
  component: QuotesDashboard,
})
