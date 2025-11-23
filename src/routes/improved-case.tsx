import { createFileRoute } from '@tanstack/react-router'
import ImprovedCaseManagement from '../../newdesigns/ImprovedCaseManagement'

export const Route = createFileRoute('/improved-case')({
    component: ImprovedCaseManagement,
})
