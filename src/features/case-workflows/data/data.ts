import {
  FileUp,
  CheckCircle2,
  CreditCard,
  PenTool,
  Eye,
  ListChecks,
  Scale,
  Briefcase,
  Building2,
  Gavel,
  Users,
  FileText,
  type LucideIcon,
} from 'lucide-react'

/**
 * Requirement Type Options
 */
export const requirementTypes = [
  { value: 'document_upload', label: 'Document Upload', labelAr: 'رفع مستند', icon: FileUp },
  { value: 'approval', label: 'Approval', labelAr: 'موافقة', icon: CheckCircle2 },
  { value: 'payment', label: 'Payment', labelAr: 'دفع', icon: CreditCard },
  { value: 'signature', label: 'Signature', labelAr: 'توقيع', icon: PenTool },
  { value: 'review', label: 'Review', labelAr: 'مراجعة', icon: Eye },
  { value: 'task_completion', label: 'Task Completion', labelAr: 'إتمام مهمة', icon: ListChecks },
] as const

/**
 * Get requirement type info
 */
export function getRequirementTypeInfo(type: string): { label: string; labelAr: string; icon: LucideIcon } {
  const found = requirementTypes.find((t) => t.value === type)
  return found || { label: type, labelAr: type, icon: ListChecks }
}

/**
 * Case Category Options
 */
export const caseCategories = [
  { value: 'labor', label: 'Labor', labelAr: 'عمالية', icon: Users },
  { value: 'commercial', label: 'Commercial', labelAr: 'تجارية', icon: Briefcase },
  { value: 'civil', label: 'Civil', labelAr: 'مدنية', icon: Scale },
  { value: 'criminal', label: 'Criminal', labelAr: 'جنائية', icon: Gavel },
  { value: 'family', label: 'Family', labelAr: 'أحوال شخصية', icon: Users },
  { value: 'administrative', label: 'Administrative', labelAr: 'إدارية', icon: Building2 },
  { value: 'other', label: 'Other', labelAr: 'أخرى', icon: FileText },
] as const

/**
 * Get case category info
 */
export function getCaseCategoryInfo(category: string): { label: string; labelAr: string; icon: LucideIcon } {
  const found = caseCategories.find((c) => c.value === category)
  return found || { label: category, labelAr: category, icon: FileText }
}

/**
 * Stage Color Options
 */
export const stageColors = [
  { value: '#3B82F6', label: 'Blue', labelAr: 'أزرق' },
  { value: '#10B981', label: 'Green', labelAr: 'أخضر' },
  { value: '#F59E0B', label: 'Amber', labelAr: 'كهرماني' },
  { value: '#EF4444', label: 'Red', labelAr: 'أحمر' },
  { value: '#8B5CF6', label: 'Purple', labelAr: 'بنفسجي' },
  { value: '#EC4899', label: 'Pink', labelAr: 'وردي' },
  { value: '#06B6D4', label: 'Cyan', labelAr: 'سماوي' },
  { value: '#F97316', label: 'Orange', labelAr: 'برتقالي' },
  { value: '#14B8A6', label: 'Teal', labelAr: 'أخضر مزرق' },
  { value: '#6366F1', label: 'Indigo', labelAr: 'نيلي' },
  { value: '#84CC16', label: 'Lime', labelAr: 'ليموني' },
  { value: '#64748B', label: 'Slate', labelAr: 'رمادي' },
] as const

/**
 * Get color label
 */
export function getColorLabel(color: string, isArabic: boolean): string {
  const found = stageColors.find((c) => c.value === color)
  return found ? (isArabic ? found.labelAr : found.label) : color
}

/**
 * Approver Role Options
 */
export const approverRoles = [
  { value: 'owner', label: 'Owner', labelAr: 'المالك' },
  { value: 'admin', label: 'Administrator', labelAr: 'مدير النظام' },
  { value: 'partner', label: 'Partner', labelAr: 'شريك' },
  { value: 'lawyer', label: 'Lawyer', labelAr: 'محامي' },
  { value: 'paralegal', label: 'Paralegal', labelAr: 'مساعد قانوني' },
  { value: 'secretary', label: 'Secretary', labelAr: 'سكرتير' },
  { value: 'accountant', label: 'Accountant', labelAr: 'محاسب' },
] as const

/**
 * Allowed Actions for Stages
 */
