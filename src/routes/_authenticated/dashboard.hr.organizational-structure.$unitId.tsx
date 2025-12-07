import { createFileRoute } from '@tanstack/react-router'
import { OrganizationalStructureDetailsView } from '@/features/hr/components/organizational-structure-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/organizational-structure/$unitId')({
  component: OrganizationalStructureDetailsView,
})
