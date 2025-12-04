import { createFileRoute } from '@tanstack/react-router'
import { CreateVendorView } from '@/features/finance/components/create-vendor-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/vendors/new',
)({
    component: () => <CreateVendorView mode="create" />,
})
