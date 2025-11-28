import type {
  WikiPageType,
  WikiPageStatus,
  WikiConfidentialityLevel,
  WikiVisibility,
  WikiCollectionType,
  WikiRevisionChangeType,
  WikiBacklinkType,
  WikiCommentStatus,
  WikiAttachmentCategory
} from '@/types/wiki'

// ═══════════════════════════════════════════════════════════════
// PAGE TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const pageTypeLabels: Record<WikiPageType, string> = {
  note: 'Note',
  general: 'General',
  pleading: 'Pleading',
  motion: 'Motion',
  brief: 'Brief',
  petition: 'Petition',
  timeline: 'Timeline',
  evidence_log: 'Evidence Log',
  witness_notes: 'Witness Notes',
  interview_notes: 'Interview Notes',
  deposition: 'Deposition',
  legal_research: 'Legal Research',
  precedent: 'Precedent',
  case_analysis: 'Case Analysis',
  strategy: 'Strategy',
  correspondence: 'Correspondence',
  client_memo: 'Client Memo',
  internal_memo: 'Internal Memo',
  meeting_notes: 'Meeting Notes',
  court_documents: 'Court Documents',
  hearing_notes: 'Hearing Notes',
  judgment_analysis: 'Judgment Analysis',
  template: 'Template'
}

export const pageTypeLabelsAr: Record<WikiPageType, string> = {
  note: 'ملاحظة',
  general: 'عام',
  pleading: 'مرافعة',
  motion: 'طلب',
  brief: 'موجز',
  petition: 'عريضة',
  timeline: 'جدول زمني',
  evidence_log: 'سجل الأدلة',
  witness_notes: 'ملاحظات الشاهد',
  interview_notes: 'ملاحظات المقابلة',
  deposition: 'إفادة',
  legal_research: 'بحث قانوني',
  precedent: 'سابقة قضائية',
  case_analysis: 'تحليل القضية',
  strategy: 'استراتيجية',
  correspondence: 'مراسلة',
  client_memo: 'مذكرة للعميل',
  internal_memo: 'مذكرة داخلية',
  meeting_notes: 'ملاحظات الاجتماع',
  court_documents: 'وثائق المحكمة',
  hearing_notes: 'ملاحظات الجلسة',
  judgment_analysis: 'تحليل الحكم',
  template: 'قالب'
}

export const pageTypeIcons: Record<WikiPageType, string> = {
  note: 'FileText',
  general: 'File',
  pleading: 'ScrollText',
  motion: 'ClipboardList',
  brief: 'FileStack',
  petition: 'FileText',
  timeline: 'Calendar',
  evidence_log: 'Paperclip',
  witness_notes: 'User',
  interview_notes: 'Mic',
  deposition: 'Scale',
  legal_research: 'Search',
  precedent: 'BookOpen',
  case_analysis: 'Microscope',
  strategy: 'Target',
  correspondence: 'Mail',
  client_memo: 'Send',
  internal_memo: 'FileText',
  meeting_notes: 'Handshake',
  court_documents: 'Landmark',
  hearing_notes: 'Gavel',
  judgment_analysis: 'Scale',
  template: 'ClipboardList'
}

// ═══════════════════════════════════════════════════════════════
// PAGE STATUS LABELS
// ═══════════════════════════════════════════════════════════════

export const pageStatusLabels: Record<WikiPageStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived'
}

export const pageStatusLabelsAr: Record<WikiPageStatus, string> = {
  draft: 'مسودة',
  in_review: 'قيد المراجعة',
  approved: 'معتمد',
  published: 'منشور',
  archived: 'مؤرشف'
}

export const pageStatusColors: Record<WikiPageStatus, string> = {
  draft: 'gray',
  in_review: 'yellow',
  approved: 'blue',
  published: 'green',
  archived: 'red'
}

// ═══════════════════════════════════════════════════════════════
// CONFIDENTIALITY LEVEL LABELS
// ═══════════════════════════════════════════════════════════════

export const confidentialityLabels: Record<WikiConfidentialityLevel, string> = {
  public: 'Public',
  internal: 'Internal',
  confidential: 'Confidential',
  highly_confidential: 'Highly Confidential'
}

export const confidentialityLabelsAr: Record<
  WikiConfidentialityLevel,
  string
> = {
  public: 'عام',
  internal: 'داخلي',
  confidential: 'سري',
  highly_confidential: 'سري للغاية'
}

export const confidentialityColors: Record<WikiConfidentialityLevel, string> = {
  public: 'green',
  internal: 'blue',
  confidential: 'orange',
  highly_confidential: 'red'
}

// ═══════════════════════════════════════════════════════════════
// VISIBILITY LABELS
// ═══════════════════════════════════════════════════════════════

