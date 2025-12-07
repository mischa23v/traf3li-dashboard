import { createFileRoute } from '@tanstack/react-router'
import { AssetsDetailsView } from '@/features/hr/components/assets-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/assets/$assetId')({
  component: AssetsDetailsView,
})
