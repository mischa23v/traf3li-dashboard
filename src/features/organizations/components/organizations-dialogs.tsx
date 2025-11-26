import { OrganizationsActionDialog } from './organizations-action-dialog'
import { OrganizationsDeleteDialog } from './organizations-delete-dialog'
import { OrganizationsViewDialog } from './organizations-view-dialog'
import { useOrganizationsContext } from './organizations-provider'

export function OrganizationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrganizationsContext()

  return (
    <>
      <OrganizationsActionDialog
        key='organizations-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <OrganizationsViewDialog
            key={`organizations-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <OrganizationsActionDialog
            key={`organizations-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <OrganizationsDeleteDialog
            key={`organizations-delete-${currentRow._id}`}
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
