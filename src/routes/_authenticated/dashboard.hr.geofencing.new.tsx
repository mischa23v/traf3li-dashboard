import { createFileRoute } from '@tanstack/react-router'
import { GeofencingCreateView } from '@/features/hr/components/geofencing-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/geofencing/new')({
  component: GeofencingCreateView,
})
