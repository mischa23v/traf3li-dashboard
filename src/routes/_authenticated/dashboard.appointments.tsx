/**
 * Appointments Route
 * مسار المواعيد
 */

import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load the appointments view
const AppointmentsView = lazy(() =>
  import('@/features/appointments/components/appointments-view').then((m) => ({
    default: m.AppointmentsView,
  }))
)

export const Route = createFileRoute('/_authenticated/dashboard/appointments')({
  component: AppointmentsPage,
})

function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <AppointmentsView />
    </Suspense>
  )
}
