import { createFileRoute } from '@tanstack/react-router'
import { AssetAssignmentDetailsView } from '@/features/hr/components/asset-assignment-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/asset-assignment/$assignmentId')({
  component: AssetAssignmentDetailsView,
})
