import { createFileRoute } from '@tanstack/react-router'
import { AssetAssignmentCreateView } from '@/features/hr/components/asset-assignment-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/asset-assignment/new')({
  component: AssetAssignmentCreateView,
})
