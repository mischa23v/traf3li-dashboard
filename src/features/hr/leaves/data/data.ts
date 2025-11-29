export const leaveTypes = [
  { value: 'annual', label: 'إجازة سنوية', labelEn: 'Annual Leave', defaultDays: 21 },
  { value: 'sick', label: 'إجازة مرضية', labelEn: 'Sick Leave', defaultDays: 30 },
  { value: 'personal', label: 'إجازة شخصية', labelEn: 'Personal Leave', defaultDays: 3 },
  { value: 'unpaid', label: 'إجازة بدون راتب', labelEn: 'Unpaid Leave', defaultDays: 0 },
  { value: 'maternity', label: 'إجازة أمومة', labelEn: 'Maternity Leave', defaultDays: 70 },
  { value: 'paternity', label: 'إجازة أبوة', labelEn: 'Paternity Leave', defaultDays: 3 },
  { value: 'hajj', label: 'إجازة حج', labelEn: 'Hajj Leave', defaultDays: 15 },
  { value: 'marriage', label: 'إجازة زواج', labelEn: 'Marriage Leave', defaultDays: 5 },
  { value: 'bereavement', label: 'إجازة عزاء', labelEn: 'Bereavement Leave', defaultDays: 5 },
  { value: 'emergency', label: 'إجازة طارئة', labelEn: 'Emergency Leave', defaultDays: 0 },
  { value: 'study', label: 'إجازة دراسية', labelEn: 'Study Leave', defaultDays: 0 },
  { value: 'compensatory', label: 'إجازة تعويضية', labelEn: 'Compensatory Leave', defaultDays: 0 },
] as const

export const leaveStatuses = [
  { value: 'pending', label: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { value: 'approved', label: 'معتمد', labelEn: 'Approved', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { value: 'rejected', label: 'مرفوض', labelEn: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { value: 'cancelled', label: 'ملغي', labelEn: 'Cancelled', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
] as const

export const leaveStatusColors = new Map([
  ['pending', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'],
  ['approved', 'bg-green-500/10 text-green-500 border-green-500/20'],
  ['rejected', 'bg-red-500/10 text-red-500 border-red-500/20'],
  ['cancelled', 'bg-gray-500/10 text-gray-500 border-gray-500/20'],
])

export const leaveTypeColors = new Map([
  ['annual', 'bg-blue-500/10 text-blue-500'],
  ['sick', 'bg-red-500/10 text-red-500'],
  ['personal', 'bg-purple-500/10 text-purple-500'],
  ['unpaid', 'bg-gray-500/10 text-gray-500'],
  ['maternity', 'bg-pink-500/10 text-pink-500'],
  ['paternity', 'bg-cyan-500/10 text-cyan-500'],
  ['hajj', 'bg-green-500/10 text-green-500'],
  ['marriage', 'bg-rose-500/10 text-rose-500'],
  ['bereavement', 'bg-slate-500/10 text-slate-500'],
  ['emergency', 'bg-orange-500/10 text-orange-500'],
  ['study', 'bg-indigo-500/10 text-indigo-500'],
  ['compensatory', 'bg-teal-500/10 text-teal-500'],
])
