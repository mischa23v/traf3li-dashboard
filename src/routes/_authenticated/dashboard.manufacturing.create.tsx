import { createFileRoute } from '@tanstack/react-router'
import { CreateWorkOrderView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/create')({
  component: CreateWorkOrderView,
})
