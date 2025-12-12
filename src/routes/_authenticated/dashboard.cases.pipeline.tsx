import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineListView } from '@/features/cases/components/case-pipeline-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline')({
  component: CasePipelineListView,
})
