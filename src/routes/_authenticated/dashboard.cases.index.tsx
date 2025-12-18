import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, TableSkeleton } from '@/utils/lazy-import'

// Lazy load the cases list view (heavy table with many cases)
const CasesListView = lazyImport(
  () => import('@/features/cases/components/cases-list-view').then(mod => ({ default: mod.CasesListView })),
  <TableSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/cases/')({
    component: CasesListView,
})
