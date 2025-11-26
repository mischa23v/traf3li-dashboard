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
import { useDeleteTag } from '@/hooks/useTags'
import { type Tag } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface TagsDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Tag
}

export function TagsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: TagsDeleteDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const displayName = isArabic && currentRow.nameAr ? currentRow.nameAr : currentRow.name

  const deleteTag = useDeleteTag()

  const handleDelete = () => {
    deleteTag.mutate(currentRow._id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('tags.deleteTag')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('tags.deleteTagConfirmation', { name: displayName })}
            {currentRow.usageCount && currentRow.usageCount > 0 && (
              <span className='block mt-2 text-destructive'>
                {t('tags.deleteTagWarning', { count: currentRow.usageCount })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={deleteTag.isPending}
          >
            {deleteTag.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
