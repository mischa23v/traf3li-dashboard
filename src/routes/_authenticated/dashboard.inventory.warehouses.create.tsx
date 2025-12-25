import { createFileRoute } from '@tanstack/react-router'
import { CreateWarehouseView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/warehouses/create')({
  component: CreateWarehouseView,
})
