import { createFileRoute } from '@tanstack/react-router'
import EmailSettings from '@/features/settings/components/email-settings'

export const Route = createFileRoute('/_authenticated/settings/email')({
  component: EmailSettings,
})
