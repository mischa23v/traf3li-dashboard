import { createFileRoute } from '@tanstack/react-router'
import { ChatView } from '@/features/messages/components/chat-view'

export const Route = createFileRoute('/_authenticated/dashboard/messages/chat')({
    component: ChatView,
})
