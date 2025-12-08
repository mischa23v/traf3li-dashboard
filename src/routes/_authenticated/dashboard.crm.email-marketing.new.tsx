import { createFileRoute } from '@tanstack/react-router'
import { EmailCampaignCreateView } from '@/features/crm/components/email-campaign-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/email-marketing/new')({
  component: EmailCampaignCreateView,
})
