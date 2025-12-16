import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, CheckCircle, GraduationCap } from 'lucide-react'
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
  { value: 'bachelors', labelAr: 'بكالوريوس', labelEn: 'Bachelor\'s' },
  { value: 'masters', labelAr: 'ماجستير', labelEn: 'Master\'s' },
  { value: 'doctorate', labelAr: 'دكتوراه', labelEn: 'Doctorate' },
  { value: 'professional', labelAr: 'مهنية', labelEn: 'Professional' },
]

const COUNTRIES = [
  'Saudi Arabia',
  'United States',
  'United Kingdom',
  'Egypt',
  'Jordan',
  'Lebanon',
  'UAE',
  'Canada',
  'Australia',
  'Other',
]

export function EducationDialog({ open, onOpenChange, education, onSave, isLoading }: EducationDialogProps) {
  const [schoolUniversity, setSchoolUniversity] = useState('')
  const [schoolUniversityAr, setSchoolUniversityAr] = useState('')
  const [qualification, setQualification] = useState('')
  const [qualificationAr, setQualificationAr] = useState('')
  const [level, setLevel] = useState<EducationLevel>('bachelors')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [fieldOfStudyAr, setFieldOfStudyAr] = useState('')
  const [yearOfPassing, setYearOfPassing] = useState<number>(new Date().getFullYear())
  const [classPercentage, setClassPercentage] = useState<number | undefined>(undefined)
  const [gpa, setGpa] = useState<number | undefined>(undefined)
  const [gpaScale, setGpaScale] = useState<number | undefined>(4.0)
  const [country, setCountry] = useState('Saudi Arabia')
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (education) {
      setSchoolUniversity(education.schoolUniversity)
      setSchoolUniversityAr(education.schoolUniversityAr)
      setQualification(education.qualification)
      setQualificationAr(education.qualificationAr)
      setLevel(education.level)
      setFieldOfStudy(education.fieldOfStudy)
      setFieldOfStudyAr(education.fieldOfStudyAr)
      setYearOfPassing(education.yearOfPassing)
      setClassPercentage(education.classPercentage)
      setGpa(education.gpa)
      setGpaScale(education.gpaScale)
      setCountry(education.country)
      setVerified(education.verified)
    } else {
      // Reset form
      setSchoolUniversity('')
      setSchoolUniversityAr('')
      setQualification('')
      setQualificationAr('')
      setLevel('bachelors')
      setFieldOfStudy('')
      setFieldOfStudyAr('')
      setYearOfPassing(new Date().getFullYear())
      setClassPercentage(undefined)
      setGpa(undefined)
      setGpaScale(4.0)
      setCountry('Saudi Arabia')
      setVerified(false)
    }
  }, [education, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const educationData: Omit<Education, 'educationId'> = {
      schoolUniversity,
      schoolUniversityAr,
      qualification,
      qualificationAr,
      level,
      fieldOfStudy,
      fieldOfStudyAr,
      yearOfPassing,
      classPercentage,
      gpa,
      gpaScale,
      country,
      verified,
      verificationDate: verified ? new Date().toISOString() : undefined,
    }

    onSave(educationData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            {education ? 'تعديل المؤهل التعليمي' : 'إضافة مؤهل تعليمي'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School/University Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                الجامعة/المدرسة (عربي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={schoolUniversityAr}
                onChange={(e) => setSchoolUniversityAr(e.target.value)}
                placeholder="جامعة الملك سعود"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                الجامعة/المدرسة (إنجليزي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={schoolUniversity}
                onChange={(e) => setSchoolUniversity(e.target.value)}
                placeholder="King Saud University"
                required
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Qualification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                المؤهل (عربي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={qualificationAr}
                onChange={(e) => setQualificationAr(e.target.value)}
                placeholder="بكالوريوس القانون"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                المؤهل (إنجليزي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Bachelor of Law"
                required
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                المستوى التعليمي <span className="text-red-500">*</span>
              </Label>
              <Select value={level} onValueChange={(v) => setLevel(v as EducationLevel)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                سنة التخرج <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={yearOfPassing}
                onChange={(e) => setYearOfPassing(parseInt(e.target.value) || new Date().getFullYear())}
                min={1950}
                max={new Date().getFullYear() + 5}
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Field of Study */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                التخصص (عربي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fieldOfStudyAr}
                onChange={(e) => setFieldOfStudyAr(e.target.value)}
                placeholder="القانون"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                التخصص (إنجليزي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="Law"
                required
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="text-navy font-medium">
              الدولة <span className="text-red-500">*</span>
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'Saudi Arabia' ? 'المملكة العربية السعودية' :
                     c === 'United States' ? 'الولايات المتحدة' :
                     c === 'United Kingdom' ? 'المملكة المتحدة' :
                     c === 'Egypt' ? 'مصر' :
                     c === 'Jordan' ? 'الأردن' :
                     c === 'Lebanon' ? 'لبنان' :
                     c === 'UAE' ? 'الإمارات' :
                     c === 'Canada' ? 'كندا' :
                     c === 'Australia' ? 'أستراليا' : 'أخرى'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GPA or Percentage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">النسبة المئوية</Label>
              <Input
                type="number"
                value={classPercentage || ''}
                onChange={(e) => setClassPercentage(e.target.value ? parseFloat(e.target.value) : undefined)}
                min={0}
                max={100}
                step={0.01}
                placeholder="85.5"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">GPA</Label>
              <Input
                type="number"
                value={gpa || ''}
                onChange={(e) => setGpa(e.target.value ? parseFloat(e.target.value) : undefined)}
                min={0}
                step={0.01}
                placeholder="3.75"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">سلم GPA</Label>
              <Select
                value={gpaScale?.toString() || '4.0'}
                onValueChange={(v) => setGpaScale(parseFloat(v))}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0">4.0</SelectItem>
                  <SelectItem value="5.0">5.0</SelectItem>
                  <SelectItem value="10.0">10.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Verification */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <Label className="text-navy font-medium">تم التحقق من المؤهل</Label>
              <p className="text-sm text-slate-500">هل تم التحقق من صحة هذا المؤهل؟</p>
            </div>
            <Switch checked={verified} onCheckedChange={setVerified} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 ms-2" />
                  حفظ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
