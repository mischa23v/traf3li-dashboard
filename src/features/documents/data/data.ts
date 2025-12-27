import {
  FileText,
  Scale,
  FileSearch,
  Mail,
  FileEdit,
  File,
} from 'lucide-react'
import { type DocumentCategory } from './schema'

// Category options
export const categoryOptions: {
  value: DocumentCategory
  icon: typeof FileText
  color: string
}[] = [
  {
    value: 'contract',
    icon: FileText,
    color: '#3B82F6', // Blue
  },
  {
    value: 'judgment',
    icon: Scale,
    color: '#8B5CF6', // Purple
  },
  {
    value: 'evidence',
    icon: FileSearch,
    color: '#F59E0B', // Amber
  },
  {
    value: 'correspondence',
    icon: Mail,
    color: '#10B981', // Green
  },
  {
    value: 'pleading',
    icon: FileEdit,
    color: '#EF4444', // Red
  },
  {
    value: 'other',
    icon: File,
    color: '#6B7280', // Gray
  },
]

// Get category label using i18n
export function getCategoryLabel(category: DocumentCategory): string {
  return `documents.categories.${category}`
}

// Get category info
export function getCategoryInfo(category: string) {
  return (
    categoryOptions.find((opt) => opt.value === category) || categoryOptions[5]
  )
}

// File type icons mapping
export const fileTypeIcons: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'text/plain': '📃',
  'application/zip': '📦',
  'application/x-rar-compressed': '📦',
}

// Get file icon
export function getFileIcon(mimeType: string): string {
  return fileTypeIcons[mimeType] || '📁'
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Accepted file types
export const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
}

/**
 * @deprecated Use FILE_LIMITS from '@/config' instead
 *
 * File size limits have been centralized to @/config/ui-constants.ts
 * Use FILE_LIMITS.MAX_SIZE for general uploads (50MB)
 * Use FILE_LIMITS.MAX_UPLOAD_SIZE for bulk uploads (100MB)
 * Use FILE_LIMITS.RECOMMENDED for category-specific limits
 */
