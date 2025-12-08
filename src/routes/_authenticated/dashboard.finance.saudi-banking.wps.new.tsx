import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingWPSCreateView } from '@/features/finance/components/saudi-banking-wps-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/wps/new')({
    component: SaudiBankingWPSCreateView,
})
