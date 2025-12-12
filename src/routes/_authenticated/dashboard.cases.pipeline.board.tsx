import { createFileRoute } from '@tanstack/react-router'
import { CasePipelineBoardView } from '@/features/cases/components/case-pipeline-board-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline/board')({
  component: CasePipelineBoardView,
})
