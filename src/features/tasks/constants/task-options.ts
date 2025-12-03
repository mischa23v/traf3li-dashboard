/**
 * Task Options Constants
 * Centralized constants for task management with Arabic labels and tooltips
 */

import type { TaskPriority, TaskStatus, TaskLabel } from '@/services/tasksService'

// ==================== STATUS OPTIONS ====================
export interface StatusOption {
  value: TaskStatus
  label: string
  tooltip: string
  color: string
  bgColor: string
}

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'backlog',
    label: 'جديدة',
    tooltip: 'المهمة لم تبدأ بعد وفي انتظار البدء بالعمل عليها',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100'
  },
  {
    value: 'todo',
    label: 'معلقة',
    tooltip: 'المهمة متوقفة مؤقتاً في انتظار إجراء أو موافقة',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    value: 'in_progress',
    label: 'قيد التنفيذ',
    tooltip: 'المهمة قيد العمل حالياً ويتم تنفيذها',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  },
  {
    value: 'done',
    label: 'مكتملة',
    tooltip: 'تم الانتهاء من تنفيذ المهمة بنجاح',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },
  {
    value: 'canceled',
    label: 'منتهية',
    tooltip: 'المهمة مغلقة نهائياً ولا تحتاج لأي إجراء آخر',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
]

// For forms that only show active statuses (not done/canceled)
export const ACTIVE_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  s => !['done', 'canceled'].includes(s.value)
)

// ==================== PRIORITY OPTIONS ====================
export interface PriorityOption {
  value: TaskPriority
  label: string
  tooltip: string
  color: string
  bgColor: string
  dotColor: string
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: 'critical',
    label: 'عاجل جداً',
    tooltip: 'مهمة عاجلة جداً تتطلب إجراءً فورياً ولا تحتمل أي تأخير',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    dotColor: 'bg-red-500'
  },
  {
    value: 'high',
    label: 'عاجل',
    tooltip: 'مهمة عاجلة يجب إنجازها في أقرب وقت ممكن',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    dotColor: 'bg-orange-500'
  },
  {
    value: 'medium',
    label: 'متوسطة',
    tooltip: 'مهمة ذات أهمية متوسطة ضمن الجدول الزمني المعتاد',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    dotColor: 'bg-yellow-500'
  },
  {
    value: 'low',
    label: 'عادية',
    tooltip: 'مهمة عادية يمكن إنجازها ضمن المواعيد الاعتيادية',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  {
    value: 'none',
    label: 'بدون أولوية',
    tooltip: 'مهمة بدون أولوية محددة',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
    dotColor: 'bg-slate-300'
  },
]

// For forms that show the main 4 priorities (excluding 'none')
export const MAIN_PRIORITY_OPTIONS = PRIORITY_OPTIONS.filter(
  p => p.value !== 'none'
)

// ==================== CATEGORY/LABEL OPTIONS ====================
export interface CategoryOption {
  value: TaskLabel
  label: string
  tooltip: string
  color: string
  bgColor: string
  icon?: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'urgent',
    label: 'عاجل',
    tooltip: 'مهمة تتطلب معالجة سريعة وإجراءً عاجلاً',
    color: 'text-red-800',
    bgColor: 'bg-red-100'
  },
  {
    value: 'legal',
    label: 'قانوني',
    tooltip: 'مهمة تتعلق بالأمور القانونية أو الإجراءات النظامية',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100'
  },
  {
    value: 'administrative',
    label: 'إداري',
    tooltip: 'مهمة إدارية تتعلق بالعمليات والإجراءات الداخلية',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100'
  },
  {
    value: 'bug',
    label: 'تقني',
    tooltip: 'مهمة تتعلق بالمشاكل التقنية أو الأخطاء البرمجية',
    color: 'text-rose-800',
    bgColor: 'bg-rose-100'
  },
  {
    value: 'feature',
    label: 'ميزة',
    tooltip: 'طلب إضافة ميزة أو وظيفة جديدة',
    color: 'text-green-800',
    bgColor: 'bg-green-100'
  },
  {
    value: 'documentation',
    label: 'توثيق',
    tooltip: 'مهمة تتعلق بإعداد أو تحديث الوثائق',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100'
  },
  {
    value: 'enhancement',
    label: 'تحسين',
    tooltip: 'مهمة لتحسين الأداء أو الجودة',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100'
  },
  {
    value: 'question',
    label: 'استفسار',
    tooltip: 'سؤال أو استفسار يحتاج إلى إجابة',
    color: 'text-cyan-800',
    bgColor: 'bg-cyan-100'
  },
]

