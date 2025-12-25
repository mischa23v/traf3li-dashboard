import { createFileRoute } from '@tanstack/react-router'
import { WarehouseDetailsView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/warehouses/$warehouseId')({
  component: WarehouseDetailsView,
})
