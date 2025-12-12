import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineListView } from '@/features/cases/components/case-pipeline-list-view'

// List view to select a case, then open its pipeline detail
export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline')({
  component: CasePipelineListView,
})
