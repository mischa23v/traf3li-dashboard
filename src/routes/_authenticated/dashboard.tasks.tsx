import { createFileRoute, Outlet } from '@tanstack/react-router'
import { FeatureErrorBoundary } from '@/components/feature-error-boundary'

export const Route = createFileRoute('/_authenticated/dashboard/tasks')({
  component: TasksLayout,
})

function TasksLayout() {
  return (
    <FeatureErrorBoundary featureName="Tasks">
      <Outlet />
    </FeatureErrorBoundary>
  )
}