export const stageActions = [
  { value: 'upload_document', label: 'Upload Document', labelAr: 'رفع مستند' },
  { value: 'add_note', label: 'Add Note', labelAr: 'إضافة ملاحظة' },
  { value: 'schedule_hearing', label: 'Schedule Hearing', labelAr: 'جدولة جلسة' },
  { value: 'add_claim', label: 'Add Claim', labelAr: 'إضافة مطالبة' },
  { value: 'update_parties', label: 'Update Parties', labelAr: 'تحديث الأطراف' },
  { value: 'send_notification', label: 'Send Notification', labelAr: 'إرسال إشعار' },
  { value: 'assign_task', label: 'Assign Task', labelAr: 'تعيين مهمة' },
  { value: 'request_payment', label: 'Request Payment', labelAr: 'طلب دفعة' },
] as const

/**
 * Default Stage Templates
 */
export const defaultStageTemplates = {
  labor: [
    { name: 'Case Intake', nameAr: 'استلام القضية', color: '#3B82F6', isInitial: true },
    { name: 'Document Collection', nameAr: 'جمع المستندات', color: '#F59E0B' },
    { name: 'Labor Office', nameAr: 'مكتب العمل', color: '#8B5CF6' },
    { name: 'Court Filing', nameAr: 'تقديم للمحكمة', color: '#06B6D4' },
    { name: 'Hearings', nameAr: 'الجلسات', color: '#EC4899' },
    { name: 'Judgment', nameAr: 'الحكم', color: '#10B981' },
    { name: 'Execution', nameAr: 'التنفيذ', color: '#14B8A6' },
    { name: 'Case Closed', nameAr: 'إغلاق القضية', color: '#64748B', isFinal: true },
  ],
  commercial: [
    { name: 'Case Intake', nameAr: 'استلام القضية', color: '#3B82F6', isInitial: true },
    { name: 'Legal Analysis', nameAr: 'التحليل القانوني', color: '#8B5CF6' },
    { name: 'Negotiation', nameAr: 'المفاوضات', color: '#F59E0B' },
    { name: 'Court Proceedings', nameAr: 'إجراءات المحكمة', color: '#EC4899' },
    { name: 'Settlement/Judgment', nameAr: 'التسوية/الحكم', color: '#10B981' },
    { name: 'Case Closed', nameAr: 'إغلاق القضية', color: '#64748B', isFinal: true },
  ],
  civil: [
    { name: 'Case Intake', nameAr: 'استلام القضية', color: '#3B82F6', isInitial: true },
    { name: 'Research', nameAr: 'البحث', color: '#8B5CF6' },
    { name: 'Filing', nameAr: 'التقديم', color: '#F59E0B' },
    { name: 'Discovery', nameAr: 'الاكتشاف', color: '#06B6D4' },
    { name: 'Trial', nameAr: 'المحاكمة', color: '#EC4899' },
    { name: 'Judgment', nameAr: 'الحكم', color: '#10B981' },
    { name: 'Case Closed', nameAr: 'إغلاق القضية', color: '#64748B', isFinal: true },
  ],
  criminal: [
    { name: 'Case Intake', nameAr: 'استلام القضية', color: '#3B82F6', isInitial: true },
    { name: 'Investigation', nameAr: 'التحقيق', color: '#EF4444' },
    { name: 'Arraignment', nameAr: 'المحاكمة الأولى', color: '#F59E0B' },
    { name: 'Pre-Trial', nameAr: 'ما قبل المحاكمة', color: '#8B5CF6' },
    { name: 'Trial', nameAr: 'المحاكمة', color: '#EC4899' },
    { name: 'Sentencing', nameAr: 'الحكم', color: '#10B981' },
    { name: 'Case Closed', nameAr: 'إغلاق القضية', color: '#64748B', isFinal: true },
  ],
  family: [
    { name: 'Case Intake', nameAr: 'استلام القضية', color: '#3B82F6', isInitial: true },
    { name: 'Documentation', nameAr: 'التوثيق', color: '#F59E0B' },
    { name: 'Mediation', nameAr: 'الوساطة', color: '#8B5CF6' },
    { name: 'Court Filing', nameAr: 'التقديم للمحكمة', color: '#06B6D4' },
    { name: 'Hearings', nameAr: 'الجلسات', color: '#EC4899' },
    { name: 'Final Order', nameAr: 'الحكم النهائي', color: '#10B981' },
    { name: 'Case Closed', nameAr: 'إغلاق القضية', color: '#64748B', isFinal: true },
  ],
} as const

/**
 * Get default stages for a category
 */
export function getDefaultStages(category: string) {
  return defaultStageTemplates[category as keyof typeof defaultStageTemplates] || defaultStageTemplates.civil
}
