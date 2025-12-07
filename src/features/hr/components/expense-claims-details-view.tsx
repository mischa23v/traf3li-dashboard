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
  useExpenseClaim,
  useDeleteExpenseClaim,
  useApproveExpenseClaim,
  useRejectExpenseClaim,
  useSubmitExpenseClaim,
  useProcessClaimPayment,
  useRequestClaimChanges,
} from '@/hooks/useExpenseClaims'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  FileText, DollarSign, Receipt, Loader2, XCircle, Send,
  Plane, Utensils, Hotel, Car, Paperclip, CreditCard, Banknote,
  FileCheck, AlertTriangle, Eye
} from 'lucide-react'
import {
  EXPENSE_CATEGORY_LABELS,
  CLAIM_STATUS_LABELS,
  EXPENSE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  type ClaimStatus,
  type PaymentMethod,
  type ExpenseCategory,
} from '@/services/expenseClaimsService'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { ar: string; en: string }> = {
  bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  cash: { ar: 'نقداً', en: 'Cash' },
  check: { ar: 'شيك', en: 'Check' },
  payroll_addition: { ar: 'إضافة للراتب', en: 'Payroll Addition' },
  corporate_card_credit: { ar: 'رصيد بطاقة الشركة', en: 'Corporate Card Credit' },
}

