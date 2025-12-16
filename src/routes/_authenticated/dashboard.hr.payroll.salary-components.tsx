import { createFileRoute } from '@tanstack/react-router'
import SalaryComponents from '@/pages/dashboard/hr/payroll/SalaryComponents'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/salary-components')({
  component: SalaryComponents,
})
