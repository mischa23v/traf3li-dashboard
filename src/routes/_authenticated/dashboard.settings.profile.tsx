import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/dashboard-settings/profile-page'

export const Route = createFileRoute('/_authenticated/dashboard/settings/profile')({
  component: ProfilePage,
})
