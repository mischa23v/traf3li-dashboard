import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingLeanView } from '@/features/finance/components/saudi-banking-lean-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/lean')({
    component: SaudiBankingLeanView,
})
