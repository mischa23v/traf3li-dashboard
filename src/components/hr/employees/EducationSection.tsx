import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Plus, Edit2, Trash2, CheckCircle, Calendar } from 'lucide-react'
import { EducationDialog } from './EducationDialog'
import type { Education, EducationLevel } from '@/services/hrService'

interface EducationSectionProps {
  education: Education[]
  onAdd?: (education: Omit<Education, 'educationId'>) => void
  onEdit?: (educationId: string, education: Omit<Education, 'educationId'>) => void
  onDelete?: (educationId: string) => void
  readOnly?: boolean
}

const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  high_school: 'ثانوية عامة',
  diploma: 'دبلوم',
  bachelors: 'بكالوريوس',
  masters: 'ماجستير',
  doctorate: 'دكتوراه',
  professional: 'مهنية',
}

export function EducationSection({ education, onAdd, onEdit, onDelete, readOnly = false }: EducationSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null)

  const handleAdd = () => {
    setSelectedEducation(null)
    setDialogOpen(true)
  }

  const handleEdit = (edu: Education) => {
    setSelectedEducation(edu)
    setDialogOpen(true)
  }

  const handleSave = (educationData: Omit<Education, 'educationId'>) => {
    if (selectedEducation && onEdit) {
      onEdit(selectedEducation.educationId, educationData)
    } else if (onAdd) {
      onAdd(educationData)
    }
    setDialogOpen(false)
    setSelectedEducation(null)
  }

  const handleDelete = (educationId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المؤهل التعليمي؟')) {
      onDelete?.(educationId)
    }
  }

  return (
    <>
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              المؤهلات التعليمية
            </CardTitle>
            {!readOnly && (
              <Button
                size="sm"
                onClick={handleAdd}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 ms-1" />
                إضافة مؤهل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {education && education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu) => (
                <div
                  key={edu.educationId}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy">{edu.qualificationAr}</h3>
                          <p className="text-sm text-slate-500" dir="ltr">{edu.qualification}</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 me-4">
                        <div>
                          <span className="text-xs text-slate-500">الجامعة/المدرسة:</span>
                          <p className="text-sm font-medium text-slate-900">{edu.schoolUniversityAr}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">المستوى:</span>
                          <p className="text-sm font-medium text-slate-900">
                            {EDUCATION_LEVEL_LABELS[edu.level]}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">التخصص:</span>
                          <p className="text-sm font-medium text-slate-900">{edu.fieldOfStudyAr}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">سنة التخرج:</span>
                          <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {edu.yearOfPassing}
                          </p>
                        </div>
                        {(edu.gpa || edu.classPercentage) && (
                          <div>
                            <span className="text-xs text-slate-500">التقدير:</span>
                            <p className="text-sm font-medium text-slate-900">
                              {edu.gpa && `GPA: ${edu.gpa}/${edu.gpaScale || 4.0}`}
                              {edu.gpa && edu.classPercentage && ' | '}
                              {edu.classPercentage && `${edu.classPercentage}%`}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-slate-500">الدولة:</span>
                          <p className="text-sm font-medium text-slate-900">
                            {edu.country === 'Saudi Arabia' ? 'المملكة العربية السعودية' : edu.country}
                          </p>
                        </div>
                      </div>

                      {/* Verification Badge */}
                      <div className="mt-3">
                        <Badge
                          className={
                            edu.verified
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }
                        >
                          {edu.verified ? (
                            <>
                              <CheckCircle className="w-3 h-3 ms-1" />
                              تم التحقق
                            </>
                          ) : (
                            'لم يتم التحقق'
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    {!readOnly && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(edu)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(edu.educationId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-medium">لا توجد مؤهلات تعليمية</p>
              {!readOnly && (
                <p className="text-sm mt-1">اضغط على "إضافة مؤهل" لإضافة مؤهلات تعليمية</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <EducationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        education={selectedEducation}
        onSave={handleSave}
      />
    </>
  )
}
