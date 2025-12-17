import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, DashboardSkeleton } from '@/utils/lazy-import'

// Lazy load the Dashboard component for better initial page load performance
const Dashboard = lazyImport(
  () => import('@/features/dashboard').then(mod => ({ default: mod.Dashboard })),
  <DashboardSkeleton />
)

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})
