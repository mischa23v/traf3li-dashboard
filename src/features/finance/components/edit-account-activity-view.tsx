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
import { ArrowRight, Save, Trash2, CreditCard, Building2, Wallet } from 'lucide-react'
import { useAccountActivity, useUpdateAccountActivity, useDeleteAccountActivity } from '@/hooks/useFinance'

const activityTypes = [
  { value: 'deposit', label: 'إيداع', color: 'text-green-600' },
  { value: 'withdrawal', label: 'سحب', color: 'text-red-600' },
  { value: 'transfer_in', label: 'تحويل وارد', color: 'text-blue-600' },
  { value: 'transfer_out', label: 'تحويل صادر', color: 'text-orange-600' },
  { value: 'fee', label: 'رسوم', color: 'text-gray-600' },
  { value: 'interest', label: 'فوائد', color: 'text-purple-600' },
  { value: 'adjustment', label: 'تسوية', color: 'text-yellow-600' },
]

const accountTypes = [
  { value: 'bank', label: 'حساب بنكي', icon: Building2 },
  { value: 'cash', label: 'صندوق نقدي', icon: Wallet },
  { value: 'credit_card', label: 'بطاقة ائتمان', icon: CreditCard },
]

export function EditAccountActivityView() {
  const navigate = useNavigate()
  const { activityId } = useParams({ from: '/_authenticated/dashboard/finance/activity/$activityId/edit' })
  const { data: activity, isLoading } = useAccountActivity(activityId)
  const updateActivity = useUpdateAccountActivity()
  const deleteActivity = useDeleteAccountActivity()

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'deposit',
    accountType: 'bank',
    accountName: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    balanceBefore: 0,
    balanceAfter: 0,
    notes: '',
    reconciled: false,
  })

  useEffect(() => {
    if (activity) {
      setFormData({
        description: activity.description || '',
        amount: activity.amount || 0,
        type: activity.type || 'deposit',
        accountType: activity.accountType || 'bank',
        accountName: activity.accountName || '',
        date: activity.date || new Date().toISOString().split('T')[0],
        reference: activity.reference || '',
        balanceBefore: activity.balanceBefore || 0,
        balanceAfter: activity.balanceAfter || 0,
        notes: activity.notes || '',
        reconciled: activity.reconciled ?? false,
      })
    }
  }, [activity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate balance after based on type
    let balanceAfter = formData.balanceBefore
    if (['deposit', 'transfer_in', 'interest'].includes(formData.type)) {
      balanceAfter = formData.balanceBefore + formData.amount
    } else if (['withdrawal', 'transfer_out', 'fee'].includes(formData.type)) {
      balanceAfter = formData.balanceBefore - formData.amount
    }

    updateActivity.mutate(
      { id: activityId, data: { ...formData, balanceAfter } },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard/finance/activity/$activityId', params: { activityId } })
        },
      }
    )
  }

  const handleDelete = () => {
    deleteActivity.mutate(activityId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/finance/activity' })
      },
    })
  }

  const getTypeInfo = () => {
    return activityTypes.find(t => t.value === formData.type) || activityTypes[0]
  }

  const calculateBalanceAfter = () => {
    if (['deposit', 'transfer_in', 'interest'].includes(formData.type)) {
      return formData.balanceBefore + formData.amount
    } else if (['withdrawal', 'transfer_out', 'fee'].includes(formData.type)) {
      return formData.balanceBefore - formData.amount
    }
    return formData.balanceBefore
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
          <span>نشاط الحساب</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">تعديل النشاط</span>
        </div>

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
                سيتم حذف هذا النشاط نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تعديل نشاط الحساب</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>نوع الحساب *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {accountTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, accountType: type.value })}
                          className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                            formData.accountType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="font-medium text-sm">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">اسم الحساب *</Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      placeholder="مثال: الحساب الجاري - البنك الأهلي"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">نوع النشاط *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع النشاط" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className={type.color}>{type.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف النشاط"
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
                    <Label htmlFor="reference">رقم المرجع</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="رقم العملية أو المرجع"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balanceBefore">الرصيد قبل العملية (ر.س)</Label>
                    <Input
                      id="balanceBefore"
                      type="number"
                      step="0.01"
                      value={formData.balanceBefore}
                      onChange={(e) => setFormData({ ...formData, balanceBefore: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الرصيد بعد العملية (ر.س)</Label>
                    <Input
                      type="number"
                      value={calculateBalanceAfter()}
                      disabled
                      className="bg-muted"
                    />
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reconciled"
                    checked={formData.reconciled}
                    onChange={(e) => setFormData({ ...formData, reconciled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="reconciled">تمت المطابقة</Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={updateActivity.isPending}>
                    <Save className="h-4 w-4 ms-2" />
                    {updateActivity.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/dashboard/finance/activity/$activityId', params: { activityId } })}
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
              <CardTitle>ملخص النشاط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع النشاط</span>
                <span className={`font-medium ${getTypeInfo().color}`}>{getTypeInfo().label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-medium">{formData.amount.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرصيد السابق</span>
                <span className="font-medium">{formData.balanceBefore.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرصيد الجديد</span>
                <span className="font-bold text-primary">{calculateBalanceAfter().toLocaleString('ar-SA')} ر.س</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-muted-foreground">حالة المطابقة</span>
                <span className={`font-medium ${formData.reconciled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {formData.reconciled ? 'تمت المطابقة' : 'معلقة'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
