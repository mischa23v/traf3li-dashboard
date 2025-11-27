import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateConversation, useSendMessage } from '@/hooks/useChat'
import { useAuthStore } from '@/stores/auth-store'

type NewChatProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChat({ onOpenChange, open }: NewChatProps) {
  const [recipientId, setRecipientId] = useState('')
  const [initialMessage, setInitialMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const user = useAuthStore((state) => state.user)
  const createConversation = useCreateConversation()
  const sendMessage = useSendMessage()

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    // Reset form when dialog closes
    if (!newOpen) {
      setRecipientId('')
      setInitialMessage('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientId.trim()) {
      toast.error('Please enter a recipient ID')
      return
    }

    if (!user?._id) {
      toast.error('You must be logged in to start a conversation')
      return
    }

    setIsSubmitting(true)

    try {
      // Create the conversation
      const conversation = await createConversation.mutateAsync({
        to: recipientId.trim(),
        from: user._id,
      })

      // If there's an initial message, send it
      if (initialMessage.trim() && conversation.conversationID) {
        await sendMessage.mutateAsync({
          conversationID: conversation.conversationID,
          description: initialMessage.trim(),
        })
      }

      toast.success('Conversation created successfully')
      handleOpenChange(false)
    } catch (error: any) {
      console.error('Failed to create conversation:', error)
      toast.error(error.message || 'Failed to create conversation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='recipientId'>Recipient ID</Label>
            <Input
              id='recipientId'
              placeholder='Enter user ID to start a conversation'
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={isSubmitting}
            />
            <p className='text-muted-foreground text-xs'>
              Enter the user ID of the person you want to chat with
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='initialMessage'>Initial Message (optional)</Label>
            <Textarea
              id='initialMessage'
              placeholder='Type your first message...'
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          <Button
            type='submit'
            disabled={!recipientId.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Start Conversation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
