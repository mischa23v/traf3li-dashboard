import { createFileRoute } from '@tanstack/react-router'
import { EmailCampaignDetailsView } from '@/features/crm/components/email-campaign-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/email-marketing/$campaignId')({
  component: EmailCampaignDetailsView,
})
