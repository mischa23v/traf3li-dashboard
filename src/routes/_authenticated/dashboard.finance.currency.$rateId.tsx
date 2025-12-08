import { createFileRoute } from '@tanstack/react-router'
import { CurrencyDetailsView } from '@/features/finance/components/currency-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/currency/$rateId')({
    component: CurrencyDetailsView,
})
