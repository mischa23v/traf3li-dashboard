import { z } from 'zod'
import { GraduationCap } from 'lucide-react'
import { GenericFormDialog } from '@/components/generic-form-dialog'
import type { FormSectionConfig } from '@/components/generic-form-dialog'
import type { Education, EducationLevel } from '@/services/hrService'

interface EducationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  education?: Education | null
  onSave: (education: Omit<Education, 'educationId'>) => void
  isLoading?: boolean
}

const EDUCATION_LEVELS: { value: EducationLevel; labelAr: string; labelEn: string }[] = [
  { value: 'high_school', labelAr: 'ثانوية عامة', labelEn: 'High School' },
  { value: 'diploma', labelAr: 'دبلوم', labelEn: 'Diploma' },
  { value: 'bachelors', labelAr: 'بكالوريوس', labelEn: "Bachelor's" },
  { value: 'masters', labelAr: 'ماجستير', labelEn: "Master's" },
  { value: 'doctorate', labelAr: 'دكتوراه', labelEn: 'Doctorate' },
  { value: 'professional', labelAr: 'مهنية', labelEn: 'Professional' },
]

const COUNTRIES = [
  { value: 'Saudi Arabia', labelAr: 'المملكة العربية السعودية', labelEn: 'Saudi Arabia' },
  { value: 'United States', labelAr: 'الولايات المتحدة', labelEn: 'United States' },
  { value: 'United Kingdom', labelAr: 'المملكة المتحدة', labelEn: 'United Kingdom' },
  { value: 'Egypt', labelAr: 'مصر', labelEn: 'Egypt' },
  { value: 'Jordan', labelAr: 'الأردن', labelEn: 'Jordan' },
  { value: 'Lebanon', labelAr: 'لبنان', labelEn: 'Lebanon' },
  { value: 'UAE', labelAr: 'الإمارات', labelEn: 'UAE' },
  { value: 'Canada', labelAr: 'كندا', labelEn: 'Canada' },
  { value: 'Australia', labelAr: 'أستراليا', labelEn: 'Australia' },
  { value: 'Other', labelAr: 'أخرى', labelEn: 'Other' },
]

// Zod schema for education form validation
const educationSchema = z.object({
  schoolUniversity: z.string().min(1, { message: 'School/University name (English) is required' }),
  schoolUniversityAr: z.string().min(1, { message: 'اسم الجامعة/المدرسة (عربي) مطلوب' }),
  qualification: z.string().min(1, { message: 'Qualification (English) is required' }),
  qualificationAr: z.string().min(1, { message: 'المؤهل (عربي) مطلوب' }),
  level: z.enum(['high_school', 'diploma', 'bachelors', 'masters', 'doctorate', 'professional']),
  fieldOfStudy: z.string().min(1, { message: 'Field of study (English) is required' }),
  fieldOfStudyAr: z.string().min(1, { message: 'التخصص (عربي) مطلوب' }),
  yearOfPassing: z.number().min(1950).max(new Date().getFullYear() + 5),
  classPercentage: z.number().min(0).max(100).optional(),
  gpa: z.number().min(0).optional(),
  gpaScale: z.number().optional(),
  country: z.string().min(1, { message: 'Country is required' }),
  verified: z.boolean(),
})

type EducationFormData = z.infer<typeof educationSchema>

