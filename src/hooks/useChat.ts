import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'

// Types
export interface Message {
    _id: string
    conversationID: string
    userID: {
        _id: string
        username: string
        image?: string
        email?: string
    }
    description: string
    attachments: Array<{
        filename: string
        originalName: string
        mimetype: string
        size: number
        url: string
        type: 'image' | 'document' | 'video' | 'other'
    }>
    readBy: Array<{
        userId: {
            _id: string
            username: string
        }
        readAt: string
    }>
    isEdited: boolean
    editedAt?: string
    createdAt: string
    updatedAt: string
}

export interface Conversation {
    _id: string
    conversationID: string
    sellerID: {
        _id: string
        username: string
        image?: string
        email?: string
    }
    buyerID: {
        _id: string
        username: string
        image?: string
        email?: string
    }
    readBySeller: boolean
    readByBuyer: boolean
    lastMessage?: string
    createdAt: string
    updatedAt: string
}

// Fetch all conversations
export const useConversations = () => {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await apiClient.get('/conversations')
            return response.data as Conversation[]
        },
        staleTime: 30000, // 30 seconds
    })
}

// Fetch messages for a conversation
export const useMessages = (conversationID: string | null) => {
    return useQuery({
        queryKey: ['messages', conversationID],
        queryFn: async () => {
            if (!conversationID) return []
            const response = await apiClient.get(`/messages/${conversationID}`)
            return response.data as Message[]
        },
        enabled: !!conversationID,
        staleTime: 10000, // 10 seconds
    })
}

// Create a new conversation
export const useCreateConversation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { to: string; from: string }) => {
            const response = await apiClient.post('/conversations', data)
            return response.data as Conversation
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}

// Send a message
export const useSendMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: {
            conversationID: string
            description?: string
            files?: File[]
        }) => {
            const formData = new FormData()
            formData.append('conversationID', data.conversationID)
            if (data.description) {
                formData.append('description', data.description)
            }
            if (data.files && data.files.length > 0) {
                data.files.forEach(file => {
                    formData.append('files', file)
                })
            }

            const response = await apiClient.post('/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data as Message
        },
        onSettled: async (_, __, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationID] })
            await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}

// Mark messages as read
export const useMarkAsRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (conversationID: string) => {
            const response = await apiClient.patch(`/messages/${conversationID}/read`)
            return response.data
        },
        onSettled: async (_, __, conversationID) => {
            await queryClient.invalidateQueries({ queryKey: ['messages', conversationID] })
            await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}

// Update conversation (mark as read)
export const useUpdateConversation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (conversationID: string) => {
            const response = await apiClient.patch(`/conversations/${conversationID}`)
            return response.data as Conversation
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}

// Get single conversation
export const useSingleConversation = (sellerID: string | null, buyerID: string | null) => {
    return useQuery({
        queryKey: ['conversation', sellerID, buyerID],
        queryFn: async () => {
            if (!sellerID || !buyerID) return null
            const response = await apiClient.get(`/conversations/single/${sellerID}/${buyerID}`)
            return response.data as Conversation
        },
        enabled: !!sellerID && !!buyerID,
    })
}
