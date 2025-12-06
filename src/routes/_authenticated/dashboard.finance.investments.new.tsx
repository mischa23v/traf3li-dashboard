import { createFileRoute } from '@tanstack/react-router'
import CreateInvestmentView from '@/features/finance/components/create-investment-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/investments/new')({
    component: CreateInvestmentView,
})
