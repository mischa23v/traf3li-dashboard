import { createFileRoute } from '@tanstack/react-router'
import { CorporateCardsDashboard } from '@/features/finance/components/corporate-cards-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/corporate-cards')({
    component: CorporateCardsDashboard,
})
