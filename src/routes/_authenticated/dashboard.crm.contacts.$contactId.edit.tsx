import { createFileRoute } from '@tanstack/react-router'
import { ContactFormView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/contacts/$contactId/edit')({
  component: ContactFormView,
})
