/**
 * Smart File Viewer Utility
 * Uses Microsoft Office Online for Office files, native browser for PDF/images/text/audio/video
 */

import { toast } from 'sonner'

// File type sets for smart viewer selection
const OFFICE_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])
const NATIVE_EXTENSIONS = new Set([
  'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp',
  'txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js',
  'mp3', 'wav', 'ogg', 'm4a', 'webm', 'mp4', 'avi', 'mov'
])

export interface SmartPreviewOptions {
  /** URL to the file */
  url: string
  /** File name (used to determine file type) */
  fileName: string
  /** Whether to show Arabic error messages */
  isArabic?: boolean
  /** Callback when popup is blocked */
  onPopupBlocked?: () => void
  /** Callback when URL is too long for Office viewer */
  onUrlTooLong?: () => void
}

export interface SmartPreviewResult {
  success: boolean
  method: 'office-viewer' | 'native' | 'download' | 'blocked'
  message?: string
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  return fileName?.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if file is an Office document
 */
export function isOfficeFile(fileName: string): boolean {
  return OFFICE_EXTENSIONS.has(getFileExtension(fileName))
}

/**
 * Check if file can be viewed natively in browser
 */
export function isNativeViewable(fileName: string): boolean {
  return NATIVE_EXTENSIONS.has(getFileExtension(fileName))
}

/**
 * Get Microsoft Office Online viewer URL
 */
export function getOfficeViewerUrl(fileUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
}

/**
 * Smart file preview - automatically selects the best viewer
 *
 * - Office files (doc, docx, xls, xlsx, ppt, pptx) → Microsoft Office Online Viewer
 * - Native files (PDF, images, text, audio, video) → Browser native viewer
 * - Other files → Attempt to open, browser will handle or download
 *
 * Best Practices:
 * - Uses Content-Disposition: inline for preview (not attachment)
 * - Handles popup blockers gracefully
 * - Falls back to download for URLs > 2000 chars (Office viewer limit)
 */
export function openSmartPreview(options: SmartPreviewOptions): SmartPreviewResult {
  const { url, fileName, isArabic = true, onPopupBlocked, onUrlTooLong } = options
  const ext = getFileExtension(fileName)

  // Office files - use Microsoft Office Online Viewer
  if (OFFICE_EXTENSIONS.has(ext)) {
    // Office Online Viewer works best with URLs under 2000 characters
    if (url.length < 2000) {
      const officeViewerUrl = getOfficeViewerUrl(url)
      const newWindow = window.open(officeViewerUrl, '_blank', 'noopener,noreferrer')

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        toast.warning(isArabic
          ? 'يرجى السماح بالنوافذ المنبثقة لمعاينة الملفات'
          : 'Please allow popups to preview files')
        onPopupBlocked?.()
        return { success: false, method: 'blocked' }
      }

      return { success: true, method: 'office-viewer' }
    } else {
      // URL too long - fall back to download
      toast.info(isArabic
        ? 'جاري تحميل الملف... (الرابط طويل جداً للمعاينة)'
        : 'Downloading file... (URL too long for preview)')
      onUrlTooLong?.()

      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()

      return { success: true, method: 'download', message: 'URL too long for Office viewer' }
    }
  }

  // Native viewable files - open directly in browser
  if (NATIVE_EXTENSIONS.has(ext) || ext === 'pdf') {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      toast.warning(isArabic
        ? 'يرجى السماح بالنوافذ المنبثقة لمعاينة الملفات'
        : 'Please allow popups to preview files')
      onPopupBlocked?.()
      return { success: false, method: 'blocked' }
    }

    return { success: true, method: 'native' }
  }

  // Unknown file type - attempt to open, browser will handle
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')

  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    toast.warning(isArabic
      ? 'يرجى السماح بالنوافذ المنبثقة لمعاينة الملفات'
      : 'Please allow popups to preview files')
    onPopupBlocked?.()
    return { success: false, method: 'blocked' }
  }

  return { success: true, method: 'native' }
}

/**
 * Download file
 */
export function downloadFile(url: string, fileName: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Get file type label for display
 */
export function getFileTypeLabel(fileName: string): string {
  const ext = getFileExtension(fileName)

  const labels: Record<string, string> = {
    pdf: 'PDF',
    doc: 'DOC',
    docx: 'DOCX',
    xls: 'XLS',
    xlsx: 'XLSX',
    ppt: 'PPT',
    pptx: 'PPTX',
    png: 'IMG',
    jpg: 'IMG',
    jpeg: 'IMG',
    gif: 'IMG',
    webp: 'IMG',
    svg: 'SVG',
    mp3: 'AUDIO',
    wav: 'AUDIO',
    ogg: 'AUDIO',
    m4a: 'AUDIO',
    mp4: 'VIDEO',
    webm: 'VIDEO',
    avi: 'VIDEO',
    mov: 'VIDEO',
    txt: 'TXT',
    csv: 'CSV',
    json: 'JSON',
    xml: 'XML',
    html: 'HTML',
    zip: 'ZIP',
    rar: 'RAR',
  }

  return labels[ext] || 'FILE'
}

/**
 * Get file type color for styling
 */
export function getFileTypeColor(fileName: string): { bg: string; text: string; border: string } {
  const ext = getFileExtension(fileName)

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    pdf: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    doc: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    docx: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    xls: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    xlsx: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    ppt: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    pptx: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    png: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    jpg: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    jpeg: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    gif: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    mp3: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    wav: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    mp4: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    webm: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  }

  return colors[ext] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
}
