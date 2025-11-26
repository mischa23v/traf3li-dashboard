import { createFileRoute } from '@tanstack/react-router'
import { MyServices } from '@/features/jobs'

export const Route = createFileRoute('/_authenticated/dashboard/jobs/my-services')({
  component: MyServices,
})
