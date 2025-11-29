export const allowanceTypes = [
  { value: 'housing', label: 'بدل سكن', labelEn: 'Housing' },
  { value: 'transportation', label: 'بدل مواصلات', labelEn: 'Transportation' },
  { value: 'food', label: 'بدل طعام', labelEn: 'Food' },
  { value: 'phone', label: 'بدل هاتف', labelEn: 'Phone' },
  { value: 'overtime', label: 'عمل إضافي', labelEn: 'Overtime' },
  { value: 'commission', label: 'عمولة', labelEn: 'Commission' },
  { value: 'bonus', label: 'مكافأة', labelEn: 'Bonus' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

export const deductionTypes = [
  { value: 'gosi', label: 'التأمينات الاجتماعية', labelEn: 'GOSI' },
  { value: 'tax', label: 'ضريبة', labelEn: 'Tax' },
  { value: 'loan', label: 'قرض', labelEn: 'Loan' },
  { value: 'advance', label: 'سلفة', labelEn: 'Advance' },
  { value: 'absence', label: 'غياب', labelEn: 'Absence' },
  { value: 'late', label: 'تأخير', labelEn: 'Late' },
  { value: 'insurance', label: 'تأمين', labelEn: 'Insurance' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

export const salaryStatuses = [
  { value: 'active', label: 'نشط', labelEn: 'Active', color: 'bg-green-500/10 text-green-500' },
  { value: 'inactive', label: 'غير نشط', labelEn: 'Inactive', color: 'bg-gray-500/10 text-gray-500' },
  { value: 'superseded', label: 'محل بديل', labelEn: 'Superseded', color: 'bg-yellow-500/10 text-yellow-500' },
] as const

export const paymentFrequencies = [
  { value: 'monthly', label: 'شهري', labelEn: 'Monthly' },
  { value: 'bi_weekly', label: 'نصف شهري', labelEn: 'Bi-weekly' },
  { value: 'weekly', label: 'أسبوعي', labelEn: 'Weekly' },
] as const
