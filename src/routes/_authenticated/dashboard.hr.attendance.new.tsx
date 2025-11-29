import { createFileRoute } from '@tanstack/react-router'
import { AttendanceCreate } from '@/features/hr/attendance/attendance-create'

export const Route = createFileRoute('/_authenticated/dashboard/hr/attendance/new')({
    component: AttendanceCreate,
})
