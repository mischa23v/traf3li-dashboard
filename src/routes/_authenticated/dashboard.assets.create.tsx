import { createFileRoute } from '@tanstack/react-router'
import { CreateAssetView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/create')({
  component: CreateAssetView,
})
