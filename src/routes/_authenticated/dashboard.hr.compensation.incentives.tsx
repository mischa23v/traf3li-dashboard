import { createFileRoute } from '@tanstack/react-router'
import EmployeeIncentives from '@/pages/dashboard/hr/compensation/EmployeeIncentives'

export const Route = createFileRoute('/_authenticated/dashboard/hr/compensation/incentives')({
  component: EmployeeIncentives,
})
