import { createFileRoute } from '@tanstack/react-router'
import { CreateMaintenanceView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/maintenance/create')({
  component: CreateMaintenanceView,
})
