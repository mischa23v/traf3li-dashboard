import { createFileRoute } from '@tanstack/react-router'
import { WhatsAppStartConversation } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/whatsapp/start')({
  component: WhatsAppStartConversation,
})
