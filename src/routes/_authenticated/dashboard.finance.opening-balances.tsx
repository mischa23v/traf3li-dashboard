import { createFileRoute } from '@tanstack/react-router'
import { OpeningBalancesView } from '@/features/finance/components/opening-balances-view'

export const Route = createFileRoute(
  '/_authenticated/dashboard/finance/opening-balances'
)({
  component: OpeningBalancesView,
})
