import { createFileRoute } from '@tanstack/react-router'
import { CreateWorkstationView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/workstations/create')({
  component: CreateWorkstationView,
})
