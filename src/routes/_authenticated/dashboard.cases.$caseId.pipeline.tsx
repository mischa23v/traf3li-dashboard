import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineDetailView } from '@/features/cases/components/case-pipeline-detail-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId/pipeline')({
  component: CasePipelineDetailView,
})
