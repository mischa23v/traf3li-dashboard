import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load the SettingsDisplay component for better performance
const SettingsDisplay = lazy(() =>
  import('@/features/settings/display').then(m => ({ default: m.SettingsDisplay }))
)

export const Route = createFileRoute('/_authenticated/settings/display')({
  component: SettingsDisplay,
})
