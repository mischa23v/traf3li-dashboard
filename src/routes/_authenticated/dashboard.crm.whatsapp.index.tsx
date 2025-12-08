import { createFileRoute } from '@tanstack/react-router'
import { WhatsAppListView } from '@/features/crm/components/whatsapp-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/whatsapp/')({
  component: WhatsAppListView,
})
