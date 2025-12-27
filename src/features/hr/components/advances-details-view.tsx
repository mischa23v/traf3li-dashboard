import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import {
  useAdvance,
  useDeleteAdvance,
  useApproveAdvance,
  useRejectAdvance,
  useDisburseAdvance,
  useRecordAdvanceRecovery,
  useProcessEarlyRecovery,
  useIssueClearanceLetter,
} from '@/hooks/useAdvances'
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
  FileText, DollarSign, Wallet, Loader2, XCircle,
  Receipt, TrendingUp, AlertTriangle, Banknote, FileCheck, Zap
} from 'lucide-react'
import {
  ADVANCE_TYPE_LABELS,
  ADVANCE_STATUS_LABELS,
  RECOVERY_STATUS_LABELS,
  URGENCY_LABELS,
  type AdvanceStatus,
  type RecoveryMethod,
  type DisbursementMethod,
} from '@/services/advancesService'

const RECOVERY_METHOD_LABELS: Record<RecoveryMethod, { ar: string; en: string }> = {
  payroll_deduction: { ar: 'خصم من الراتب', en: 'Payroll Deduction' },
  bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  cash: { ar: 'نقداً', en: 'Cash' },
  final_settlement: { ar: 'تسوية نهائية', en: 'Final Settlement' },
  lump_sum: { ar: 'مبلغ إجمالي', en: 'Lump Sum' },
}

