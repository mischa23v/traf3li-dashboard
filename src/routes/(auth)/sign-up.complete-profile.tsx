import { createFileRoute } from '@tanstack/react-router'
import { CompleteOAuthProfile } from '@/features/auth/sign-up/components/complete-oauth-profile'

export const Route = createFileRoute('/(auth)/sign-up/complete-profile')({
  component: CompleteOAuthProfile,
})
