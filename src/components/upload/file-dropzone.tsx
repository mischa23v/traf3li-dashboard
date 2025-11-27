/**
 * File Dropzone Component
 * Enhanced file upload with drag-and-drop using react-dropzone
 * Features: preview, progress, multiple files, validation
 */

import { useCallback, useState } from 'react'
import { useDropzone, FileRejection, Accept } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Trash2,
} from 'lucide-react'

/**
 * File with upload status
 */
export interface UploadFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
}

/**
 * Props Interface
 */
interface FileDropzoneProps {
  // Configuration
  accept?: Accept
  maxFiles?: number
  maxSize?: number // bytes
  multiple?: boolean
  disabled?: boolean
  // Callbacks
  onDrop?: (acceptedFiles: File[]) => void
  onUpload?: (file: File) => Promise<{ url: string } | void>
  onRemove?: (file: UploadFile) => void
  onFilesChange?: (files: UploadFile[]) => void
  // Existing files
  value?: UploadFile[]
  // Styling
  className?: string
  dropzoneClassName?: string
  // Locale
  locale?: 'ar' | 'en'
  // UI Options
  showPreview?: boolean
  compact?: boolean
}

/**
 * File type icons
 */
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />
  if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />
  if (type.startsWith('audio/')) return <FileAudio className="h-8 w-8 text-pink-500" />
  if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
  if (type.includes('document') || type.includes('word'))
    return <FileText className="h-8 w-8 text-blue-600" />
  if (type.includes('spreadsheet') || type.includes('excel'))
    return <FileText className="h-8 w-8 text-green-600" />
  return <File className="h-8 w-8 text-gray-500" />
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Translations
 */
function getTranslation(key: string, locale: 'ar' | 'en' = 'ar'): string {
  const translations: Record<string, { ar: string; en: string }> = {
    dropHere: { ar: 'أسقط الملفات هنا', en: 'Drop files here' },
    dragOrClick: { ar: 'اسحب الملفات هنا أو انقر للاختيار', en: 'Drag files here or click to select' },
    browse: { ar: 'تصفح', en: 'Browse' },
    maxSize: { ar: 'الحد الأقصى', en: 'Max size' },
    maxFiles: { ar: 'أقصى عدد ملفات', en: 'Max files' },
    uploading: { ar: 'جاري الرفع...', en: 'Uploading...' },
    uploaded: { ar: 'تم الرفع', en: 'Uploaded' },
    failed: { ar: 'فشل الرفع', en: 'Upload failed' },
    remove: { ar: 'حذف', en: 'Remove' },
    preview: { ar: 'معاينة', en: 'Preview' },
    download: { ar: 'تحميل', en: 'Download' },
    fileTooLarge: { ar: 'الملف كبير جداً', en: 'File is too large' },
    fileTypeNotAllowed: { ar: 'نوع الملف غير مسموح', en: 'File type not allowed' },
    tooManyFiles: { ar: 'عدد الملفات أكثر من المسموح', en: 'Too many files' },
  }
  return translations[key]?.[locale] || key
}

/**
 * File Preview Item
 */
