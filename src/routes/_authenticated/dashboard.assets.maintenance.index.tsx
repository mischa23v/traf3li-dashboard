import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceListView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/maintenance/')({
  component: MaintenanceListView,
})
