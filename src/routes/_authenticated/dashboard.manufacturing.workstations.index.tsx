import { createFileRoute } from '@tanstack/react-router'
import { WorkstationListView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/workstations/')({
  component: WorkstationListView,
})
