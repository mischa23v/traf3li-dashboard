import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingSADADPayView } from '@/features/finance/components/saudi-banking-sadad-pay-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/sadad/pay')({
    component: SaudiBankingSADADPayView,
})
