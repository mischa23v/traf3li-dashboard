import { createFileRoute } from '@tanstack/react-router'
import { CurrencyCreateView } from '@/features/finance/components/currency-create-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/currency/new',
)({
    component: CurrencyCreateView,
})
