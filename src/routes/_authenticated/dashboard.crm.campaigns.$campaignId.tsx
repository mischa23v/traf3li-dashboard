import { createFileRoute } from '@tanstack/react-router'
import { CampaignDetailView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/campaigns/$campaignId')({
  component: CampaignDetailView,
})
