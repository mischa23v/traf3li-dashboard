import { createFileRoute } from '@tanstack/react-router'
import { BiometricCreateView } from '@/features/hr/components/biometric-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/biometric/new')({
  component: BiometricCreateView,
})
