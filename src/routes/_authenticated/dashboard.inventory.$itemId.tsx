import { createFileRoute } from '@tanstack/react-router'
import { ItemDetailsView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/$itemId')({
  component: ItemDetailsView,
})
