import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Save, Plus, X, Upload, Download, Trash, Calculator,
  FileSpreadsheet, AlertCircle, CheckCircle2, Info, Loader2,
  ChevronDown, ChevronUp, DollarSign, Calendar, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'
import { useAccounts, useCreateJournalEntry } from '@/hooks/useAccounting'
import { toast } from 'sonner'

// ==================== TYPES ====================

interface BalanceLine {
  id: string
  accountId: string
  accountCode?: string
  accountName?: string
  accountNameAr?: string
  debit: number
  credit: number
  description?: string
}

// ==================== COMMON OPENING BALANCE ACCOUNTS ====================

const commonAccounts = [
  { key: 'cash', nameEn: 'Cash in Hand', nameAr: 'النقدية في الصندوق', type: 'debit' },
  { key: 'bank', nameEn: 'Bank Balance', nameAr: 'رصيد البنك', type: 'debit' },
  { key: 'ar', nameEn: 'Accounts Receivable', nameAr: 'العملاء - المدينون', type: 'debit' },
  { key: 'ap', nameEn: 'Accounts Payable', nameAr: 'الموردون - الدائنون', type: 'credit' },
  { key: 'equity', nameEn: 'Owner\'s Capital', nameAr: 'رأس المال', type: 'credit' },
]

// ==================== COMPONENT ====================

