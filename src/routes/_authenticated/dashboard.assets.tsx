import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AssetsErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/assets')({
  component: AssetsLayout,
})

function AssetsLayout() {
  return (
    <AssetsErrorBoundary>
      <Outlet />
    </AssetsErrorBoundary>
  )
}
