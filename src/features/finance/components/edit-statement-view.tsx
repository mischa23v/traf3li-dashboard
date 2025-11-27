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
import { ArrowRight, Save, Trash2, Send, Download, FileText } from 'lucide-react'
import { useStatement, useUpdateStatement, useDeleteStatement, useSendStatement, useDownloadStatement } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

const statementPeriods = [
  { value: 'monthly', label: 'شهري' },
  { value: 'quarterly', label: 'ربع سنوي' },
  { value: 'annually', label: 'سنوي' },
  { value: 'custom', label: 'مخصص' },
]

export function EditStatementView() {
  const navigate = useNavigate()
  const { statementId } = useParams({ from: '/_authenticated/dashboard/finance/statements/$statementId/edit' })
  const { data: statement, isLoading } = useStatement(statementId)
  const { data: casesAndClients } = useCasesAndClients()
  const updateStatement = useUpdateStatement()
  const deleteStatement = useDeleteStatement()
  const sendStatement = useSendStatement()
  const downloadStatement = useDownloadStatement()

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    periodType: 'monthly',
    startDate: '',
    endDate: '',
    openingBalance: 0,
    closingBalance: 0,
    notes: '',
    includeInvoices: true,
    includePayments: true,
    includeExpenses: false,
  })

  useEffect(() => {
    if (statement) {
      setFormData({
        title: statement.title || '',
        clientId: statement.clientId || '',
        periodType: statement.periodType || 'monthly',
        startDate: statement.startDate || '',
        endDate: statement.endDate || '',
        openingBalance: statement.openingBalance || 0,
        closingBalance: statement.closingBalance || 0,
        notes: statement.notes || '',
        includeInvoices: statement.includeInvoices ?? true,
        includePayments: statement.includePayments ?? true,
        includeExpenses: statement.includeExpenses ?? false,
      })
    }
  }, [statement])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateStatement.mutate(
      { id: statementId, data: formData },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard/finance/statements/$statementId', params: { statementId } })
        },
      }
    )
  }

  const handleDelete = () => {
    deleteStatement.mutate(statementId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/finance/statements' })
      },
    })
  }

  const handleSend = () => {
    sendStatement.mutate(statementId)
  }

  const handleDownload = (format: 'pdf' | 'xlsx') => {
    downloadStatement.mutate({ id: statementId, format })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const selectedClient = casesAndClients?.clients?.find((c: { id: string }) => c.id === formData.clientId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>المالية</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>كشوف الحساب</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">تعديل الكشف</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
            <Download className="h-4 w-4 ml-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('xlsx')}>
            <FileText className="h-4 w-4 ml-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleSend} disabled={sendStatement.isPending}>
            <Send className="h-4 w-4 ml-2" />
            {sendStatement.isPending ? 'جاري الإرسال...' : 'إرسال للعميل'}
          </Button>
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
                  سيتم حذف كشف الحساب هذا نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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
              <CardTitle>تعديل كشف الحساب</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الكشف *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="كشف حساب شهري"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">العميل *</Label>
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
                    <Label htmlFor="periodType">نوع الفترة *</Label>
                    <Select
                      value={formData.periodType}
                      onValueChange={(value) => setFormData({ ...formData, periodType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الفترة" />
                      </SelectTrigger>
                      <SelectContent>
                        {statementPeriods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">تاريخ البداية *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">تاريخ النهاية *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openingBalance">الرصيد الافتتاحي (ر.س)</Label>
                    <Input
                      id="openingBalance"
                      type="number"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingBalance">الرصيد الختامي (ر.س)</Label>
                    <Input
                      id="closingBalance"
                      type="number"
                      step="0.01"
                      value={formData.closingBalance}
                      onChange={(e) => setFormData({ ...formData, closingBalance: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>تضمين في الكشف</Label>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeInvoices"
                        checked={formData.includeInvoices}
                        onChange={(e) => setFormData({ ...formData, includeInvoices: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="includeInvoices">الفواتير</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includePayments"
                        checked={formData.includePayments}
                        onChange={(e) => setFormData({ ...formData, includePayments: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="includePayments">المدفوعات</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeExpenses"
                        checked={formData.includeExpenses}
                        onChange={(e) => setFormData({ ...formData, includeExpenses: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="includeExpenses">المصروفات القابلة للفوترة</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية تظهر في الكشف"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={updateStatement.isPending}>
                    <Save className="h-4 w-4 ml-2" />
                    {updateStatement.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/dashboard/finance/statements/$statementId', params: { statementId } })}
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
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-medium">{selectedClient.name}</p>
                  </div>
                  {selectedClient.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium">{selectedClient.email}</p>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">الهاتف</p>
                      <p className="font-medium">{selectedClient.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">اختر عميلاً لعرض معلوماته</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ملخص الكشف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرصيد الافتتاحي</span>
                <span className="font-medium">{formData.openingBalance.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرصيد الختامي</span>
                <span className="font-medium">{formData.closingBalance.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-muted-foreground">الفرق</span>
                <span className={`font-bold ${formData.closingBalance - formData.openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(formData.closingBalance - formData.openingBalance).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
