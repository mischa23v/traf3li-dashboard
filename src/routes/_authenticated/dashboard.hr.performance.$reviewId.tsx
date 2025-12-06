import { createFileRoute } from '@tanstack/react-router'
import { PerformanceReviewDetailsView } from '@/features/hr/components/performance-review-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/performance/$reviewId')({
  component: PerformanceReviewDetailsView,
})
