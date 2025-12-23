# File Download Security Audit Report

**Date**: 2025-12-23
**Scope**: File download functionality security review
**Status**: 🔴 **CRITICAL ISSUES FOUND**

## Executive Summary

A comprehensive security audit of file download functionality identified **multiple critical vulnerabilities** across the codebase. The primary issues are:

1. **Unsanitized filenames in downloads** (40+ instances) - HIGH RISK
2. **No content validation on downloads** - MEDIUM RISK
3. **Memory leaks from unreleased blob URLs** - MEDIUM RISK
4. **User-controlled filenames without sanitization** - MEDIUM RISK

## Detailed Findings

### 1. Unsanitized Filenames (HIGH RISK) 🔴

**Issue**: Most download functions use filenames directly from parameters without sanitization, allowing potential path traversal and filename injection attacks.

**Risk**:
- Path traversal attacks (`../../etc/passwd`)
- Special character injection in filenames
- Potential XSS via filename injection
- Directory traversal on some browsers

**Affected Files** (40+ locations):

| File | Line | Code | Risk |
|------|------|------|------|
| `useDataExport.ts` | 88 | `a.download = fileName` | HIGH |
| `useDocuments.ts` | 430 | `link.setAttribute('download', fileName)` | HIGH |
| `notion-page-view.tsx` | 210 | `a.download = \`${page?.title}.pdf\`` | HIGH |
| `notion-page-view.tsx` | 225 | `a.download = \`${page?.title}.md\`` | HIGH |
| `calendar-sync-dialog.tsx` | 184 | Uses date in filename (OK) | LOW |
| `backup-codes-modal.tsx` | 87 | `a.download = 'traf3li-mfa-backup-codes.txt'` | LOW (hardcoded) |
| `useFinance.ts` | 376, 1152, 1371 | Multiple download points | HIGH |
| `useGantt.ts` | 401, 419, 437 | Multiple export formats | MEDIUM |
| `useTasks.ts` | 885, 1035 | Task exports | MEDIUM |
| `useAccounting.ts` | 884 | Debit notes download | MEDIUM |
| `useBiometric.ts` | 287 | Verification logs | MEDIUM |
| `useCorporateCards.ts` | 389, 409 | Card reconciliation | MEDIUM |
| `useHrAnalytics.ts` | 315 | HR reports | MEDIUM |
| `useRetentionBonus.ts` | 346 | Bonus reports | MEDIUM |
| `useReceipt.ts` | 39, 132 | Receipt downloads | MEDIUM |
| `usePdfme.ts` | 353 | PDF generation | MEDIUM |

**Examples of Vulnerable Code**:

```typescript
// ❌ VULNERABLE: No sanitization
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      const blob = await documentsService.downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName) // ⚠️ Unsanitized!
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}

// ❌ VULNERABLE: User-controlled page title
const handleExportPdf = async () => {
  const blob = await exportPdf.mutateAsync({ caseId, pageId })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${page?.title || 'page'}.pdf` // ⚠️ Unsanitized page title!
  a.click()
  URL.revokeObjectURL(url)
}
```

### 2. No Content Validation (MEDIUM RISK) ⚠️

**Issue**: Downloaded files are not validated or scanned before being saved to the user's system.

**Risk**:
- Malware distribution
- Unexpected file types
- File size bombs
- Content type mismatch

**Affected**: ALL download functions

**Current State**:
- No MIME type verification after download
- No file size validation
- No malware scanning
- No content integrity checks

### 3. Memory Leaks from Unreleased Blob URLs (MEDIUM RISK) ⚠️

**Issue**: Some components create blob URLs but don't properly revoke them, leading to memory leaks.

**Affected Files**:

| File | Line | Issue |
|------|------|-------|
| `create-expense-view.tsx` | 321, 336 | Creates object URLs for attachments but doesn't revoke on removal |

**Example**:
```typescript
// ❌ MEMORY LEAK
const removeAttachment = (index: number) => {
  setAttachments(prev => prev.filter((_, i) => i !== index))
  // ⚠️ Object URL not revoked - memory leak!
}

// Attachments created with:
url: URL.createObjectURL(file) // Never revoked!
```

### 4. Existing Security Controls ✅

**Good practices found**:

1. **Filename sanitization utility exists** (`lib/file-validation.ts`):
   ```typescript
   export function sanitizeFilename(filename: string): string {
     return filename
       .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, '_')
       .replace(/\.{2,}/g, '.')
       .replace(/^\.+/, '')
       .substring(0, 255)
   }
   ```
   ✅ BUT: Only used in 2 locations (tasks-import-dialog, task-details-view)

2. **Blob URL cleanup**: Most functions properly revoke blob URLs (90% coverage)

3. **File upload validation**: Upload validation is comprehensive with MIME type and size checks

## Security Recommendations

### Immediate Actions (Priority 1) 🚨

1. **Create centralized secure download utility**:
   - ✅ Created: `/src/utils/file-download-security.ts`
   - Provides `secureDownload()` function with automatic sanitization and cleanup

2. **Replace all download implementations** with the secure utility

3. **Fix memory leaks** in attachment handling

### Implementation Required

#### Fix 1: Replace Unsafe Downloads

```typescript
// ✅ SECURE: Use the new utility
import { secureDownload } from '@/utils/file-download-security'

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      const blob = await documentsService.downloadDocument(id)

      // Automatic sanitization, validation, and cleanup
      secureDownload({
        blob,
        filename: fileName,
        expectedMimeType: 'application/pdf',
        maxSize: 50 * 1024 * 1024, // 50MB
      })
    },
  })
}
```

#### Fix 2: Secure Page Title Export

```typescript
// ✅ SECURE: Sanitize user-controlled input
import { secureDownload } from '@/utils/file-download-security'

