import { createFileRoute } from '@tanstack/react-router'
import { EmailView } from '@/features/messages/components/email-view'

export const Route = createFileRoute('/_authenticated/dashboard/messages/email')({
  component: EmailView,
})
