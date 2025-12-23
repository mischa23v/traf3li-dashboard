import { createFileRoute } from '@tanstack/react-router'
import { MLAnalytics } from '@/features/ml-scoring'

export const Route = createFileRoute('/_authenticated/dashboard/ml/analytics')({
  component: MLAnalytics,
})