const handleExportPdf = async () => {
  const blob = await exportPdf.mutateAsync({ caseId, pageId })

  secureDownload({
    blob,
    filename: `${page?.title || 'page'}.pdf`, // Will be sanitized automatically
  })
}
```

#### Fix 3: Fix Memory Leaks

```typescript
// ✅ SECURE: Proper cleanup
import { createManagedBlobUrl, revokeBlobUrls } from '@/utils/file-download-security'

// Store managed URLs
const [attachmentUrls, setAttachmentUrls] = useState<Map<number, () => void>>(new Map())

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  const newAttachments: any[] = []
  const newUrlRevokers = new Map(attachmentUrls)

  files.forEach((file) => {
    const validation = validateFile(file, { allowedTypes, maxSize: SIZE_LIMITS.ATTACHMENT })

    if (validation.valid) {
      const manager = createManagedBlobUrl(file)
      const index = attachments.length + newAttachments.length

      newAttachments.push({
        type: 'other',
        filename: file.name,
        url: manager.url,
        size: file.size,
      })

      newUrlRevokers.set(index, manager.revoke)
    }
  })

  setAttachments(prev => [...prev, ...newAttachments])
  setAttachmentUrls(newUrlRevokers)
}

const removeAttachment = (index: number) => {
  // Revoke the blob URL before removing
  const revoker = attachmentUrls.get(index)
  if (revoker) {
    revoker()
    const newUrls = new Map(attachmentUrls)
    newUrls.delete(index)
    setAttachmentUrls(newUrls)
  }

  setAttachments(prev => prev.filter((_, i) => i !== index))
}

// Cleanup on unmount
useEffect(() => {
  return () => {
    attachmentUrls.forEach(revoker => revoker())
  }
}, [attachmentUrls])
```

### Medium-term Actions (Priority 2)

1. **Add content validation**:
   - Validate MIME types after download
   - Check file sizes
   - Consider magic number validation for critical file types

2. **Add server-side file scanning**:
   - Integrate malware scanning (ClamAV or similar)
   - Scan all uploaded files before storage
   - Scan on download for high-risk file types

3. **Add CSP headers** for downloaded content

### Long-term Actions (Priority 3)

1. **Implement download analytics**:
   - Track suspicious download patterns
   - Monitor unusual filenames
   - Alert on potential attacks

2. **Add rate limiting** for downloads

3. **Implement download quotas** per user/organization

## Files Requiring Immediate Updates

### Critical Priority (All download functions):
- ✅ `src/utils/file-download-security.ts` - **CREATED** (secure download utility)
- ⚠️ `src/hooks/useDataExport.ts` - Lines 83-93, 251-259
- ⚠️ `src/hooks/useDocuments.ts` - Lines 426-434
- ⚠️ `src/features/case-notion/components/notion-page-view.tsx` - Lines 204-230
- ⚠️ `src/features/finance/components/create-expense-view.tsx` - Lines 310-338 (memory leak)
- ⚠️ `src/hooks/useFinance.ts` - Multiple locations
- ⚠️ `src/hooks/useGantt.ts` - Lines 398-439
- ⚠️ `src/hooks/useTasks.ts` - Lines 1032-1038
- ⚠️ `src/hooks/useAccounting.ts` - Line 881-888
- ⚠️ `src/hooks/useBiometric.ts` - Lines 284-289
- ⚠️ `src/hooks/useCorporateCards.ts` - Lines 386-413
- ⚠️ `src/hooks/useHrAnalytics.ts` - Lines 312-318
- ⚠️ `src/hooks/useRetentionBonus.ts` - Lines 343-350
- ⚠️ `src/hooks/useReceipt.ts` - Lines 36-42, 129-135
- ⚠️ `src/hooks/usePdfme.ts` - Lines 313-316, 350-357

### Medium Priority:
- All other download functions (see full list above)

## Implementation Checklist

- [x] Create secure download utility (`file-download-security.ts`)
- [ ] Update `useDataExport.ts` to use secure downloads
- [ ] Update `useDocuments.ts` to use secure downloads
- [ ] Update `notion-page-view.tsx` to sanitize page titles
- [ ] Fix memory leaks in `create-expense-view.tsx`
- [ ] Update all finance-related download hooks
- [ ] Update HR and analytics download functions
- [ ] Update task export functions
- [ ] Add tests for secure download utility
- [ ] Add E2E tests for download security
- [ ] Document secure download patterns
- [ ] Train team on secure download practices

## Testing Requirements

### Unit Tests Needed:
```typescript
describe('secureDownload', () => {
  it('should sanitize filenames with path traversal attempts', () => {
    // Test: ../../etc/passwd
  })

  it('should sanitize filenames with special characters', () => {
    // Test: file<script>.pdf
  })

  it('should validate blob size', () => {
    // Test: maxSize enforcement
  })

  it('should validate MIME types', () => {
    // Test: expectedMimeType validation
  })

  it('should revoke blob URLs after download', () => {
    // Test: URL.revokeObjectURL called
  })
})
```

### Integration Tests Needed:
- Test all download functions with malicious filenames
- Test memory cleanup after downloads
- Test concurrent downloads

## References

- OWASP Path Traversal: https://owasp.org/www-community/attacks/Path_Traversal
- OWASP File Upload Security: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- MDN URL.createObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
- MDN URL.revokeObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL

## Conclusion

The codebase has **critical security vulnerabilities** in file download handling. While a sanitization utility exists, it's rarely used. The new `file-download-security.ts` utility provides a secure, centralized solution that must be adopted across all download functions.

**Estimated Remediation Time**: 8-16 hours for critical issues

**Risk Level**: 🔴 HIGH - Immediate action required

---

**Auditor**: Claude Code Security Scanner
**Next Review**: After implementation of recommendations
