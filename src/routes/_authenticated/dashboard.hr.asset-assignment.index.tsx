import { createFileRoute } from '@tanstack/react-router'
import { AssetAssignmentListView } from '@/features/hr/components/asset-assignment-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/asset-assignment/')({
  component: AssetAssignmentListView,
})