export const visibilityLabels: Record<WikiVisibility, string> = {
  private: 'Private',
  case_team: 'Case Team',
  firm_wide: 'Firm Wide'
}

export const visibilityLabelsAr: Record<WikiVisibility, string> = {
  private: 'خاص',
  case_team: 'فريق القضية',
  firm_wide: 'على مستوى الشركة'
}

// ═══════════════════════════════════════════════════════════════
// COLLECTION TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const collectionTypeLabels: Record<WikiCollectionType, string> = {
  custom: 'Custom',
  pleadings: 'Pleadings',
  evidence: 'Evidence',
  research: 'Research',
  correspondence: 'Correspondence',
  notes: 'Notes',
  timeline: 'Timeline',
  witnesses: 'Witnesses',
  court_documents: 'Court Documents',
  client_communications: 'Client Communications',
  internal_memos: 'Internal Memos'
}

export const collectionTypeLabelsAr: Record<WikiCollectionType, string> = {
  custom: 'مخصص',
  pleadings: 'المرافعات',
  evidence: 'الأدلة',
  research: 'البحث القانوني',
  correspondence: 'المراسلات',
  notes: 'الملاحظات',
  timeline: 'الجدول الزمني',
  witnesses: 'الشهود',
  court_documents: 'وثائق المحكمة',
  client_communications: 'تواصل العملاء',
  internal_memos: 'المذكرات الداخلية'
}

export const collectionTypeIcons: Record<WikiCollectionType, string> = {
  custom: 'Folder',
  pleadings: 'ScrollText',
  evidence: 'Paperclip',
  research: 'Search',
  correspondence: 'Mail',
  notes: 'FileText',
  timeline: 'Calendar',
  witnesses: 'Users',
  court_documents: 'Scale',
  client_communications: 'MessageSquare',
  internal_memos: 'ClipboardList'
}

export const collectionTypeColors: Record<WikiCollectionType, string> = {
  custom: '#6366f1',
  pleadings: '#ef4444',
  evidence: '#f97316',
  research: '#8b5cf6',
  correspondence: '#06b6d4',
  notes: '#22c55e',
  timeline: '#eab308',
  witnesses: '#ec4899',
  court_documents: '#64748b',
  client_communications: '#3b82f6',
  internal_memos: '#14b8a6'
}

// ═══════════════════════════════════════════════════════════════
// REVISION CHANGE TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const revisionChangeTypeLabels: Record<WikiRevisionChangeType, string> =
  {
    create: 'Created',
    update: 'Updated',
    restore: 'Restored',
    seal: 'Sealed',
    unseal: 'Unsealed',
    auto_save: 'Auto-saved',
    publish: 'Published',
    archive: 'Archived'
  }

export const revisionChangeTypeLabelsAr: Record<
  WikiRevisionChangeType,
  string
> = {
  create: 'إنشاء',
  update: 'تحديث',
  restore: 'استعادة',
  seal: 'ختم',
  unseal: 'فك الختم',
  auto_save: 'حفظ تلقائي',
  publish: 'نشر',
  archive: 'أرشفة'
}

// ═══════════════════════════════════════════════════════════════
// BACKLINK TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const backlinkTypeLabels: Record<WikiBacklinkType, string> = {
  reference: 'Reference',
  related: 'Related',
  parent: 'Parent',
  child: 'Child',
  citation: 'Citation',
  see_also: 'See Also'
}

export const backlinkTypeLabelsAr: Record<WikiBacklinkType, string> = {
  reference: 'مرجع',
  related: 'ذو صلة',
  parent: 'أصل',
  child: 'فرع',
  citation: 'اقتباس',
  see_also: 'انظر أيضاً'
}

// ═══════════════════════════════════════════════════════════════
// COMMENT STATUS LABELS
// ═══════════════════════════════════════════════════════════════

export const commentStatusLabels: Record<WikiCommentStatus, string> = {
  active: 'Active',
  resolved: 'Resolved',
  deleted: 'Deleted'
}

