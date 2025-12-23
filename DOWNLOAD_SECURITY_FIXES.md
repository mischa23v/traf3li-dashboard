# File Download Security - Implementation Guide

This document provides step-by-step instructions to fix the identified file download security vulnerabilities.

## Quick Start

### 1. Import the Secure Download Utility

Replace all manual download implementations with the new secure utility:

```typescript
import { secureDownload } from '@/utils/file-download-security'
```

### 2. Replace Download Code

#### Before (Vulnerable):
```typescript
const blob = await dataExportService.downloadExport(jobId)
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = fileName  // ⚠️ Unsanitized filename
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
URL.revokeObjectURL(url)
```

#### After (Secure):
```typescript
const blob = await dataExportService.downloadExport(jobId)
secureDownload({
  blob,
  filename: fileName,  // ✅ Automatically sanitized
  expectedMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  maxSize: 50 * 1024 * 1024, // 50MB
})
```

## File-by-File Fix Guide

### Fix 1: useDataExport.ts

**Location**: `/src/hooks/useDataExport.ts` lines 78-102

**Current Code**:
```typescript
export function useDownloadExport() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ jobId, fileName }: { jobId: string; fileName: string }) => {
      const blob = await dataExportService.downloadExport(jobId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}
```

**Fixed Code**:
```typescript
import { secureDownload } from '@/utils/file-download-security'

export function useDownloadExport() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ jobId, fileName }: { jobId: string; fileName: string }) => {
      const blob = await dataExportService.downloadExport(jobId)

      // Secure download with automatic sanitization and cleanup
      secureDownload({
        blob,
        filename: fileName,
        // Optional: Add validation based on export type
        maxSize: 100 * 1024 * 1024, // 100MB for exports
      })

      return true
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}
```

**Also fix line 246-269** (useDownloadSampleTemplate):
```typescript
export function useDownloadSampleTemplate() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ entityType, format }: { entityType: EntityType; format: 'xlsx' | 'csv' }) => {
      const blob = await dataExportService.downloadSampleTemplate(entityType, format)

      secureDownload({
        blob,
        filename: `${entityType}_template.${format}`,
        expectedMimeType: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      })

      return true
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}
```

---

### Fix 2: useDocuments.ts

**Location**: `/src/hooks/useDocuments.ts` lines 414-444

**Current Code**:
```typescript
export const useDownloadDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      id,
      fileName,
    }: {
      id: string
      fileName: string
    }) => {
      const blob = await documentsService.downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.downloadError'),
      })
    },
  })
}
```

**Fixed Code**:
```typescript
import { secureDownload } from '@/utils/file-download-security'

export const useDownloadDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      id,
      fileName,
    }: {
      id: string
      fileName: string
    }) => {
      const blob = await documentsService.downloadDocument(id)

      secureDownload({
        blob,
        filename: fileName,
        maxSize: 100 * 1024 * 1024, // 100MB for documents
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.downloadError'),
      })
    },
  })
}
```

---

### Fix 3: notion-page-view.tsx

**Location**: `/src/features/case-notion/components/notion-page-view.tsx` lines 204-230

**Current Code**:
```typescript
const handleExportPdf = async () => {
  try {
    const blob = await exportPdf.mutateAsync({ caseId, pageId })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${page?.title || 'page'}.pdf`  // ⚠️ Unsanitized user input!
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export PDF:', error)
  }
}

