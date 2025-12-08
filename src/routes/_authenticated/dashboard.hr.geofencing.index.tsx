import { createFileRoute } from '@tanstack/react-router'
import { GeofencingListView } from '@/features/hr/components/geofencing-list-view'

export const Route = createFileRoute('/dashboard/hr/geofencing/')({
  component: GeofencingListView,
})
