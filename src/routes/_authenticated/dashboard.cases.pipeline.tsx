import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineBoardView } from '@/features/cases/components/case-pipeline-board-view'

// Use board view as default (like CRM pipeline) for better visibility
export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline')({
  component: CasePipelineBoardView,
})
