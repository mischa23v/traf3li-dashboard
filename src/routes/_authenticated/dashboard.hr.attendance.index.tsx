import { createFileRoute } from '@tanstack/react-router'
import { AttendanceRecordsListView } from '@/features/hr/components/attendance-records-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/attendance/')({
  component: AttendanceRecordsListView,
})
