import { createFileRoute } from '@tanstack/react-router'
import { ReputationOverview } from '@/features/reputation'

export const Route = createFileRoute('/_authenticated/dashboard/reputation/overview')({
  component: ReputationOverview,
})
