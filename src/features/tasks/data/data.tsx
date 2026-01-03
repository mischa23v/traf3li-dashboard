import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  CheckCircle,
  AlertCircle,
  Timer,
  HelpCircle,
  CircleOff,
  Flame,
} from 'lucide-react'

export const labels = [
  {
    value: 'bug',
    label: 'تقني',
  },
  {
    value: 'feature',
    label: 'ميزة',
  },
  {
    value: 'documentation',
    label: 'توثيق',
  },
  {
    value: 'urgent',
    label: 'عاجل',
  },
  {
    value: 'legal',
    label: 'قانوني',
  },
  {
    value: 'administrative',
    label: 'إداري',
  },
  {
    value: 'enhancement',
    label: 'تحسين',
  },
  {
    value: 'question',
    label: 'استفسار',
  },
]

export const statuses = [
  {
    label: 'جديدة',
    value: 'todo' as const,
    icon: HelpCircle,
    tooltip: 'المهمة لم تبدأ بعد وفي انتظار البدء بالعمل عليها',
  },
  {
    label: 'معلقة',
    value: 'pending' as const,
    icon: Circle,
    tooltip: 'المهمة متوقفة مؤقتاً في انتظار إجراء أو موافقة',
  },
  {
    label: 'قيد التنفيذ',
    value: 'in_progress' as const,
    icon: Timer,
    tooltip: 'المهمة قيد العمل حالياً ويتم تنفيذها',
  },
  {
    label: 'مكتملة',
    value: 'done' as const,
    icon: CheckCircle,
    tooltip: 'تم الانتهاء من تنفيذ المهمة بنجاح',
  },
  {
    label: 'منتهية',
    value: 'canceled' as const,
    icon: CircleOff,
    tooltip: 'المهمة مغلقة نهائياً ولا تحتاج لأي إجراء آخر',
  },
]

export const priorities = [
  {
    label: 'عاجل جداً',
    value: 'urgent' as const,
    icon: Flame,
    tooltip: 'مهمة عاجلة جداً تتطلب إجراءً فورياً ولا تحتمل أي تأخير',
  },
  {
    label: 'عاجل',
    value: 'high' as const,
    icon: AlertCircle,
    tooltip: 'مهمة عاجلة يجب إنجازها في أقرب وقت ممكن',
  },
  {
    label: 'متوسطة',
    value: 'medium' as const,
    icon: ArrowRight,
    tooltip: 'مهمة ذات أهمية متوسطة ضمن الجدول الزمني المعتاد',
  },
  {
    label: 'عادية',
    value: 'low' as const,
    icon: ArrowDown,
    tooltip: 'مهمة عادية يمكن إنجازها ضمن المواعيد الاعتيادية',
  },
]
