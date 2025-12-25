import { createFileRoute } from '@tanstack/react-router'
import { CreateSupplierView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/create')({
  component: CreateSupplierView,
})
