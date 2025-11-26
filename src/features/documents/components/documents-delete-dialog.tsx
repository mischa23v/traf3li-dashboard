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
import { useDeleteDocument } from '@/hooks/useDocuments'
import { type Document } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface DocumentsDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Document
}

export function DocumentsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DocumentsDeleteDialogProps) {
  const { t } = useTranslation()
  const deleteDocument = useDeleteDocument()

  const handleDelete = () => {
    deleteDocument.mutate(currentRow._id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('documents.deleteDocument')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('documents.deleteConfirmation', { name: currentRow.originalName })}
            {currentRow.version > 1 && (
              <span className='block mt-2 text-destructive'>
                {t('documents.deleteVersionsWarning', { count: currentRow.version })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={deleteDocument.isPending}
          >
            {deleteDocument.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
