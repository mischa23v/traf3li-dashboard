import { createFileRoute } from '@tanstack/react-router'
import { EmailTemplatesView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/settings/email-templates')({
  component: EmailTemplatesView,
})
