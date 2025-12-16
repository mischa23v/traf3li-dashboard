import { createFileRoute } from '@tanstack/react-router'
import StaffingPlans from '@/pages/dashboard/hr/recruitment/StaffingPlans'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/staffing-plans')({
  component: StaffingPlans,
})
