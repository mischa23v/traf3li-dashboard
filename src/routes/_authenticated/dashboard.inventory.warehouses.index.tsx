import { createFileRoute } from '@tanstack/react-router'
import { WarehouseListView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/warehouses/')({
  component: WarehouseListView,
})
