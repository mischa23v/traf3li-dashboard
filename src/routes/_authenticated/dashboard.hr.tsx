import { createFileRoute, Outlet } from '@tanstack/react-router'
import { HRErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/hr')({
  component: HRLayout,
})

function HRLayout() {
  return (
    <HRErrorBoundary>
      <Outlet />
    </HRErrorBoundary>
  )
}
