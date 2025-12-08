import { createFileRoute } from '@tanstack/react-router'
import { BiometricDetailsView } from '@/features/hr/components/biometric-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/biometric/$deviceId')({
  component: BiometricDetailsView,
})
