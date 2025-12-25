import { createFileRoute } from '@tanstack/react-router'
import { MaterialRequestListView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/material-requests/')({
  component: MaterialRequestListView,
})
