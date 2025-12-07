import { createFileRoute } from '@tanstack/react-router'
import { AdvancesCreateView } from '@/features/hr/components/advances-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/advances/new')({
  component: AdvancesCreateView,
})
