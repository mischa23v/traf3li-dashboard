import { ClientsActionDialog } from './clients-action-dialog'
import { ClientsDeleteDialog } from './clients-delete-dialog'
import { ClientsViewDialog } from './clients-view-dialog'
import { useClientsContext } from './clients-provider'

export function ClientsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClientsContext()

  return (
    <>
      <ClientsActionDialog
        key='client-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ClientsViewDialog
            key={`client-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ClientsActionDialog
            key={`client-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ClientsDeleteDialog
            key={`client-delete-${currentRow._id}`}
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
