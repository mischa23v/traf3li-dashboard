import { createFileRoute } from '@tanstack/react-router'
import { MaterialRequestDetailsView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/material-requests/$materialRequestId')({
  component: MaterialRequestDetailsView,
})
