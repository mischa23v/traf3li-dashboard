import { createFileRoute } from '@tanstack/react-router'
import { WhatsAppNewConversation } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/whatsapp/new')({
  component: WhatsAppNewConversation,
})
