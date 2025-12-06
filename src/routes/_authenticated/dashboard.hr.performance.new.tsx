import { createFileRoute } from '@tanstack/react-router'
import { PerformanceReviewCreateView } from '@/features/hr/components/performance-review-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/performance/new')({
  component: PerformanceReviewCreateView,
})
