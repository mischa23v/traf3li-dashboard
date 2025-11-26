import { DocumentsUploadDialog } from './documents-upload-dialog'
import { DocumentsViewDialog } from './documents-view-dialog'
import { DocumentsEditDialog } from './documents-edit-dialog'
import { DocumentsDeleteDialog } from './documents-delete-dialog'
import { DocumentsVersionsDialog } from './documents-versions-dialog'
import { DocumentsShareDialog } from './documents-share-dialog'
import { useDocumentsContext } from './documents-provider'

export function DocumentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDocumentsContext()

  return (
    <>
      <DocumentsUploadDialog
        key='documents-upload'
        open={open === 'upload'}
        onOpenChange={() => setOpen('upload')}
      />

      {currentRow && (
        <>
          <DocumentsViewDialog
            key={`documents-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DocumentsEditDialog
            key={`documents-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DocumentsDeleteDialog
            key={`documents-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DocumentsVersionsDialog
            key={`documents-versions-${currentRow._id}`}
            open={open === 'versions'}
            onOpenChange={() => {
              setOpen('versions')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DocumentsShareDialog
            key={`documents-share-${currentRow._id}`}
            open={open === 'share'}
            onOpenChange={() => {
              setOpen('share')
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