export const commentStatusLabelsAr: Record<WikiCommentStatus, string> = {
  active: 'نشط',
  resolved: 'محلول',
  deleted: 'محذوف'
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT CATEGORY LABELS
// ═══════════════════════════════════════════════════════════════

export const attachmentCategoryLabels: Record<WikiAttachmentCategory, string> =
  {
    pleading: 'Pleading',
    evidence: 'Evidence',
    exhibit: 'Exhibit',
    contract: 'Contract',
    correspondence: 'Correspondence',
    research: 'Research',
    judgment: 'Judgment',
    other: 'Other'
  }

export const attachmentCategoryLabelsAr: Record<
  WikiAttachmentCategory,
  string
> = {
  pleading: 'مرافعة',
  evidence: 'دليل',
  exhibit: 'مستند',
  contract: 'عقد',
  correspondence: 'مراسلة',
  research: 'بحث',
  judgment: 'حكم',
  other: 'أخرى'
}

export const attachmentCategoryIcons: Record<WikiAttachmentCategory, string> = {
  pleading: 'ScrollText',
  evidence: 'Paperclip',
  exhibit: 'FileImage',
  contract: 'FileContract',
  correspondence: 'Mail',
  research: 'Search',
  judgment: 'Scale',
  other: 'File'
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT VERSION LABELS
// ═══════════════════════════════════════════════════════════════

export const attachmentVersionLabels = {
  versionHistory: 'Version History',
  currentVersion: 'Current Version',
  version: 'Version',
  uploadNewVersion: 'Upload New Version',
  restoreVersion: 'Restore Version',
  downloadVersion: 'Download Version',
  changeNote: 'Change Note',
  uploadedBy: 'Uploaded By',
  uploadedAt: 'Uploaded At',
  restored: 'Restored',
  restoredFrom: 'Restored from version',
  noVersionHistory: 'No version history',
  confirmRestore: 'Are you sure you want to restore this version?',
  versionRestored: 'Version restored successfully',
  versionUploaded: 'New version uploaded successfully'
}

export const attachmentVersionLabelsAr = {
  versionHistory: 'سجل الإصدارات',
  currentVersion: 'الإصدار الحالي',
  version: 'الإصدار',
  uploadNewVersion: 'رفع إصدار جديد',
  restoreVersion: 'استعادة الإصدار',
  downloadVersion: 'تحميل الإصدار',
  changeNote: 'ملاحظة التغيير',
  uploadedBy: 'رفع بواسطة',
  uploadedAt: 'تاريخ الرفع',
  restored: 'مستعاد',
  restoredFrom: 'مستعاد من الإصدار',
  noVersionHistory: 'لا يوجد سجل إصدارات',
  confirmRestore: 'هل أنت متأكد من استعادة هذا الإصدار؟',
  versionRestored: 'تم استعادة الإصدار بنجاح',
  versionUploaded: 'تم رفع الإصدار الجديد بنجاح'
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const getLabel = <T extends string>(
  labels: Record<T, string>,
  labelsAr: Record<T, string>,
  key: T,
  locale: 'en' | 'ar' = 'en'
): string => {
  return locale === 'ar' ? labelsAr[key] : labels[key]
}

export const getPageTypeLabel = (
  type: WikiPageType,
  locale: 'en' | 'ar' = 'en'
) => getLabel(pageTypeLabels, pageTypeLabelsAr, type, locale)

export const getPageStatusLabel = (
  status: WikiPageStatus,
  locale: 'en' | 'ar' = 'en'
) => getLabel(pageStatusLabels, pageStatusLabelsAr, status, locale)

export const getConfidentialityLabel = (
  level: WikiConfidentialityLevel,
  locale: 'en' | 'ar' = 'en'
) => getLabel(confidentialityLabels, confidentialityLabelsAr, level, locale)

export const getVisibilityLabel = (
  visibility: WikiVisibility,
  locale: 'en' | 'ar' = 'en'
) => getLabel(visibilityLabels, visibilityLabelsAr, visibility, locale)

export const getCollectionTypeLabel = (
  type: WikiCollectionType,
  locale: 'en' | 'ar' = 'en'
) => getLabel(collectionTypeLabels, collectionTypeLabelsAr, type, locale)

export const getRevisionChangeTypeLabel = (
  type: WikiRevisionChangeType,
  locale: 'en' | 'ar' = 'en'
) => getLabel(revisionChangeTypeLabels, revisionChangeTypeLabelsAr, type, locale)

export const getBacklinkTypeLabel = (
  type: WikiBacklinkType,
  locale: 'en' | 'ar' = 'en'
) => getLabel(backlinkTypeLabels, backlinkTypeLabelsAr, type, locale)

export const getCommentStatusLabel = (
  status: WikiCommentStatus,
  locale: 'en' | 'ar' = 'en'
) => getLabel(commentStatusLabels, commentStatusLabelsAr, status, locale)

export const getAttachmentCategoryLabel = (
  category: WikiAttachmentCategory,
  locale: 'en' | 'ar' = 'en'
) =>
  getLabel(attachmentCategoryLabels, attachmentCategoryLabelsAr, category, locale)

export const getAttachmentVersionLabel = (
  key: keyof typeof attachmentVersionLabels,
  locale: 'en' | 'ar' = 'en'
) =>
  locale === 'ar'
    ? attachmentVersionLabelsAr[key]
    : attachmentVersionLabels[key]