export function EducationDialog({ open, onOpenChange, education, onSave, isLoading }: EducationDialogProps) {
  // Form sections configuration
  const sections: FormSectionConfig[] = [
    {
      fields: [
        {
          name: 'schoolUniversityAr',
          type: 'text',
          label: 'School/University (Arabic)',
          labelAr: 'الجامعة/المدرسة (عربي)',
          placeholder: 'King Saud University',
          placeholderAr: 'جامعة الملك سعود',
          required: true,
        },
        {
          name: 'schoolUniversity',
          type: 'text',
          label: 'School/University (English)',
          labelAr: 'الجامعة/المدرسة (إنجليزي)',
          placeholder: 'King Saud University',
          placeholderAr: 'جامعة الملك سعود',
          required: true,
        },
      ],
      columns: 2,
    },
    {
      fields: [
        {
          name: 'qualificationAr',
          type: 'text',
          label: 'Qualification (Arabic)',
          labelAr: 'المؤهل (عربي)',
          placeholder: 'Bachelor of Law',
          placeholderAr: 'بكالوريوس القانون',
          required: true,
        },
        {
          name: 'qualification',
          type: 'text',
          label: 'Qualification (English)',
          labelAr: 'المؤهل (إنجليزي)',
          placeholder: 'Bachelor of Law',
          placeholderAr: 'بكالوريوس القانون',
          required: true,
        },
      ],
      columns: 2,
    },
    {
      fields: [
        {
          name: 'level',
          type: 'select',
          label: 'Education Level',
          labelAr: 'المستوى التعليمي',
          required: true,
          options: EDUCATION_LEVELS.map((lvl) => ({
            value: lvl.value,
            label: lvl.labelEn,
            labelAr: lvl.labelAr,
          })),
        },
        {
          name: 'yearOfPassing',
          type: 'number',
          label: 'Year of Graduation',
          labelAr: 'سنة التخرج',
          required: true,
          min: 1950,
          max: new Date().getFullYear() + 5,
        },
      ],
      columns: 2,
    },
    {
      fields: [
        {
          name: 'fieldOfStudyAr',
          type: 'text',
          label: 'Field of Study (Arabic)',
          labelAr: 'التخصص (عربي)',
          placeholder: 'Law',
          placeholderAr: 'القانون',
          required: true,
        },
        {
          name: 'fieldOfStudy',
          type: 'text',
          label: 'Field of Study (English)',
          labelAr: 'التخصص (إنجليزي)',
          placeholder: 'Law',
          placeholderAr: 'القانون',
          required: true,
        },
      ],
      columns: 2,
    },
    {
      fields: [
        {
          name: 'country',
          type: 'select',
          label: 'Country',
          labelAr: 'الدولة',
          required: true,
          options: COUNTRIES.map((c) => ({
            value: c.value,
            label: c.labelEn,
            labelAr: c.labelAr,
          })),
          colSpan: 2,
        },
      ],
      columns: 2,
    },
    {
      title: 'Academic Performance',
      titleAr: 'الأداء الأكاديمي',
      fields: [
        {
          name: 'classPercentage',
          type: 'number',
          label: 'Percentage',
          labelAr: 'النسبة المئوية',
          placeholder: '85.5',
          min: 0,
          max: 100,
          step: 0.01,
        },
        {
          name: 'gpa',
          type: 'number',
          label: 'GPA',
          labelAr: 'GPA',
          placeholder: '3.75',
          min: 0,
          step: 0.01,
        },
        {
          name: 'gpaScale',
          type: 'select',
          label: 'GPA Scale',
          labelAr: 'سلم GPA',
          options: [
            { value: '4.0', label: '4.0', labelAr: '4.0' },
            { value: '5.0', label: '5.0', labelAr: '5.0' },
            { value: '10.0', label: '10.0', labelAr: '10.0' },
          ],
        },
      ],
      columns: 2,
    },
    {
      title: 'Verification',
      titleAr: 'التحقق',
      fields: [
        {
          name: 'verified',
          type: 'switch',
          label: 'Qualification Verified',
          labelAr: 'تم التحقق من المؤهل',
          description: 'Has this qualification been verified?',
          descriptionAr: 'هل تم التحقق من صحة هذا المؤهل؟',
          colSpan: 2,
        },
      ],
      columns: 2,
    },
  ]

  // Default values from education prop or initial values
  const defaultValues: Partial<EducationFormData> = education
    ? {
        schoolUniversity: education.schoolUniversity,
        schoolUniversityAr: education.schoolUniversityAr,
        qualification: education.qualification,
        qualificationAr: education.qualificationAr,
        level: education.level,
        fieldOfStudy: education.fieldOfStudy,
        fieldOfStudyAr: education.fieldOfStudyAr,
        yearOfPassing: education.yearOfPassing,
        classPercentage: education.classPercentage,
        gpa: education.gpa,
        gpaScale: education.gpaScale,
        country: education.country,
        verified: education.verified,
      }
    : {
        schoolUniversity: '',
        schoolUniversityAr: '',
        qualification: '',
        qualificationAr: '',
        level: 'bachelors' as EducationLevel,
        fieldOfStudy: '',
        fieldOfStudyAr: '',
        yearOfPassing: new Date().getFullYear(),
        classPercentage: undefined,
        gpa: undefined,
        gpaScale: 4.0,
        country: 'Saudi Arabia',
        verified: false,
      }

  // Handle form submission
  const handleSubmit = (data: EducationFormData) => {
    const educationData: Omit<Education, 'educationId'> = {
      ...data,
      verificationDate: data.verified ? new Date().toISOString() : undefined,
    }
    onSave(educationData)
  }

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={education ? 'Edit Education' : 'Add Education'}
      titleAr={education ? 'تعديل المؤهل التعليمي' : 'إضافة مؤهل تعليمي'}
      schema={educationSchema}
      sections={sections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode={education ? 'edit' : 'create'}
      submitLabel={education ? 'Save' : 'Add'}
      submitLabelAr={education ? 'حفظ' : 'إضافة'}
      cancelLabel="Cancel"
      cancelLabelAr="إلغاء"
      maxWidth="3xl"
    />
  )
}
