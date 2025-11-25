import { createFileRoute } from '@tanstack/react-router'
import { SignUpForm } from '@/features/auth/sign-up/components/sign-up-form'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUpForm,
})
