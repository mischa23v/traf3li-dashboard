import { createFileRoute } from '@tanstack/react-router'
import { LeadScoringDashboard } from '@/features/crm/components/lead-scoring-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/crm/lead-scoring/')({
  component: LeadScoringDashboard,
})
