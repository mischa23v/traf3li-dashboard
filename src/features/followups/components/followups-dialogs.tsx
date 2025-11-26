import { FollowupsActionDialog } from './followups-action-dialog'
import { FollowupsViewDialog } from './followups-view-dialog'
import { FollowupsCompleteDialog } from './followups-complete-dialog'
import { FollowupsRescheduleDialog } from './followups-reschedule-dialog'
import { FollowupsDeleteDialog } from './followups-delete-dialog'
import { useFollowupsContext } from './followups-provider'

export function FollowupsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useFollowupsContext()

  return (
    <>
      <FollowupsActionDialog
        key='followups-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <FollowupsViewDialog
            key={`followups-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <FollowupsActionDialog
            key={`followups-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <FollowupsCompleteDialog
            key={`followups-complete-${currentRow._id}`}
            open={open === 'complete'}
            onOpenChange={() => {
              setOpen('complete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <FollowupsRescheduleDialog
            key={`followups-reschedule-${currentRow._id}`}
            open={open === 'reschedule'}
            onOpenChange={() => {
              setOpen('reschedule')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <FollowupsDeleteDialog
            key={`followups-delete-${currentRow._id}`}
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
