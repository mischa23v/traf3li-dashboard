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
import { useDeleteRate } from '@/hooks/useBillingRates'
import type { BillingRate } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface RateDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRate: BillingRate | null
}

export function RateDeleteDialog({
  open,
  onOpenChange,
  currentRate,
}: RateDeleteDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const deleteRate = useDeleteRate()

  const handleDelete = () => {
    if (currentRate) {
      deleteRate.mutate(currentRate._id, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const displayName = currentRate
    ? isRTL
      ? currentRate.nameAr
      : currentRate.name
    : ''

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('billingRates.deleteRate')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('billingRates.deleteRateConfirmation', { name: displayName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteRate.isPending}
          >
            {deleteRate.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
