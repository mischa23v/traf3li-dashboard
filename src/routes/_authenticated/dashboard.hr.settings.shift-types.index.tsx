import { createFileRoute } from '@tanstack/react-router'
import { ShiftTypesListView } from '@/features/hr/components/shift-types-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/settings/shift-types/')({
  component: ShiftTypesListView,
})
