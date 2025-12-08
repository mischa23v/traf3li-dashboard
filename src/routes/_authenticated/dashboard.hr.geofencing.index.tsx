import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, MapSkeleton } from '@/utils/lazy-import'

// Lazy load the heavy map component (includes Leaflet)
const GeofencingListView = lazyImport(
  () => import('@/features/hr/components/geofencing-list-view').then(mod => ({ default: mod.GeofencingListView })),
  <MapSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/hr/geofencing/')({
  component: GeofencingListView,
})
