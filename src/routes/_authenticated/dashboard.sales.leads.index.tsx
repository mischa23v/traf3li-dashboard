import { createFileRoute } from '@tanstack/react-router'
import { LeadsDashboard } from '@/features/sales/components/leads-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/sales/leads/')({
    component: LeadsDashboard,
})
