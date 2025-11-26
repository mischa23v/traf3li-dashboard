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
  label: string
  labelAr: string
  icon: typeof FileText
  color: string
}[] = [
  {
    value: 'contract',
    label: 'Contract',
    labelAr: 'عقد',
    icon: FileText,
    color: '#3B82F6', // Blue
  },
  {
    value: 'judgment',
    label: 'Judgment',
    labelAr: 'حكم',
    icon: Scale,
    color: '#8B5CF6', // Purple
  },
  {
    value: 'evidence',
    label: 'Evidence',
    labelAr: 'دليل',
    icon: FileSearch,
    color: '#F59E0B', // Amber
  },
  {
    value: 'correspondence',
    label: 'Correspondence',
    labelAr: 'مراسلات',
    icon: Mail,
    color: '#10B981', // Green
  },
  {
    value: 'pleading',
    label: 'Pleading',
    labelAr: 'مذكرة',
    icon: FileEdit,
    color: '#EF4444', // Red
  },
  {
    value: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    icon: File,
    color: '#6B7280', // Gray
  },
]

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

// Max file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024