const handleExportMarkdown = async () => {
  try {
    const markdown = await exportMarkdown.mutateAsync({ caseId, pageId })
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${page?.title || 'page'}.md`  // ⚠️ Unsanitized user input!
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export Markdown:', error)
  }
}
```

**Fixed Code**:
```typescript
import { secureDownload } from '@/utils/file-download-security'

const handleExportPdf = async () => {
  try {
    const blob = await exportPdf.mutateAsync({ caseId, pageId })

    secureDownload({
      blob,
      filename: `${page?.title || 'page'}.pdf`,  // ✅ Will be sanitized automatically
      expectedMimeType: 'application/pdf',
      maxSize: 50 * 1024 * 1024, // 50MB
    })
  } catch (error) {
    console.error('Failed to export PDF:', error)
  }
}

const handleExportMarkdown = async () => {
  try {
    const markdown = await exportMarkdown.mutateAsync({ caseId, pageId })
    const blob = new Blob([markdown], { type: 'text/markdown' })

    secureDownload({
      blob,
      filename: `${page?.title || 'page'}.md`,  // ✅ Will be sanitized automatically
      expectedMimeType: 'text/markdown',
    })
  } catch (error) {
    console.error('Failed to export Markdown:', error)
  }
}
```

---

### Fix 4: create-expense-view.tsx (Memory Leak)

**Location**: `/src/features/finance/components/create-expense-view.tsx` lines 310-338

**Current Code** (causes memory leak):
```typescript
// Upload attachments
const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  const validAttachments: any[] = []

  files.forEach((file) => {
    const validation = validateFile(file, {
      allowedTypes,
      maxSize: SIZE_LIMITS.ATTACHMENT,
    })

    if (!validation.valid) {
      toast.error(`${file.name}: ${validation.errorAr || validation.error}`)
    } else {
      validAttachments.push({
        type: 'other',
        filename: file.name,
        url: URL.createObjectURL(file),  // ⚠️ Never revoked!
        size: file.size,
      })
    }
  })

  if (validAttachments.length > 0) {
    setAttachments(prev => [...prev, ...validAttachments])
  }

  e.target.value = ''
}

// Remove attachment
const removeAttachment = (index: number) => {
  setAttachments(prev => prev.filter((_, i) => i !== index))
  // ⚠️ Object URL not revoked - MEMORY LEAK!
}
```

**Fixed Code**:
```typescript
import { createManagedBlobUrl } from '@/utils/file-download-security'

// Add state to track blob URL cleanup functions
const [blobUrlCleanup, setBlobUrlCleanup] = useState<Map<number, () => void>>(new Map())

// Upload attachments
const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  const validAttachments: any[] = []
  const newCleanup = new Map(blobUrlCleanup)

  files.forEach((file) => {
    const validation = validateFile(file, {
      allowedTypes,
      maxSize: SIZE_LIMITS.ATTACHMENT,
    })

    if (!validation.valid) {
      toast.error(`${file.name}: ${validation.errorAr || validation.error}`)
    } else {
      const manager = createManagedBlobUrl(file)
      const index = attachments.length + validAttachments.length

      validAttachments.push({
        type: 'other',
        filename: file.name,
        url: manager.url,
        size: file.size,
      })

      // Store cleanup function
      newCleanup.set(index, manager.revoke)
    }
  })

  if (validAttachments.length > 0) {
    setAttachments(prev => [...prev, ...validAttachments])
    setBlobUrlCleanup(newCleanup)
  }

  e.target.value = ''
}

// Remove attachment with proper cleanup
const removeAttachment = (index: number) => {
  // Revoke the blob URL before removing
  const cleanup = blobUrlCleanup.get(index)
  if (cleanup) {
    cleanup()

    // Update cleanup map
    const newCleanup = new Map(blobUrlCleanup)
    newCleanup.delete(index)
    setBlobUrlCleanup(newCleanup)
  }

  setAttachments(prev => prev.filter((_, i) => i !== index))
}

// Cleanup all blob URLs on unmount
useEffect(() => {
  return () => {
    blobUrlCleanup.forEach(cleanup => cleanup())
  }
}, [blobUrlCleanup])
```

---

### Fix 5: backup-codes-modal.tsx (Already secure, but can improve)

**Location**: `/src/components/mfa/backup-codes-modal.tsx` lines 74-92

**Current Code** (already secure with hardcoded filename):
```typescript
const handleDownload = () => {
  const content = `Traf3li - MFA Backup Codes
==============================
${t('mfa.backup.warning')}

${codes.join('\n')}

Generated: ${new Date().toISOString()}
`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'traf3li-mfa-backup-codes.txt'  // ✅ Hardcoded, safe
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

**Improved Code** (use utility for consistency):
```typescript
import { secureDownload } from '@/utils/file-download-security'

const handleDownload = () => {
  const content = `Traf3li - MFA Backup Codes
==============================
${t('mfa.backup.warning')}

${codes.join('\n')}

Generated: ${new Date().toISOString()}
`
  const blob = new Blob([content], { type: 'text/plain' })

  secureDownload({
    blob,
    filename: 'traf3li-mfa-backup-codes.txt',
    expectedMimeType: 'text/plain',
  })
}
```

---

## Bulk Update Pattern

For the remaining 35+ files, follow this pattern:

### Step 1: Add Import
```typescript
import { secureDownload } from '@/utils/file-download-security'
```

### Step 2: Replace Download Logic

**Find**:
```typescript
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = FILENAME
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
URL.revokeObjectURL(url)
```

**Replace with**:
```typescript
secureDownload({
  blob,
  filename: FILENAME,
  // Add optional validation
  expectedMimeType: 'MIME_TYPE',  // optional
  maxSize: SIZE_IN_BYTES,          // optional
})
```

### Step 3: Determine MIME Type (if needed)

Common MIME types:
```typescript
{
  'pdf': 'application/pdf',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'csv': 'text/csv',
  'txt': 'text/plain',
  'md': 'text/markdown',
  'ics': 'text/calendar',
  'json': 'application/json',
}
```

## Testing Checklist

After implementing fixes, test:

- [ ] Download with normal filename works
- [ ] Download with special characters in filename (e.g., `test<script>.pdf`)
- [ ] Download with path traversal attempt (e.g., `../../etc/passwd.pdf`)
- [ ] Download with very long filename (>255 chars)
- [ ] Download with Arabic characters in filename
- [ ] Download with multiple dots (e.g., `file...pdf`)
- [ ] Memory leak test: Upload many files, remove them, check browser memory
- [ ] Blob URL cleanup: Verify URLs are revoked after download
- [ ] File size validation: Try exceeding maxSize
- [ ] MIME type validation: Try mismatched MIME types

## Automated Testing

Add these unit tests:

```typescript
import { secureDownload, sanitizeFilename } from '@/utils/file-download-security'

describe('File Download Security', () => {
  describe('sanitizeFilename', () => {
    it('removes path traversal attempts', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('etcpasswd')
    })

    it('removes special characters', () => {
      expect(sanitizeFilename('file<script>.pdf')).toBe('file_script_.pdf')
    })

    it('preserves Arabic characters', () => {
      expect(sanitizeFilename('ملف.pdf')).toBe('ملف.pdf')
    })

    it('limits filename length', () => {
      const longName = 'a'.repeat(300)
      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255)
    })
  })

  describe('secureDownload', () => {
    it('validates blob size', () => {
      const blob = new Blob(['x'.repeat(1000)])
      expect(() => {
        secureDownload({
          blob,
          filename: 'test.txt',
          maxSize: 100,
        })
      }).toThrow('exceeds maximum allowed size')
    })

    it('rejects empty blobs', () => {
      const blob = new Blob([])
      expect(() => {
        secureDownload({
          blob,
          filename: 'test.txt',
        })
      }).toThrow('Downloaded file is empty')
    })
  })
})
```

## Migration Tracking

Track progress using this checklist:

### Critical Priority (Week 1)
- [ ] useDataExport.ts
- [ ] useDocuments.ts
- [ ] notion-page-view.tsx
- [ ] create-expense-view.tsx (memory leak)
- [ ] useFinance.ts (all download functions)

### High Priority (Week 2)
- [ ] useGantt.ts
- [ ] useTasks.ts
- [ ] useAccounting.ts
- [ ] useCorporateCards.ts
- [ ] useHrAnalytics.ts
- [ ] useRetentionBonus.ts

### Medium Priority (Week 3)
- [ ] All remaining hooks
- [ ] Component-level downloads
- [ ] Utility functions

### Testing & Validation (Week 4)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security audit
- [ ] Code review

## Questions?

If you encounter edge cases or need clarification:

1. Check the utility function documentation in `file-download-security.ts`
2. Review the security report: `FILE_DOWNLOAD_SECURITY_REPORT.md`
3. Look at the example fixes above
4. Test your implementation thoroughly

---

**Remember**: The goal is to ensure ALL file downloads use the secure utility for consistent security across the application.
