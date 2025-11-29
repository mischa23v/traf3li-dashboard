import { EmployeesActionDialog } from './employees-action-dialog'
import { EmployeesDeleteDialog } from './employees-delete-dialog'
import { EmployeesViewDialog } from './employees-view-dialog'

export function EmployeesDialogs() {
  return (
    <>
      <EmployeesActionDialog />
      <EmployeesDeleteDialog />
      <EmployeesViewDialog />
    </>
  )
}
