import { useState, useMemo, useEffect } from 'react'
import {
  Save, ArrowLeft, FileText, Plus, Trash2, AlertCircle, Receipt,
  User, Calendar, Hash, DollarSign, Loader2, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateCreditNote } from '@/hooks/useFinance'
import { useInvoice, useInvoices } from '@/hooks/useFinance'
import { Skeleton } from '@/components/ui/skeleton'

interface CreditNoteItem {
  originalItemId?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  selected: boolean
}

// Generate credit note number
const generateCreditNoteNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() + 10000).toString().padStart(4, '0')
  return `CN-${year}${month}-${random}`
}

export function CreateCreditNoteView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { invoiceId?: string }
  const createMutation = useCreateCreditNote()

  // Form state
  const [invoiceId, setInvoiceId] = useState(searchParams?.invoiceId || '')
  const [creditType, setCreditType] = useState<'full' | 'partial'>('partial')
  const [reasonCategory, setReasonCategory] = useState<string>('error')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<CreditNoteItem[]>([])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])

  // Fetch invoices for dropdown
  const { data: invoicesData } = useInvoices({ status: 'sent,paid,partial' })
  const invoices = invoicesData?.invoices || []

  // Fetch selected invoice details
  const { data: selectedInvoice, isLoading: isLoadingInvoice } = useInvoice(invoiceId)

  // Populate items when invoice is selected
  useEffect(() => {
    if (selectedInvoice) {
      const invoiceItems: CreditNoteItem[] = (selectedInvoice.items || []).map((item: any) => ({
        originalItemId: item._id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        selected: creditType === 'full',
      }))
      setItems(invoiceItems)
    }
  }, [selectedInvoice, creditType])

  // Toggle all items selection
  const toggleAllItems = (checked: boolean) => {
    setItems(items.map(item => ({ ...item, selected: checked })))
  }

  // Toggle individual item
  const toggleItem = (index: number) => {
    const newItems = [...items]
    newItems[index].selected = !newItems[index].selected
    setItems(newItems)
  }

  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    newItems[index].total = quantity * newItems[index].unitPrice
    setItems(newItems)
  }

  // Calculate totals
  const calculations = useMemo(() => {
    const selectedItems = items.filter(item => item.selected)
    const subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0)
    const vatRate = selectedInvoice?.vatRate || 15
    const vatAmount = (subtotal * vatRate) / 100
    const totalAmount = subtotal + vatAmount

    return {
      subtotal,
      vatRate,
      vatAmount,
      totalAmount,
      selectedCount: selectedItems.length,
    }
  }, [items, selectedInvoice])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceId) {
      alert('الرجاء اختيار فاتورة')
      return
    }

    if (calculations.selectedCount === 0) {
      alert('الرجاء اختيار عنصر واحد على الأقل')
      return
    }

    if (!reason.trim()) {
      alert('الرجاء إدخال سبب إصدار إشعار الدائن')
      return
    }

    const selectedItems = items.filter(item => item.selected).map(item => ({
      originalItemId: item.originalItemId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }))

    try {
      const creditNote = await createMutation.mutateAsync({
        originalInvoiceId: invoiceId,
        clientId: typeof selectedInvoice?.clientId === 'string'
          ? selectedInvoice.clientId
          : selectedInvoice?.clientId?._id || '',
        caseId: selectedInvoice?.caseId,
        items: selectedItems,
        subtotal: calculations.subtotal,
        vatRate: calculations.vatRate,
        vatAmount: calculations.vatAmount,
        totalAmount: calculations.totalAmount,
        creditType,
        reason: reason.trim(),
        reasonCategory: reasonCategory as any,
        issueDate,
        notes: notes.trim() || undefined,
      })

      navigate({
        to: '/dashboard/finance/credit-notes/$creditNoteId',
        params: { creditNoteId: creditNote._id },
      })
    } catch (error) {
      console.error('Failed to create credit note:', error)
    }
  }

  const clientName = selectedInvoice
    ? typeof selectedInvoice.clientId === 'string'
      ? selectedInvoice.clientId
      : `${selectedInvoice.clientId?.firstName || ''} ${selectedInvoice.clientId?.lastName || ''}`.trim()
    : ''

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex items-center justify-between">
        <ProductivityHero
          title="إنشاء إشعار دائن جديد"
          description="إصدار إشعار دائن (Credit Note) لتصحيح أو تعديل فاتورة سابقة"
        />
        <Link to="/dashboard/finance/credit-notes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى القائمة
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Selection */}
            <Card>
              <CardHeader>
                <CardTitle>الفاتورة الأصلية</CardTitle>
                <CardDescription>اختر الفاتورة التي تريد إصدار إشعار دائن لها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invoice">الفاتورة *</Label>
                  <Select value={invoiceId} onValueChange={setInvoiceId}>
                    <SelectTrigger id="invoice">
                      <SelectValue placeholder="اختر فاتورة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((invoice: any) => (
                        <SelectItem key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber} - {
                            typeof invoice.clientId === 'string'
                              ? invoice.clientId
                              : `${invoice.clientId?.firstName || ''} ${invoice.clientId?.lastName || ''}`.trim()
                          } ({new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          }).format(invoice.totalAmount / 100)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoice && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p><strong>العميل:</strong> {clientName}</p>
                        <p><strong>المبلغ الإجمالي:</strong> {new Intl.NumberFormat('ar-SA', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(selectedInvoice.totalAmount / 100)}</p>
                        <p><strong>المبلغ المتبقي:</strong> {new Intl.NumberFormat('ar-SA', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(selectedInvoice.balanceDue / 100)}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Credit Note Details */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل إشعار الدائن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="creditType">نوع الإشعار *</Label>
                    <Select value={creditType} onValueChange={(value: any) => {
                      setCreditType(value)
                      if (value === 'full') {
                        toggleAllItems(true)
                      }
                    }}>
                      <SelectTrigger id="creditType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">إشعار دائن كامل</SelectItem>
                        <SelectItem value="partial">إشعار دائن جزئي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="issueDate">تاريخ الإصدار *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reasonCategory">فئة السبب *</Label>
                  <Select value={reasonCategory} onValueChange={setReasonCategory}>
                    <SelectTrigger id="reasonCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">خطأ في الفاتورة</SelectItem>
                      <SelectItem value="discount">خصم</SelectItem>
                      <SelectItem value="return">إرجاع منتجات/خدمات</SelectItem>
                      <SelectItem value="cancellation">إلغاء</SelectItem>
                      <SelectItem value="adjustment">تعديل</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">سبب الإصدار *</Label>
                  <Textarea
                    id="reason"
                    placeholder="اشرح سبب إصدار إشعار الدائن بالتفصيل..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    placeholder="أي ملاحظات أخرى..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            {selectedInvoice && items.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>العناصر</CardTitle>
                      <CardDescription>
                        اختر العناصر التي تريد تضمينها في إشعار الدائن
                      </CardDescription>
                    </div>
                    {creditType === 'partial' && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="selectAll"
                          checked={items.every(item => item.selected)}
                          onCheckedChange={toggleAllItems}
                        />
                        <Label htmlFor="selectAll" className="cursor-pointer">
                          تحديد الكل
                        </Label>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <Checkbox
                          id={`item-${index}`}
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(index)}
                          disabled={creditType === 'full'}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`item-${index}`} className="cursor-pointer font-medium">
                            {item.description}
                          </Label>
                          <div className="grid gap-2 md:grid-cols-3 text-sm">
                            <div>
                              <Label htmlFor={`qty-${index}`} className="text-xs">الكمية</Label>
                              <Input
                                id={`qty-${index}`}
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                                disabled={!item.selected}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">سعر الوحدة</Label>
                              <div className="h-8 flex items-center text-muted-foreground">
                                {new Intl.NumberFormat('ar-SA').format(item.unitPrice / 100)} ر.س
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">الإجمالي</Label>
                              <div className="h-8 flex items-center font-medium">
                                {new Intl.NumberFormat('ar-SA').format(item.total / 100)} ر.س
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>الملخص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">العناصر المحددة</span>
                    <span className="font-medium">{calculations.selectedCount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('ar-SA').format(calculations.subtotal / 100)} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ضريبة القيمة المضافة ({calculations.vatRate}%)</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('ar-SA').format(calculations.vatAmount / 100)} ر.س
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">إجمالي المبلغ</span>
                    <span className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat('ar-SA').format(calculations.totalAmount / 100)} ر.س
                    </span>
                  </div>
                </div>

                <Separator />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!invoiceId || calculations.selectedCount === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ms-2" />
                      إنشاء إشعار الدائن
                    </>
                  )}
                </Button>

                {!invoiceId && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      الرجاء اختيار فاتورة أولاً
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
