import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useUploadVersion } from '@/hooks/useDocumentVersions'
import { type Document } from '../data/schema'
import { type VersionType } from '@/services/documentVersionService'
import documentVersionService from '@/services/documentVersionService'
import { formatFileSize, MAX_FILE_SIZE, acceptedFileTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import {
  Upload,
  FileText,
  X,
  Info,
  ArrowUp,
  TrendingUp,
  GitCommit,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface VersionUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document
  onSuccess?: () => void
}

export function VersionUploadDialog({
  open,
  onOpenChange,
  document,
  onSuccess,
}: VersionUploadDialogProps) {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [changeNote, setChangeNote] = useState('')
  const [versionType, setVersionType] = useState<VersionType>('minor')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const uploadVersion = useUploadVersion()

  // Calculate next version number
  const nextVersion = documentVersionService.calculateNextVersion(
    document.version,
    versionType
  )

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

  const handleUpload = () => {
    if (!selectedFile) return

    uploadVersion.mutate(
      {
        documentId: document._id,
        data: {
          file: selectedFile,
          changeNote,
          versionType,
          tags,
        },
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          setSelectedFile(null)
          setChangeNote('')
          setVersionType('minor')
          setTags([])
          setTagInput('')
          setUploadProgress(0)
          onSuccess?.()
          onOpenChange(false)
        },
      }
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            {t('documents.uploadNewVersion', 'Upload New Version')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'documents.uploadVersionDescription',
              'Upload a new version of this document with version tracking'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Current document info */}
          <Card className='bg-muted/50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>
                {t('documents.currentDocument', 'Current Document')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium truncate flex-1'>
                  {document.originalName}
                </span>
                <Badge variant='secondary'>v{document.version}</Badge>
              </div>
              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <span>{formatFileSize(document.fileSize)}</span>
                <span>{document.fileType}</span>
              </div>
            </CardContent>
          </Card>

          {/* Version Type Selection */}
          <div className='space-y-3'>
            <Label className='flex items-center gap-2'>
              <GitCommit className='h-4 w-4' />
              {t('documents.versionType', 'Version Type')}
            </Label>
            <RadioGroup value={versionType} onValueChange={(v) => setVersionType(v as VersionType)}>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    versionType === 'major' && 'border-2 border-primary bg-primary/5'
                  )}
                  onClick={() => setVersionType('major')}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <RadioGroupItem value='major' id='major' />
                      <div className='flex-1'>
                        <Label htmlFor='major' className='cursor-pointer flex items-center gap-2'>
                          <ArrowUp className='h-4 w-4 text-red-500' />
                          <span className='font-semibold'>
                            {t('documents.majorVersion', 'Major')}
                          </span>
                        </Label>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {t('documents.majorVersionDesc', 'Breaking changes')}
                        </p>
                        <Badge variant='outline' className='mt-2 text-xs'>
                          v{document.version} → v{documentVersionService.calculateNextVersion(document.version, 'major')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    versionType === 'minor' && 'border-2 border-primary bg-primary/5'
                  )}
                  onClick={() => setVersionType('minor')}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <RadioGroupItem value='minor' id='minor' />
                      <div className='flex-1'>
                        <Label htmlFor='minor' className='cursor-pointer flex items-center gap-2'>
                          <TrendingUp className='h-4 w-4 text-blue-500' />
                          <span className='font-semibold'>
                            {t('documents.minorVersion', 'Minor')}
                          </span>
                        </Label>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {t('documents.minorVersionDesc', 'New features')}
                        </p>
                        <Badge variant='outline' className='mt-2 text-xs'>
                          v{document.version} → v{documentVersionService.calculateNextVersion(document.version, 'minor')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    versionType === 'patch' && 'border-2 border-primary bg-primary/5'
                  )}
                  onClick={() => setVersionType('patch')}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <RadioGroupItem value='patch' id='patch' />
                      <div className='flex-1'>
                        <Label htmlFor='patch' className='cursor-pointer flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-green-500' />
                          <span className='font-semibold'>
                            {t('documents.patchVersion', 'Patch')}
                          </span>
                        </Label>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {t('documents.patchVersionDesc', 'Bug fixes')}
                        </p>
                        <Badge variant='outline' className='mt-2 text-xs'>
                          v{document.version} → v{documentVersionService.calculateNextVersion(document.version, 'patch')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* File Upload */}
          <div className='space-y-3'>
            <Label>{t('documents.newVersionFile', 'New Version File')}</Label>
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                )}
              >
                <input {...getInputProps()} />
                <Upload className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
                <p className='text-sm font-medium mb-1'>
                  {t('documents.dropNewVersion', 'Drop file here or click to browse')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('documents.maxFileSize', `Max file size: ${formatFileSize(MAX_FILE_SIZE)}`)}
                </p>
              </div>
            ) : (
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <FileText className='h-10 w-10 text-primary flex-shrink-0' />
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
                      disabled={uploadVersion.isPending}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Change Note */}
          <div className='space-y-2'>
            <Label htmlFor='changeNote'>
              {t('documents.changeNote', 'Change Note')}
              <span className='text-muted-foreground text-xs ms-2'>
                ({t('common.optional', 'Optional')})
              </span>
            </Label>
            <Textarea
              id='changeNote'
              placeholder={t('documents.changeNotePlaceholder', 'Describe what changed in this version...')}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              rows={3}
              disabled={uploadVersion.isPending}
            />
          </div>

          {/* Tags */}
          <div className='space-y-2'>
            <Label htmlFor='tags'>
              {t('documents.tags', 'Tags')}
              <span className='text-muted-foreground text-xs ms-2'>
                ({t('common.optional', 'Optional')})
              </span>
            </Label>
            <div className='flex gap-2'>
              <Input
                id='tags'
                placeholder={t('documents.addTag', 'Add tag...')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={uploadVersion.isPending}
              />
              <Button
                type='button'
                variant='outline'
                onClick={addTag}
                disabled={!tagInput.trim() || uploadVersion.isPending}
              >
                {t('common.add', 'Add')}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {tags.map((tag) => (
                  <Badge key={tag} variant='secondary' className='gap-1'>
                    {tag}
                    <X
                      className='h-3 w-3 cursor-pointer hover:text-destructive'
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadVersion.isPending && uploadProgress > 0 && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>{t('common.uploading', 'Uploading...')}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className='h-4 w-4' />
            <AlertTitle>{t('documents.versioningInfo', 'Version Information')}</AlertTitle>
            <AlertDescription className='text-xs'>
              {t(
                'documents.versioningInfoDesc',
                'The current version will be archived and the new file will become the active version.'
              )}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={uploadVersion.isPending}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadVersion.isPending}
          >
            {uploadVersion.isPending ? (
              <>
                <Upload className='me-2 h-4 w-4 animate-pulse' />
                {t('common.uploading', 'Uploading...')}
              </>
            ) : (
              <>
                <Upload className='me-2 h-4 w-4' />
                {t('documents.uploadVersion', 'Upload Version')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
