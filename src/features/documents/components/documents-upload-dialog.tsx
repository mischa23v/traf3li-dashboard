import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useUploadDocument } from '@/hooks/useDocuments'
import { createDocumentSchema, type CreateDocumentData } from '../data/schema'
import { categoryOptions, formatFileSize, MAX_FILE_SIZE, acceptedFileTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * DocumentsUploadDialog Component
 *
 * @deprecated This component uses the deprecated direct upload method (useUploadDocument).
 *
 * MIGRATION GUIDE:
 * The underlying useUploadDocument hook uses documentsService.uploadDocument(),
 * which is deprecated. For new implementations or when refactoring, please use
 * the S3-based upload flow:
 *
 * 1. Call documentsService.getUploadUrl() to get a presigned S3 URL
 * 2. Upload the file directly to S3 using fetch() with the presigned URL
 * 3. Call documentsService.confirmUpload() to finalize the document record
 *
 * This approach provides:
 * - Better performance (direct upload to S3, bypassing the API server)
 * - Improved scalability (reduces server load)
 * - Better security (presigned URLs with time limits)
 *
 * Users will see a warning toast notification when using this component.
 */
interface DocumentsUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCaseId?: string
  defaultClientId?: string
}

export function DocumentsUploadDialog({
  open,
  onOpenChange,
  defaultCaseId,
  defaultClientId,
}: DocumentsUploadDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadDocument = useUploadDocument()

  const form = useForm<CreateDocumentData>({
    resolver: zodResolver(createDocumentSchema) as any,
    defaultValues: {
      category: 'other',
      caseId: defaultCaseId || '',
      clientId: defaultClientId || '',
      description: '',
      tags: [],
      isConfidential: false,
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > MAX_FILE_SIZE) {
        return
      }
      setSelectedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  const onSubmit = (data: CreateDocumentData) => {
    if (!selectedFile) return

    uploadDocument.mutate(
      {
        file: selectedFile,
        metadata: data,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
          setSelectedFile(null)
          setUploadProgress(0)
        },
      }
    )
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const isLoading = uploadDocument.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{t('documents.uploadDocument')}</DialogTitle>
          <DialogDescription>
            {t('documents.uploadDocumentDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* File Drop Zone */}
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
                <Upload className='mx-auto h-12 w-12 text-muted-foreground' />
                <p className='mt-2 text-sm text-muted-foreground'>
                  {isDragActive
                    ? t('documents.dropHere')
                    : t('documents.dragOrClick')}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {t('documents.maxFileSize', { size: '50MB' })}
                </p>
              </div>
            ) : (
              <div className='border rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <FileText className='h-10 w-10 text-primary' />
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{selectedFile.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                {isLoading && uploadProgress > 0 && (
                  <Progress value={uploadProgress} className='mt-3' />
                )}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('documents.category')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('documents.selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {isArabic ? option.labelAr : option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isConfidential'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between gap-2 rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>{t('documents.confidential')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('documents.descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type='submit'
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? t('common.uploading') : t('common.upload')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
