import { HRSidebar } from './hr-sidebar'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import {
  useCompensationRecord,
  useDeleteCompensation,
  useSubmitForReview,
  useApproveReview,
} from '@/hooks/useCompensation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search, Bell, ArrowRight, User, Calendar,
  AlertCircle, Loader2, DollarSign, Wallet,
  Trash2, Edit, MoreHorizontal, Receipt,
  TrendingUp, TrendingDown, CheckCircle, Clock, Shield,
  Briefcase, Award, Scale, BarChart3, Send, ThumbsUp,
  Building2, Percent, FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  compensationStatusLabels,
  paymentFrequencyLabels,
  salaryBasisLabels,
  paymentMethodLabels,
  allowanceTypeLabels,
  calculationTypeLabels,
  bonusTypeLabels,
  reviewStatusLabels,
  compaRatioCategoryLabels,
  compensationModelLabels,
  partnershipTierLabels,
  employmentTypeLabels,
  CompensationStatus,
  CompaRatioCategory,
  ReviewStatus,
} from '@/services/compensationService'

export function CompensationDetailsView() {
  const navigate = useNavigate()
  const { compensationId } = useParams({ strict: false })

  const { data: record, isLoading, error } = useCompensationRecord(compensationId || '')
  const deleteMutation = useDeleteCompensation()
  const submitMutation = useSubmitForReview()
  const approveMutation = useApproveReview()

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'التعويضات', href: ROUTES.dashboard.hr.compensation.list, isActive: true },
  ]

  const getStatusColor = (status: CompensationStatus) => {
    const colors: Record<CompensationStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      historical: 'bg-slate-100 text-slate-700 border-slate-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const getCompaRatioColor = (category?: CompaRatioCategory) => {
    if (!category) return 'bg-slate-100 text-slate-700'
    const colors: Record<CompaRatioCategory, string> = {
      below_range: 'bg-red-100 text-red-700',
      in_range_low: 'bg-amber-100 text-amber-700',
      in_range_mid: 'bg-emerald-100 text-emerald-700',
      in_range_high: 'bg-blue-100 text-blue-700',
      above_range: 'bg-purple-100 text-purple-700',
    }
    return colors[category]
  }

  const getReviewStatusColor = (status: ReviewStatus) => {
    const colors: Record<ReviewStatus, string> = {
      not_started: 'bg-slate-100 text-slate-700',
      in_progress: 'bg-blue-100 text-blue-700',
      pending_approval: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      implemented: 'bg-green-100 text-green-700',
      deferred: 'bg-purple-100 text-purple-700',
      declined: 'bg-red-100 text-red-700',
    }
    return colors[status]
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmitForReview = async () => {
    if (!compensationId) return
    await submitMutation.mutateAsync(compensationId)
  }

  const handleApprove = async () => {
    if (!compensationId || !record) return
    await approveMutation.mutateAsync({
      id: compensationId,
      data: {
        approvedIncrease: record.salaryReview?.recommendedIncrease || 0,
        approvedPercentage: record.salaryReview?.recommendedPercentage || 0,
        effectiveDate: new Date().toISOString(),
      }
    })
  }

  const handleDelete = async () => {
    if (!compensationId) return
    if (confirm('هل أنت متأكد من حذف سجل التعويضات هذا؟')) {
      await deleteMutation.mutateAsync(compensationId)
      navigate({ to: ROUTES.dashboard.hr.compensation.list })
    }
  }

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
          badge="الموارد البشرية"
          title="تفاصيل التعويضات"
          type="compensation"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Loading/Error States */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل البيانات...</p>
                </CardContent>
              </Card>
            ) : error || !record ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
                  <p className="text-red-600">حدث خطأ في تحميل بيانات التعويضات</p>
                  <Button
                    onClick={() => navigate({ to: ROUTES.dashboard.hr.compensation.list })}
                    className="mt-4"
                  >
                    العودة للقائمة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-white"
                      onClick={() => navigate({ to: ROUTES.dashboard.hr.compensation.list })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-navy">
                          {record.employeeNameAr || record.employeeName}
                        </h1>
                        <Badge className={getStatusColor(record.status)}>
                          {compensationStatusLabels[record.status]?.ar}
                        </Badge>
                      </div>
                      <p className="text-slate-500">
                        {record.recordNumber} - {record.jobTitleAr || record.jobTitle || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.salaryReview?.eligibleForReview && record.salaryReview?.reviewStatus === ReviewStatus.NOT_STARTED && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSubmitForReview}
                        disabled={submitMutation.isPending}
                        className="rounded-xl"
                      >
                        <Send className="w-4 h-4 ms-1" aria-hidden="true" />
                        تقديم للمراجعة
                      </Button>
                    )}
                    {record.salaryReview?.reviewStatus === ReviewStatus.PENDING_APPROVAL && (
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <ThumbsUp className="w-4 h-4 ms-1" />
                        اعتماد
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/compensation/new?editId=${compensationId}` })}>
                          <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                          <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Salary Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الراتب الأساسي</p>
                          <p className="text-lg font-bold text-navy">
                            {formatCurrency(record.basicSalary, record.currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <Receipt className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">إجمالي البدلات</p>
                          <p className="text-lg font-bold text-navy">
                            {formatCurrency(record.totalAllowances, record.currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Wallet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الراتب الإجمالي</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(record.grossSalary, record.currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Percent className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Compa-Ratio</p>
                          <p className={`text-lg font-bold ${
                            record.compaRatio < 0.8 ? 'text-red-600' :
                            record.compaRatio > 1.2 ? 'text-purple-600' : 'text-emerald-600'
                          }`}>
                            {(record.compaRatio * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-white rounded-xl p-1 border border-slate-200">
                    <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="allowances" className="rounded-lg">البدلات</TabsTrigger>
                    <TabsTrigger value="variable" className="rounded-lg">التعويضات المتغيرة</TabsTrigger>
                    <TabsTrigger value="analysis" className="rounded-lg">التحليل</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Employee Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          معلومات الموظف
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">رقم الموظف</p>
                            <p className="font-medium">{record.employeeNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">الاسم</p>
                            <p className="font-medium">{record.employeeNameAr || record.employeeName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">المسمى الوظيفي</p>
                            <p className="font-medium">{record.jobTitleAr || record.jobTitle || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">القسم</p>
                            <p className="font-medium">{record.department || '-'}</p>
                          </div>
                          {record.employeeDetails?.employmentType && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">نوع التوظيف</p>
                              <p className="font-medium">
                                {employmentTypeLabels[record.employeeDetails.employmentType]?.ar}
                              </p>
                            </div>
                          )}
                          {record.employeeDetails?.nationality && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">الجنسية</p>
                              <p className="font-medium">{record.employeeDetails.nationality}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pay Grade & Range */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-500" aria-hidden="true" />
                          الدرجة الوظيفية والنطاق
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">الدرجة</p>
                            <p className="text-xl font-bold text-navy">{record.payGrade}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">الحد الأدنى</p>
                            <p className="font-bold text-slate-700">
                              {formatCurrency(record.salaryRangeMin, record.currency)}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">نقطة المنتصف</p>
                            <p className="font-bold text-slate-700">
                              {record.salaryRangeMid ? formatCurrency(record.salaryRangeMid, record.currency) : '-'}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">الحد الأقصى</p>
                            <p className="font-bold text-slate-700">
                              {formatCurrency(record.salaryRangeMax, record.currency)}
                            </p>
                          </div>
                        </div>

                        {/* Range Visualization */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>{formatCurrency(record.salaryRangeMin, record.currency)}</span>
                            <div className="flex items-center gap-2">
                              <span>موقع الراتب:</span>
                              <Badge className={getCompaRatioColor(record.compaRatioCategory)}>
                                {compaRatioCategoryLabels[record.compaRatioCategory || CompaRatioCategory.IN_RANGE_MID]?.ar}
                              </Badge>
                            </div>
                            <span>{formatCurrency(record.salaryRangeMax, record.currency)}</span>
                          </div>
                          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                              style={{ width: `${Math.min((record.rangePenetration || 0) * 100, 100)}%` }}
                            />
                            <div
                              className="absolute w-5 h-5 bg-white border-2 border-emerald-500 rounded-full -top-0.5"
                              style={{ left: `calc(${Math.min(Math.max((record.rangePenetration || 0) * 100, 0), 100)}% - 10px)` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-indigo-500" />
                          تفاصيل الدفع
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {record.paymentFrequency && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تكرار الدفع</p>
                              <p className="font-medium">
                                {paymentFrequencyLabels[record.paymentFrequency]?.ar}
                              </p>
                            </div>
                          )}
                          {record.paymentMethod && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">طريقة الدفع</p>
                              <p className="font-medium">
                                {paymentMethodLabels[record.paymentMethod]?.ar}
                              </p>
                            </div>
                          )}
                          {record.salaryBasis && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">أساس الراتب</p>
                              <p className="font-medium">
                                {salaryBasisLabels[record.salaryBasis]?.ar}
                              </p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">العملة</p>
                            <p className="font-medium">{record.currency}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-500" aria-hidden="true" />
                          التواريخ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">تاريخ السريان</p>
                            <p className="font-medium">
                              {new Date(record.effectiveDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          {record.reviewDate && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ المراجعة</p>
                              <p className="font-medium">
                                {new Date(record.reviewDate).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          )}
                          {record.nextReviewDate && (
                            <div className="p-4 bg-amber-50 rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">المراجعة القادمة</p>
                              <p className="font-medium text-amber-700">
                                {new Date(record.nextReviewDate).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                            <p className="font-medium">
                              {new Date(record.updatedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Allowances Tab */}
                  <TabsContent value="allowances" className="space-y-6">
                    {/* Housing Allowance */}
                    {record.housingAllowance?.provided && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-500" aria-hidden="true" />
                            بدل السكن
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                              <p className="text-xs text-blue-600 mb-1">المبلغ</p>
                              <p className="text-xl font-bold text-blue-700">
                                {formatCurrency(record.housingAllowance.amount, record.currency)}
                              </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">طريقة الحساب</p>
                              <p className="font-medium">
                                {calculationTypeLabels[record.housingAllowance.calculationType]?.ar}
                              </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">يشمل GOSI</p>
                              <p className="font-medium">
                                {record.housingAllowance.includedInGOSI ? 'نعم' : 'لا'}
                              </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">يشمل EOSB</p>
                              <p className="font-medium">
                                {record.housingAllowance.includedInEOSB ? 'نعم' : 'لا'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Transportation Allowance */}
                    {record.transportationAllowance?.provided && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-amber-500" />
                            بدل المواصلات
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-amber-50 rounded-xl text-center">
                              <p className="text-xs text-amber-600 mb-1">المبلغ</p>
                              <p className="text-xl font-bold text-amber-700">
                                {formatCurrency(record.transportationAllowance.amount, record.currency)}
                              </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">طريقة الحساب</p>
                              <p className="font-medium">
                                {calculationTypeLabels[record.transportationAllowance.calculationType]?.ar}
                              </p>
                            </div>
                            {record.transportationAllowance.percentage && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">النسبة</p>
                                <p className="font-medium">{record.transportationAllowance.percentage}%</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Other Allowances */}
                    {record.allowances && record.allowances.length > 0 && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-green-500" />
                            بدلات إضافية
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {record.allowances.map((allowance, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                  <p className="font-medium">
                                    {allowance.allowanceNameAr || allowance.allowanceName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {allowanceTypeLabels[allowance.allowanceType]?.ar}
                                  </p>
                                </div>
                                <div className="text-start">
                                  <p className="font-bold text-navy">
                                    {formatCurrency(allowance.amount, record.currency)}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {allowance.taxable ? 'خاضع للضريبة' : 'معفى'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Allowances Summary */}
                    <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-emerald-50 to-green-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-emerald-600">إجمالي البدلات</p>
                            <p className="text-3xl font-bold text-emerald-700">
                              {formatCurrency(record.totalAllowances, record.currency)}
                            </p>
                          </div>
                          <div className="p-3 bg-emerald-100 rounded-xl">
                            <Receipt className="w-8 h-8 text-emerald-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Variable Compensation Tab */}
                  <TabsContent value="variable" className="space-y-6">
                    {record.variableCompensation?.eligibleForVariablePay ? (
                      <>
                        {/* Annual Bonus */}
                        {record.variableCompensation.annualBonus?.eligible && (
                          <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                المكافأة السنوية
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {record.variableCompensation.annualBonus.bonusType && (
                                  <div className="p-4 bg-amber-50 rounded-xl">
                                    <p className="text-xs text-amber-600 mb-1">نوع المكافأة</p>
                                    <p className="font-medium text-amber-700">
                                      {bonusTypeLabels[record.variableCompensation.annualBonus.bonusType]?.ar}
                                    </p>
                                  </div>
                                )}
                                {record.variableCompensation.annualBonus.targetPercentage !== undefined && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">النسبة المستهدفة</p>
                                    <p className="font-bold text-navy">
                                      {record.variableCompensation.annualBonus.targetPercentage}%
                                    </p>
                                  </div>
                                )}
                                {record.variableCompensation.annualBonus.targetAmount !== undefined && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">المبلغ المستهدف</p>
                                    <p className="font-bold text-navy">
                                      {formatCurrency(record.variableCompensation.annualBonus.targetAmount, record.currency)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Bonus History */}
                              {record.variableCompensation.annualBonus.bonusHistory && record.variableCompensation.annualBonus.bonusHistory.length > 0 && (
                                <div className="mt-6">
                                  <p className="text-sm font-medium text-slate-700 mb-3">سجل المكافآت</p>
                                  <div className="space-y-2">
                                    {record.variableCompensation.annualBonus.bonusHistory.map((bonus, index) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span className="font-medium">{bonus.year}</span>
                                        <div className="flex items-center gap-4">
                                          <span className="text-sm text-slate-500">
                                            مستهدف: {formatCurrency(bonus.targetBonus, record.currency)}
                                          </span>
                                          <span className="font-bold text-emerald-600">
                                            فعلي: {formatCurrency(bonus.actualBonus, record.currency)}
                                          </span>
                                          <Badge className={bonus.payoutPercentage >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                            {bonus.payoutPercentage}%
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Commission */}
                        {record.variableCompensation.commission?.eligible && (
                          <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-blue-500" />
                                العمولة
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {record.variableCompensation.commission.commissionRate !== undefined && (
                                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                                    <p className="text-xs text-blue-600 mb-1">نسبة العمولة</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                      {record.variableCompensation.commission.commissionRate}%
                                    </p>
                                  </div>
                                )}
                                {record.variableCompensation.commission.ytdCommission !== undefined && (
                                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 mb-1">العمولة حتى الآن</p>
                                    <p className="text-xl font-bold text-navy">
                                      {formatCurrency(record.variableCompensation.commission.ytdCommission, record.currency)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Attorney Compensation */}
                        {record.attorneyCompensation?.isAttorney && (
                          <Card className="rounded-2xl border-slate-100">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-indigo-500" />
                                تعويضات المحامي
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {record.attorneyCompensation.compensationModel && (
                                  <div className="p-4 bg-indigo-50 rounded-xl">
                                    <p className="text-xs text-indigo-600 mb-1">نموذج التعويض</p>
                                    <p className="font-medium text-indigo-700">
                                      {compensationModelLabels[record.attorneyCompensation.compensationModel]?.ar}
                                    </p>
                                  </div>
                                )}
                                {record.attorneyCompensation.partnershipTier && (
                                  <div className="p-4 bg-purple-50 rounded-xl">
                                    <p className="text-xs text-purple-600 mb-1">مستوى الشراكة</p>
                                    <p className="font-medium text-purple-700">
                                      {partnershipTierLabels[record.attorneyCompensation.partnershipTier]?.ar}
                                    </p>
                                  </div>
                                )}
                                {record.attorneyCompensation.equityPercentage !== undefined && record.attorneyCompensation.equityPercentage > 0 && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">نسبة الحصة</p>
                                    <p className="font-bold text-navy">{record.attorneyCompensation.equityPercentage}%</p>
                                  </div>
                                )}
                                {record.attorneyCompensation.billableHoursTarget !== undefined && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">ساعات العمل المستهدفة</p>
                                    <p className="font-bold text-navy">{record.attorneyCompensation.billableHoursTarget}</p>
                                  </div>
                                )}
                                {record.attorneyCompensation.ytdBillableHours !== undefined && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">الساعات حتى الآن</p>
                                    <p className="font-bold text-navy">{record.attorneyCompensation.ytdBillableHours}</p>
                                  </div>
                                )}
                                {record.attorneyCompensation.averageHourlyRate !== undefined && (
                                  <div className="p-4 bg-emerald-50 rounded-xl">
                                    <p className="text-xs text-emerald-600 mb-1">متوسط سعر الساعة</p>
                                    <p className="font-bold text-emerald-700">
                                      {formatCurrency(record.attorneyCompensation.averageHourlyRate, record.currency)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Award className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-500">الموظف غير مؤهل للتعويضات المتغيرة</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Analysis Tab */}
                  <TabsContent value="analysis" className="space-y-6">
                    {/* Salary Review */}
                    {record.salaryReview && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                            مراجعة الراتب
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">مؤهل للمراجعة</p>
                              <p className="font-medium">
                                {record.salaryReview.eligibleForReview ? 'نعم' : 'لا'}
                              </p>
                            </div>
                            {record.salaryReview.reviewStatus && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">حالة المراجعة</p>
                                <Badge className={getReviewStatusColor(record.salaryReview.reviewStatus)}>
                                  {reviewStatusLabels[record.salaryReview.reviewStatus]?.ar}
                                </Badge>
                              </div>
                            )}
                            {record.salaryReview.recommendedPercentage !== undefined && (
                              <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">النسبة الموصى بها</p>
                                <p className="font-bold text-emerald-700">{record.salaryReview.recommendedPercentage}%</p>
                              </div>
                            )}
                            {record.salaryReview.recommendedIncrease !== undefined && (
                              <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">الزيادة الموصى بها</p>
                                <p className="font-bold text-emerald-700">
                                  {formatCurrency(record.salaryReview.recommendedIncrease, record.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Deductions */}
                    {record.deductions && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-red-500" />
                            الاستقطاعات
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {record.deductions.gosiEmployeeContribution !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">مساهمة GOSI (موظف)</p>
                                <p className="font-bold text-navy">
                                  {formatCurrency(record.deductions.gosiEmployeeContribution, record.currency)}
                                </p>
                              </div>
                            )}
                            {record.deductions.gosiEmployerContribution !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">مساهمة GOSI (صاحب عمل)</p>
                                <p className="font-bold text-navy">
                                  {formatCurrency(record.deductions.gosiEmployerContribution, record.currency)}
                                </p>
                              </div>
                            )}
                            {record.deductions.totalDeductions !== undefined && (
                              <div className="p-4 bg-red-50 rounded-xl">
                                <p className="text-xs text-red-600 mb-1">إجمالي الاستقطاعات</p>
                                <p className="font-bold text-red-700">
                                  {formatCurrency(record.deductions.totalDeductions, record.currency)}
                                </p>
                              </div>
                            )}
                            {record.deductions.netPay !== undefined && (
                              <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">صافي الراتب</p>
                                <p className="font-bold text-emerald-700">
                                  {formatCurrency(record.deductions.netPay, record.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Compliance */}
                    {record.compliance && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            الامتثال
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                              {record.compliance.saudiLaborLawCompliant ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                              )}
                              <span className="text-sm">نظام العمل السعودي</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                              {record.compliance.minimumWageCompliant ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                              )}
                              <span className="text-sm">الحد الأدنى للأجور</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                              {record.compliance.eosbCompliant ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                              )}
                              <span className="text-sm">مستحقات نهاية الخدمة</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Total Rewards */}
                    {record.totalRewards && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                            إجمالي المكافآت
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                              <p className="text-xs text-blue-600 mb-1">التعويض النقدي</p>
                              <p className="text-xl font-bold text-blue-700">
                                {formatCurrency(record.totalRewards.totalCashCompensation, record.currency)}
                              </p>
                            </div>
                            {record.totalRewards.benefitsValue !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-xs text-slate-500 mb-1">قيمة المزايا</p>
                                <p className="text-xl font-bold text-navy">
                                  {formatCurrency(record.totalRewards.benefitsValue, record.currency)}
                                </p>
                              </div>
                            )}
                            {record.totalRewards.perksValue !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-xs text-slate-500 mb-1">قيمة الامتيازات</p>
                                <p className="text-xl font-bold text-navy">
                                  {formatCurrency(record.totalRewards.perksValue, record.currency)}
                                </p>
                              </div>
                            )}
                            {record.totalRewards.totalRewardsValue !== undefined && (
                              <div className="p-4 bg-purple-50 rounded-xl text-center">
                                <p className="text-xs text-purple-600 mb-1">إجمالي المكافآت</p>
                                <p className="text-xl font-bold text-purple-700">
                                  {formatCurrency(record.totalRewards.totalRewardsValue, record.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Salary History */}
                    {record.salaryHistory && record.salaryHistory.length > 0 && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
                            سجل الرواتب
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {record.salaryHistory.map((history, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${
                                    history.increasePercentage && history.increasePercentage > 0
                                      ? 'bg-emerald-100'
                                      : history.increasePercentage && history.increasePercentage < 0
                                        ? 'bg-red-100'
                                        : 'bg-slate-100'
                                  }`}>
                                    {history.increasePercentage && history.increasePercentage > 0 ? (
                                      <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                    ) : history.increasePercentage && history.increasePercentage < 0 ? (
                                      <TrendingDown className="w-4 h-4 text-red-600" />
                                    ) : (
                                      <DollarSign className="w-4 h-4 text-slate-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{history.changeReason || 'تغيير راتب'}</p>
                                    <p className="text-xs text-slate-500">
                                      {new Date(history.effectiveDate).toLocaleDateString('ar-SA')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-start">
                                  <p className="font-bold text-navy">
                                    {formatCurrency(history.grossSalary, record.currency)}
                                  </p>
                                  {history.increasePercentage !== undefined && (
                                    <p className={`text-xs ${
                                      history.increasePercentage > 0 ? 'text-emerald-600' :
                                      history.increasePercentage < 0 ? 'text-red-600' : 'text-slate-500'
                                    }`}>
                                      {history.increasePercentage > 0 ? '+' : ''}{history.increasePercentage}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Notes */}
                {record.notes?.compensationNotes && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" aria-hidden="true" />
                        ملاحظات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 p-4 bg-slate-50 rounded-xl">
                        {record.notes.compensationNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="compensation" />
        </div>
      </Main>
    </>
  )
}
