import { createFileRoute } from '@tanstack/react-router'
import { AssetDetailsView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/$assetId')({
  component: AssetDetailsView,
})
