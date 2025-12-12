import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineView } from '@/features/cases/components/case-pipeline-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline')({
  component: CasePipelineView,
})
