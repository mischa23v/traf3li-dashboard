import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  usePromotion,
  useApplyPromotion,
  useApprovePromotion,
  useRejectPromotion,
  useCancelPromotion,
  useDeletePromotion,
} from '@/hooks/useEmployeePromotion'
import {
  Search,
  Bell,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  DollarSign,
  Briefcase,
  Building2,
  FileText,
  Clock,
  User,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { promotionStatusLabels } from '@/services/employeePromotionService'
import type { PromotionStatus } from '@/services/employeePromotionService'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function PromotionDetailsView() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { promotionId: string }
  const promotionId = params.promotionId

  const { data: promotion, isLoading, isError, error } = usePromotion(promotionId)
  const applyPromotionMutation = useApplyPromotion()
  const approvePromotionMutation = useApprovePromotion()
  const rejectPromotionMutation = useRejectPromotion()
  const cancelPromotionMutation = useCancelPromotion()
  const deletePromotionMutation = useDeletePromotion()

  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectComments, setRejectComments] = useState('')

  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'غير محدد'
    const date = new Date(dateString)
    return format(date, 'd MMMM yyyy', { locale: arSA })
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate salary increase
  const calculateIncrease = () => {
    if (!promotion) return null
    const increase = promotion.newSalary - promotion.previousSalary
    const percentage = ((increase / promotion.previousSalary) * 100).toFixed(1)
    return { increase, percentage }
  }

  const salaryIncrease = calculateIncrease()

  // Handle actions
  const handleApplyPromotion = () => {
    if (confirm('هل أنت متأكد من تطبيق هذه الترقية؟ سيتم تحديث بيانات الموظف.')) {
      applyPromotionMutation.mutate(promotionId)
    }
  }

  const handleApprove = () => {
    const currentStep = promotion?.approvalWorkflow.find((step) => step.status === 'pending')
    if (currentStep) {
      approvePromotionMutation.mutate(
        {
          id: promotionId,
          stepNumber: currentStep.stepNumber,
          comments: approvalComments,
        },
        {
          onSuccess: () => {
            setShowApprovalDialog(false)
            setApprovalComments('')
          },
        }
      )
    }
  }

  const handleReject = () => {
    const currentStep = promotion?.approvalWorkflow.find((step) => step.status === 'pending')
    if (currentStep && rejectComments) {
      rejectPromotionMutation.mutate(
        {
          id: promotionId,
          stepNumber: currentStep.stepNumber,
          comments: rejectComments,
        },
        {
          onSuccess: () => {
            setShowRejectDialog(false)
            setRejectComments('')
          },
        }
      )
    }
  }

  const handleCancel = () => {
    const reason = prompt('يرجى إدخال سبب الإلغاء:')
    if (reason) {
      cancelPromotionMutation.mutate({ id: promotionId, reason })
    }
  }

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه الترقية؟')) {
      deletePromotionMutation.mutate(promotionId, {
        onSuccess: () => {
          navigate({ to: ROUTES.dashboard.hr.promotions.list })
        },
      })
    }
  }

  // Status badge
  const getStatusBadge = (status: PromotionStatus) => {
    const styles: Record<PromotionStatus, { bg: string; icon: any }> = {
      draft: { bg: 'bg-slate-100 text-slate-700', icon: Edit3 },
      pending_approval: { bg: 'bg-amber-100 text-amber-700', icon: Clock },
      approved: { bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100 text-red-700', icon: XCircle },
      cancelled: { bg: 'bg-slate-100 text-slate-700', icon: XCircle },
    }

    const config = styles[status]
    const Icon = config.icon
    const label = promotionStatusLabels[status]

    return (
      <Badge className={`${config.bg} border-0 rounded-md px-3 py-1 flex items-center gap-2`}>
        <Icon className="h-4 w-4" />
        {label.ar} / {label.en}
      </Badge>
    )
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الترقيات', href: ROUTES.dashboard.hr.promotions.list, isActive: true },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>
      </div>
    )
  }

  if (isError || !promotion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">خطأ في تحميل البيانات</h2>
          <p className="text-slate-600">{error?.message || 'تعذر تحميل بيانات الترقية'}</p>
          <Button onClick={() => navigate({ to: ROUTES.dashboard.hr.promotions.list })}>
            العودة للقائمة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate({ to: ROUTES.dashboard.hr.promotions.list })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          العودة للترقيات
        </Button>

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Award className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-navy mb-2">
                  {promotion.employeeNameAr || promotion.employeeName}
                </h1>
                <p className="text-slate-600">
                  {promotion.promotionId} • {formatDate(promotion.promotionDate)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {getStatusBadge(promotion.status)}
                  {promotion.applied && (
                    <Badge className="bg-blue-100 text-blue-700 border-0">مطبقة</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {promotion.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate({
                      to: ROUTES.dashboard.hr.promotions.edit(promotionId),
                      params: { promotionId },
                    })
                  }
                >
                  <Edit3 className="h-4 w-4 ms-2" />
                  تعديل
                </Button>
              )}
              {promotion.status === 'approved' && !promotion.applied && (
                <Button size="sm" onClick={handleApplyPromotion} className="bg-emerald-500">
                  <CheckCircle className="h-4 w-4 ms-2" />
                  تطبيق الترقية
                </Button>
              )}
              {promotion.status === 'draft' && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 ms-2" />
                  حذف
                </Button>
              )}
            </div>
          </div>

          {/* Salary Increase Highlight */}
          {salaryIncrease && (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">الراتب السابق</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {formatCurrency(promotion.previousSalary)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">الراتب الجديد</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(promotion.newSalary)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">الزيادة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    +{formatCurrency(salaryIncrease.increase)}
                  </p>
                  <p className="text-sm text-blue-500">(+{salaryIncrease.percentage}%)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Position Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  تفاصيل الترقية / Promotion Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  {/* Previous Position */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-600 border-b pb-2">الوظيفة السابقة</h4>
                    <div>
                      <p className="text-sm text-slate-500">المسمى الوظيفي</p>
                      <p className="font-medium text-navy">
                        {promotion.previousDesignationAr || promotion.previousDesignation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">القسم</p>
                      <p className="font-medium text-navy">
                        {promotion.previousDepartmentNameAr ||
                          promotion.previousDepartmentName ||
                          'غير محدد'}
                      </p>
                    </div>
                    {promotion.previousGrade && (
                      <div>
                        <p className="text-sm text-slate-500">الدرجة</p>
                        <p className="font-medium text-navy">{promotion.previousGrade}</p>
                      </div>
                    )}
                  </div>

                  {/* New Position */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-emerald-600 border-b pb-2">الوظيفة الجديدة</h4>
                    <div>
                      <p className="text-sm text-slate-500">المسمى الوظيفي</p>
                      <p className="font-medium text-navy">
                        {promotion.newDesignationAr || promotion.newDesignation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">القسم</p>
                      <p className="font-medium text-navy">
                        {promotion.newDepartmentNameAr || promotion.newDepartmentName || 'غير محدد'}
                      </p>
                    </div>
                    {promotion.newGrade && (
                      <div>
                        <p className="text-sm text-slate-500">الدرجة</p>
                        <p className="font-medium text-navy">{promotion.newGrade}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reason & Justification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  السبب والمبرر / Reason & Justification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">سبب الترقية</p>
                  <p className="text-navy">{promotion.reasonAr || promotion.reason}</p>
                </div>
                {promotion.justification && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">المبرر التفصيلي</p>
                    <p className="text-navy">
                      {promotion.justificationAr || promotion.justification}
                    </p>
                  </div>
                )}
                {promotion.performanceRating && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">تقييم الأداء</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Award
                            key={i}
                            className={`h-5 w-5 ${
                              i < promotion.performanceRating!
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-navy">
                        {promotion.performanceRating}/5
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Workflow */}
            {promotion.approvalWorkflow && promotion.approvalWorkflow.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    سير الموافقات / Approval Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {promotion.approvalWorkflow.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="flex items-start gap-4 p-4 rounded-lg bg-slate-50"
                      >
                        <div className="flex-shrink-0">
                          {step.status === 'approved' && (
                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                          )}
                          {step.status === 'rejected' && (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                          {step.status === 'pending' && (
                            <Clock className="h-6 w-6 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-navy">
                            {step.approverRoleAr || step.approverRole}
                          </p>
                          {step.approverName && (
                            <p className="text-sm text-slate-600">{step.approverName}</p>
                          )}
                          {step.actionDate && (
                            <p className="text-sm text-slate-500">{formatDate(step.actionDate)}</p>
                          )}
                          {step.comments && (
                            <p className="text-sm text-slate-600 mt-2">{step.comments}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dates Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  التواريخ / Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">تاريخ الترقية</p>
                  <p className="font-medium text-navy">{formatDate(promotion.promotionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">تاريخ السريان</p>
                  <p className="font-medium text-navy">{formatDate(promotion.effectiveDate)}</p>
                </div>
                {promotion.appliedAt && (
                  <div>
                    <p className="text-sm text-slate-500">تاريخ التطبيق</p>
                    <p className="font-medium text-navy">{formatDate(promotion.appliedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employee Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  الموظف / Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.dashboard.hr.employees.detail(promotion.employeeId)}>
                  <Button variant="outline" className="w-full">
                    عرض ملف الموظف
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Compliance Note */}
            {promotion.compliance && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <AlertCircle className="h-5 w-5" />
                    الامتثال القانوني
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  {promotion.compliance.saudiLaborLawCompliant && (
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      متوافق مع نظام العمل السعودي
                    </p>
                  )}
                  {promotion.compliance.violations &&
                    promotion.compliance.violations.length > 0 && (
                      <div>
                        <p className="font-bold mb-1">ملاحظات:</p>
                        <ul className="list-disc list-inside">
                          {promotion.compliance.violations.map((violation, index) => (
                            <li key={index}>{violation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
