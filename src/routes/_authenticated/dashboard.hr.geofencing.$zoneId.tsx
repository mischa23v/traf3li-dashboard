import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, MapSkeleton } from '@/utils/lazy-import'

// Lazy load the heavy map component (includes Leaflet)
const GeofencingDetailsView = lazyImport(
  () => import('@/features/hr/components/geofencing-details-view').then(mod => ({ default: mod.GeofencingDetailsView })),
  <MapSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/hr/geofencing/$zoneId')({
  component: GeofencingDetailsView,
})
