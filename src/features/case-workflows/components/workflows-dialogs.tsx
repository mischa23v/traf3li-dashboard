import { WorkflowsActionDialog } from './workflows-action-dialog'
import { WorkflowsViewDialog } from './workflows-view-dialog'
import { WorkflowsDeleteDialog } from './workflows-delete-dialog'
import { WorkflowsDuplicateDialog } from './workflows-duplicate-dialog'
import { WorkflowsStagesDialog } from './workflows-stages-dialog'
import { useWorkflowsContext } from './workflows-provider'

export function WorkflowsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useWorkflowsContext()

  return (
    <>
      <WorkflowsActionDialog
        key='workflows-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <WorkflowsViewDialog
            key={`workflows-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WorkflowsActionDialog
            key={`workflows-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WorkflowsDeleteDialog
            key={`workflows-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WorkflowsDuplicateDialog
            key={`workflows-duplicate-${currentRow._id}`}
            open={open === 'duplicate'}
            onOpenChange={() => {
              setOpen('duplicate')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WorkflowsStagesDialog
            key={`workflows-stages-${currentRow._id}`}
            open={open === 'stages'}
            onOpenChange={() => {
              setOpen('stages')
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
