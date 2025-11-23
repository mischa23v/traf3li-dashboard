import { createFileRoute } from '@tanstack/react-router'
import StatementGenerator from '../../newdesigns/StatementGenerator'

export const Route = createFileRoute('/generate-statement')({
    component: StatementGenerator,
})
