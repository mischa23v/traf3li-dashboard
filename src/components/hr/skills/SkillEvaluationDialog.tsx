import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Award, Calendar, User, TrendingUp, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useEvaluateSkill, useSkillTrends } from '@/hooks/useEmployeeSkillMap'
import type { EmployeeSkillDetail } from '@/services/employeeSkillMapService'
import { PROFICIENCY_LEVELS } from '@/services/skillService'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface SkillEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  skill?: EmployeeSkillDetail
}

export function SkillEvaluationDialog({
  open,
  onOpenChange,
  employeeId,
  skill,
}: SkillEvaluationDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const evaluateMutation = useEvaluateSkill()
  const { data: trends } = useSkillTrends(employeeId, skill?.skillId || '')

  // Form state
  const [proficiency, setProficiency] = useState<number>(1)
  const [notes, setNotes] = useState('')
  const [certificationId, setCertificationId] = useState('')
  const [certificationExpiry, setCertificationExpiry] = useState('')

  // Initialize form when skill changes
  useEffect(() => {
    if (skill) {
      setProficiency(skill.proficiency)
      setNotes(skill.notes || '')
      setCertificationId(skill.certificationId || '')
      setCertificationExpiry(skill.certificationExpiry || '')
    } else {
      setProficiency(1)
      setNotes('')
      setCertificationId('')
      setCertificationExpiry('')
    }
  }, [skill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!skill) return

    try {
      // In a real app, get the evaluator ID from auth context
      const evaluatorId = 'current-user-id'

      await evaluateMutation.mutateAsync({
        employeeId,
        skillId: skill.skillId,
        proficiency,
        evaluatorId,
        notes: notes.trim() || undefined,
      })

      toast.success(
        isArabic ? 'تم تقييم المهارة بنجاح' : 'Skill evaluated successfully'
      )

      onOpenChange(false)
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const getProficiencyLabel = (level: number) => {
    const proficiency = PROFICIENCY_LEVELS.find((p) => p.level === level)
    if (!proficiency) return ''
    return isArabic ? proficiency.ar : proficiency.en
  }

  const getProficiencyDescription = (level: number) => {
    const proficiency = PROFICIENCY_LEVELS.find((p) => p.level === level)
    return proficiency?.description || ''
  }

  const getProficiencyColor = (level: number) => {
    const proficiency = PROFICIENCY_LEVELS.find((p) => p.level === level)
    return proficiency?.color || 'gray'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'تقييم المهارة' : 'Evaluate Skill'}
          </DialogTitle>
          <DialogDescription>
            {skill && (
              <div className="mt-2">
                <div className="font-medium text-foreground">
                  {isArabic ? skill.skillNameAr : skill.skillName}
                </div>
                {skill.lastEvaluationDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {isArabic ? 'آخر تقييم:' : 'Last evaluated:'}
                    {format(new Date(skill.lastEvaluationDate), 'PP', {
                      locale: isArabic ? ar : undefined,
                    })}
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          {skill && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isArabic ? 'الكفاءة الحالية' : 'Current Proficiency'}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded bg-${getProficiencyColor(skill.proficiency)}-100 text-${getProficiencyColor(skill.proficiency)}-700`}
                  >
                    {skill.proficiency}
                  </span>
                  <span className="text-sm">{getProficiencyLabel(skill.proficiency)}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isArabic ? 'المُقيّم' : 'Evaluated By'}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {skill.evaluatedByName ? (
                    <>
                      <User className="h-3 w-3 text-muted-foreground" />
                      {skill.evaluatedByName}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skill Trend */}
          {trends && trends.history.length > 0 && (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">
                    {isArabic ? 'الاتجاه' : 'Trend'}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    trends.trend === 'improving'
                      ? 'text-emerald-600'
                      : trends.trend === 'declining'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {trends.trend === 'improving'
                    ? isArabic
                      ? 'تحسن'
                      : 'Improving'
                    : trends.trend === 'declining'
                    ? isArabic
                      ? 'تراجع'
                      : 'Declining'
                    : isArabic
                    ? 'مستقر'
                    : 'Stable'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'آخر 3 تقييمات' : 'Last 3 Evaluations'}
                </div>
                {trends.history.slice(-3).reverse().map((evaluation, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(evaluation.date), 'PP', {
                        locale: isArabic ? ar : undefined,
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{evaluation.evaluatedBy}</span>
                      <span
                        className={`px-2 py-0.5 rounded bg-${getProficiencyColor(evaluation.proficiency)}-100 text-${getProficiencyColor(evaluation.proficiency)}-700`}
                      >
                        {evaluation.proficiency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proficiency Level Selection */}
          <div className="space-y-3">
            <Label>
              {isArabic ? 'مستوى الكفاءة الجديد' : 'New Proficiency Level'}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <RadioGroup
              value={proficiency.toString()}
              onValueChange={(value) => setProficiency(parseInt(value))}
              className="space-y-3"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <div
                  key={level.level}
                  className={`flex items-start space-x-3 space-x-reverse p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    proficiency === level.level
                      ? `border-${level.color}-500 bg-${level.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setProficiency(level.level)}
                >
                  <RadioGroupItem
                    value={level.level.toString()}
                    id={`level-${level.level}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`level-${level.level}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-${level.color}-100 text-${level.color}-700 font-medium`}
                      >
                        {level.level}
                      </span>
                      <span className="font-medium">
                        {isArabic ? level.ar : level.en}
                      </span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Certification Details */}
          {skill?.certificationId && (
            <div className="space-y-4 p-4 border rounded-lg bg-amber-50">
              <div className="flex items-center gap-2 text-amber-700">
                <Award className="h-4 w-4" />
                <span className="font-medium">
                  {isArabic ? 'تفاصيل الشهادة' : 'Certification Details'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificationId">
                    {isArabic ? 'رقم الشهادة' : 'Certification ID'}
                  </Label>
                  <Input
                    id="certificationId"
                    value={certificationId}
                    onChange={(e) => setCertificationId(e.target.value)}
                    placeholder="CERT-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificationExpiry">
                    {isArabic ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}
                  </Label>
                  <Input
                    id="certificationExpiry"
                    type="date"
                    value={certificationExpiry}
                    onChange={(e) => setCertificationExpiry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {isArabic ? 'ملاحظات التقييم' : 'Evaluation Notes'}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isArabic
                  ? 'أضف أي ملاحظات أو تعليقات حول هذا التقييم...'
                  : 'Add any notes or comments about this evaluation...'
              }
              rows={4}
              dir={isArabic ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Evaluation Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>
              {isArabic
                ? 'سيتم تسجيل هذا التقييم في سجل مهارات الموظف'
                : 'This evaluation will be recorded in the employee skill history'}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={evaluateMutation.isPending}>
              {isArabic ? 'حفظ التقييم' : 'Save Evaluation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
