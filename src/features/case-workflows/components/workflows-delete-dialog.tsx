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
import { useDeleteWorkflow } from '@/hooks/useCaseWorkflows'
import type { WorkflowTemplate } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface WorkflowsDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: WorkflowTemplate
}

export function WorkflowsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: WorkflowsDeleteDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const deleteWorkflow = useDeleteWorkflow()

  const handleDelete = () => {
    deleteWorkflow.mutate(currentRow._id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('caseWorkflows.deleteWorkflow')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('caseWorkflows.deleteConfirmation', {
              name: isRTL ? currentRow.nameAr : currentRow.name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteWorkflow.isPending}
          >
            {deleteWorkflow.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
