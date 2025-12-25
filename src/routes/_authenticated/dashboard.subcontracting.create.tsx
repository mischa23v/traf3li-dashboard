import { createFileRoute } from '@tanstack/react-router'
import { CreateSubcontractingOrderView } from '@/features/subcontracting/components'

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/create')({
  component: CreateSubcontractingOrderView,
})
