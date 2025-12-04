import { createFileRoute } from '@tanstack/react-router'
import VendorDetailsView from '@/features/finance/components/vendor-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/vendors/$vendorId')({
    component: VendorDetailsView,
})
