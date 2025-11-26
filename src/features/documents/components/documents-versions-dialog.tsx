import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  useDocumentVersions,
  useUploadDocumentVersion,
  useRestoreDocumentVersion,
  useDownloadDocument,
} from '@/hooks/useDocuments'
import { type Document, type DocumentVersion } from '../data/schema'
import { formatFileSize, MAX_FILE_SIZE, acceptedFileTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Upload,
  Download,
  RotateCcw,
  FileText,
  X,
  Clock,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentsVersionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Document
}

export function DocumentsVersionsDialog({
  open,
  onOpenChange,
  currentRow,
}: DocumentsVersionsDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [changeNote, setChangeNote] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data: versions = [], isLoading } = useDocumentVersions(currentRow._id)
  const uploadVersion = useUploadDocumentVersion()
  const restoreVersion = useRestoreDocumentVersion()
  const downloadDocument = useDownloadDocument()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size <= MAX_FILE_SIZE) {
        setSelectedFile(file)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const handleUploadVersion = () => {
    if (!selectedFile) return

    uploadVersion.mutate(
      {
        documentId: currentRow._id,
        file: selectedFile,
        changeNote,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          setSelectedFile(null)
          setChangeNote('')
          setUploadProgress(0)
        },
      }
    )
  }

  const handleRestore = (versionId: string) => {
    restoreVersion.mutate({
      documentId: currentRow._id,
      versionId,
    })
  }

  const getUploaderName = (uploadedBy: string | { _id: string; fullName: string }) => {
    if (typeof uploadedBy === 'object') {
      return uploadedBy.fullName
    }
    return uploadedBy
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            {t('documents.versionHistory')}
          </DialogTitle>
          <DialogDescription>
            {t('documents.versionHistoryDescription', { name: currentRow.originalName })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Upload new version */}
          <div className='border rounded-lg p-4 space-y-4'>
            <h3 className='font-medium'>{t('documents.uploadNewVersion')}</h3>

            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                )}
              >
                <input {...getInputProps()} />
                <Upload className='mx-auto h-8 w-8 text-muted-foreground' />
                <p className='mt-2 text-sm text-muted-foreground'>
                  {t('documents.dropNewVersion')}
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
                  <FileText className='h-8 w-8 text-primary' />
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{selectedFile.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <div>
                  <Label htmlFor='changeNote'>{t('documents.changeNote')}</Label>
                  <Input
                    id='changeNote'
                    placeholder={t('documents.changeNotePlaceholder')}
                    value={changeNote}
                    onChange={(e) => setChangeNote(e.target.value)}
                    className='mt-1'
                  />
                </div>

                {uploadVersion.isPending && uploadProgress > 0 && (
                  <Progress value={uploadProgress} />
                )}

                <Button
                  onClick={handleUploadVersion}
                  disabled={uploadVersion.isPending}
                  className='w-full'
                >
                  <Upload className='me-2 h-4 w-4' />
                  {uploadVersion.isPending
                    ? t('common.uploading')
                    : t('documents.uploadVersion')}
                </Button>
              </div>
            )}
          </div>

          {/* Version history */}
          <div>
            <h3 className='font-medium mb-3'>{t('documents.previousVersions')}</h3>
            <ScrollArea className='h-[300px]'>
              {isLoading ? (
                <div className='text-center py-8 text-muted-foreground'>
                  {t('common.loading')}
                </div>
              ) : versions.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  {t('documents.noVersions')}
                </div>
              ) : (
                <div className='space-y-3'>
                  {/* Current version */}
                  <div className='flex items-start gap-3 p-3 border rounded-lg bg-primary/5'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{currentRow.originalName}</span>
                        <Badge>{t('documents.currentVersion')}</Badge>
                      </div>
                      <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {formatDate(currentRow.updatedAt)}
                        </span>
                        <span>{formatFileSize(currentRow.fileSize)}</span>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        downloadDocument.mutate({
                          id: currentRow._id,
                          fileName: currentRow.originalName,
                        })
                      }
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                  </div>

                  {/* Previous versions */}
                  {versions.map((version) => (
                    <div
                      key={version._id}
                      className='flex items-start gap-3 p-3 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{version.originalName}</span>
                          <Badge variant='outline'>v{version.version}</Badge>
                        </div>
                        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {formatDate(version.createdAt)}
                          </span>
                          <span>{formatFileSize(version.fileSize)}</span>
                          <span className='flex items-center gap-1'>
                            <User className='h-3 w-3' />
                            {getUploaderName(version.uploadedBy)}
                          </span>
                        </div>
                        {version.changeNote && (
                          <p className='text-sm mt-1 italic'>
                            "{version.changeNote}"
                          </p>
                        )}
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleRestore(version._id)}
                          disabled={restoreVersion.isPending}
                        >
                          <RotateCcw className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
