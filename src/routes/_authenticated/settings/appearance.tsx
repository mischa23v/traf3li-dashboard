import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load the SettingsAppearance component for better performance
const SettingsAppearance = lazy(() =>
  import('@/features/settings/appearance').then(m => ({ default: m.SettingsAppearance }))
)

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
