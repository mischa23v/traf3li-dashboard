import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, MapSkeleton } from '@/utils/lazy-import'

// Lazy load the heavy map component (includes Leaflet)
const GeofencingCreateView = lazyImport(
  () => import('@/features/hr/components/geofencing-create-view').then(mod => ({ default: mod.GeofencingCreateView })),
  <MapSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/hr/geofencing/new')({
  component: GeofencingCreateView,
})
