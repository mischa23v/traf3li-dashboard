import { createFileRoute } from '@tanstack/react-router'
import GosiChatDashboard from '../../newdesigns/GosiChatDashboard'

export const Route = createFileRoute('/gosi-chat')({
    component: GosiChatDashboard,
})
