import { createFileRoute, Outlet } from '@tanstack/react-router'
import { InventoryErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/inventory')({
  component: InventoryLayout,
})

function InventoryLayout() {
  return (
    <InventoryErrorBoundary>
      <Outlet />
    </InventoryErrorBoundary>
  )
}
