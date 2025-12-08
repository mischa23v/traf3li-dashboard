import { createFileRoute } from '@tanstack/react-router'
import { GeofencingDetailsView } from '@/features/hr/components/geofencing-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/geofencing/$zoneId')({
  component: GeofencingDetailsView,
})
