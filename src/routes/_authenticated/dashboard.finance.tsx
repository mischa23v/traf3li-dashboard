import { createFileRoute, Outlet } from '@tanstack/react-router'
import { FinanceErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/finance')({
  component: FinanceLayout,
})

function FinanceLayout() {
  return (
    <FinanceErrorBoundary>
      <Outlet />
    </FinanceErrorBoundary>
  )
}
