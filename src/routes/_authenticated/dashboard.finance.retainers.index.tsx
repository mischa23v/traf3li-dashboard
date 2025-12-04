import { createFileRoute } from '@tanstack/react-router'
import RetainersDashboard from '@/features/finance/components/retainers-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/retainers/')({
    component: RetainersDashboard,
})
