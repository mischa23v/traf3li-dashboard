import { createFileRoute } from '@tanstack/react-router'
import { CompensationDetailsView } from '@/features/hr/components/compensation-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/compensation/$compensationId')({
  component: CompensationDetailsView,
})
