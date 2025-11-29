export const evaluationTypes = [
  { value: 'annual', label: 'تقييم سنوي', labelEn: 'Annual Review' },
  { value: 'semi_annual', label: 'تقييم نصف سنوي', labelEn: 'Semi-Annual Review' },
  { value: 'quarterly', label: 'تقييم ربع سنوي', labelEn: 'Quarterly Review' },
  { value: 'probation', label: 'تقييم فترة التجربة', labelEn: 'Probation Review' },
  { value: 'project', label: 'تقييم مشروع', labelEn: 'Project Review' },
  { value: 'promotion', label: 'تقييم ترقية', labelEn: 'Promotion Review' },
  { value: 'performance_improvement', label: 'تقييم تحسين الأداء', labelEn: 'PIP Review' },
  { value: 'special', label: 'تقييم خاص', labelEn: 'Special Review' },
] as const

export const evaluationStatuses = [
  { value: 'draft', label: 'مسودة', labelEn: 'Draft', color: 'bg-gray-500/10 text-gray-500' },
  { value: 'self_assessment', label: 'التقييم الذاتي', labelEn: 'Self Assessment', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'manager_review', label: 'مراجعة المدير', labelEn: 'Manager Review', color: 'bg-yellow-500/10 text-yellow-500' },
  { value: 'hr_review', label: 'مراجعة الموارد البشرية', labelEn: 'HR Review', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'completed', label: 'مكتمل', labelEn: 'Completed', color: 'bg-green-500/10 text-green-500' },
  { value: 'acknowledged', label: 'تم الإقرار', labelEn: 'Acknowledged', color: 'bg-teal-500/10 text-teal-500' },
] as const

export const performanceLevels = [
  { value: 'exceptional', label: 'استثنائي', labelEn: 'Exceptional', rating: 5, color: 'bg-green-500' },
  { value: 'exceeds', label: 'يفوق التوقعات', labelEn: 'Exceeds Expectations', rating: 4, color: 'bg-blue-500' },
  { value: 'meets', label: 'يلبي التوقعات', labelEn: 'Meets Expectations', rating: 3, color: 'bg-yellow-500' },
  { value: 'needs_improvement', label: 'يحتاج تحسين', labelEn: 'Needs Improvement', rating: 2, color: 'bg-orange-500' },
  { value: 'unsatisfactory', label: 'غير مُرضٍ', labelEn: 'Unsatisfactory', rating: 1, color: 'bg-red-500' },
] as const

export const competencyCategories = [
  { value: 'technical', label: 'المهارات الفنية', labelEn: 'Technical Skills' },
  { value: 'communication', label: 'التواصل', labelEn: 'Communication' },
  { value: 'leadership', label: 'القيادة', labelEn: 'Leadership' },
  { value: 'teamwork', label: 'العمل الجماعي', labelEn: 'Teamwork' },
  { value: 'problem_solving', label: 'حل المشكلات', labelEn: 'Problem Solving' },
  { value: 'time_management', label: 'إدارة الوقت', labelEn: 'Time Management' },
  { value: 'adaptability', label: 'التكيف', labelEn: 'Adaptability' },
  { value: 'initiative', label: 'المبادرة', labelEn: 'Initiative' },
  { value: 'customer_focus', label: 'التركيز على العميل', labelEn: 'Customer Focus' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

export const evaluationStatusColors = new Map([
  ['draft', 'bg-gray-500/10 text-gray-500 border-gray-500/20'],
  ['self_assessment', 'bg-blue-500/10 text-blue-500 border-blue-500/20'],
  ['manager_review', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'],
  ['hr_review', 'bg-purple-500/10 text-purple-500 border-purple-500/20'],
  ['completed', 'bg-green-500/10 text-green-500 border-green-500/20'],
  ['acknowledged', 'bg-teal-500/10 text-teal-500 border-teal-500/20'],
])

export const performanceLevelColors = new Map([
  ['exceptional', 'bg-green-500'],
  ['exceeds', 'bg-blue-500'],
  ['meets', 'bg-yellow-500'],
  ['needs_improvement', 'bg-orange-500'],
  ['unsatisfactory', 'bg-red-500'],
])
