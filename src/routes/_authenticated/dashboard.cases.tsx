import { createFileRoute, Outlet } from '@tanstack/react-router'
import { CasesErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/cases')({
  component: CasesLayout,
})

function CasesLayout() {
  return (
    <CasesErrorBoundary>
      <Outlet />
    </CasesErrorBoundary>
  )
}
