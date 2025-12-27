import { createFileRoute, Outlet } from '@tanstack/react-router'
import { CRMErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/crm')({
  component: CRMLayout,
})

function CRMLayout() {
  return (
    <CRMErrorBoundary>
      <Outlet />
    </CRMErrorBoundary>
  )
}
