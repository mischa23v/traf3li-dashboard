import { createFileRoute } from '@tanstack/react-router'
import { BenefitsCreateView } from '@/features/hr/components/benefits-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/benefits/new')({
  component: BenefitsCreateView,
})
