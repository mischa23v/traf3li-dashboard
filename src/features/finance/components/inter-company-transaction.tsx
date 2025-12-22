import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Building2, ArrowRightLeft, Calendar, DollarSign,
  FileText, Plus, Save, X, AlertCircle, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import {
  useCreateInterCompanyTransaction,
  useUpdateInterCompanyTransaction,
  useInterCompanyCompanies,
  useExchangeRate,
} from '@/hooks/useInterCompany'
import { formatCurrency } from '@/lib/utils'

interface InterCompanyTransactionFormProps {
  transactionId?: string
  mode?: 'create' | 'edit'
}

export default function InterCompanyTransactionForm({
  transactionId,
  mode = 'create'
}: InterCompanyTransactionFormProps) {
  const navigate = useNavigate()
  const [isArabic, setIsArabic] = useState(true)

  // Form state
  const [sourceCompanyId, setSourceCompanyId] = useState('')
  const [targetCompanyId, setTargetCompanyId] = useState('')
  const [transactionType, setTransactionType] = useState<'invoice' | 'payment' | 'expense' | 'transfer'>('invoice')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('SAR')
  const [description, setDescription] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [autoCreateCounterpart, setAutoCreateCounterpart] = useState(true)
  const [notes, setNotes] = useState('')

  // API hooks
  const { data: companies, isLoading: companiesLoading } = useInterCompanyCompanies()
  const createMutation = useCreateInterCompanyTransaction()
  const updateMutation = useUpdateInterCompanyTransaction()

  // Get source and target companies for exchange rate
  const sourceCompany = companies?.find(c => c._id === sourceCompanyId)
  const targetCompany = companies?.find(c => c._id === targetCompanyId)

  // Fetch exchange rate if currencies differ
  const { data: exchangeRate } = useExchangeRate(
    sourceCompany?.currency || 'SAR',
    targetCompany?.currency || 'SAR',
    transactionDate
  )

  // Calculate equivalent amount in target currency
  const equivalentAmount = exchangeRate && amount
    ? (parseFloat(amount) * exchangeRate).toFixed(2)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      sourceCompanyId,
      targetCompanyId,
      transactionType,
      amount: parseFloat(amount),
      currency,
      exchangeRate: exchangeRate || undefined,
      description,
      referenceNumber: referenceNumber || undefined,
      transactionDate,
      dueDate: dueDate || undefined,
      autoCreateCounterpart,
      notes: notes || undefined,
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data)
        navigate({ to: '/finance/inter-company' })
      } else if (transactionId) {
        await updateMutation.mutateAsync({ id: transactionId, data })
        navigate({ to: '/finance/inter-company' })
      }
    } catch (error) {
      console.error('Failed to save transaction:', error)
    }
  }

  const topNav = [
    { title: isArabic ? 'المالية' : 'Finance', href: '/finance' },
    { title: isArabic ? 'المعاملات بين الشركات' : 'Inter-Company', href: '/finance/inter-company' },
    {
      title: mode === 'create'
        ? (isArabic ? 'معاملة جديدة' : 'New Transaction')
        : (isArabic ? 'تعديل معاملة' : 'Edit Transaction'),
      isCurrentPage: true
    },
  ]

  const currencies = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'BHD', 'OMR', 'QAR']

  return (
    <>
      <Header>
        <TopNav items={topNav} />
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <FinanceSidebar />

      <Main>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {mode === 'create'
                  ? (isArabic ? 'معاملة جديدة بين الشركات' : 'New Inter-Company Transaction')
                  : (isArabic ? 'تعديل معاملة بين الشركات' : 'Edit Inter-Company Transaction')
                }
              </h1>
              <p className="text-muted-foreground mt-2">
                {isArabic
                  ? 'إنشاء معاملة مالية بين شركات المجموعة مع دعم العملات المتعددة'
                  : 'Create financial transactions between group companies with multi-currency support'
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Companies Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {isArabic ? 'الشركات' : 'Companies'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic
                      ? 'اختر الشركة المصدرة والشركة المستقبلة للمعاملة'
                      : 'Select the source and target companies for the transaction'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source Company */}
                    <div className="space-y-2">
                      <Label htmlFor="sourceCompany">
                        {isArabic ? 'الشركة المصدرة' : 'Source Company'}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={sourceCompanyId} onValueChange={setSourceCompanyId} required>
                        <SelectTrigger id="sourceCompany">
                          <SelectValue placeholder={isArabic ? 'اختر الشركة' : 'Select company'} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              <div className="flex items-center gap-2">
                                <span>{isArabic ? company.nameAr : company.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {company.currency}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sourceCompany && (
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'العملة:' : 'Currency:'} {sourceCompany.currency}
                        </p>
                      )}
                    </div>

                    {/* Target Company */}
                    <div className="space-y-2">
                      <Label htmlFor="targetCompany">
                        {isArabic ? 'الشركة المستقبلة' : 'Target Company'}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={targetCompanyId} onValueChange={setTargetCompanyId} required>
                        <SelectTrigger id="targetCompany">
                          <SelectValue placeholder={isArabic ? 'اختر الشركة' : 'Select company'} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies
                            ?.filter(c => c._id !== sourceCompanyId)
                            .map((company) => (
                              <SelectItem key={company._id} value={company._id}>
                                <div className="flex items-center gap-2">
                                  <span>{isArabic ? company.nameAr : company.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {company.currency}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {targetCompany && (
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'العملة:' : 'Currency:'} {targetCompany.currency}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exchange Rate Info */}
                  {sourceCompany && targetCompany && sourceCompany.currency !== targetCompany.currency && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {isArabic ? 'معاملة بعملات مختلفة' : 'Multi-currency transaction'}
                          </p>
                          <p className="text-sm">
                            {isArabic ? 'سعر الصرف:' : 'Exchange rate:'} {exchangeRate || '...'} {' '}
                            ({sourceCompany.currency} → {targetCompany.currency})
                          </p>
                          {equivalentAmount && (
                            <p className="text-sm">
                              {isArabic ? 'المبلغ المكافئ:' : 'Equivalent amount:'}{' '}
                              {formatCurrency(parseFloat(equivalentAmount), targetCompany.currency)}
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {isArabic ? 'تفاصيل المعاملة' : 'Transaction Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <Label htmlFor="transactionType">
                      {isArabic ? 'نوع المعاملة' : 'Transaction Type'}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select value={transactionType} onValueChange={(v: any) => setTransactionType(v)} required>
                      <SelectTrigger id="transactionType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">
                          {isArabic ? 'فاتورة' : 'Invoice'}
                        </SelectItem>
                        <SelectItem value="payment">
                          {isArabic ? 'دفعة' : 'Payment'}
                        </SelectItem>
                        <SelectItem value="expense">
                          {isArabic ? 'مصروف' : 'Expense'}
                        </SelectItem>
                        <SelectItem value="transfer">
                          {isArabic ? 'تحويل' : 'Transfer'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {isArabic ? 'المبلغ' : 'Amount'}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Currency */}
                    <div className="space-y-2">
                      <Label htmlFor="currency">
                        {isArabic ? 'العملة' : 'Currency'}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={currency} onValueChange={setCurrency} required>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr} value={curr}>
                              {curr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {isArabic ? 'الوصف' : 'Description'}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isArabic ? 'وصف المعاملة' : 'Transaction description'}
                      required
                    />
                  </div>

                  {/* Reference Number */}
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">
                      {isArabic ? 'رقم المرجع' : 'Reference Number'}
                    </Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder={isArabic ? 'رقم مرجعي اختياري' : 'Optional reference number'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Transaction Date */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate">
                        {isArabic ? 'تاريخ المعاملة' : 'Transaction Date'}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                      />
                    </div>

                    {/* Due Date */}
                    {(transactionType === 'invoice' || transactionType === 'payment') && (
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">
                          {isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={transactionDate}
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {isArabic ? 'ملاحظات' : 'Notes'}
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isArabic ? 'ملاحظات إضافية...' : 'Additional notes...'}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Auto-create Counterpart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    {isArabic ? 'إنشاء تلقائي' : 'Auto-create'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoCreate">
                        {isArabic ? 'إنشاء المعاملة المقابلة تلقائياً' : 'Auto-create counterpart transaction'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isArabic
                          ? 'سيتم إنشاء معاملة معكوسة في الشركة المستقبلة تلقائياً'
                          : 'Automatically create the opposite transaction in the target company'
                        }
                      </p>
                    </div>
                    <Switch
                      id="autoCreate"
                      checked={autoCreateCounterpart}
                      onCheckedChange={setAutoCreateCounterpart}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/finance/inter-company' })}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create'
                    ? (isArabic ? 'إنشاء معاملة' : 'Create Transaction')
                    : (isArabic ? 'حفظ التغييرات' : 'Save Changes')
                  }
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Main>
    </>
  )
}
