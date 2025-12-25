import { createFileRoute } from '@tanstack/react-router'
import { SupplierDetailsView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/$supplierId')({
  component: SupplierDetailsView,
})
