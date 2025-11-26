import { TagsActionDialog } from './tags-action-dialog'
import { TagsDeleteDialog } from './tags-delete-dialog'
import { TagsViewDialog } from './tags-view-dialog'
import { useTagsContext } from './tags-provider'

export function TagsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTagsContext()

  return (
    <>
      <TagsActionDialog
        key='tags-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <TagsViewDialog
            key={`tags-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <TagsActionDialog
            key={`tags-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <TagsDeleteDialog
            key={`tags-delete-${currentRow._id}`}
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