export function AdvancesDetailsView() {
  const getColorClasses = (color: string) => {
    const colorMap = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        pink: 'bg-pink-100 text-pink-700 border-pink-200',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        violet: 'bg-violet-100 text-violet-700 border-violet-200',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        stone: 'bg-stone-100 text-stone-700 border-stone-200',
        teal: 'bg-teal-100 text-teal-700 border-teal-200',
        cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        sky: 'bg-sky-100 text-sky-700 border-sky-200',
        lime: 'bg-lime-100 text-lime-700 border-lime-200',
        rose: 'bg-rose-100 text-rose-700 border-rose-200',
        fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
}

  const params = useParams({ strict: false }) as { advanceId?: string }
  const advanceId = params.advanceId || ''
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDisburseDialog, setShowDisburseDialog] = useState(false)
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
  const [showEarlyRecoveryDialog, setShowEarlyRecoveryDialog] = useState(false)

  // Form state
  const [approveComments, setApproveComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [disbursementMethod, setDisbursementMethod] = useState<DisbursementMethod>('bank_transfer')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [iban, setIban] = useState('')
  const [recoveryAmount, setRecoveryAmount] = useState<number>(0)
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('payroll_deduction')
  const [recoveryDate, setRecoveryDate] = useState('')
  const [recoveryReference, setRecoveryReference] = useState('')
  const [earlyRecoveryAmount, setEarlyRecoveryAmount] = useState<number>(0)

  const { data: advance, isLoading, error } = useAdvance(advanceId)
  const deleteMutation = useDeleteAdvance()
  const approveMutation = useApproveAdvance()
  const rejectMutation = useRejectAdvance()
  const disburseMutation = useDisburseAdvance()
  const recoveryMutation = useRecordAdvanceRecovery()
  const earlyRecoveryMutation = useProcessEarlyRecovery()
  const clearanceMutation = useIssueClearanceLetter()

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه السلفة؟')) {
      deleteMutation.mutate(advanceId, {
        onSuccess: () => navigate({ to: ROUTES.dashboard.hr.advances.list }),
      })
    }
  }

  const handleApprove = () => {
    approveMutation.mutate({
      advanceId,
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
      advanceId,
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
      advanceId,
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

  const handleRecordRecovery = () => {
    recoveryMutation.mutate({
      advanceId,
      data: {
        amount: recoveryAmount,
        recoveryMethod,
        recoveryDate,
        recoveryReference: recoveryReference || undefined,
      },
    }, {
      onSuccess: () => {
        setShowRecoveryDialog(false)
        setRecoveryAmount(0)
        setRecoveryDate('')
        setRecoveryReference('')
      },
    })
  }

  const handleEarlyRecovery = () => {
    earlyRecoveryMutation.mutate({
      advanceId,
      data: {
        recoveryAmount: earlyRecoveryAmount,
        recoveryMethod,
        recoveryReference: recoveryReference || undefined,
      },
    }, {
      onSuccess: () => {
        setShowEarlyRecoveryDialog(false)
        setEarlyRecoveryAmount(0)
        setRecoveryReference('')
      },
    })
  }

  const getStatusColor = (status: AdvanceStatus) => {
    const colors: Record<AdvanceStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      disbursed: 'bg-purple-100 text-purple-700 border-purple-200',
      recovering: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'السلف', href: ROUTES.dashboard.hr.advances.list, isActive: true },
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
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="السلف"
          title={advance?.employeeNameAr || advance?.employeeName || 'تفاصيل السلفة'}
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
                  onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.list })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-navy">تفاصيل السلفة</h1>
                  <p className="text-slate-500">عرض وإدارة بيانات السلفة</p>
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
                    onClick={() => navigate({ to: `/dashboard/hr/advances/new?editId=${advanceId}` })}
                  >
                    <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                    تعديل
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {advance?.status === 'pending' && (
                    <>
                      <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
                        <CheckCircle className="w-4 h-4 ms-2 text-emerald-500" />
                        اعتماد السلفة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
                        <XCircle className="w-4 h-4 ms-2 text-red-500" />
                        رفض السلفة
                      </DropdownMenuItem>
                    </>
                  )}
                  {advance?.status === 'approved' && !advance?.disbursement?.disbursed && (
                    <DropdownMenuItem onClick={() => setShowDisburseDialog(true)}>
                      <Banknote className="w-4 h-4 ms-2 text-blue-500" />
                      صرف السلفة
                    </DropdownMenuItem>
                  )}
                  {(advance?.status === 'disbursed' || advance?.status === 'recovering') && (
                    <>
                      <DropdownMenuItem onClick={() => setShowRecoveryDialog(true)}>
                        <Receipt className="w-4 h-4 ms-2 text-emerald-500" />
                        تسجيل استرداد
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEarlyRecoveryDialog(true)}>
                        <DollarSign className="w-4 h-4 ms-2 text-purple-500" />
                        استرداد مبكر
                      </DropdownMenuItem>
                    </>
                  )}
                  {advance?.status === 'completed' && !advance?.completion?.clearanceLetterIssued && (
                    <DropdownMenuItem onClick={() => clearanceMutation.mutate(advanceId)}>
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
            ) : !advance ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">لم يتم العثور على السلفة</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Progress Card (for recovering advances) */}
                {(advance.status === 'recovering' || advance.status === 'disbursed') && advance.balance && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-navy">تقدم الاسترداد</h3>
                          <p className="text-sm text-slate-500">نسبة السداد من إجمالي السلفة</p>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {advance.balance.completionPercentage}%
                        </div>
                      </div>
                      <Progress value={advance.balance.completionPercentage} className="h-3" />
                      <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-slate-500">
                          المسترد: <span className="font-bold text-emerald-600">{advance.balance.recoveredAmount.toLocaleString('ar-SA')} ر.س</span>
                        </span>
                        <span className="text-slate-500">
                          المتبقي: <span className="font-bold text-orange-600">{advance.balance.remainingBalance.toLocaleString('ar-SA')} ر.س</span>
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
                          <p className="text-xs text-slate-500">مبلغ السلفة</p>
                          <p className="font-bold text-navy">
                            {advance.advanceAmount.toLocaleString('ar-SA')} ر.س
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
                            {advance.repayment?.installments || 0} شهر
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
                            {advance.repayment?.installmentAmount?.toLocaleString('ar-SA') || 0} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(advance.status)} px-3 py-2`}>
                          {ADVANCE_STATUS_LABELS[advance.status]?.ar}
                        </Badge>
                        {advance.isEmergency && (
                          <Badge className="bg-red-100 text-red-700">
                            <Zap className="w-3 h-3 ms-1" />
                            طوارئ
                          </Badge>
                        )}
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
                        value="schedule"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        جدول السداد
                      </TabsTrigger>
                      <TabsTrigger
                        value="recoveries"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        سجل الاسترداد
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
                            <User className="w-4 h-4" aria-hidden="true" />
                            بيانات الموظف
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">الاسم</span>
                              <span className="font-medium">{advance.employeeNameAr || advance.employeeName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم الموظف</span>
                              <span className="font-medium">{advance.employeeNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">المسمى الوظيفي</span>
                              <span className="font-medium">{advance.jobTitle || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">القسم</span>
                              <span className="font-medium">{advance.department || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Advance Info */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            تفاصيل السلفة
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم السلفة</span>
                              <span className="font-medium">{advance.advanceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">نوع السلفة</span>
                              <Badge className={getColorClasses(ADVANCE_TYPE_LABELS[advance.advanceType]?.color)}>
                                {ADVANCE_TYPE_LABELS[advance.advanceType]?.ar}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">الأولوية</span>
                              <Badge className={getColorClasses(URGENCY_LABELS[advance.urgency]?.color)}>
                                {URGENCY_LABELS[advance.urgency]?.ar}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">تاريخ الطلب</span>
                              <span className="font-medium">
                                {new Date(advance.requestDate).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            {advance.approvalDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ الاعتماد</span>
                                <span className="font-medium">
                                  {new Date(advance.approvalDate).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                            {advance.disbursementDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ الصرف</span>
                                <span className="font-medium">
                                  {new Date(advance.disbursementDate).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Repayment Info */}
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          بيانات السداد
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">مبلغ السلفة</p>
                            <p className="font-bold text-navy">{advance.advanceAmount.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">عدد الأقساط</p>
                            <p className="font-bold text-navy">{advance.repayment?.installments} شهر</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">القسط الشهري</p>
                            <p className="font-bold text-navy">{advance.repayment?.installmentAmount?.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">تاريخ البدء</p>
                            <p className="font-bold text-navy">
                              {advance.repayment?.startDate
                                ? new Date(advance.repayment.startDate).toLocaleDateString('ar-SA')
                                : 'غير محدد'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {(advance.reason || advance.reasonAr) && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-navy flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" aria-hidden="true" />
                            سبب السلفة
                          </h4>
                          <p className="text-slate-600">{advance.reasonAr || advance.reason}</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule" className="p-6 space-y-4">
                      {advance.repaymentSchedule?.installments && advance.repaymentSchedule.installments.length > 0 ? (
                        <div className="space-y-3">
                          {advance.repaymentSchedule.installments.map((installment) => (
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
                                  <div className="text-start">
                                    <p className="font-bold text-navy">{installment.installmentAmount.toLocaleString('ar-SA')} ر.س</p>
                                    <Badge className={`${
                                      installment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                      installment.status === 'pending' ? 'bg-slate-100 text-slate-700' :
                                      installment.status === 'missed' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {RECOVERY_STATUS_LABELS[installment.status]?.ar}
                                    </Badge>
                                  </div>
                                </div>
                                {installment.daysMissed && installment.daysMissed > 0 && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                                    متأخر {installment.daysMissed} يوم
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                          <p className="mt-4 text-slate-500">لم يتم إنشاء جدول السداد بعد</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Recoveries Tab */}
                    <TabsContent value="recoveries" className="p-6 space-y-4">
                      {advance.recoveryHistory && advance.recoveryHistory.length > 0 ? (
                        <div className="space-y-3">
                          {advance.recoveryHistory.map((recovery, index) => (
                            <Card key={recovery.recoveryId || index} className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-100 rounded-xl">
                                      <Receipt className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {recovery.installmentNumber
                                          ? `استرداد قسط رقم ${recovery.installmentNumber}`
                                          : 'استرداد'}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {new Date(recovery.recoveryDate).toLocaleDateString('ar-SA')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-start">
                                    <p className="font-bold text-emerald-600">+{recovery.recoveredAmount.toLocaleString('ar-SA')} ر.س</p>
                                    <p className="text-xs text-slate-500">
                                      {RECOVERY_METHOD_LABELS[recovery.recoveryMethod]?.ar}
                                    </p>
                                  </div>
                                </div>
                                {recovery.receiptNumber && (
                                  <p className="mt-2 text-xs text-slate-500">
                                    رقم الإيصال: {recovery.receiptNumber}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Receipt className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="mt-4 text-slate-500">لا توجد استردادات مسجلة</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="p-6 space-y-6">
                      {advance.recoveryPerformance ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="rounded-xl border-slate-100 bg-emerald-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-emerald-600">في الوقت</p>
                                <p className="text-2xl font-bold text-emerald-700">
                                  {advance.recoveryPerformance.onTimeRecoveries}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-amber-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-amber-600">متأخرة</p>
                                <p className="text-2xl font-bold text-amber-700">
                                  {advance.recoveryPerformance.delayedRecoveries}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-red-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-red-600">فائتة</p>
                                <p className="text-2xl font-bold text-red-700">
                                  {advance.recoveryPerformance.missedRecoveries}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-blue-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-blue-600">نسبة الالتزام</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {advance.recoveryPerformance.onTimePercentage}%
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {advance.recoveryPerformance.performanceRating && (
                            <Card className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                    <span className="font-medium">تقييم السداد</span>
                                  </div>
                                  <Badge className={`px-4 py-2 ${
                                    advance.recoveryPerformance.performanceRating === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                    advance.recoveryPerformance.performanceRating === 'good' ? 'bg-blue-100 text-blue-700' :
                                    advance.recoveryPerformance.performanceRating === 'fair' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {advance.recoveryPerformance.performanceRating === 'excellent' ? 'ممتاز' :
                                     advance.recoveryPerformance.performanceRating === 'good' ? 'جيد' :
                                     advance.recoveryPerformance.performanceRating === 'fair' ? 'مقبول' : 'ضعيف'}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
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
            <DialogTitle>اعتماد السلفة</DialogTitle>
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
            <DialogTitle>رفض السلفة</DialogTitle>
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
            <DialogTitle>صرف السلفة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>طريقة الصرف</Label>
              <Select
                value={disbursementMethod}
                onValueChange={(v) => setDisbursementMethod(v as DisbursementMethod)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                  <SelectItem value="payroll_addition">إضافة للراتب</SelectItem>
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

      {/* Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل استرداد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>مبلغ الاسترداد <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={recoveryAmount || ''}
                onChange={(e) => setRecoveryAmount(Number(e.target.value))}
                placeholder="أدخل مبلغ الاسترداد"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الاسترداد <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={recoveryDate}
                onChange={(e) => setRecoveryDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>طريقة الاسترداد</Label>
              <Select
                value={recoveryMethod}
                onValueChange={(v) => setRecoveryMethod(v as RecoveryMethod)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECOVERY_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم المرجع (اختياري)</Label>
              <Input
                value={recoveryReference}
                onChange={(e) => setRecoveryReference(e.target.value)}
                placeholder="رقم الإيصال أو التحويل"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecoveryDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleRecordRecovery}
              disabled={!recoveryAmount || !recoveryDate || recoveryMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              <Receipt className="w-4 h-4 ms-2" />
              تسجيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Early Recovery Dialog */}
      <Dialog open={showEarlyRecoveryDialog} onOpenChange={setShowEarlyRecoveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>استرداد مبكر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
              <p className="font-medium mb-1">الرصيد المتبقي:</p>
              <p className="text-lg font-bold">{advance?.balance?.remainingBalance?.toLocaleString('ar-SA')} ر.س</p>
            </div>
            <div className="space-y-2">
              <Label>مبلغ الاسترداد <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={earlyRecoveryAmount || ''}
                onChange={(e) => setEarlyRecoveryAmount(Number(e.target.value))}
                placeholder="أدخل مبلغ الاسترداد"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>طريقة الاسترداد</Label>
              <Select
                value={recoveryMethod}
                onValueChange={(v) => setRecoveryMethod(v as RecoveryMethod)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECOVERY_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم المرجع (اختياري)</Label>
              <Input
                value={recoveryReference}
                onChange={(e) => setRecoveryReference(e.target.value)}
                placeholder="رقم الإيصال أو التحويل"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEarlyRecoveryDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleEarlyRecovery}
              disabled={!earlyRecoveryAmount || earlyRecoveryMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 rounded-xl"
            >
              <DollarSign className="w-4 h-4 ms-2" />
              استرداد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
