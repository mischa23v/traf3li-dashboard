import { createFileRoute } from '@tanstack/react-router'
import { CampaignsListView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/campaigns/')({
  component: CampaignsListView,
})
