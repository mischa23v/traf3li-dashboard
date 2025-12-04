import { createFileRoute } from '@tanstack/react-router'
import VendorsDashboard from '@/features/finance/components/vendors-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/vendors/')({
    component: VendorsDashboard,
})
