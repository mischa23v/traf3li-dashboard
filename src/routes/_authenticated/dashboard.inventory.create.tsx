import { createFileRoute } from '@tanstack/react-router'
import { CreateItemView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/create')({
  component: CreateItemView,
})