function FilePreviewItem({
  file,
  onRemove,
  onPreview,
  showPreview = true,
  locale = 'ar',
}: {
  file: UploadFile
  onRemove?: () => void
  onPreview?: () => void
  showPreview?: boolean
  locale?: 'ar' | 'en'
}) {
  const isImage = file.file.type.startsWith('image/')

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-lg border bg-muted/30',
        file.status === 'error' && 'border-red-300 bg-red-50/50 dark:bg-red-900/20',
        file.status === 'success' && 'border-green-300 bg-green-50/50 dark:bg-green-900/20'
      )}
    >
      {/* Preview/Icon */}
      <div className="flex-shrink-0">
        {isImage && file.preview && showPreview ? (
          <img
            src={file.preview}
            alt={file.file.name}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          getFileIcon(file.file.type)
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="mt-1">
            <Progress value={file.progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-0.5">
              {file.progress}%
            </p>
          </div>
        )}

        {/* Error message */}
        {file.status === 'error' && file.error && (
          <p className="text-xs text-red-600 mt-1">{file.error}</p>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {file.status === 'uploading' && (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        )}
        {file.status === 'success' && (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        {file.status === 'error' && (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {/* Preview button for images */}
        {isImage && file.preview && showPreview && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onPreview}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{getTranslation('preview', locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Download button for uploaded files */}
        {file.status === 'success' && file.url && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  asChild
                >
                  <a href={file.url} download={file.file.name} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{getTranslation('download', locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Remove button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:text-destructive"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{getTranslation('remove', locale)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

/**
 * Main File Dropzone Component
 */
export function FileDropzone({
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = true,
  disabled = false,
  onDrop,
  onUpload,
  onRemove,
  onFilesChange,
  value = [],
  className,
  dropzoneClassName,
  locale = 'ar',
  showPreview = true,
  compact = false,
}: FileDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>(value)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Update internal state when value prop changes
  const updateFiles = useCallback(
    (newFiles: UploadFile[]) => {
      setFiles(newFiles)
      onFilesChange?.(newFiles)
    },
    [onFilesChange]
  )

  // Handle file drop
  const handleDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Create upload file objects
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        id: generateId(),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: 'pending' as const,
      }))

      // Handle rejected files
      const rejectedUploadFiles: UploadFile[] = rejectedFiles.map(({ file, errors }) => ({
        id: generateId(),
        file,
        progress: 0,
        status: 'error' as const,
        error: errors
          .map((e) => {
            if (e.code === 'file-too-large') return getTranslation('fileTooLarge', locale)
            if (e.code === 'file-invalid-type') return getTranslation('fileTypeNotAllowed', locale)
            if (e.code === 'too-many-files') return getTranslation('tooManyFiles', locale)
            return e.message
          })
          .join(', '),
      }))

      const allNewFiles = [...files, ...newFiles, ...rejectedUploadFiles]
      updateFiles(allNewFiles)
      onDrop?.(acceptedFiles)

      // Upload files if onUpload is provided
      if (onUpload) {
        for (const uploadFile of newFiles) {
          try {
            // Update status to uploading
            updateFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? { ...f, status: 'uploading' as const, progress: 10 }
                  : f
              )
            )

            // Simulate progress updates
            const progressInterval = setInterval(() => {
              updateFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadFile.id && f.status === 'uploading'
                    ? { ...f, progress: Math.min(f.progress + 10, 90) }
                    : f
                )
              )
            }, 200)

            // Upload file
            const result = await onUpload(uploadFile.file)

            clearInterval(progressInterval)

            // Update status to success
            updateFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? { ...f, status: 'success' as const, progress: 100, url: result?.url }
                  : f
              )
            )
          } catch (error: any) {
            // Update status to error
            updateFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? {
                      ...f,
                      status: 'error' as const,
                      error: error.message || getTranslation('failed', locale),
                    }
                  : f
              )
            )
          }
        }
      } else {
        // Mark files as success without uploading
        updateFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.id === f.id)
              ? { ...f, status: 'success' as const, progress: 100 }
              : f
          )
        )
      }
    },
    [files, locale, onDrop, onUpload, updateFiles]
  )

  // Handle file removal
  const handleRemove = useCallback(
    (file: UploadFile) => {
      // Revoke object URL to avoid memory leaks
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
      const newFiles = files.filter((f) => f.id !== file.id)
      updateFiles(newFiles)
      onRemove?.(file)
    },
    [files, onRemove, updateFiles]
  )

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    multiple,
    disabled,
  })

  return (
    <div className={cn('space-y-4', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          compact ? 'p-4' : 'p-8',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-red-500 bg-red-50 dark:bg-red-900/20',
          !isDragActive && 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          dropzoneClassName
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            className={cn(
              'text-muted-foreground mb-2',
              compact ? 'h-6 w-6' : 'h-10 w-10',
              isDragActive && 'text-primary'
            )}
          />
          {isDragActive ? (
            <p className="text-primary font-medium">
              {getTranslation('dropHere', locale)}
            </p>
          ) : (
            <>
              <p className={cn('text-muted-foreground', compact ? 'text-sm' : '')}>
                {getTranslation('dragOrClick', locale)}
              </p>
              {!compact && (
                <Button type="button" variant="outline" size="sm" className="mt-4">
                  {getTranslation('browse', locale)}
                </Button>
              )}
            </>
          )}
          {!compact && (
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <p>
                {getTranslation('maxSize', locale)}: {formatFileSize(maxSize)}
              </p>
              {multiple && (
                <p>
                  {getTranslation('maxFiles', locale)}: {maxFiles}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <FilePreviewItem
              key={file.id}
              file={file}
              onRemove={() => handleRemove(file)}
              onPreview={() => file.preview && setPreviewUrl(file.preview)}
              showPreview={showPreview}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 end-2 text-white hover:bg-white/20"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default FileDropzone
