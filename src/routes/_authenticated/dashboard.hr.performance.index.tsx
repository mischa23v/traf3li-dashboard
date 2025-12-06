import { createFileRoute } from '@tanstack/react-router'
import { PerformanceReviewsListView } from '@/features/hr/components/performance-reviews-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/performance/')({
  component: PerformanceReviewsListView,
})
