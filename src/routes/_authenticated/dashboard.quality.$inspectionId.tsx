import { createFileRoute } from '@tanstack/react-router'
import { InspectionDetailsView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/$inspectionId')({
  component: InspectionDetailsView,
})
