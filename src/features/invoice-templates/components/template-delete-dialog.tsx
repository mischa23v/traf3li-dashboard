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
import { useDeleteTemplate } from '@/hooks/useInvoiceTemplates'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'
import { useTranslation } from 'react-i18next'

interface TemplateDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTemplate: InvoiceTemplate | null
}

export function TemplateDeleteDialog({
  open,
  onOpenChange,
  currentTemplate,
}: TemplateDeleteDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const deleteTemplate = useDeleteTemplate()

  const handleDelete = () => {
    if (currentTemplate) {
      deleteTemplate.mutate(currentTemplate._id, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const displayName = currentTemplate
    ? isRTL
      ? currentTemplate.nameAr
      : currentTemplate.name
    : ''

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('invoiceTemplates.deleteTemplate')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('invoiceTemplates.deleteConfirmation', { name: displayName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteTemplate.isPending}
          >
            {deleteTemplate.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
