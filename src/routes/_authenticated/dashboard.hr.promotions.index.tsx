import { createFileRoute } from '@tanstack/react-router'
import { EmployeePromotionsListView } from '@/features/hr/components/employee-promotions-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/promotions/')({
  component: EmployeePromotionsListView,
})
