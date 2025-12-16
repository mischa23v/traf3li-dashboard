import { createFileRoute } from '@tanstack/react-router'
import Vehicles from '@/pages/dashboard/hr/vehicles/Vehicles'

export const Route = createFileRoute('/_authenticated/dashboard/hr/vehicles/')({
  component: Vehicles,
})
