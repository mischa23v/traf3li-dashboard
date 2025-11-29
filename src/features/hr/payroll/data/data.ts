export const payrollStatuses = [
  { value: 'draft', label: 'مسودة', labelEn: 'Draft', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  { value: 'pending_approval', label: 'بانتظار الموافقة', labelEn: 'Pending Approval', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { value: 'approved', label: 'معتمد', labelEn: 'Approved', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'processing', label: 'قيد المعالجة', labelEn: 'Processing', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { value: 'completed', label: 'مكتمل', labelEn: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { value: 'cancelled', label: 'ملغي', labelEn: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
] as const

export const payrollStatusColors = new Map([
  ['draft', 'bg-gray-500/10 text-gray-500 border-gray-500/20'],
  ['pending_approval', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'],
  ['approved', 'bg-blue-500/10 text-blue-500 border-blue-500/20'],
  ['processing', 'bg-purple-500/10 text-purple-500 border-purple-500/20'],
  ['completed', 'bg-green-500/10 text-green-500 border-green-500/20'],
  ['cancelled', 'bg-red-500/10 text-red-500 border-red-500/20'],
])

export const months = [
  { value: 1, label: 'يناير', labelEn: 'January' },
  { value: 2, label: 'فبراير', labelEn: 'February' },
  { value: 3, label: 'مارس', labelEn: 'March' },
  { value: 4, label: 'أبريل', labelEn: 'April' },
  { value: 5, label: 'مايو', labelEn: 'May' },
  { value: 6, label: 'يونيو', labelEn: 'June' },
  { value: 7, label: 'يوليو', labelEn: 'July' },
  { value: 8, label: 'أغسطس', labelEn: 'August' },
  { value: 9, label: 'سبتمبر', labelEn: 'September' },
  { value: 10, label: 'أكتوبر', labelEn: 'October' },
  { value: 11, label: 'نوفمبر', labelEn: 'November' },
  { value: 12, label: 'ديسمبر', labelEn: 'December' },
] as const
