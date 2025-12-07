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
  useJobPosition,
  useDeleteJobPosition,
  useFreezeJobPosition,
  useUnfreezeJobPosition,
  useMarkPositionVacant,
  useCloneJobPosition,
} from '@/hooks/useJobPositions'
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
  CheckCircle, XCircle, AlertCircle, Loader2,
  Briefcase, Building2, Users, Network,
  Trash2, Edit, MoreHorizontal, Pause, Play,
  Copy, MapPin, Wallet, Target, TrendingUp,
  GraduationCap, FileText, Clock, UserCheck, UserX
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  JOB_LEVEL_LABELS,
  JOB_FAMILY_LABELS,
  POSITION_STATUS_LABELS,
  POSITION_TYPE_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  OCCUPATIONAL_CATEGORY_LABELS,
  WORK_ENVIRONMENT_LABELS,
  type PositionStatus,
} from '@/services/jobPositionsService'

export function JobPositionsDetailsView() {
  const navigate = useNavigate()
  const { positionId } = useParams({ strict: false })

  const { data: position, isLoading, error } = useJobPosition(positionId || '')
  const deleteMutation = useDeleteJobPosition()
  const freezeMutation = useFreezeJobPosition()
  const unfreezeMutation = useUnfreezeJobPosition()
  const markVacantMutation = useMarkPositionVacant()
  const cloneMutation = useCloneJobPosition()

  // Dialog states
  const [showFreezeDialog, setShowFreezeDialog] = useState(false)
  const [showVacantDialog, setShowVacantDialog] = useState(false)

  // Form states
  const [freezeReason, setFreezeReason] = useState('')
  const [freezeDate, setFreezeDate] = useState('')
  const [vacantReason, setVacantReason] = useState('')

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'المناصب الوظيفية', href: '/dashboard/hr/job-positions', isActive: true },
  ]

  const getStatusColor = (status: PositionStatus) => {
    const colors: Record<PositionStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      vacant: 'bg-amber-100 text-amber-700 border-amber-200',
      frozen: 'bg-blue-100 text-blue-700 border-blue-200',
      eliminated: 'bg-red-100 text-red-700 border-red-200',
      pending_approval: 'bg-purple-100 text-purple-700 border-purple-200',
      proposed: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return colors[status]
  }

  const handleFreeze = async () => {
    if (!positionId || !freezeReason) return
    await freezeMutation.mutateAsync({
      positionId,
      data: { reason: freezeReason, effectiveDate: freezeDate || undefined },
    })
    setShowFreezeDialog(false)
    setFreezeReason('')
    setFreezeDate('')
  }

  const handleUnfreeze = async () => {
    if (!positionId) return
    await unfreezeMutation.mutateAsync(positionId)
  }

  const handleMarkVacant = async () => {
    if (!positionId || !vacantReason) return
    await markVacantMutation.mutateAsync({
      positionId,
      data: { reason: vacantReason },
    })
    setShowVacantDialog(false)
    setVacantReason('')
  }

  const handleClone = async () => {
    if (!positionId) return
    await cloneMutation.mutateAsync({ positionId })
    navigate({ to: '/dashboard/hr/job-positions' })
  }

  const handleDelete = async () => {
    if (!positionId) return
    if (confirm('هل أنت متأكد من حذف هذا المنصب الوظيفي؟')) {
      await deleteMutation.mutateAsync(positionId)
      navigate({ to: '/dashboard/hr/job-positions' })
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
          badge="الموارد البشرية"
          title="تفاصيل المنصب الوظيفي"
          type="job-positions"
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
            ) : error || !position ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
                  <p className="text-red-600">حدث خطأ في تحميل بيانات المنصب</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/job-positions' })}
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
                      onClick={() => navigate({ to: '/dashboard/hr/job-positions' })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-navy">
                          {position.jobTitleAr || position.jobTitle}
                        </h1>
                        <Badge className={getStatusColor(position.status)}>
                          {POSITION_STATUS_LABELS[position.status]?.ar}
                        </Badge>
                        {position.filled ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <UserCheck className="w-3 h-3 ms-1" />
                            مشغول
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <UserX className="w-3 h-3 ms-1" />
                            شاغر
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500">
                        {position.positionNumber} - {JOB_FAMILY_LABELS[position.jobFamily]?.ar}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/job-positions/new?editId=${position._id}` })}>
                          <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClone}>
                          <Copy className="w-4 h-4 ms-2" />
                          نسخ المنصب
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

                {/* Action Buttons based on Status */}
                <Card className="rounded-2xl border-slate-100">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {position.status === 'frozen' && (
                        <Button
                          onClick={handleUnfreeze}
                          disabled={unfreezeMutation.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                        >
                          <Play className="w-4 h-4 ms-2" />
                          {unfreezeMutation.isPending ? 'جاري الإلغاء...' : 'إلغاء التجميد'}
                        </Button>
                      )}

                      {position.status === 'active' && (
                        <>
                          <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                                <Pause className="w-4 h-4 ms-2" />
                                تجميد
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تجميد المنصب الوظيفي</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>سبب التجميد <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    value={freezeReason}
                                    onChange={(e) => setFreezeReason(e.target.value)}
                                    placeholder="يرجى توضيح سبب التجميد..."
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>تاريخ السريان</Label>
                                  <Input
                                    type="date"
                                    value={freezeDate}
                                    onChange={(e) => setFreezeDate(e.target.value)}
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowFreezeDialog(false)} className="rounded-xl">
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={handleFreeze}
                                    disabled={!freezeReason || freezeMutation.isPending}
                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                  >
                                    {freezeMutation.isPending ? 'جاري التجميد...' : 'تجميد'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {position.filled && (
                            <Dialog open={showVacantDialog} onOpenChange={setShowVacantDialog}>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50">
                                  <UserX className="w-4 h-4 ms-2" />
                                  تحديد كشاغر
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تحديد المنصب كشاغر</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>سبب الشغور <span className="text-red-500">*</span></Label>
                                    <Textarea
                                      value={vacantReason}
                                      onChange={(e) => setVacantReason(e.target.value)}
                                      placeholder="يرجى توضيح سبب شغور المنصب..."
                                      className="rounded-xl"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowVacantDialog(false)} className="rounded-xl">
                                      إلغاء
                                    </Button>
                                    <Button
                                      onClick={handleMarkVacant}
                                      disabled={!vacantReason || markVacantMutation.isPending}
                                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                                    >
                                      {markVacantMutation.isPending ? 'جاري التحديث...' : 'تحديد كشاغر'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                    <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="description" className="rounded-lg">الوصف الوظيفي</TabsTrigger>
                    <TabsTrigger value="qualifications" className="rounded-lg">المؤهلات</TabsTrigger>
                    <TabsTrigger value="compensation" className="rounded-lg">التعويضات</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Basic Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          المعلومات الأساسية
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">رقم المنصب</p>
                            <p className="font-medium text-navy">{position.positionNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">العائلة الوظيفية</p>
                            <Badge className={`bg-${JOB_FAMILY_LABELS[position.jobFamily]?.color}-100 text-${JOB_FAMILY_LABELS[position.jobFamily]?.color}-700`}>
                              {JOB_FAMILY_LABELS[position.jobFamily]?.ar}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">المستوى الوظيفي</p>
                            <Badge className={`bg-${JOB_LEVEL_LABELS[position.jobLevel]?.color}-100 text-${JOB_LEVEL_LABELS[position.jobLevel]?.color}-700`}>
                              {JOB_LEVEL_LABELS[position.jobLevel]?.ar}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الدرجة</p>
                            <p className="font-medium text-navy">{position.jobGrade}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">نوع المنصب</p>
                            <p className="font-medium text-navy">{POSITION_TYPE_LABELS[position.positionType]?.ar}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">نوع التوظيف</p>
                            <p className="font-medium text-navy">{EMPLOYMENT_TYPE_LABELS[position.employmentType]?.ar}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الفئة المهنية</p>
                            <p className="font-medium text-navy">{OCCUPATIONAL_CATEGORY_LABELS[position.occupationalCategory]?.ar}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">نسبة التوظيف (FTE)</p>
                            <p className="font-medium text-navy">{position.fte}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Organization */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          الانتماء التنظيمي
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">القسم</p>
                            <p className="font-medium text-navy">{position.departmentNameAr || position.departmentName || '-'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">يرفع تقاريره إلى</p>
                            <p className="font-medium text-navy">{position.reportsToJobTitleAr || position.reportsToJobTitle || '-'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">تقارير مباشرة</p>
                            <p className="font-medium text-navy">{position.directReportsCount || 0}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">منصب إشرافي</p>
                            {position.supervisoryPosition ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Incumbent */}
                    {position.incumbent && (
                      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-600" />
                            شاغل المنصب الحالي
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-emerald-600 mb-1">اسم الموظف</p>
                              <p className="font-medium text-emerald-700">{position.incumbent.employeeNameAr || position.incumbent.employeeName}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-emerald-600 mb-1">رقم الموظف</p>
                              <p className="font-medium text-emerald-700">{position.incumbent.employeeNumber}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-emerald-600 mb-1">نوع التعيين</p>
                              <p className="font-medium text-emerald-700">
                                {position.incumbent.assignmentType === 'permanent' ? 'دائم' :
                                  position.incumbent.assignmentType === 'acting' ? 'بالإنابة' :
                                    position.incumbent.assignmentType === 'temporary' ? 'مؤقت' : 'تحت التجربة'}
                              </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-emerald-600 mb-1">تاريخ التعيين</p>
                              <p className="font-medium text-emerald-700">{new Date(position.incumbent.assignmentDate).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Location */}
                    {(position.location || position.city) && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                            الموقع
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(position.location || position.locationAr) && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الموقع</p>
                                <p className="font-medium text-navy">{position.locationAr || position.location}</p>
                              </div>
                            )}
                            {position.city && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المدينة</p>
                                <p className="font-medium text-navy">{position.city}</p>
                              </div>
                            )}
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">العمل عن بعد</p>
                              {position.remoteEligible ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            {position.workEnvironment && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">بيئة العمل</p>
                                <p className="font-medium text-navy">{WORK_ENVIRONMENT_LABELS[position.workEnvironment]?.ar}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Dates */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          التواريخ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {position.effectiveDate && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ السريان</p>
                              <p className="font-medium text-navy">{new Date(position.effectiveDate).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</p>
                            <p className="font-medium text-navy">{new Date(position.createdOn).toLocaleDateString('ar-SA')}</p>
                          </div>
                          {position.updatedOn && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                              <p className="font-medium text-navy">{new Date(position.updatedOn).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                          {position.vacantSince && (
                            <div className="p-4 bg-amber-50 rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">شاغر منذ</p>
                              <p className="font-medium text-amber-700">{new Date(position.vacantSince).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Description Tab */}
                  <TabsContent value="description" className="space-y-6">
                    {(position.jobSummary || position.jobSummaryAr) && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-500" />
                            ملخص الوظيفة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-slate-700 whitespace-pre-wrap">{position.jobSummaryAr || position.jobSummary}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {(position.jobPurpose || position.jobPurposeAr) && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-500" />
                            هدف الوظيفة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-slate-700 whitespace-pre-wrap">{position.jobPurposeAr || position.jobPurpose}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {position.keyResponsibilities && position.keyResponsibilities.length > 0 && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            المسؤوليات الرئيسية
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {position.keyResponsibilities.map((resp, idx) => (
                              <div key={resp.responsibilityId || idx} className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="font-medium text-navy">{resp.responsibilityAr || resp.responsibility}</p>
                                    {resp.category && (
                                      <Badge className={`mt-2 ${resp.category === 'primary' ? 'bg-emerald-100 text-emerald-700' :
                                          resp.category === 'secondary' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {resp.category === 'primary' ? 'أساسي' :
                                          resp.category === 'secondary' ? 'ثانوي' : 'عرضي'}
                                      </Badge>
                                    )}
                                  </div>
                                  {resp.essentialFunction && (
                                    <Badge className="bg-purple-100 text-purple-700">وظيفة أساسية</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Working Conditions */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-500" />
                          ظروف العمل
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">ساعات العمل</p>
                            <p className="font-medium text-navy">{position.standardHours || 40} ساعة/أسبوع</p>
                          </div>
                          {position.scheduleType && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">نوع الجدول</p>
                              <p className="font-medium text-navy">
                                {position.scheduleType === 'standard' ? 'قياسي' :
                                  position.scheduleType === 'flexible' ? 'مرن' :
                                    position.scheduleType === 'shift' ? 'نوبات' :
                                      position.scheduleType === 'compressed' ? 'مضغوط' : 'متغير'}
                              </p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-xs text-slate-500">عمل إضافي</span>
                            {position.overtimeExpected ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-xs text-slate-500">مناوبة</span>
                            {position.onCallRequired ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Qualifications Tab */}
                  <TabsContent value="qualifications" className="space-y-6">
                    {position.qualifications && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-emerald-500" />
                            المؤهلات المطلوبة
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الحد الأدنى للتعليم</p>
                              <p className="font-medium text-navy">
                                {position.qualifications.minimumEducation === 'high_school' ? 'ثانوية عامة' :
                                  position.qualifications.minimumEducation === 'diploma' ? 'دبلوم' :
                                    position.qualifications.minimumEducation === 'bachelors' ? 'بكالوريوس' :
                                      position.qualifications.minimumEducation === 'masters' ? 'ماجستير' :
                                        position.qualifications.minimumEducation === 'doctorate' ? 'دكتوراه' : 'مهني'}
                              </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">سنوات الخبرة المطلوبة</p>
                              <p className="font-medium text-navy">{position.qualifications.minimumYearsExperience} سنوات</p>
                            </div>
                            {position.qualifications.preferredYearsExperience && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">سنوات الخبرة المفضلة</p>
                                <p className="font-medium text-navy">{position.qualifications.preferredYearsExperience} سنوات</p>
                              </div>
                            )}
                          </div>

                          {position.qualifications.requiredSkills && position.qualifications.requiredSkills.length > 0 && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">المهارات المطلوبة</p>
                              <div className="flex flex-wrap gap-2">
                                {position.qualifications.requiredSkills.map((skill, idx) => (
                                  <Badge key={idx} className="bg-emerald-100 text-emerald-700">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {position.qualifications.preferredSkills && position.qualifications.preferredSkills.length > 0 && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">المهارات المفضلة</p>
                              <div className="flex flex-wrap gap-2">
                                {position.qualifications.preferredSkills.map((skill, idx) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-700">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {position.qualifications.requiredCertifications && position.qualifications.requiredCertifications.length > 0 && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">الشهادات المطلوبة</p>
                              <div className="flex flex-wrap gap-2">
                                {position.qualifications.requiredCertifications.map((cert, idx) => (
                                  <Badge key={idx} className="bg-purple-100 text-purple-700">{cert}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Saudization Requirements */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-500" />
                          متطلبات السعودة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-sm text-slate-700">للسعوديين فقط</span>
                            {position.saudiOnly ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-sm text-slate-700">يُفضل سعودي</span>
                            {position.saudiPreferred ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-sm text-slate-700">متوافق مع السعودة</span>
                            {position.saudizationCompliant ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Compensation Tab */}
                  <TabsContent value="compensation" className="space-y-6">
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-emerald-500" />
                          نطاق الراتب
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">درجة الراتب</p>
                            <p className="font-medium text-navy">{position.salaryGrade}</p>
                          </div>
                          {position.salaryRange && (
                            <>
                              <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">الحد الأدنى</p>
                                <p className="text-xl font-bold text-emerald-700">
                                  {position.salaryRange.minimum?.toLocaleString()} {position.salaryRange.currency}
                                </p>
                              </div>
                              <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-xs text-blue-600 mb-1">المنتصف</p>
                                <p className="text-xl font-bold text-blue-700">
                                  {position.salaryRange.midpoint?.toLocaleString()} {position.salaryRange.currency}
                                </p>
                              </div>
                              <div className="p-4 bg-purple-50 rounded-xl">
                                <p className="text-xs text-purple-600 mb-1">الحد الأقصى</p>
                                <p className="text-xl font-bold text-purple-700">
                                  {position.salaryRange.maximum?.toLocaleString()} {position.salaryRange.currency}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Budget Status */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          حالة الميزانية
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-sm text-slate-700">معتمد في الميزانية</span>
                            {position.budgeted ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          {position.fiscalYear && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">السنة المالية</p>
                              <p className="font-medium text-navy">{position.fiscalYear}</p>
                            </div>
                          )}
                          {position.costCenter && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">مركز التكلفة</p>
                              <p className="font-medium text-navy">{position.costCenter}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="job-positions" />
        </div>
      </Main>
    </>
  )
}
