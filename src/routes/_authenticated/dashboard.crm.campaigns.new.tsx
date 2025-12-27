import { createFileRoute } from '@tanstack/react-router'
import { CampaignFormView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/campaigns/new')({
  component: CampaignFormView,
})
