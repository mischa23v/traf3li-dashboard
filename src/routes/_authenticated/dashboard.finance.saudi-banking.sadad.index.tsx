import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingSADADView } from '@/features/finance/components/saudi-banking-sadad-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/sadad/')({
    component: SaudiBankingSADADView,
})
