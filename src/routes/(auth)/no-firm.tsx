import { createFileRoute } from '@tanstack/react-router'
import NoFirmPage from '@/features/auth/no-firm'

export const Route = createFileRoute('/(auth)/no-firm')({
  component: NoFirmPage,
})
