import { createFileRoute } from '@tanstack/react-router'
import { LeadsListView } from '@/features/crm/components/leads-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/leads/')({
  component: LeadsListView,
})
