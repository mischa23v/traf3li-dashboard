import { useTranslation } from 'react-i18next'
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
import { useEmployeesContext } from './employees-provider'
import { useDeleteEmployee } from '@/hooks/useEmployees'

export function EmployeesDeleteDialog() {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, setCurrentRow } = useEmployeesContext()
  const deleteMutation = useDeleteEmployee()

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await deleteMutation.mutateAsync(currentRow._id)
      handleClose()
    } catch (error) {
      // Error handled in mutation
    }
  }

  const handleClose = () => {
    setOpen(null)
    setCurrentRow(null)
  }

  return (
    <AlertDialog open={open === 'delete'} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('hr.employees.deleteEmployee')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('hr.employees.deleteEmployeeConfirm', {
              name: currentRow?.fullName || `${currentRow?.firstName} ${currentRow?.lastName}`,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
