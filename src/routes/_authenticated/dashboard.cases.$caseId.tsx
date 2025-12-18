import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, DashboardSkeleton } from '@/utils/lazy-import'

// Lazy load the case details view for better performance
const CaseDetailsView = lazyImport(
  () => import('@/features/cases/components/case-details-view').then(mod => ({ default: mod.CaseDetailsView })),
  <DashboardSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId')({
    component: CaseDetailsView,
})
