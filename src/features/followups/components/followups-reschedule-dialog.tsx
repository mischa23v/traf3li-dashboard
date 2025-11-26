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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRescheduleFollowup } from '@/hooks/useFollowups'
import { type Followup } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'

interface FollowupsRescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Followup
}

export function FollowupsRescheduleDialog({
  open,
  onOpenChange,
  currentRow,
}: FollowupsRescheduleDialogProps) {
  const { t } = useTranslation()
  const [newDueDate, setNewDueDate] = useState('')
  const [newDueTime, setNewDueTime] = useState('')
  const [reason, setReason] = useState('')

  const rescheduleFollowup = useRescheduleFollowup()

  const handleReschedule = () => {
    if (!newDueDate) return

    rescheduleFollowup.mutate(
      {
        id: currentRow._id,
        newDueDate,
        newDueTime: newDueTime || undefined,
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setNewDueDate('')
          setNewDueTime('')
          setReason('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5 text-blue-500' />
            {t('followups.rescheduleFollowup')}
          </DialogTitle>
          <DialogDescription>
            {t('followups.rescheduleFollowupDescription', { title: currentRow.title })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='newDueDate'>{t('followups.newDueDate')}</Label>
              <Input
                id='newDueDate'
                type='date'
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className='mt-1'
                required
              />
            </div>
            <div>
              <Label htmlFor='newDueTime'>{t('followups.newDueTime')}</Label>
              <Input
                id='newDueTime'
                type='time'
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className='mt-1'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='reason'>{t('followups.rescheduleReason')}</Label>
            <Textarea
              id='reason'
              placeholder={t('followups.rescheduleReasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='mt-1'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={rescheduleFollowup.isPending || !newDueDate}
          >
            <Calendar className='me-2 h-4 w-4' />
            {rescheduleFollowup.isPending
              ? t('common.loading')
              : t('followups.reschedule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
