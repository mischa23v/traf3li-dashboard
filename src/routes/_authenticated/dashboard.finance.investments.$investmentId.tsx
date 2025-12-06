import { createFileRoute } from '@tanstack/react-router'
import InvestmentDetailsView from '@/features/finance/components/investment-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/investments/$investmentId')({
    component: InvestmentDetailsView,
})
