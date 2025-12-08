import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingWPSView } from '@/features/finance/components/saudi-banking-wps-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/wps/')({
    component: SaudiBankingWPSView,
})
