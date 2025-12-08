import { createFileRoute } from '@tanstack/react-router'
import { BiometricDashboard } from '@/features/hr/components/biometric-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/hr/biometric/')({
  component: BiometricDashboard,
})
