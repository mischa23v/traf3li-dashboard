import { createFileRoute } from '@tanstack/react-router'
import { AttendanceRecordCreateView } from '@/features/hr/components/attendance-record-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/attendance/new')({
  component: AttendanceRecordCreateView,
})
