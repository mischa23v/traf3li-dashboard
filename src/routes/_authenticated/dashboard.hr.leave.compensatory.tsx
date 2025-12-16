import { createFileRoute } from '@tanstack/react-router'
import CompensatoryLeave from '@/pages/dashboard/hr/leave/CompensatoryLeave'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/compensatory')({
  component: CompensatoryLeave,
})
