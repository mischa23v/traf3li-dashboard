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
import { useDeleteRateGroup } from '@/hooks/useBillingRates'
import type { RateGroup } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface GroupDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentGroup: RateGroup | null
}

export function GroupDeleteDialog({
  open,
  onOpenChange,
  currentGroup,
}: GroupDeleteDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const deleteGroup = useDeleteRateGroup()

  const handleDelete = () => {
    if (currentGroup) {
      deleteGroup.mutate(currentGroup._id, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const displayName = currentGroup
    ? isRTL
      ? currentGroup.nameAr
      : currentGroup.name
    : ''

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('billingRates.deleteGroup')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('billingRates.deleteGroupConfirmation', { name: displayName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteGroup.isPending}
          >
            {deleteGroup.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
