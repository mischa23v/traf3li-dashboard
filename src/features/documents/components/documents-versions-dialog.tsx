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
  History,
  CheckCircle2,
  GitBranch,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

          {/* Version history with visual timeline */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-medium flex items-center gap-2'>
                <History className='h-4 w-4 text-primary' />
                {t('documents.previousVersions')}
              </h3>
              <Badge variant='secondary' className='text-xs'>
                {(versions?.length || 0) + 1} {t('documents.totalVersions', 'versions')}
              </Badge>
            </div>
            <ScrollArea className='h-[350px]'>
              {isLoading ? (
                <div className='text-center py-8 text-muted-foreground'>
                  {t('common.loading')}
                </div>
              ) : (
                <TooltipProvider>
                  <div className='relative'>
                    {/* Timeline line */}
                    <div className='absolute top-6 bottom-6 start-5 w-0.5 bg-gradient-to-b from-primary via-muted-foreground/30 to-muted-foreground/10' />

                    <div className='space-y-4'>
                      {/* Current version */}
                      <div className='relative flex gap-4'>
                        {/* Timeline node */}
                        <div className='relative z-10 flex-shrink-0'>
                          <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30'>
                            <CheckCircle2 className='h-5 w-5 text-primary-foreground' />
                          </div>
                        </div>
                        {/* Content */}
                        <div className='flex-1 bg-primary/5 border-2 border-primary/20 rounded-xl p-4 hover:border-primary/40 transition-colors'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-2'>
                                <FileText className='h-4 w-4 text-primary' />
                                <span className='font-semibold'>{currentRow.originalName}</span>
                                <Badge className='bg-primary text-primary-foreground'>
                                  {t('documents.currentVersion')}
                                </Badge>
                              </div>
                              <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                                <span className='flex items-center gap-1'>
                                  <Clock className='h-3 w-3' />
                                  {formatDate(currentRow.updatedAt)}
                                </span>
                                <span className='px-2 py-0.5 bg-muted rounded-full text-xs'>
                                  {formatFileSize(currentRow.fileSize)}
                                </span>
                              </div>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='hover:bg-primary hover:text-primary-foreground'
                                  onClick={() =>
                                    downloadDocument.mutate({
                                      id: currentRow._id,
                                      fileName: currentRow.originalName,
                                    })
                                  }
                                >
                                  <Download className='h-4 w-4' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('common.download')}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      {/* Previous versions */}
                      {versions.length === 0 ? (
                        <div className='relative flex gap-4'>
                          <div className='relative z-10 flex-shrink-0'>
                            <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                              <GitBranch className='h-4 w-4 text-muted-foreground' />
                            </div>
                          </div>
                          <div className='flex-1 text-center py-6 text-muted-foreground'>
                            <p className='text-sm'>{t('documents.noVersions')}</p>
                            <p className='text-xs mt-1'>{t('documents.firstVersion', 'This is the first version of the document')}</p>
                          </div>
                        </div>
                      ) : (
                        versions.map((version, index) => (
                          <div key={version._id} className='relative flex gap-4'>
                            {/* Timeline node */}
                            <div className='relative z-10 flex-shrink-0'>
                              <div className='w-10 h-10 rounded-full bg-muted border-2 border-muted-foreground/20 flex items-center justify-center'>
                                <span className='text-xs font-bold text-muted-foreground'>
                                  v{version.version}
                                </span>
                              </div>
                            </div>
                            {/* Content */}
                            <div className='flex-1 bg-muted/30 border border-muted-foreground/10 rounded-xl p-4 hover:border-muted-foreground/30 hover:bg-muted/50 transition-all group'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-2'>
                                    <FileText className='h-4 w-4 text-muted-foreground' />
                                    <span className='font-medium'>{version.originalName}</span>
                                    <Badge variant='outline' className='text-xs'>
                                      v{version.version}
                                    </Badge>
                                  </div>
                                  <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                                    <span className='flex items-center gap-1'>
                                      <Clock className='h-3 w-3' />
                                      {formatDate(version.createdAt)}
                                    </span>
                                    <span className='px-2 py-0.5 bg-muted rounded-full text-xs'>
                                      {formatFileSize(version.fileSize)}
                                    </span>
                                    <span className='flex items-center gap-1'>
                                      <User className='h-3 w-3' />
                                      {getUploaderName(version.uploadedBy)}
                                    </span>
                                  </div>
                                  {version.changeNote && (
                                    <div className='mt-2 p-2 bg-muted/50 rounded-lg border-s-2 border-muted-foreground/30'>
                                      <p className='text-xs text-muted-foreground italic'>
                                        "{version.changeNote}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleRestore(version._id)}
                                        disabled={restoreVersion.isPending}
                                        className='hover:bg-amber-500 hover:text-white hover:border-amber-500'
                                      >
                                        <RotateCcw className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t('documents.restoreVersion', 'Restore this version')}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TooltipProvider>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
