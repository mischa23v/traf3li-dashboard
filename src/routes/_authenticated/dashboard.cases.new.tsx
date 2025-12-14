import { createFileRoute } from '@tanstack/react-router'
import { CreateCaseView } from '@/features/cases/components/create-case-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/new')({
    component: CreateCaseView,
})
