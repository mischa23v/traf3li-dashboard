import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load the SettingsNotifications component for better performance
const SettingsNotifications = lazy(() =>
  import('@/features/settings/notifications').then(m => ({ default: m.SettingsNotifications }))
)

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
