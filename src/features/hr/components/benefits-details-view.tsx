import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  useBenefit,
  useDeleteBenefit,
  useActivateBenefit,
  useSuspendBenefit,
  useTerminateBenefit,
} from '@/hooks/useBenefits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search, Bell, ArrowRight, User, Calendar,
  CheckCircle, XCircle, AlertCircle, Loader2, Heart,
  Shield, Wallet, Home, Car, DollarSign, Building2,
  Users, Trash2, Edit, MoreHorizontal, Play, Pause,
  UserPlus, FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BENEFIT_TYPE_LABELS,
  BENEFIT_STATUS_LABELS,
  BENEFIT_CATEGORY_LABELS,
  ENROLLMENT_TYPE_LABELS,
  COVERAGE_LEVEL_LABELS,
  type BenefitStatus,
} from '@/services/benefitsService'

export function BenefitsDetailsView() {
  const navigate = useNavigate()
  const { benefitId } = useParams({ strict: false })

  const { data: benefit, isLoading, error } = useBenefit(benefitId || '')
  const deleteMutation = useDeleteBenefit()
  const activateMutation = useActivateBenefit()
  const suspendMutation = useSuspendBenefit()
  const terminateMutation = useTerminateBenefit()

  // Dialog states
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)

  // Form states
  const [suspendReason, setSuspendReason] = useState('')
  const [terminateReason, setTerminateReason] = useState('')
  const [terminationDate, setTerminationDate] = useState('')

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'المزايا', href: '/dashboard/hr/benefits', isActive: true },
  ]

  const getStatusColor = (status: BenefitStatus) => {
    const colors: Record<BenefitStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      suspended: 'bg-amber-100 text-amber-700 border-amber-200',
      terminated: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const handleActivate = async () => {
    if (!benefitId) return
    await activateMutation.mutateAsync({ benefitId })
  }

  const handleSuspend = async () => {
    if (!benefitId || !suspendReason) return
    await suspendMutation.mutateAsync({
      benefitId,
      data: { reason: suspendReason },
    })
    setShowSuspendDialog(false)
    setSuspendReason('')
  }

  const handleTerminate = async () => {
    if (!benefitId || !terminateReason) return
    await terminateMutation.mutateAsync({
      benefitId,
      data: { reason: terminateReason, terminationDate: terminationDate || undefined },
    })
    setShowTerminateDialog(false)
    setTerminateReason('')
    setTerminationDate('')
  }

  const handleDelete = async () => {
    if (!benefitId) return
    if (confirm('هل أنت متأكد من حذف هذه الميزة؟')) {
      await deleteMutation.mutateAsync(benefitId)
      navigate({ to: '/dashboard/hr/benefits' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error || !benefit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600">حدث خطأ في تحميل بيانات الميزة</p>
        <Button
          onClick={() => navigate({ to: '/dashboard/hr/benefits' })}
          className="mt-4"
        >
          العودة للقائمة
        </Button>
      </div>
    )
  }

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
          badge="الموارد البشرية"
          title="تفاصيل الميزة"
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
                  onClick={() => navigate({ to: '/dashboard/hr/benefits' })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-navy">
                      {benefit.benefitNameAr || benefit.benefitName}
                    </h1>
                    <Badge className={getStatusColor(benefit.status)}>
                      {BENEFIT_STATUS_LABELS[benefit.status]?.ar}
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    {benefit.enrollmentNumber} - {benefit.employeeNameAr || benefit.employeeName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/benefits/new?editId=${benefit._id}` })}>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Action Buttons based on Status */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {benefit.status === 'pending' && (
                    <Button
                      onClick={handleActivate}
                      disabled={activateMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 ml-2" />
                      {activateMutation.isPending ? 'جاري التفعيل...' : 'تفعيل الميزة'}
                    </Button>
                  )}

                  {benefit.status === 'active' && (
                    <>
                      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="rounded-xl">
                            <Pause className="w-4 h-4 ml-2" />
                            إيقاف مؤقت
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>إيقاف الميزة مؤقتاً</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>سبب الإيقاف <span className="text-red-500">*</span></Label>
                              <Textarea
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                                placeholder="يرجى توضيح سبب الإيقاف..."
                                className="rounded-xl"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowSuspendDialog(false)} className="rounded-xl">
                                إلغاء
                              </Button>
                              <Button
                                onClick={handleSuspend}
                                disabled={!suspendReason || suspendMutation.isPending}
                                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                              >
                                {suspendMutation.isPending ? 'جاري الإيقاف...' : 'إيقاف'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="rounded-xl">
                            <XCircle className="w-4 h-4 ml-2" />
                            إنهاء
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>إنهاء الميزة</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>سبب الإنهاء <span className="text-red-500">*</span></Label>
                              <Textarea
                                value={terminateReason}
                                onChange={(e) => setTerminateReason(e.target.value)}
                                placeholder="يرجى توضيح سبب الإنهاء..."
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>تاريخ الإنهاء</Label>
                              <Input
                                type="date"
                                value={terminationDate}
                                onChange={(e) => setTerminationDate(e.target.value)}
                                className="rounded-xl"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowTerminateDialog(false)} className="rounded-xl">
                                إلغاء
                              </Button>
                              <Button
                                onClick={handleTerminate}
                                disabled={!terminateReason || terminateMutation.isPending}
                                variant="destructive"
                                className="rounded-xl"
                              >
                                {terminateMutation.isPending ? 'جاري الإنهاء...' : 'إنهاء'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {benefit.status === 'suspended' && (
                    <Button
                      onClick={handleActivate}
                      disabled={activateMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 ml-2" />
                      {activateMutation.isPending ? 'جاري إعادة التفعيل...' : 'إعادة التفعيل'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                <TabsTrigger value="coverage" className="rounded-lg">التغطية</TabsTrigger>
                <TabsTrigger value="costs" className="rounded-lg">التكاليف</TabsTrigger>
                <TabsTrigger value="dependents" className="rounded-lg">المعالين</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Benefit Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-emerald-500" />
                      معلومات الميزة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">نوع الميزة</p>
                        <Badge className="bg-blue-100 text-blue-700">
                          {BENEFIT_TYPE_LABELS[benefit.benefitType]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">التصنيف</p>
                        <Badge className={`bg-${BENEFIT_CATEGORY_LABELS[benefit.benefitCategory]?.color}-100 text-${BENEFIT_CATEGORY_LABELS[benefit.benefitCategory]?.color}-700`}>
                          {BENEFIT_CATEGORY_LABELS[benefit.benefitCategory]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">نوع التسجيل</p>
                        <p className="font-medium text-navy">{ENROLLMENT_TYPE_LABELS[benefit.enrollmentType]?.ar}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">مستوى التغطية</p>
                        <p className="font-medium text-navy">
                          {benefit.coverageLevel ? COVERAGE_LEVEL_LABELS[benefit.coverageLevel]?.ar : '-'}
                        </p>
                      </div>
                    </div>

                    {benefit.benefitDescription && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">الوصف</p>
                        <p className="text-slate-700">{benefit.benefitDescriptionAr || benefit.benefitDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Employee Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" />
                      بيانات الموظف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">اسم الموظف</p>
                        <p className="font-medium text-navy">{benefit.employeeNameAr || benefit.employeeName}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">رقم الموظف</p>
                        <p className="font-medium text-navy">{benefit.employeeNumber}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">القسم</p>
                        <p className="font-medium text-navy">{benefit.department || '-'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">رقم التسجيل</p>
                        <p className="font-medium text-navy">{benefit.enrollmentNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                      التواريخ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ التسجيل</p>
                        <p className="font-medium text-navy">{new Date(benefit.enrollmentDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ السريان</p>
                        <p className="font-medium text-navy">{new Date(benefit.effectiveDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                      {benefit.coverageEndDate && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">تاريخ انتهاء التغطية</p>
                          <p className="font-medium text-navy">{new Date(benefit.coverageEndDate).toLocaleDateString('ar-SA')}</p>
                        </div>
                      )}
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ آخر تحديث للحالة</p>
                        <p className="font-medium text-navy">{new Date(benefit.statusDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider */}
                {benefit.providerName && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                        مقدم الخدمة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">اسم مقدم الخدمة</p>
                          <p className="font-medium text-navy">{benefit.providerNameAr || benefit.providerName}</p>
                        </div>
                        {benefit.providerContact?.email && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">البريد الإلكتروني</p>
                            <p className="font-medium text-navy">{benefit.providerContact.email}</p>
                          </div>
                        )}
                        {benefit.providerContact?.phone && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">رقم الهاتف</p>
                            <p className="font-medium text-navy">{benefit.providerContact.phone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Coverage Tab */}
              <TabsContent value="coverage" className="space-y-6">
                {/* Health Insurance Details */}
                {benefit.healthInsurance && (
                  <Card className="rounded-2xl border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-blue-600" />
                        تفاصيل التأمين الصحي
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-blue-600 mb-1">شركة التأمين</p>
                          <p className="font-medium text-blue-700">{benefit.healthInsurance.insuranceProvider}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-blue-600 mb-1">رقم البوليصة</p>
                          <p className="font-medium text-blue-700">{benefit.healthInsurance.policyNumber}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-blue-600 mb-1">رقم العضوية</p>
                          <p className="font-medium text-blue-700">{benefit.healthInsurance.memberNumber}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-blue-600 mb-1">نوع الخطة</p>
                          <Badge className="bg-blue-100 text-blue-700">
                            {benefit.healthInsurance.planType === 'basic' ? 'أساسي' :
                              benefit.healthInsurance.planType === 'standard' ? 'قياسي' :
                                benefit.healthInsurance.planType === 'premium' ? 'ممتاز' : 'تنفيذي'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-blue-600 mb-2">تغطية داخلية</p>
                          <Badge className={benefit.healthInsurance.inpatientCoverage ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.healthInsurance.inpatientCoverage ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-blue-600 mb-2">تغطية خارجية</p>
                          <Badge className={benefit.healthInsurance.outpatientCoverage ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.healthInsurance.outpatientCoverage ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-blue-600 mb-2">تغطية أسنان</p>
                          <Badge className={benefit.healthInsurance.dentalCoverage ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.healthInsurance.dentalCoverage ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-blue-600 mb-2">تغطية أمومة</p>
                          <Badge className={benefit.healthInsurance.maternityCoverage ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.healthInsurance.maternityCoverage ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                      </div>

                      {benefit.healthInsurance.annualMaximum && (
                        <div className="mt-4 p-4 bg-white rounded-xl">
                          <p className="text-xs text-blue-600 mb-1">الحد الأقصى السنوي</p>
                          <p className="text-xl font-bold text-blue-700">{benefit.healthInsurance.annualMaximum.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Life Insurance Details */}
                {benefit.lifeInsurance && (
                  <Card className="rounded-2xl border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        تفاصيل التأمين على الحياة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-purple-600 mb-1">مبلغ التغطية</p>
                          <p className="text-xl font-bold text-purple-700">{benefit.lifeInsurance.coverageAmount.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-purple-600 mb-1">نوع التغطية</p>
                          <Badge className="bg-purple-100 text-purple-700">
                            {benefit.lifeInsurance.coverageType === 'term' ? 'محدد المدة' :
                              benefit.lifeInsurance.coverageType === 'whole_life' ? 'مدى الحياة' : 'جماعي'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-purple-600 mb-2">وفاة عرضية</p>
                          <Badge className={benefit.lifeInsurance.accidentalDeath ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.lifeInsurance.accidentalDeath ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-purple-600 mb-2">أمراض خطيرة</p>
                          <Badge className={benefit.lifeInsurance.criticalIllness ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.lifeInsurance.criticalIllness ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Allowance Details */}
                {benefit.allowance && (
                  <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                        تفاصيل البدل
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-emerald-600 mb-1">قيمة البدل</p>
                          <p className="text-xl font-bold text-emerald-700">{benefit.allowance.allowanceAmount.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-emerald-600 mb-1">طريقة الحساب</p>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {benefit.allowance.calculationType === 'fixed' ? 'ثابت' :
                              benefit.allowance.calculationType === 'percentage_of_salary' ? 'نسبة من الراتب' :
                                benefit.allowance.calculationType === 'tiered' ? 'متدرج' : 'استرداد'}
                          </Badge>
                        </div>
                        {benefit.allowance.annualLimit && (
                          <div className="p-4 bg-white rounded-xl">
                            <p className="text-xs text-emerald-600 mb-1">الحد السنوي</p>
                            <p className="font-medium text-emerald-700">{benefit.allowance.annualLimit.toLocaleString('ar-SA')} ر.س</p>
                          </div>
                        )}
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-emerald-600 mb-1">المستخدم حتى الآن</p>
                          <p className="font-medium text-emerald-700">{benefit.allowance.usedToDate.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-emerald-600 mb-2">خاضع للضريبة</p>
                          <Badge className={benefit.allowance.taxable ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
                            {benefit.allowance.taxable ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-emerald-600 mb-2">مشمول في GOSI</p>
                          <Badge className={benefit.allowance.includedInGOSI ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.allowance.includedInGOSI ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl text-center">
                          <p className="text-xs text-emerald-600 mb-2">مشمول في EOSB</p>
                          <Badge className={benefit.allowance.includedInEOSB ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}>
                            {benefit.allowance.includedInEOSB ? 'نعم' : 'لا'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Costs Tab */}
              <TabsContent value="costs" className="space-y-6">
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      تفاصيل التكاليف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl text-center">
                        <p className="text-xs text-emerald-600 mb-1">تكلفة صاحب العمل</p>
                        <p className="text-2xl font-bold text-emerald-700">
                          {benefit.employerCost.toLocaleString('ar-SA')} {benefit.currency}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-xs text-blue-600 mb-1">تكلفة الموظف</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {benefit.employeeCost.toLocaleString('ar-SA')} {benefit.currency}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl text-center">
                        <p className="text-xs text-purple-600 mb-1">إجمالي التكلفة</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {(benefit.totalCost || benefit.employerCost + benefit.employeeCost).toLocaleString('ar-SA')} {benefit.currency}
                        </p>
                      </div>
                    </div>

                    {benefit.costBreakdown && (
                      <div className="mt-6 space-y-4">
                        <h4 className="font-medium text-slate-800">تفصيل التكاليف</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الخصم الشهري للموظف</p>
                            <p className="font-medium text-navy">
                              {benefit.costBreakdown.employeeCost.monthlyDeduction.toLocaleString('ar-SA')} {benefit.currency}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">التكلفة الشهرية لصاحب العمل</p>
                            <p className="font-medium text-navy">
                              {benefit.costBreakdown.employerCost.monthlyCost.toLocaleString('ar-SA')} {benefit.currency}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">إجمالي الخصومات حتى الآن</p>
                            <p className="font-medium text-navy">
                              {benefit.costBreakdown.employeeCost.ytdDeductions.toLocaleString('ar-SA')} {benefit.currency}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">نسبة مساهمة صاحب العمل</p>
                            <p className="font-medium text-navy">{benefit.costBreakdown.employerSharePercentage}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dependents Tab */}
              <TabsContent value="dependents" className="space-y-6">
                {benefit.coveredDependents && benefit.coveredDependents.length > 0 ? (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        المعالين المشمولين
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {benefit.coveredDependents.map((dependent) => (
                          <div key={dependent.memberId} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium text-navy">{dependent.nameAr || dependent.name}</p>
                                <p className="text-sm text-slate-500">
                                  {dependent.relationship === 'spouse' ? 'زوج/ة' :
                                    dependent.relationship === 'child' ? 'ابن/ابنة' :
                                      dependent.relationship === 'parent' ? 'والد/ة' : 'آخر'} - عمر: {dependent.age} سنة
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={dependent.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                {dependent.active ? 'نشط' : 'غير نشط'}
                              </Badge>
                              <Badge className={dependent.documentsVerified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                                {dependent.documentsVerified ? 'موثق' : 'غير موثق'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">لا يوجد معالين مشمولين</p>
                    </CardContent>
                  </Card>
                )}

                {/* Beneficiaries */}
                {benefit.beneficiaries && benefit.beneficiaries.length > 0 && (
                  <Card className="rounded-2xl border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-purple-600" />
                        المستفيدون (للتأمين على الحياة)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {benefit.beneficiaries.map((beneficiary) => (
                          <div key={beneficiary.beneficiaryId} className="p-4 bg-white rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center font-bold text-purple-700">
                                {beneficiary.designation}
                              </div>
                              <div>
                                <p className="font-medium text-purple-800">{beneficiary.nameAr || beneficiary.name}</p>
                                <p className="text-sm text-purple-600">{beneficiary.relationship}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={beneficiary.beneficiaryType === 'primary' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}>
                                {beneficiary.beneficiaryType === 'primary' ? 'أساسي' : 'بديل'}
                              </Badge>
                              <span className="text-lg font-bold text-purple-700">{beneficiary.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