export function OpeningBalancesView() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading: loadingAccounts } = useAccounts()
  const createJournalEntryMutation = useCreateJournalEntry()

  // State
  const [mode, setMode] = useState<'manual' | 'quick'>('quick')
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState<string>('أرصدة افتتاحية - Opening Balances')
  const [notes, setNotes] = useState<string>('')
  const [lines, setLines] = useState<BalanceLine[]>([])
  const [expandedQuick, setExpandedQuick] = useState<Record<string, boolean>>({
    cash: true,
    bank: true,
    ar: true,
    ap: true,
    equity: false,
  })

  // Quick entry state
  const [quickBalances, setQuickBalances] = useState<Record<string, number>>({
    cash: 0,
    bank: 0,
    ar: 0,
    ap: 0,
    equity: 0,
  })

  // Get accounts list
  const accounts = useMemo(() => {
    if (!accountsData?.accounts) return []
    return accountsData.accounts.filter((acc: any) => acc.isActive)
  }, [accountsData])

  // Calculate totals
  const totals = useMemo(() => {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const difference = totalDebit - totalCredit
    const isBalanced = Math.abs(difference) < 0.01

    return { totalDebit, totalCredit, difference, isBalanced }
  }, [lines])

  // Calculate quick entry totals
  const quickTotals = useMemo(() => {
    const cash = quickBalances.cash || 0
    const bank = quickBalances.bank || 0
    const ar = quickBalances.ar || 0
    const ap = quickBalances.ap || 0
    const equity = quickBalances.equity || 0

    const totalDebits = cash + bank + ar
    const totalCredits = ap + equity
    const difference = totalDebits - totalCredits
    const autoEquity = difference > 0 ? difference : 0

    return {
      totalDebits,
      totalCredits,
      difference,
      autoEquity,
      isBalanced: Math.abs(difference) < 0.01,
    }
  }, [quickBalances])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ر.س'
  }

  // Add new line
  const addLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        accountId: '',
        debit: 0,
        credit: 0,
        description: '',
      },
    ])
  }

  // Update line
  const updateLine = (id: string, field: keyof BalanceLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value }

        // If account changed, update account details
        if (field === 'accountId') {
          const account = accounts.find((acc: any) => acc._id === value)
          if (account) {
            updated.accountCode = account.code
            updated.accountName = account.name
            updated.accountNameAr = account.nameAr
          }
        }

        // Ensure only debit or credit has value, not both
        if (field === 'debit' && value > 0) {
          updated.credit = 0
        } else if (field === 'credit' && value > 0) {
          updated.debit = 0
        }

        return updated
      }
      return line
    }))
  }

  // Remove line
  const removeLine = (id: string) => {
    setLines(lines.filter(line => line.id !== id))
  }

  // Update quick balance
  const updateQuickBalance = (key: string, value: number) => {
    setQuickBalances(prev => ({ ...prev, [key]: value }))
  }

  // Toggle quick section
  const toggleQuickSection = (key: string) => {
    setExpandedQuick(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Convert quick entry to manual lines
  const convertQuickToLines = () => {
    const newLines: BalanceLine[] = []

    // Find accounts by common names or types
    const findAccount = (searchTerms: string[]) => {
      return accounts.find((acc: any) => {
        const nameLower = (acc.name + ' ' + acc.nameAr).toLowerCase()
        return searchTerms.some(term => nameLower.includes(term.toLowerCase()))
      })
    }

    // Cash
    if (quickBalances.cash > 0) {
      const cashAccount = findAccount(['cash', 'نقد', 'صندوق'])
      if (cashAccount) {
        newLines.push({
          id: 'quick-cash',
          accountId: cashAccount._id,
          accountCode: cashAccount.code,
          accountName: cashAccount.name,
          accountNameAr: cashAccount.nameAr,
          debit: quickBalances.cash,
          credit: 0,
          description: 'رصيد افتتاحي - النقدية',
        })
      }
    }

    // Bank
    if (quickBalances.bank > 0) {
      const bankAccount = findAccount(['bank', 'بنك'])
      if (bankAccount) {
        newLines.push({
          id: 'quick-bank',
          accountId: bankAccount._id,
          accountCode: bankAccount.code,
          accountName: bankAccount.name,
          accountNameAr: bankAccount.nameAr,
          debit: quickBalances.bank,
          credit: 0,
          description: 'رصيد افتتاحي - البنك',
        })
      }
    }

    // AR
    if (quickBalances.ar > 0) {
      const arAccount = findAccount(['receivable', 'مدين', 'عميل'])
      if (arAccount) {
        newLines.push({
          id: 'quick-ar',
          accountId: arAccount._id,
          accountCode: arAccount.code,
          accountName: arAccount.name,
          accountNameAr: arAccount.nameAr,
          debit: quickBalances.ar,
          credit: 0,
          description: 'رصيد افتتاحي - العملاء',
        })
      }
    }

    // AP
    if (quickBalances.ap > 0) {
      const apAccount = findAccount(['payable', 'دائن', 'مورد'])
      if (apAccount) {
        newLines.push({
          id: 'quick-ap',
          accountId: apAccount._id,
          accountCode: apAccount.code,
          accountName: apAccount.name,
          accountNameAr: apAccount.nameAr,
          debit: 0,
          credit: quickBalances.ap,
          description: 'رصيد افتتاحي - الموردون',
        })
      }
    }

    // Equity (use auto-calculated or manual)
    const equityAmount = quickBalances.equity || quickTotals.autoEquity
    if (equityAmount > 0) {
      const equityAccount = findAccount(['equity', 'capital', 'رأس المال', 'حقوق'])
      if (equityAccount) {
        newLines.push({
          id: 'quick-equity',
          accountId: equityAccount._id,
          accountCode: equityAccount.code,
          accountName: equityAccount.name,
          accountNameAr: equityAccount.nameAr,
          debit: 0,
          credit: equityAmount,
          description: 'رصيد افتتاحي - رأس المال',
        })
      }
    }

    return newLines
  }

  // Handle save as draft
  const handleSaveDraft = () => {
    toast.info('سيتم حفظ المسودة قريباً')
  }

  // Handle post to GL
  const handlePostToGL = () => {
    let finalLines: BalanceLine[] = []

    if (mode === 'quick') {
      finalLines = convertQuickToLines()
      if (finalLines.length === 0) {
        toast.error('لم يتم العثور على الحسابات المطلوبة في دليل الحسابات')
        return
      }
    } else {
      finalLines = lines
    }

    // Validation
    if (finalLines.length === 0) {
      toast.error('يجب إضافة أرصدة افتتاحية')
      return
    }

    const hasEmptyAccount = finalLines.some(line => !line.accountId)
    if (hasEmptyAccount) {
      toast.error('يجب اختيار حساب لكل سطر')
      return
    }

    const totalDebit = finalLines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredit = finalLines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const difference = Math.abs(totalDebit - totalCredit)

    if (difference >= 0.01) {
      toast.error('يجب أن تكون المدينة مساوية للدائنة')
      return
    }

    // Create journal entry data
    const journalEntryData = {
      transactionDate: asOfDate,
      description: description,
      memo: notes || 'قيد أرصدة افتتاحية - Opening Balance Entry',
      lines: finalLines.map(line => ({
        accountId: line.accountId,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description || 'رصيد افتتاحي',
      })),
    }

    createJournalEntryMutation.mutate(journalEntryData, {
      onSuccess: (data: any) => {
        // Post the entry immediately
        toast.success('تم إنشاء قيد الأرصدة الافتتاحية بنجاح')
        navigate({ to: '/dashboard/finance/transactions' })
      },
      onError: (error: any) => {
        toast.error(error.message || 'فشل في إنشاء القيد')
      },
    })
  }

  // Handle import
  const handleImport = () => {
    toast.info('ميزة الاستيراد قريباً')
  }

  // Top navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
    { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
    { title: 'الأرصدة الافتتاحية', href: '/dashboard/finance/opening-balances', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Hero Card */}
        <ProductivityHero
          badge="المحاسبة"
          title="إدخال الأرصدة الافتتاحية"
          type="finance"
          listMode={false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                أدخل الأرصدة الافتتاحية لجميع الحسابات في بداية الفترة المالية. يجب أن
                تكون إجمالي المدين مساوياً لإجمالي الدائن.
              </AlertDescription>
            </Alert>

            {/* Main Card */}
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">الأرصدة الافتتاحية</CardTitle>
                    <CardDescription>
                      اختر طريقة الإدخال: سريع للحسابات الشائعة أو يدوي لجميع الحسابات
                    </CardDescription>
                  </div>
                  <Badge
                    variant={totals.isBalanced || quickTotals.isBalanced ? 'default' : 'destructive'}
                    className="h-8 px-3"
                  >
                    {(mode === 'manual' ? totals.isBalanced : quickTotals.isBalanced) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 ml-1" />
                        متوازن
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 ml-1" />
                        غير متوازن
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Date and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      كما في تاريخ (As of Date)
                    </Label>
                    <Input
                      type="date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-slate-500">عادةً بداية السنة المالية</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      الوصف
                    </Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="وصف القيد..."
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Mode Tabs */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'quick')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="quick">إدخال سريع</TabsTrigger>
                    <TabsTrigger value="manual">إدخال يدوي</TabsTrigger>
                  </TabsList>

                  {/* Quick Entry Mode */}
                  <TabsContent value="quick" className="space-y-4">
                    {commonAccounts.map((acc) => (
                      <Card
                        key={acc.key}
                        className={`border ${acc.type === 'debit' ? 'border-blue-200' : 'border-green-200'}`}
                      >
                        <CardHeader
                          className="pb-3 cursor-pointer"
                          onClick={() => toggleQuickSection(acc.key)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${acc.type === 'debit' ? 'bg-blue-100' : 'bg-green-100'}`}
                              >
                                <DollarSign
                                  className={`w-4 h-4 ${acc.type === 'debit' ? 'text-blue-600' : 'text-green-600'}`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{acc.nameAr}</h4>
                                <p className="text-xs text-slate-500">{acc.nameEn}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                {acc.type === 'debit' ? 'مدين' : 'دائن'}
                              </Badge>
                              {expandedQuick[acc.key] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        {expandedQuick[acc.key] && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <Label className="text-sm">المبلغ (ر.س)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={quickBalances[acc.key] || ''}
                                onChange={(e) =>
                                  updateQuickBalance(acc.key, parseFloat(e.target.value) || 0)
                                }
                                placeholder="0.00"
                                className="rounded-xl text-lg font-semibold"
                              />
                              {acc.key === 'equity' && quickTotals.autoEquity > 0 && (
                                <p className="text-xs text-emerald-600">
                                  سيتم حساب رأس المال تلقائياً: {formatCurrency(quickTotals.autoEquity)}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}

                    {/* Quick Entry Summary */}
                    <Card className="bg-slate-50 border-slate-200">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">إجمالي المدين:</span>
                            <span className="font-bold text-blue-600">
                              {formatCurrency(quickTotals.totalDebits)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">إجمالي الدائن:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(quickTotals.totalCredits + quickTotals.autoEquity)}
                            </span>
                          </div>
                          <div className="border-t pt-3 flex justify-between items-center">
                            <span className="font-semibold">الفرق:</span>
                            <span
                              className={`font-bold ${quickTotals.isBalanced ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                              {formatCurrency(Math.abs(quickTotals.difference))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Manual Entry Mode */}
                  <TabsContent value="manual" className="space-y-4">
                    {loadingAccounts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        <span className="mr-2">جاري تحميل الحسابات...</span>
                      </div>
                    ) : (
                      <>
                        {/* Lines */}
                        {lines.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <p>لم يتم إضافة أي أرصدة بعد</p>
                            <p className="text-sm mt-2">انقر على "إضافة سطر" للبدء</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {lines.map((line, index) => (
                              <Card key={line.id} className="border-slate-200">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                                      {index + 1}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                                      {/* Account */}
                                      <div className="md:col-span-4 space-y-1">
                                        <Label className="text-xs">الحساب</Label>
                                        <Select
                                          value={line.accountId}
                                          onValueChange={(value) =>
                                            updateLine(line.id, 'accountId', value)
                                          }
                                        >
                                          <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="اختر الحساب..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {accounts.map((acc: any) => (
                                              <SelectItem key={acc._id} value={acc._id}>
                                                {acc.code} - {acc.nameAr || acc.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Debit */}
                                      <div className="md:col-span-3 space-y-1">
                                        <Label className="text-xs">مدين</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={line.debit || ''}
                                          onChange={(e) =>
                                            updateLine(
                                              line.id,
                                              'debit',
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          placeholder="0.00"
                                          className="rounded-xl"
                                        />
                                      </div>

                                      {/* Credit */}
                                      <div className="md:col-span-3 space-y-1">
                                        <Label className="text-xs">دائن</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={line.credit || ''}
                                          onChange={(e) =>
                                            updateLine(
                                              line.id,
                                              'credit',
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          placeholder="0.00"
                                          className="rounded-xl"
                                        />
                                      </div>

                                      {/* Actions */}
                                      <div className="md:col-span-2 flex items-end">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeLine(line.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </Button>
                                      </div>

                                      {/* Description */}
                                      <div className="md:col-span-12 space-y-1">
                                        <Label className="text-xs">ملاحظة</Label>
                                        <Input
                                          value={line.description || ''}
                                          onChange={(e) =>
                                            updateLine(line.id, 'description', e.target.value)
                                          }
                                          placeholder="وصف اختياري..."
                                          className="rounded-xl"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Add Line Button */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addLine}
                          className="w-full rounded-xl border-dashed"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة سطر
                        </Button>

                        {/* Manual Entry Summary */}
                        {lines.length > 0 && (
                          <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">إجمالي المدين:</span>
                                  <span className="font-bold text-blue-600">
                                    {formatCurrency(totals.totalDebit)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">إجمالي الدائن:</span>
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(totals.totalCredit)}
                                  </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                  <span className="font-semibold">الفرق:</span>
                                  <span
                                    className={`font-bold ${totals.isBalanced ? 'text-emerald-600' : 'text-red-600'}`}
                                  >
                                    {formatCurrency(Math.abs(totals.difference))}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أضف ملاحظات إضافية..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: '/dashboard/finance/transactions' })}
                      className="rounded-xl"
                    >
                      <X className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      className="rounded-xl"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ كمسودة
                    </Button>
                  </div>

                  <Button
                    onClick={handlePostToGL}
                    disabled={
                      createJournalEntryMutation.isPending ||
                      (mode === 'manual' ? !totals.isBalanced : !quickTotals.isBalanced)
                    }
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg"
                  >
                    {createJournalEntryMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        ترحيل إلى الدفتر العام
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  استيراد من Excel/CSV
                </CardTitle>
                <CardDescription>
                  قم برفع ملف Excel أو CSV يحتوي على الأرصدة الافتتاحية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleImport} className="rounded-xl">
                    <Upload className="w-4 h-4 ml-2" />
                    اختر ملف
                  </Button>
                  <Button variant="ghost" className="rounded-xl">
                    <Download className="w-4 h-4 ml-2" />
                    تحميل قالب
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  يجب أن يحتوي الملف على الأعمدة: رمز الحساب، اسم الحساب، المدين، الدائن
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <FinanceSidebar context="transactions" />
        </div>
      </Main>
    </>
  )
}
