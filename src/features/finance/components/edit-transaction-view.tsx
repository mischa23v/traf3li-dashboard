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
import { ArrowRight, Save, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

const transactionTypes = [
  { value: 'income', label: 'إيراد', icon: ArrowDownRight, color: 'text-green-600' },
  { value: 'expense', label: 'مصروف', icon: ArrowUpRight, color: 'text-red-600' },
  { value: 'transfer', label: 'تحويل', icon: ArrowRight, color: 'text-blue-600' },
]

const paymentMethods = [
  { value: 'cash', label: 'نقداً' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'credit_card', label: 'بطاقة ائتمان' },
  { value: 'check', label: 'شيك' },
  { value: 'online', label: 'دفع إلكتروني' },
]

const transactionCategories = [
  { value: 'legal_fees', label: 'أتعاب قانونية' },
  { value: 'consultation', label: 'استشارات' },
  { value: 'court_fees', label: 'رسوم محكمة' },
  { value: 'filing_fees', label: 'رسوم تسجيل' },
  { value: 'travel', label: 'سفر ومواصلات' },
  { value: 'office_supplies', label: 'لوازم مكتبية' },
  { value: 'rent', label: 'إيجار' },
  { value: 'utilities', label: 'مرافق' },
  { value: 'salaries', label: 'رواتب' },
  { value: 'other', label: 'أخرى' },
]

export function EditTransactionView() {
  const navigate = useNavigate()
  const { transactionId } = useParams({ from: '/_authenticated/dashboard/finance/transactions/$transactionId/edit' })
  const { data: transaction, isLoading } = useTransaction(transactionId)
  const { data: casesAndClients } = useCasesAndClients()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'income',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    clientId: '',
    caseId: '',
    notes: '',
    accountId: '',
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount || 0,
        type: transaction.type || 'income',
        category: transaction.category || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || '',
        reference: transaction.reference || '',
        clientId: transaction.clientId || '',
        caseId: transaction.caseId || '',
        notes: transaction.notes || '',
        accountId: transaction.accountId || '',
      })
    }
  }, [transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateTransaction.mutate(
      { id: transactionId, data: formData },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard/finance/transactions/$transactionId', params: { transactionId } })
        },
      }
    )
  }

  const handleDelete = () => {
    deleteTransaction.mutate(transactionId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/finance/transactions' })
      },
    })
  }

  const getTypeInfo = () => {
    return transactionTypes.find(t => t.type === formData.type) || transactionTypes[0]
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
          <span>المعاملات</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">تعديل المعاملة</span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذه المعاملة نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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
          <CardTitle>تعديل المعاملة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>نوع المعاملة *</Label>
              <div className="grid grid-cols-3 gap-4">
                {transactionTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.type === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${type.color}`} />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description">الوصف *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف المعاملة"
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
                    {transactionCategories.map((cat) => (
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
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">رقم المرجع</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="رقم المرجع أو الإيصال"
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={updateTransaction.isPending}>
                <Save className="h-4 w-4 ml-2" />
                {updateTransaction.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/finance/transactions/$transactionId', params: { transactionId } })}
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
