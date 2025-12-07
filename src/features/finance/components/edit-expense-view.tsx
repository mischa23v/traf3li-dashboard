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
import { ArrowRight, Save, Trash2, Upload, X, FileText } from 'lucide-react'
import { useExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

const expenseCategories = [
  { value: 'travel', label: 'سفر ومواصلات' },
  { value: 'meals', label: 'وجبات وضيافة' },
  { value: 'supplies', label: 'لوازم مكتبية' },
  { value: 'communication', label: 'اتصالات' },
  { value: 'software', label: 'برمجيات واشتراكات' },
  { value: 'professional_fees', label: 'رسوم مهنية' },
  { value: 'court_fees', label: 'رسوم محكمة' },
  { value: 'filing_fees', label: 'رسوم تسجيل' },
  { value: 'other', label: 'أخرى' },
]

export function EditExpenseView() {
  const navigate = useNavigate()
  const { expenseId } = useParams({ from: '/_authenticated/dashboard/finance/expenses/$expenseId/edit' })
  const { data: expense, isLoading } = useExpense(expenseId)
  const { data: casesAndClients } = useCasesAndClients()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    caseId: '',
    clientId: '',
    vendor: '',
    notes: '',
    billable: true,
    reimbursable: false,
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<string[]>([])

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount || 0,
        category: expense.category || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        caseId: expense.caseId || '',
        clientId: expense.clientId || '',
        vendor: expense.vendor || '',
        notes: expense.notes || '',
        billable: expense.billable ?? true,
        reimbursable: expense.reimbursable ?? false,
      })
      if (expense.attachments) {
        setExistingAttachments(expense.attachments)
      }
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, String(value))
    })
    attachments.forEach((file) => {
      formDataToSend.append('attachments', file)
    })

    updateExpense.mutate(
      { id: expenseId, data: formData },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard/finance/expenses/$expenseId', params: { expenseId } })
        },
      }
    )
  }

  const handleDelete = () => {
    deleteExpense.mutate(expenseId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/finance/expenses' })
      },
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index))
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
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <span>المالية</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>المصروفات</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">تعديل المصروف</span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذا المصروف نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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

      <Card>
        <CardHeader>
          <CardTitle>تعديل المصروف</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description">الوصف *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف المصروف"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ (ر.س) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="vendor">المورد / البائع</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="اسم المورد أو البائع"
                />
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
                <Label htmlFor="caseId">القضية</Label>
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
                rows={3}
              />
            </div>

            <div className="flex gap-6">
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reimbursable"
                  checked={formData.reimbursable}
                  onChange={(e) => setFormData({ ...formData, reimbursable: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="reimbursable">قابل للاسترداد</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>المرفقات</Label>

              {existingAttachments.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">المرفقات الحالية:</p>
                  {existingAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      <span className="flex-1 text-sm">{attachment}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed rounded-lg p-4">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="h-8 w-8 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-600">اضغط لإضافة مرفقات جديدة</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">مرفقات جديدة:</p>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      <span className="flex-1 text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={updateExpense.isPending}>
                <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                {updateExpense.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/finance/expenses/$expenseId', params: { expenseId } })}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
