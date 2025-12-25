import { createFileRoute } from '@tanstack/react-router'
import { InventoryListView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/')({
  component: InventoryListView,
})