// Extended categories for legal practice management
export const EXTENDED_CATEGORY_OPTIONS: CategoryOption[] = [
  ...CATEGORY_OPTIONS,
  // Note: These would need to be added to the TaskLabel enum in the backend
  // For now, we keep the existing labels but with Arabic display names
]

// ==================== FIELD TOOLTIPS ====================
export const FIELD_TOOLTIPS = {
  // Basic fields
  title: 'اكتب عنواناً واضحاً ومختصراً يصف المهمة',
  status: 'اختر حالة المهمة الحالية',
  priority: 'اختر مستوى أولوية المهمة',
  category: 'اختر التصنيف المناسب لنوع المهمة',
  tags: 'أضف كلمات مفتاحية لتسهيل البحث والتصنيف (مثال: عقد، عميل، محكمة)',

  // Date and time
  dueDate: 'حدد الموعد النهائي المطلوب لإنجاز المهمة',
  dueTime: 'حدد الوقت المحدد لإنجاز المهمة (اختياري)',
  estimatedMinutes: 'أدخل الوقت المتوقع لإنجاز المهمة بالدقائق',
  startDate: 'حدد تاريخ بدء العمل على المهمة',

  // Relations
  client: 'اختر العميل المرتبط بهذه المهمة',
  case: 'اختر القضية المرتبطة بهذه المهمة إن وجدت',
  assignedTo: 'اختر المحامي أو المسؤول الذي سيتولى تنفيذ المهمة',

  // Description
  description: 'اكتب تفاصيل المهمة والإجراءات المطلوبة بشكل واضح ومفصل',

  // Subtasks
  subtasks: 'أضف مهام فرعية صغيرة لتقسيم المهمة الرئيسية إلى خطوات قابلة للتنفيذ',

  // Recurring
  recurring: 'فعّل هذا الخيار إذا كانت المهمة تتكرر بشكل دوري (يومياً، أسبوعياً، شهرياً)',
  recurringFrequency: 'اختر معدل تكرار المهمة',
  recurringType: 'حدد ما إذا كان التكرار بناءً على تاريخ الاستحقاق أو تاريخ الإكمال',
  recurringDaysOfWeek: 'اختر أيام الأسبوع للمهام الأسبوعية',
  assigneeStrategy: 'اختر طريقة تعيين المسؤول للمهام المتكررة',

  // Reminders
  reminders: 'أضف تذكيرات لتنبيهك قبل موعد استحقاق المهمة',
  reminderType: 'اختر نوع التذكير (إشعار، بريد إلكتروني، رسالة نصية)',
  reminderTime: 'حدد الوقت قبل الموعد لإرسال التذكير',

  // Billing
  isBillable: 'حدد ما إذا كانت المهمة قابلة للفوترة',
  billingType: 'اختر نوع الفوترة (بالساعة، مبلغ ثابت، إلخ)',
  hourlyRate: 'أدخل السعر بالساعة للمهام القابلة للفوترة',

  // Court related
  courtType: 'اختر نوع المحكمة المرتبطة بهذه المهمة',
  courtCaseNumber: 'أدخل رقم القضية في المحكمة',

  // Deadline type
  deadlineType: 'اختر نوع الموعد النهائي (نظامي، قضائي، تعاقدي، داخلي)',
  warningDays: 'حدد عدد الأيام للتحذير قبل الموعد النهائي',
}