export function ExpenseClaimsDetailsView() {
  const params = useParams({ strict: false }) as { claimId?: string }
  const claimId = params.claimId || ''
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showChangesDialog, setShowChangesDialog] = useState(false)

  // Form state
  const [approveComments, setApproveComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [changesRequested, setChangesRequested] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [iban, setIban] = useState('')
  const [paymentReference, setPaymentReference] = useState('')

  const { data: claim, isLoading, error } = useExpenseClaim(claimId)
  const deleteMutation = useDeleteExpenseClaim()
  const approveMutation = useApproveExpenseClaim()
  const rejectMutation = useRejectExpenseClaim()
  const submitMutation = useSubmitExpenseClaim()
  const paymentMutation = useProcessClaimPayment()
  const changesMutation = useRequestClaimChanges()

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه المطالبة؟')) {
      deleteMutation.mutate(claimId, {
        onSuccess: () => navigate({ to: '/dashboard/hr/expense-claims' }),
      })
    }
  }

  const handleSubmit = () => {
    submitMutation.mutate(claimId)
  }

  const handleApprove = () => {
    approveMutation.mutate({
      claimId,
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
      claimId,
      data: { reason: rejectReason },
    }, {
      onSuccess: () => {
        setShowRejectDialog(false)
        setRejectReason('')
      },
    })
  }

  const handleRequestChanges = () => {
    changesMutation.mutate({
      claimId,
      data: { changesRequested },
    }, {
      onSuccess: () => {
        setShowChangesDialog(false)
        setChangesRequested('')
      },
    })
  }

  const handleProcessPayment = () => {
    paymentMutation.mutate({
      claimId,
      data: {
        paymentMethod,
        paymentReference: paymentReference || undefined,
        bankDetails: paymentMethod === 'bank_transfer' ? {
          bankName,
          accountNumber,
          iban,
        } : undefined,
      },
    }, {
      onSuccess: () => {
        setShowPaymentDialog(false)
        setBankName('')
        setAccountNumber('')
        setIban('')
        setPaymentReference('')
      },
    })
  }

  const getStatusColor = (status: ClaimStatus) => {
    const colors: Record<ClaimStatus, string> = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      under_review: 'bg-amber-100 text-amber-700 border-amber-200',
      pending_approval: 'bg-orange-100 text-orange-700 border-orange-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return colors[status]
  }

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<string, React.ReactNode> = {
      travel: <Plane className="w-4 h-4" />,
      meals: <Utensils className="w-4 h-4" />,
      accommodation: <Hotel className="w-4 h-4" />,
      transportation: <Car className="w-4 h-4" />,
      mileage: <Car className="w-4 h-4" />,
    }
    return icons[category] || <Receipt className="w-4 h-4" />
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'مطالبات النفقات', href: '/dashboard/hr/expense-claims', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
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
          badge="مطالبات النفقات"
          title={claim?.claimTitleAr || claim?.claimTitle || 'تفاصيل المطالبة'}
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
                  onClick={() => navigate({ to: '/dashboard/hr/expense-claims' })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-navy">تفاصيل المطالبة</h1>
                  <p className="text-slate-500">عرض وإدارة مطالبة النفقات</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <MoreHorizontal className="w-4 h-4 ml-2" />
                    إجراءات
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => navigate({ to: `/dashboard/hr/expense-claims/new?editId=${claimId}` })}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {claim?.status === 'draft' && (
                    <DropdownMenuItem onClick={handleSubmit}>
                      <Send className="w-4 h-4 ml-2 text-blue-500" />
                      تقديم المطالبة
                    </DropdownMenuItem>
                  )}
                  {(claim?.status === 'submitted' || claim?.status === 'under_review' || claim?.status === 'pending_approval') && (
                    <>
                      <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
                        <CheckCircle className="w-4 h-4 ml-2 text-emerald-500" />
                        اعتماد المطالبة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
                        <XCircle className="w-4 h-4 ml-2 text-red-500" />
                        رفض المطالبة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowChangesDialog(true)}>
                        <FileText className="w-4 h-4 ml-2 text-amber-500" />
                        طلب تعديلات
                      </DropdownMenuItem>
                    </>
                  )}
                  {claim?.status === 'approved' && (
                    <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
                      <Banknote className="w-4 h-4 ml-2 text-blue-500" />
                      معالجة الدفع
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 ml-2" />
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
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : !claim ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لم يتم العثور على المطالبة</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الإجمالي</p>
                          <p className="font-bold text-navy">
                            {claim.totals.grandTotal.toLocaleString('ar-SA')} ر.س
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">عدد البنود</p>
                          <p className="font-bold text-navy">{claim.lineItemsCount} بند</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Paperclip className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الإيصالات</p>
                          <p className={`font-bold ${claim.allReceiptsAttached ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {claim.allReceiptsAttached ? 'مكتملة' : `ناقص ${claim.missingReceiptsCount}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(claim.status)} px-3 py-2`}>
                          {CLAIM_STATUS_LABELS[claim.status]?.ar}
                        </Badge>
                        {claim.billable?.isBillable && (
                          <Badge className="bg-teal-100 text-teal-700">
                            <DollarSign className="w-3 h-3 ml-1" />
                            قابل للفوترة
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Policy Violations Warning */}
                {claim.policyCompliance && !claim.policyCompliance.compliant && (
                  <Card className="rounded-2xl border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800">مخالفات السياسة</p>
                          <ul className="mt-2 space-y-1 text-sm text-amber-700">
                            {claim.policyCompliance.violations.map((v, i) => (
                              <li key={i}>• {v.descriptionAr || v.description}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                        value="items"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        البنود
                      </TabsTrigger>
                      <TabsTrigger
                        value="receipts"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        الإيصالات
                      </TabsTrigger>
                      <TabsTrigger
                        value="approval"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        الاعتماد
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
                              <span className="font-medium">{claim.employeeNameAr || claim.employeeName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم الموظف</span>
                              <span className="font-medium">{claim.employeeNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">القسم</span>
                              <span className="font-medium">{claim.department || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">مركز التكلفة</span>
                              <span className="font-medium">{claim.costCenter || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Claim Info */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            تفاصيل المطالبة
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم المطالبة</span>
                              <span className="font-medium">{claim.claimNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">نوع المطالبة</span>
                              <Badge className={`bg-${EXPENSE_TYPE_LABELS[claim.expenseType]?.color}-100 text-${EXPENSE_TYPE_LABELS[claim.expenseType]?.color}-700`}>
                                {EXPENSE_TYPE_LABELS[claim.expenseType]?.ar}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">فترة المطالبة</span>
                              <span className="font-medium">
                                {new Date(claim.claimPeriod.startDate).toLocaleDateString('ar-SA')} - {new Date(claim.claimPeriod.endDate).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            {claim.submissionDate && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ التقديم</span>
                                <span className="font-medium">
                                  {new Date(claim.submissionDate).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                          <DollarSign className="w-4 h-4" />
                          ملخص المبالغ
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">المجموع الفرعي</p>
                            <p className="font-bold text-navy">{claim.totals.subtotal.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">ضريبة القيمة المضافة</p>
                            <p className="font-bold text-navy">{claim.totals.vatTotal.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          <div className="p-3 bg-emerald-50 rounded-xl">
                            <p className="text-xs text-emerald-600">الإجمالي الكلي</p>
                            <p className="font-bold text-emerald-700">{claim.totals.grandTotal.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                          {claim.totals.approvedAmount !== undefined && (
                            <div className="p-3 bg-blue-50 rounded-xl">
                              <p className="text-xs text-blue-600">المعتمد</p>
                              <p className="font-bold text-blue-700">{claim.totals.approvedAmount.toLocaleString('ar-SA')} ر.س</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Travel Details */}
                      {claim.travelDetails && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                            <Plane className="w-4 h-4" />
                            تفاصيل السفر
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                              <p className="text-xs text-blue-600">الغرض</p>
                              <p className="font-medium text-blue-800">{claim.travelDetails.tripPurposeAr || claim.travelDetails.tripPurpose}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500">من</p>
                              <p className="font-medium">{claim.travelDetails.departureCity}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500">إلى</p>
                              <p className="font-medium">{claim.travelDetails.arrivalCity}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500">عدد الأيام</p>
                              <p className="font-medium">{claim.travelDetails.tripDays} يوم</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mileage Claim */}
                      {claim.mileageClaim && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                            <Car className="w-4 h-4" />
                            مطالبة المسافات
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-teal-50 rounded-xl">
                              <p className="text-xs text-teal-600">إجمالي المسافة</p>
                              <p className="font-bold text-teal-700">{claim.mileageClaim.totalDistance} كم</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500">معدل الكيلومتر</p>
                              <p className="font-medium">{claim.mileageClaim.ratePerKm.toFixed(2)} ر.س</p>
                            </div>
                            <div className="p-3 bg-teal-50 rounded-xl">
                              <p className="text-xs text-teal-600">المبلغ المستحق</p>
                              <p className="font-bold text-teal-700">{claim.mileageClaim.totalMileageAmount.toLocaleString('ar-SA')} ر.س</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Items Tab */}
                    <TabsContent value="items" className="p-6 space-y-4">
                      {claim.lineItems && claim.lineItems.length > 0 ? (
                        <div className="space-y-3">
                          {claim.lineItems.map((item, index) => (
                            <Card key={item.lineItemId || index} className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-100 rounded-xl">
                                      {getCategoryIcon(item.category)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{item.descriptionAr || item.description}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`bg-${EXPENSE_CATEGORY_LABELS[item.category]?.color}-100 text-${EXPENSE_CATEGORY_LABELS[item.category]?.color}-700 text-xs`}>
                                          {EXPENSE_CATEGORY_LABELS[item.category]?.ar}
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                          {new Date(item.expenseDate).toLocaleDateString('ar-SA')}
                                        </span>
                                        {item.vendor && (
                                          <span className="text-xs text-slate-500">• {item.vendorAr || item.vendor}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-navy">{item.amount.toLocaleString('ar-SA')} ر.س</p>
                                    {item.vatAmount && item.vatAmount > 0 && (
                                      <p className="text-xs text-slate-500">+ضريبة {item.vatAmount.toLocaleString('ar-SA')}</p>
                                    )}
                                    {item.isBillable && (
                                      <Badge className="bg-teal-100 text-teal-700 text-xs mt-1">
                                        قابل للفوترة
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {item.receiptStatus !== 'attached' && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                                    <AlertTriangle className="w-3 h-3" />
                                    إيصال مفقود
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="mt-4 text-slate-500">لا توجد بنود</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Receipts Tab */}
                    <TabsContent value="receipts" className="p-6 space-y-4">
                      {claim.receipts && claim.receipts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {claim.receipts.map((receipt, index) => (
                            <Card key={receipt.receiptId || index} className="rounded-xl border-slate-100">
                              <CardContent className="p-4">
                                <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                                  <Paperclip className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="font-medium text-sm truncate">{receipt.fileName}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-slate-500">
                                    {new Date(receipt.uploadedOn).toLocaleDateString('ar-SA')}
                                  </span>
                                  <Badge className={receipt.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                    {receipt.verified ? 'موثق' : 'قيد المراجعة'}
                                  </Badge>
                                </div>
                                {receipt.fileUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2 rounded-xl"
                                    onClick={() => window.open(receipt.fileUrl, '_blank')}
                                  >
                                    <Eye className="w-4 h-4 ml-1" />
                                    عرض
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Paperclip className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="mt-4 text-slate-500">لا توجد إيصالات مرفقة</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Approval Tab */}
                    <TabsContent value="approval" className="p-6 space-y-6">
                      {claim.approvalWorkflow ? (
                        <>
                          <div className="space-y-4">
                            {claim.approvalWorkflow.workflowSteps.map((step) => (
                              <Card key={step.stepNumber} className="rounded-xl border-slate-100">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        step.status === 'approved' ? 'bg-emerald-100' :
                                        step.status === 'rejected' ? 'bg-red-100' :
                                        step.status === 'pending' ? 'bg-amber-100' : 'bg-slate-100'
                                      }`}>
                                        {step.status === 'approved' ? (
                                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        ) : step.status === 'rejected' ? (
                                          <XCircle className="w-5 h-5 text-red-600" />
                                        ) : (
                                          <Clock className="w-5 h-5 text-amber-600" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium">{step.stepNameAr || step.stepName}</p>
                                        <p className="text-sm text-slate-500">
                                          {step.approverName || step.approverRole}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-left">
                                      <Badge className={`${
                                        step.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        step.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                      }`}>
                                        {step.status === 'approved' ? 'معتمد' :
                                         step.status === 'rejected' ? 'مرفوض' :
                                         step.status === 'skipped' ? 'تم تخطيه' : 'قيد الانتظار'}
                                      </Badge>
                                      {step.actionDate && (
                                        <p className="text-xs text-slate-500 mt-1">
                                          {new Date(step.actionDate).toLocaleDateString('ar-SA')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {step.comments && (
                                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                      {step.commentsAr || step.comments}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {claim.approvalWorkflow.rejectionReason && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                              <p className="font-medium text-red-800">سبب الرفض:</p>
                              <p className="text-sm text-red-700 mt-1">{claim.approvalWorkflow.rejectionReason}</p>
                            </div>
                          )}

                          {claim.approvalWorkflow.changesRequested && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                              <p className="font-medium text-amber-800">التعديلات المطلوبة:</p>
                              <p className="text-sm text-amber-700 mt-1">{claim.approvalWorkflow.changesRequested}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <FileCheck className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="mt-4 text-slate-500">لم يتم بدء سير الاعتماد بعد</p>
                        </div>
                      )}

                      {/* Payment Info */}
                      {claim.payment && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4" />
                            معلومات الدفع
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500">طريقة الدفع</p>
                              <p className="font-medium">{PAYMENT_METHOD_LABELS[claim.payment.paymentMethod]?.ar}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500">حالة الدفع</p>
                              <Badge className={`${
                                claim.payment.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                claim.payment.paymentStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {PAYMENT_STATUS_LABELS[claim.payment.paymentStatus]?.ar}
                              </Badge>
                            </div>
                            {claim.payment.paymentDate && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500">تاريخ الدفع</p>
                                <p className="font-medium">{new Date(claim.payment.paymentDate).toLocaleDateString('ar-SA')}</p>
                              </div>
                            )}
                            {claim.payment.paymentReference && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500">رقم المرجع</p>
                                <p className="font-medium">{claim.payment.paymentReference}</p>
                              </div>
                            )}
                          </div>
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
            <DialogTitle>اعتماد المطالبة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-700">المبلغ المطلوب:</p>
              <p className="text-xl font-bold text-emerald-800">{claim?.totals.grandTotal.toLocaleString('ar-SA')} ر.س</p>
            </div>
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
              <CheckCircle className="w-4 h-4 ml-2" />
              اعتماد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رفض المطالبة</DialogTitle>
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
              <XCircle className="w-4 h-4 ml-2" />
              رفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>طلب تعديلات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>التعديلات المطلوبة <span className="text-red-500">*</span></Label>
              <Textarea
                value={changesRequested}
                onChange={(e) => setChangesRequested(e.target.value)}
                placeholder="اذكر التعديلات المطلوبة..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangesDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!changesRequested || changesMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 rounded-xl"
            >
              <FileText className="w-4 h-4 ml-2" />
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>معالجة الدفع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">المبلغ المعتمد:</p>
              <p className="text-xl font-bold text-blue-800">{(claim?.totals.approvedAmount || claim?.totals.grandTotal)?.toLocaleString('ar-SA')} ر.س</p>
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
            {paymentMethod === 'bank_transfer' && (
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
            <div className="space-y-2">
              <Label>رقم المرجع (اختياري)</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="رقم التحويل أو الإيصال"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={paymentMutation.isPending || (paymentMethod === 'bank_transfer' && (!bankName || !iban))}
              className="bg-blue-500 hover:bg-blue-600 rounded-xl"
            >
              <Banknote className="w-4 h-4 ml-2" />
              تنفيذ الدفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
