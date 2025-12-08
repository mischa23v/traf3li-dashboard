import { createFileRoute } from '@tanstack/react-router'
import { CurrencyListView } from '@/features/finance/components/currency-list-view'

export const Route = createFileRoute(
  '/_authenticated/dashboard/finance/currency/'
)({
  component: CurrencyListView,
})
