import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, CheckCircle, Briefcase, Lock } from 'lucide-react'
import type { ExternalWorkHistory } from '@/services/hrService'

interface WorkHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workHistory?: ExternalWorkHistory | null
  onSave: (history: Omit<ExternalWorkHistory, 'historyId'>) => void
  isLoading?: boolean
}

export function WorkHistoryDialog({ open, onOpenChange, workHistory, onSave, isLoading }: WorkHistoryDialogProps) {
  const [companyName, setCompanyName] = useState('')
  const [companyNameAr, setCompanyNameAr] = useState('')
  const [designation, setDesignation] = useState('')
  const [designationAr, setDesignationAr] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [salary, setSalary] = useState<number | undefined>(undefined)
  const [currency, setCurrency] = useState('SAR')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [reasonForLeaving, setReasonForLeaving] = useState('')
  const [verified, setVerified] = useState(false)

  // Calculate total experience
  const calculateExperience = (from: string, to: string): string => {
    if (!from || !to) return ''

    const fromDate = new Date(from)
    const toDate = new Date(to)

    const diffMs = toDate.getTime() - fromDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)

    if (years > 0 && months > 0) {
      return `${years} سنة ${months} شهر`
    } else if (years > 0) {
      return `${years} سنة`
    } else if (months > 0) {
      return `${months} شهر`
    } else {
      return `${diffDays} يوم`
    }
  }

  useEffect(() => {
    if (workHistory) {
      setCompanyName(workHistory.companyName)
      setCompanyNameAr(workHistory.companyNameAr)
      setDesignation(workHistory.designation)
      setDesignationAr(workHistory.designationAr)
      setFromDate(workHistory.fromDate.split('T')[0])
      setToDate(workHistory.toDate.split('T')[0])
      setSalary(workHistory.salary)
      setCurrency(workHistory.currency || 'SAR')
      setAddress(workHistory.address || '')
      setContactPerson(workHistory.contactPerson || '')
      setContactPhone(workHistory.contactPhone || '')
      setReasonForLeaving(workHistory.reasonForLeaving || '')
      setVerified(workHistory.verified)
    } else {
      // Reset form
      setCompanyName('')
      setCompanyNameAr('')
      setDesignation('')
      setDesignationAr('')
      setFromDate('')
      setToDate('')
      setSalary(undefined)
      setCurrency('SAR')
      setAddress('')
      setContactPerson('')
      setContactPhone('')
      setReasonForLeaving('')
      setVerified(false)
    }
  }, [workHistory, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalExperience = calculateExperience(fromDate, toDate)

    const historyData: Omit<ExternalWorkHistory, 'historyId'> = {
      companyName,
      companyNameAr,
      designation,
      designationAr,
      fromDate,
      toDate,
      salary,
      currency,
      totalExperience,
      address,
      contactPerson,
      contactPhone,
      reasonForLeaving,
      verified,
      verificationDate: verified ? new Date().toISOString() : undefined,
    }

    onSave(historyData)
  }

  const totalExperience = calculateExperience(fromDate, toDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-500" />
            {workHistory ? 'تعديل الخبرة الوظيفية' : 'إضافة خبرة وظيفية'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                اسم الشركة (عربي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={companyNameAr}
                onChange={(e) => setCompanyNameAr(e.target.value)}
                placeholder="شركة المحاماة السعودية"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                اسم الشركة (إنجليزي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Saudi Law Firm"
                required
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Designation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                المسمى الوظيفي (عربي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={designationAr}
                onChange={(e) => setDesignationAr(e.target.value)}
                placeholder="محامي أول"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                المسمى الوظيفي (إنجليزي) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Attorney"
                required
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                من تاريخ <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                إلى تاريخ <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Total Experience Display */}
          {totalExperience && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="text-sm text-blue-700">مدة الخبرة: </span>
                  <span className="font-bold text-blue-800">{totalExperience}</span>
                </div>
              </div>
            </div>
          )}

          {/* Salary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-navy font-medium">الراتب</Label>
              <Input
                type="number"
                value={salary || ''}
                onChange={(e) => setSalary(e.target.value ? parseFloat(e.target.value) : undefined)}
                min={0}
                step={100}
                placeholder="15000"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">العملة</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="SAR"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-navy font-medium">عنوان الشركة</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="الرياض، المملكة العربية السعودية"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">اسم المرجع</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="اسم المدير أو المشرف"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                رقم هاتف المرجع
                <Lock className="h-3 w-3 text-slate-500 inline ms-1" />
              </Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+966 5XXXXXXXX"
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Reason for Leaving */}
          <div className="space-y-2">
            <Label className="text-navy font-medium">سبب ترك العمل</Label>
            <Textarea
              value={reasonForLeaving}
              onChange={(e) => setReasonForLeaving(e.target.value)}
              placeholder="اذكر سبب ترك العمل (اختياري)"
              className="min-h-[80px] rounded-xl"
              rows={3}
            />
          </div>

          {/* Verification */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <Label className="text-navy font-medium">تم التحقق من الخبرة</Label>
              <p className="text-sm text-slate-500">هل تم التحقق من صحة هذه الخبرة؟</p>
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
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
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
