import { createFileRoute } from '@tanstack/react-router'
import { ContactsListView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/contacts/')({
  component: ContactsListView,
})
