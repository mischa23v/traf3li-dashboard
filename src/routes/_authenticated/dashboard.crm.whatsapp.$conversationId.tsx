import { createFileRoute } from '@tanstack/react-router'
import { WhatsAppConversationView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/whatsapp/$conversationId')({
  component: WhatsAppConversationView,
})
