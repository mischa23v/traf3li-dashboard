import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from '@tantml:router'
import SetupOrchestrator from '@/features/onboarding/components/setup-orchestrator'

export const Route = createFileRoute('/_authenticated/dashboard/setup-orchestrator')({
  component: SetupOrchestrator,
})
