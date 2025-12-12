import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineListView } from '@/features/cases/components/case-pipeline-list-view'

// List view as alternate view option
export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline/list')({
  component: CasePipelineListView,
})
