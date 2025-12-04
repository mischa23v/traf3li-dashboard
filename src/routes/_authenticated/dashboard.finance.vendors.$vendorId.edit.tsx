import { createFileRoute } from '@tanstack/react-router'
import { CreateVendorView } from '@/features/finance/components/create-vendor-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/vendors/$vendorId/edit')({
    component: () => <CreateVendorView mode="edit" />,
})
