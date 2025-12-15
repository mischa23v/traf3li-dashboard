import { createFileRoute } from '@tanstack/react-router'
import { NotificationSettingsPage } from '@/features/notifications'

export const Route = createFileRoute('/_authenticated/dashboard/notifications/settings')({
  component: NotificationSettingsPage,
})
