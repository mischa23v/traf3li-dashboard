import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load the SettingsProfile component for better performance
const SettingsProfile = lazy(() =>
  import('@/features/settings/profile').then(m => ({ default: m.SettingsProfile }))
)

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsProfile,
})
