import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load the SettingsAccount component for better performance
const SettingsAccount = lazy(() =>
  import('@/features/settings/account').then(m => ({ default: m.SettingsAccount }))
)

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: SettingsAccount,
})
