import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteFollowup } from '@/hooks/useFollowups'
import { type Followup } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface FollowupsDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Followup
}

export function FollowupsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: FollowupsDeleteDialogProps) {
  const { t } = useTranslation()
  const deleteFollowup = useDeleteFollowup()

  const handleDelete = () => {
    deleteFollowup.mutate(currentRow._id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('followups.deleteFollowup')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('followups.deleteConfirmation', { title: currentRow.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={deleteFollowup.isPending}
          >
            {deleteFollowup.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
