import { createFileRoute } from '@tanstack/react-router'
import { CreateStaffView } from '@/features/staff/components/create-staff-view'

export const Route = createFileRoute('/_authenticated/dashboard/staff/new')({
    component: CreateStaffView,
})
