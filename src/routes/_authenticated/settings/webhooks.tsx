import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load the WebhooksSettings component for better performance
const WebhooksSettings = lazy(() =>
  import('@/features/settings/components/webhooks-settings').then(m => ({
    default: m.WebhooksSettings,
  }))
)

export const Route = createFileRoute('/_authenticated/settings/webhooks')({
  component: WebhooksSettings,
})
