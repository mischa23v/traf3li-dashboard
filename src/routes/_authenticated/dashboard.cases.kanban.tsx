import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, TableSkeleton } from '@/utils/lazy-import'

// Lazy load the cases kanban view
const CasesKanbanView = lazyImport(
  () => import('@/features/cases/components/cases-kanban-view').then(mod => ({ default: mod.CasesKanbanView })),
  <TableSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/cases/kanban')({
  component: CasesKanbanView,
})
