import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowRight, Save, Trash2, Copy, Clock } from 'lucide-react'
import { useTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry, useCreateTimeEntry } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

const billableRates = [
  { value: '500', label: '500 ر.س/ساعة' },
  { value: '750', label: '750 ر.س/ساعة' },
  { value: '1000', label: '1,000 ر.س/ساعة' },
  { value: '1500', label: '1,500 ر.س/ساعة' },
  { value: '2000', label: '2,000 ر.س/ساعة' },
]

export function EditTimeEntryView() {
  const navigate = useNavigate()
  const { entryId } = useParams({ from: '/_authenticated/dashboard/finance/time-tracking/$entryId/edit' })
  const { data: entry, isLoading } = useTimeEntry(entryId)
  const { data: casesAndClients } = useCasesAndClients()
  const updateTimeEntry = useUpdateTimeEntry()
  const deleteTimeEntry = useDeleteTimeEntry()
  const createTimeEntry = useCreateTimeEntry()

  const [formData, setFormData] = useState({
    description: '',
    hours: 0,
    minutes: 0,
    date: new Date().toISOString().split('T')[0],
    caseId: '',
    clientId: '',
    projectId: '',
    billable: true,
    hourlyRate: 500,
    notes: '',
    taskType: 'general',
  })

  const taskTypes = [
    { value: 'general', label: 'عام' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'research', label: 'بحث قانوني' },
    { value: 'drafting', label: 'صياغة مستندات' },
    { value: 'court', label: 'حضور محكمة' },
    { value: 'consultation', label: 'استشارة' },
    { value: 'review', label: 'مراجعة' },
    { value: 'communication', label: 'تواصل مع العميل' },
  ]

  useEffect(() => {
    if (entry) {
      const totalMinutes = entry.duration || 0
      setFormData({
        description: entry.description || '',
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
        date: entry.date || new Date().toISOString().split('T')[0],
        caseId: entry.caseId || '',
        clientId: entry.clientId || '',
        projectId: entry.projectId || '',
        billable: entry.billable ?? true,
        hourlyRate: entry.hourlyRate || 500,
        notes: entry.notes || '',
        taskType: entry.taskType || 'general',
      })
    }
  }, [entry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const totalMinutes = formData.hours * 60 + formData.minutes
    const submitData = {
      ...formData,
      duration: totalMinutes,
      totalAmount: (totalMinutes / 60) * formData.hourlyRate,
    }

    updateTimeEntry.mutate(
      { id: entryId, data: submitData },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard/finance/time-tracking/$entryId', params: { entryId } })
        },
      }
    )
  }

  const handleDelete = () => {
    deleteTimeEntry.mutate(entryId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/finance/time-tracking' })
      },
    })
  }

  const handleDuplicate = () => {
    const totalMinutes = formData.hours * 60 + formData.minutes
    const duplicateData = {
      ...formData,
      duration: totalMinutes,
      totalAmount: (totalMinutes / 60) * formData.hourlyRate,
      date: new Date().toISOString().split('T')[0], // Set to today
    }

    createTimeEntry.mutate(duplicateData, {
      onSuccess: (newEntry) => {
        navigate({ to: '/dashboard/finance/time-tracking/$entryId', params: { entryId: newEntry.id } })
      },
    })
  }

  const calculateTotal = () => {
    const totalMinutes = formData.hours * 60 + formData.minutes
    const hours = totalMinutes / 60
    return (hours * formData.hourlyRate).toLocaleString('ar-SA')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>المالية</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>تتبع الوقت</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">تعديل الإدخال</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 ms-2" />
            نسخ
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 ms-2" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف هذا الإدخال نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تعديل إدخال الوقت</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف العمل المنجز"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>المدة *</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={formData.hours}
                            onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                            className="text-center"
                          />
                          <span className="text-sm text-muted-foreground">ساعة</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={formData.minutes}
                            onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                            className="text-center"
                          />
                          <span className="text-sm text-muted-foreground">دقيقة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">التاريخ *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taskType">نوع المهمة</Label>
                    <Select
                      value={formData.taskType}
                      onValueChange={(value) => setFormData({ ...formData, taskType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المهمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">السعر بالساعة</Label>
                    <Select
                      value={String(formData.hourlyRate)}
                      onValueChange={(value) => setFormData({ ...formData, hourlyRate: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر السعر" />
                      </SelectTrigger>
                      <SelectContent>
                        {billableRates.map((rate) => (
                          <SelectItem key={rate.value} value={rate.value}>
                            {rate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">العميل</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {casesAndClients?.clients?.map((client: { id: string; name: string }) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caseId">القضية / المشروع</Label>
                    <Select
                      value={formData.caseId}
                      onValueChange={(value) => setFormData({ ...formData, caseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القضية" />
                      </SelectTrigger>
                      <SelectContent>
                        {casesAndClients?.cases?.map((caseItem: { id: string; title: string }) => (
                          <SelectItem key={caseItem.id} value={caseItem.id}>
                            {caseItem.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billable"
                    checked={formData.billable}
                    onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="billable">قابل للفوترة</Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={updateTimeEntry.isPending}>
                    <Save className="h-4 w-4 ms-2" />
                    {updateTimeEntry.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/dashboard/finance/time-tracking/$entryId', params: { entryId } })}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ملخص
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المدة</span>
                <span className="font-medium">{formData.hours} ساعة {formData.minutes} دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">السعر</span>
                <span className="font-medium">{formData.hourlyRate.toLocaleString('ar-SA')} ر.س/ساعة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">قابل للفوترة</span>
                <span className="font-medium">{formData.billable ? 'نعم' : 'لا'}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">الإجمالي</span>
                <span className="font-bold text-primary">{calculateTotal()} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
