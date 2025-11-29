export const attendanceStatuses = [
  { value: 'present', label: 'حاضر', labelEn: 'Present', color: 'bg-green-500/10 text-green-500' },
  { value: 'absent', label: 'غائب', labelEn: 'Absent', color: 'bg-red-500/10 text-red-500' },
  { value: 'late', label: 'متأخر', labelEn: 'Late', color: 'bg-yellow-500/10 text-yellow-500' },
  { value: 'early_leave', label: 'انصراف مبكر', labelEn: 'Early Leave', color: 'bg-orange-500/10 text-orange-500' },
  { value: 'half_day', label: 'نصف يوم', labelEn: 'Half Day', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'on_leave', label: 'في إجازة', labelEn: 'On Leave', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'holiday', label: 'عطلة', labelEn: 'Holiday', color: 'bg-gray-500/10 text-gray-500' },
  { value: 'work_from_home', label: 'عمل من المنزل', labelEn: 'Work From Home', color: 'bg-cyan-500/10 text-cyan-500' },
  { value: 'business_trip', label: 'رحلة عمل', labelEn: 'Business Trip', color: 'bg-pink-500/10 text-pink-500' },
] as const

export const checkMethods = [
  { value: 'manual', label: 'يدوي', labelEn: 'Manual' },
  { value: 'biometric', label: 'بصمة', labelEn: 'Biometric' },
  { value: 'mobile_app', label: 'تطبيق الجوال', labelEn: 'Mobile App' },
  { value: 'web', label: 'الويب', labelEn: 'Web' },
] as const

export const attendanceStatusColors = new Map([
  ['present', 'bg-green-500/10 text-green-500 border-green-500/20'],
  ['absent', 'bg-red-500/10 text-red-500 border-red-500/20'],
  ['late', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'],
  ['early_leave', 'bg-orange-500/10 text-orange-500 border-orange-500/20'],
  ['half_day', 'bg-blue-500/10 text-blue-500 border-blue-500/20'],
  ['on_leave', 'bg-purple-500/10 text-purple-500 border-purple-500/20'],
  ['holiday', 'bg-gray-500/10 text-gray-500 border-gray-500/20'],
  ['work_from_home', 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'],
  ['business_trip', 'bg-pink-500/10 text-pink-500 border-pink-500/20'],
])
