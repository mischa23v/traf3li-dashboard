import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SettingsErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/settings')({
  component: SettingsLayout,
})

function SettingsLayout() {
  return (
    <SettingsErrorBoundary>
      <Outlet />
    </SettingsErrorBoundary>
  )
}
