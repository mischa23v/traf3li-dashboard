import { createFileRoute } from '@tanstack/react-router'
import { OrganizationalStructureListView } from '@/features/hr/components/organizational-structure-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/organizational-structure/')({
  component: OrganizationalStructureListView,
})
