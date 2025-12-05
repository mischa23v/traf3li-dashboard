import { StaffActionDialog } from './staff-action-dialog'
import { StaffDeleteDialog } from './staff-delete-dialog'
import { StaffViewDialog } from './staff-view-dialog'
import { StaffDepartureDialog } from './staff-departure-dialog'
import { StaffReinstateDialog } from './staff-reinstate-dialog'
import { useStaffContext } from './staff-provider'

export function StaffDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStaffContext()

  return (
    <>
      <StaffActionDialog
        key='staff-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {/* Departure and Reinstate dialogs */}
      <StaffDepartureDialog />
      <StaffReinstateDialog />

      {currentRow && (
        <>
          <StaffViewDialog
            key={`staff-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <StaffActionDialog
            key={`staff-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <StaffDeleteDialog
            key={`staff-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
