import { createFileRoute } from '@tanstack/react-router'
import { OrganizationalStructureCreateView } from '@/features/hr/components/organizational-structure-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/organizational-structure/new')({
  component: OrganizationalStructureCreateView,
})
