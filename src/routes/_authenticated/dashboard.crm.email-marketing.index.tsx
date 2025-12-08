import { createFileRoute } from '@tanstack/react-router'
import { EmailMarketingListView } from '@/features/crm/components/email-marketing-list-view'

export const Route = createFileRoute('/dashboard/crm/email-marketing/')({
  component: EmailMarketingListView,
})