// ==================== FREQUENCY OPTIONS ====================
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'يومياً', tooltip: 'تكرار المهمة كل يوم' },
  { value: 'weekly', label: 'أسبوعياً', tooltip: 'تكرار المهمة كل أسبوع' },
  { value: 'biweekly', label: 'كل أسبوعين', tooltip: 'تكرار المهمة كل أسبوعين' },
  { value: 'monthly', label: 'شهرياً', tooltip: 'تكرار المهمة كل شهر' },
  { value: 'quarterly', label: 'ربع سنوي', tooltip: 'تكرار المهمة كل ثلاثة أشهر' },
  { value: 'yearly', label: 'سنوياً', tooltip: 'تكرار المهمة كل سنة' },
  { value: 'custom', label: 'مخصص', tooltip: 'تحديد فترة تكرار مخصصة' },
]

// ==================== DAYS OF WEEK ====================
export const DAYS_OF_WEEK = [
  { value: 0, label: 'أحد' },
  { value: 1, label: 'إثنين' },
  { value: 2, label: 'ثلاثاء' },
  { value: 3, label: 'أربعاء' },
  { value: 4, label: 'خميس' },
  { value: 5, label: 'جمعة' },
  { value: 6, label: 'سبت' },
]

// ==================== ASSIGNEE STRATEGY OPTIONS ====================
export const ASSIGNEE_STRATEGY_OPTIONS = [
  { value: 'fixed', label: 'ثابت', description: 'نفس الشخص دائماً', tooltip: 'تعيين نفس المسؤول لجميع تكرارات المهمة' },
  { value: 'round_robin', label: 'بالتناوب', description: 'توزيع تناوبي على الفريق', tooltip: 'توزيع المهام بالتناوب على أعضاء الفريق' },
  { value: 'random', label: 'عشوائي', description: 'اختيار عشوائي', tooltip: 'اختيار المسؤول بشكل عشوائي من الفريق' },
  { value: 'least_assigned', label: 'الأقل مهام', description: 'للشخص الأقل انشغالاً', tooltip: 'تعيين المهمة للشخص الذي لديه أقل عدد من المهام' },
]

// ==================== REMINDER TYPE OPTIONS ====================
export const REMINDER_TYPE_OPTIONS = [
  { value: 'notification', label: 'إشعار', tooltip: 'إشعار داخل التطبيق' },
  { value: 'email', label: 'بريد إلكتروني', tooltip: 'إرسال تذكير عبر البريد الإلكتروني' },
  { value: 'sms', label: 'رسالة نصية', tooltip: 'إرسال تذكير عبر رسالة نصية' },
  { value: 'push', label: 'إشعار فوري', tooltip: 'إشعار فوري على الجوال' },
]

// ==================== HELPER FUNCTIONS ====================
export function getStatusOption(value: string): StatusOption | undefined {
  return STATUS_OPTIONS.find(s => s.value === value)
}

export function getPriorityOption(value: string): PriorityOption | undefined {
  return PRIORITY_OPTIONS.find(p => p.value === value)
}

export function getCategoryOption(value: string): CategoryOption | undefined {
  return CATEGORY_OPTIONS.find(c => c.value === value)
}

export function getStatusLabel(value: string): string {
  return getStatusOption(value)?.label || value
}

export function getPriorityLabel(value: string): string {
  return getPriorityOption(value)?.label || value
}

export function getCategoryLabel(value: string): string {
  return getCategoryOption(value)?.label || value
}

export function getStatusTooltip(value: string): string {
  return getStatusOption(value)?.tooltip || ''
}

export function getPriorityTooltip(value: string): string {
  return getPriorityOption(value)?.tooltip || ''
}

export function getCategoryTooltip(value: string): string {
  return getCategoryOption(value)?.tooltip || ''
}
