import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, DashboardSkeleton } from '@/utils/lazy-import'

// Lazy load the pipeline board view (heavy drag-and-drop component)
const CasePipelineBoardView = lazyImport(
  () => import('@/features/cases/components/case-pipeline-board-view').then(mod => ({ default: mod.CasePipelineBoardView })),
  <DashboardSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/cases/pipeline/board')({
  component: CasePipelineBoardView,
})
