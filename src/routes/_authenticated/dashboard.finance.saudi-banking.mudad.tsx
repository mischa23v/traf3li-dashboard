import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingMudadView } from '@/features/finance/components/saudi-banking-mudad-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/mudad')({
    component: SaudiBankingMudadView,
})
