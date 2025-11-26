import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCompleteFollowup } from '@/hooks/useFollowups'
import { type Followup } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

interface FollowupsCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Followup
}

export function FollowupsCompleteDialog({
  open,
  onOpenChange,
  currentRow,
}: FollowupsCompleteDialogProps) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState('')

  const completeFollowup = useCompleteFollowup()

  const handleComplete = () => {
    completeFollowup.mutate(
      { id: currentRow._id, notes: notes || undefined },
      {
        onSuccess: () => {
          onOpenChange(false)
          setNotes('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Check className='h-5 w-5 text-green-500' />
            {t('followups.completeFollowup')}
          </DialogTitle>
          <DialogDescription>
            {t('followups.completeFollowupDescription', { title: currentRow.title })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='completionNotes'>{t('followups.completionNotes')}</Label>
            <Textarea
              id='completionNotes'
              placeholder={t('followups.completionNotesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='mt-1'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={completeFollowup.isPending}
            className='bg-green-600 hover:bg-green-700'
          >
            <Check className='me-2 h-4 w-4' />
            {completeFollowup.isPending
              ? t('common.loading')
              : t('followups.markComplete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
