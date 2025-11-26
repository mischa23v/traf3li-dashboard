import { ContactsActionDialog } from './contacts-action-dialog'
import { ContactsDeleteDialog } from './contacts-delete-dialog'
import { ContactsViewDialog } from './contacts-view-dialog'
import { useContactsContext } from './contacts-provider'

export function ContactsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useContactsContext()

  return (
    <>
      <ContactsActionDialog
        key='contacts-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ContactsViewDialog
            key={`contacts-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ContactsActionDialog
            key={`contacts-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ContactsDeleteDialog
            key={`contacts-delete-${currentRow._id}`}
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
