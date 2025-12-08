import { createFileRoute } from '@tanstack/react-router'
import { BiometricListView } from '@/features/hr/components/biometric-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/biometric/')({
  component: BiometricListView,
})
