import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  useLoan,
  useDeleteLoan,
  useApproveLoan,
  useRejectLoan,
  useDisburseLoan,
  useRecordPayment,
  useProcessEarlySettlement,
  useIssueClearanceLetter,
} from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Bell, ArrowRight, MoreHorizontal, Edit, Trash2,
  Calendar, Building2, User, Clock, CheckCircle, AlertCircle,
  FileText, DollarSign, CreditCard, Wallet, Loader2, XCircle,
  PlayCircle, Award, FileCheck, Receipt, TrendingUp, AlertTriangle,
  Banknote, Download
} from 'lucide-react'
import {
  LOAN_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  INSTALLMENT_STATUS_LABELS,
  type LoanStatus,
  type PaymentMethod,
} from '@/services/loansService'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { ar: string; en: string }> = {
  payroll_deduction: { ar: 'خصم من الراتب', en: 'Payroll Deduction' },
  bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  cash: { ar: 'نقداً', en: 'Cash' },
  check: { ar: 'شيك', en: 'Check' },
}

export function LoansDetailsView() {
  const params = useParams({ strict: false }) as { loanId?: string }
  const loanId = params.loanId || ''
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDisburseDialog, setShowDisburseDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showSettlementDialog, setShowSettlementDialog] = useState(false)

  // Form state
  const [approveComments, setApproveComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [disbursementMethod, setDisbursementMethod] = useState<'bank_transfer' | 'cash' | 'check'>('bank_transfer')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [iban, setIban] = useState('')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payroll_deduction')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [settlementAmount, setSettlementAmount] = useState<number>(0)

  const { data: loan, isLoading, error } = useLoan(loanId)
  const deleteMutation = useDeleteLoan()
  const approveMutation = useApproveLoan()
  const rejectMutation = useRejectLoan()
  const disburseMutation = useDisburseLoan()
  const paymentMutation = useRecordPayment()
  const settlementMutation = useProcessEarlySettlement()
  const clearanceMutation = useIssueClearanceLetter()

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا القرض؟')) {
      deleteMutation.mutate(loanId, {
        onSuccess: () => navigate({ to: '/dashboard/hr/loans' }),
      })
    }
  }

  const handleApprove = () => {
    approveMutation.mutate({
      loanId,
      data: { comments: approveComments || undefined },
    }, {
      onSuccess: () => {
        setShowApproveDialog(false)
        setApproveComments('')
      },
    })
  }

  const handleReject = () => {
    rejectMutation.mutate({
      loanId,
      data: { reason: rejectReason },
    }, {
      onSuccess: () => {
        setShowRejectDialog(false)
        setRejectReason('')
      },
    })
  }

  const handleDisburse = () => {
    disburseMutation.mutate({
      loanId,
      data: {
        disbursementMethod,
        bankDetails: disbursementMethod === 'bank_transfer' ? {
          bankName,
          accountNumber,
          iban,
        } : undefined,
      },
    }, {
      onSuccess: () => {
        setShowDisburseDialog(false)
        setBankName('')
        setAccountNumber('')
        setIban('')
      },
    })
  }

  const handleRecordPayment = () => {
    paymentMutation.mutate({
      loanId,
      data: {
        amount: paymentAmount,
        paymentMethod,
        paymentDate,
        paymentReference: paymentReference || undefined,
      },
    }, {
      onSuccess: () => {
        setShowPaymentDialog(false)
        setPaymentAmount(0)
        setPaymentDate('')
        setPaymentReference('')
      },
    })
  }

  const handleEarlySettlement = () => {
    settlementMutation.mutate({
      loanId,
      data: {
        settlementAmount,
        paymentMethod,
        paymentReference: paymentReference || undefined,
      },
    }, {
      onSuccess: () => {
        setShowSettlementDialog(false)
        setSettlementAmount(0)
        setPaymentReference('')
      },
    })
  }

  const getStatusColor = (status: LoanStatus) => {
    const colors: Record<LoanStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      defaulted: 'bg-orange-100 text-orange-700 border-orange-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'القروض', href: '/dashboard/hr/loans', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="القروض"
          title={loan?.employeeNameAr || loan?.employeeName || 'تفاصيل القرض'}
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-white"
                  onClick={() => navigate({ to: '/dashboard/hr/loans' })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-navy">تفاصيل القرض</h1>
                  <p className="text-slate-500">عرض وإدارة بيانات القرض</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <MoreHorizontal className="w-4 h-4 ms-2" aria-hidden="true" />
                    إجراءات
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => navigate({ to: `/dashboard/hr/loans/new?editId=${loanId}` })}
                  >
                    <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                    تعديل
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {loan?.status === 'pending' && (
                    <>
                      <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
                        <CheckCircle className="w-4 h-4 ms-2 text-emerald-500" />
                        اعتماد القرض
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
                        <XCircle className="w-4 h-4 ms-2 text-red-500" />
                        رفض القرض
                      </DropdownMenuItem>
                    </>
                  )}
                  {loan?.status === 'approved' && !loan?.disbursement?.disbursed && (
                    <DropdownMenuItem onClick={() => setShowDisburseDialog(true)}>
                      <Banknote className="w-4 h-4 ms-2 text-blue-500" />
                      صرف القرض
                    </DropdownMenuItem>
                  )}
                  {loan?.status === 'active' && (
                    <>
                      <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
                        <Receipt className="w-4 h-4 ms-2 text-emerald-500" />
                        تسجيل دفعة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowSettlementDialog(true)}>
                        <DollarSign className="w-4 h-4 ms-2 text-purple-500" />
                        تسوية مبكرة
                      </DropdownMenuItem>
                    </>
                  )}
                  {loan?.status === 'completed' && !loan?.completion?.clearanceLetterIssued && (
                    <DropdownMenuItem onClick={() => clearanceMutation.mutate(loanId)}>
                      <FileCheck className="w-4 h-4 ms-2 text-emerald-500" />
                      إصدار خطاب إخلاء
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : !loan ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لم يتم العثور على القرض</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Progress Card (for active loans) */}
                {loan.status === 'active' && loan.balance && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-navy">تقدم السداد</h3>
                          <p className="text-sm text-slate-500">نسبة السداد من إجمالي القرض</p>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {loan.balance.completionPercentage}%
                        </div>
                      </div>
                      <Progress value={loan.balance.completionPercentage} className="h-3" />
                      <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-slate-500">
                          المسدد: <span className="font-bold text-emerald-600">{loan.balance.paidAmount.toLocaleString('ar-SA')} ر.س</span>
                        </span>
                        <span className="text-slate-500">
                          المتبقي: <span className="font-bold text-orange-600">{loan.balance.remainingBalance.toLocaleString('ar-SA')} ر.س</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">مبلغ القرض</p>
                          <p className="font-bold text-navy">
                            {loan.loanAmount.toLocaleString('ar-SA')} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <Calendar className="w-5 h-5 text-amber-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">عدد الأقساط</p>
                          <p className="font-bold text-navy">
                            {loan.repayment?.installments || 0} شهر
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Receipt className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">القسط الشهري</p>
                          <p className="font-bold text-navy">
                            {loan.repayment?.installmentAmount?.toLocaleString('ar-SA') || 0} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(loan.status)} px-3 py-2`}>
                          {LOAN_STATUS_LABELS[loan.status]?.ar}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Card className="rounded-2xl border-slate-100">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full border-b border-slate-100 bg-transparent p-0 h-auto">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        نظرة عامة
                      </TabsTrigger>
                      <TabsTrigger
                        value="installments"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        جدول الأقساط
                      </TabsTrigger>
                      <TabsTrigger
                        value="payments"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        سجل المدفوعات
                      </TabsTrigger>
                      <TabsTrigger
                        value="performance"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        الأداء
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Info */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                            <User className="w-4 h-4" />
                            بيانات الموظف
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">الاسم</span>
                              <span className="font-medium">{loan.employeeNameAr || loan.employeeName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم الموظف</span>
                              <span className="font-medium">{loan.employeeNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">المسمى الوظيفي</span>
                              <span className="font-medium">{loan.jobTitle || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">القسم</span>
                              <span className="font-medium">{loan.department || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Loan Info */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            تفاصيل القرض
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم القرض</span>
                              <span className="font-medium">{loan.loanNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">نوع القرض</span>
                              <Badge className={`bg-${LOAN_TYPE_LABELS[loan.loanType]?.color}-100 text-${LOAN_TYPE_LABELS[loan.loanType]?.color}-700`}>
                                {LOAN_TYPE_LABELS[loan.loanType]?.ar}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">تاريخ الطلب</span>
                              <span className="font-medium">
                                {new Date(loan.applicationDate).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            {loan.approvalDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ الاعتماد</span>
                                <span className="font-medium">
                                  {new Date(loan.approvalDate).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                            {loan.disbursementDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ الصرف</span>
                                <span className="font-medium">
                                  {new Date(loan.disbursementDate).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Repayment Info */}
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                          <CreditCard className="w-4 h-4" />
                          بيانات السداد
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">مبلغ القرض</p>
                            <p className="font-bold text-navy">{loan.loanAmount.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">عدد الأقساط</p>
                            <p className="font-bold text-navy">{loan.repayment?.installments} شهر</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">القسط الشهري</p>
                            <p className="font-bold text-navy">{loan.repayment?.installmentAmount?.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">طريقة السداد</p>
                            <p className="font-bold text-navy">
                              {PAYMENT_METHOD_LABELS[loan.repayment?.deductionMethod || 'payroll_deduction']?.ar}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Purpose */}
                      {(loan.purpose || loan.purposeAr) && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-navy flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" />
                            الغرض من القرض
                          </h4>
                          <p className="text-slate-600">{loan.purposeAr || loan.purpose}</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Installments Tab */}
                    <TabsContent value="installments" className="p-6 space-y-4">
                      {loan.installments && loan.installments.length > 0 ? (
                        <div className="space-y-3">
                          {loan.installments.map((installment) => (
                            <Card key={installment.installmentNumber} className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                      {installment.installmentNumber}
                                    </div>
                                    <div>
                                      <p className="font-medium">قسط رقم {installment.installmentNumber}</p>
                                      <p className="text-sm text-slate-500">
                                        {new Date(installment.dueDate).toLocaleDateString('ar-SA')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-navy">{installment.installmentAmount.toLocaleString('ar-SA')} ر.س</p>
                                    <Badge className={`${
                                      installment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                      installment.status === 'pending' ? 'bg-slate-100 text-slate-700' :
                                      installment.status === 'missed' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {INSTALLMENT_STATUS_LABELS[installment.status]?.ar}
                                    </Badge>
                                  </div>
                                </div>
                                {installment.lateDays && installment.lateDays > 0 && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    متأخر {installment.lateDays} يوم
                                    {installment.lateFee && (
                                      <span className="text-red-500">
                                        (غرامة: {installment.lateFee.toLocaleString('ar-SA')} ر.س)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                          <p className="mt-4 text-slate-500">لم يتم إنشاء جدول الأقساط بعد</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="p-6 space-y-4">
                      {loan.paymentHistory && loan.paymentHistory.length > 0 ? (
                        <div className="space-y-3">
                          {loan.paymentHistory.map((payment, index) => (
                            <Card key={payment.paymentId || index} className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-100 rounded-xl">
                                      <Receipt className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {payment.installmentNumber
                                          ? `دفعة قسط رقم ${payment.installmentNumber}`
                                          : 'دفعة'}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-emerald-600">+{payment.totalPaid.toLocaleString('ar-SA')} ر.س</p>
                                    <p className="text-xs text-slate-500">
                                      {PAYMENT_METHOD_LABELS[payment.paymentMethod]?.ar}
                                    </p>
                                  </div>
                                </div>
                                {payment.receiptNumber && (
                                  <p className="mt-2 text-xs text-slate-500">
                                    رقم الإيصال: {payment.receiptNumber}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Receipt className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="mt-4 text-slate-500">لا توجد مدفوعات مسجلة</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="p-6 space-y-6">
                      {loan.paymentPerformance ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="rounded-xl border-slate-100 bg-emerald-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-emerald-600">مدفوعات في الوقت</p>
                                <p className="text-2xl font-bold text-emerald-700">
                                  {loan.paymentPerformance.onTimePayments}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-amber-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-amber-600">مدفوعات متأخرة</p>
                                <p className="text-2xl font-bold text-amber-700">
                                  {loan.paymentPerformance.latePayments}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-red-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-red-600">مدفوعات فائتة</p>
                                <p className="text-2xl font-bold text-red-700">
                                  {loan.paymentPerformance.missedPayments}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-blue-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-blue-600">نسبة الالتزام</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {loan.paymentPerformance.onTimePercentage}%
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {loan.paymentPerformance.paymentRating && (
                            <Card className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                    <span className="font-medium">تقييم السداد</span>
                                  </div>
                                  <Badge className={`px-4 py-2 ${
                                    loan.paymentPerformance.paymentRating === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                    loan.paymentPerformance.paymentRating === 'good' ? 'bg-blue-100 text-blue-700' :
                                    loan.paymentPerformance.paymentRating === 'fair' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {loan.paymentPerformance.paymentRating === 'excellent' ? 'ممتاز' :
                                     loan.paymentPerformance.paymentRating === 'good' ? 'جيد' :
                                     loan.paymentPerformance.paymentRating === 'fair' ? 'مقبول' : 'ضعيف'}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {loan.paymentPerformance.totalLateFees > 0 && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                              <div className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <span>إجمالي غرامات التأخير: </span>
                                <span className="font-bold">{loan.paymentPerformance.totalLateFees.toLocaleString('ar-SA')} ر.س</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                          <p className="mt-4 text-slate-500">لا تتوفر بيانات أداء بعد</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </Card>
              </>
            )}
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="employees" />
        </div>
      </Main>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>اعتماد القرض</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                value={approveComments}
                onChange={(e) => setApproveComments(e.target.value)}
                placeholder="أضف ملاحظات الاعتماد..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              <CheckCircle className="w-4 h-4 ms-2" />
              اعتماد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رفض القرض</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>سبب الرفض <span className="text-red-500">*</span></Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="أدخل سبب الرفض..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason || rejectMutation.isPending}
              className="bg-red-500 hover:bg-red-600 rounded-xl"
            >
              <XCircle className="w-4 h-4 ms-2" />
              رفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disburse Dialog */}
      <Dialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>صرف القرض</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>طريقة الصرف</Label>
              <Select
                value={disbursementMethod}
                onValueChange={(v) => setDisbursementMethod(v as typeof disbursementMethod)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {disbursementMethod === 'bank_transfer' && (
              <>
                <div className="space-y-2">
                  <Label>اسم البنك</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="مثال: البنك الأهلي"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الحساب</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="رقم الحساب البنكي"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الآيبان (IBAN)</Label>
                  <Input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="SA..."
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisburseDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleDisburse}
              disabled={disburseMutation.isPending || (disbursementMethod === 'bank_transfer' && (!bankName || !iban))}
              className="bg-blue-500 hover:bg-blue-600 rounded-xl"
            >
              <Banknote className="w-4 h-4 ms-2" />
              صرف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>مبلغ الدفعة <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="أدخل مبلغ الدفعة"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الدفع <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم المرجع (اختياري)</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="رقم الإيصال أو التحويل"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={!paymentAmount || !paymentDate || paymentMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              <Receipt className="w-4 h-4 ms-2" />
              تسجيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Early Settlement Dialog */}
      <Dialog open={showSettlementDialog} onOpenChange={setShowSettlementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تسوية مبكرة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
              <p className="font-medium mb-1">الرصيد المتبقي:</p>
              <p className="text-lg font-bold">{loan?.balance?.remainingBalance?.toLocaleString('ar-SA')} ر.س</p>
            </div>
            <div className="space-y-2">
              <Label>مبلغ التسوية <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={settlementAmount || ''}
                onChange={(e) => setSettlementAmount(Number(e.target.value))}
                placeholder="أدخل مبلغ التسوية"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم المرجع (اختياري)</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="رقم الإيصال أو التحويل"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettlementDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleEarlySettlement}
              disabled={!settlementAmount || settlementMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 rounded-xl"
            >
              <DollarSign className="w-4 h-4 ms-2" />
              تسوية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
