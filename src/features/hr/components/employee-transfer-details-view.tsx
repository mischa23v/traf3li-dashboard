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
  useEmployeeTransfer,
  useDeleteEmployeeTransfer,
  useApproveTransfer,
  useRejectTransfer,
  useApplyTransfer,
  useUpdateHandoverItem,
  useNotifyEmployee,
} from '@/hooks/useEmployeeTransfer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Bell,
  ArrowRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  XCircle,
  CheckCheck,
  Send,
  Users,
} from 'lucide-react'
import {
  TRANSFER_TYPE_LABELS,
  TRANSFER_STATUS_LABELS,
  TRANSFER_PROPERTY_LABELS,
  type TransferStatus,
} from '@/services/employeeTransferService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export function EmployeeTransferDetailsView() {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const params = useParams({ strict: false }) as { transferId?: string }
  const transferId = params.transferId || ''
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // Form state
  const [approveComments, setApproveComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const { data: transfer, isLoading, error } = useEmployeeTransfer(transferId)
  const deleteMutation = useDeleteEmployeeTransfer()
  const approveMutation = useApproveTransfer()
  const rejectMutation = useRejectTransfer()
  const applyMutation = useApplyTransfer()
  const updateHandoverMutation = useUpdateHandoverItem()
  const notifyMutation = useNotifyEmployee()

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف طلب النقل هذا؟')) {
      deleteMutation.mutate(transferId, {
        onSuccess: () => navigate({ to: ROUTES.dashboard.hr.employeeTransfers.list }),
      })
    }
  }

  const handleApprove = () => {
    approveMutation.mutate(
      {
        id: transferId,
        comments: approveComments || undefined,
      },
      {
        onSuccess: () => {
          setShowApproveDialog(false)
          setApproveComments('')
        },
      }
    )
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('يرجى إدخال سبب الرفض')
      return
    }
    rejectMutation.mutate(
      {
        id: transferId,
        comments: rejectReason,
      },
      {
        onSuccess: () => {
          setShowRejectDialog(false)
          setRejectReason('')
        },
      }
    )
  }

  const handleApplyTransfer = () => {
    if (confirm('هل أنت متأكد من تطبيق هذا النقل؟ سيتم تحديث بيانات الموظف.')) {
      applyMutation.mutate(transferId)
    }
  }

  const handleHandoverToggle = (index: number, completed: boolean) => {
    updateHandoverMutation.mutate({
      id: transferId,
      itemIndex: index,
      completed,
    })
  }

  const handleNotifyEmployee = () => {
    if (confirm('هل تريد إرسال إشعار للموظف بخصوص هذا النقل؟')) {
      notifyMutation.mutate(transferId)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: TransferStatus) => {
    const color = TRANSFER_STATUS_LABELS[status]?.color || 'slate'
    return getColorClasses(color)
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'نقل الموظفين', href: ROUTES.dashboard.hr.employeeTransfers.list, isActive: true },
  ]

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa]">
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
              <p className="mt-4 text-slate-500">جاري تحميل التفاصيل...</p>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  if (error || !transfer) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa]">
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
              <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

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
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        <ProductivityHero
          badge="الموارد البشرية"
          title={`نقل الموظف: ${transfer.employeeNameAr || transfer.employeeName}`}
          type="employees"
          listMode={false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Actions */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(transfer.status)}>
                      {TRANSFER_STATUS_LABELS[transfer.status]?.ar}
                    </Badge>
                    <Badge className={getColorClasses(TRANSFER_TYPE_LABELS[transfer.transferType]?.color)}>
                      {TRANSFER_TYPE_LABELS[transfer.transferType]?.ar}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {transfer.status === 'pending_approval' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setShowApproveDialog(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                        >
                          <CheckCircle className="w-4 h-4 ms-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setShowRejectDialog(true)}
                          className="rounded-xl"
                        >
                          <XCircle className="w-4 h-4 ms-1" />
                          رفض
                        </Button>
                      </>
                    )}
                    {transfer.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={handleApplyTransfer}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                      >
                        <CheckCheck className="w-4 h-4 ms-1" />
                        تطبيق النقل
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNotifyEmployee}
                      className="rounded-xl"
                    >
                      <Send className="w-4 h-4 ms-1" />
                      إشعار الموظف
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: `/dashboard/hr/employee-transfers/new?editId=${transferId}`,
                            })
                          }
                        >
                          <Edit className="w-4 h-4 ms-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="w-4 h-4 ms-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                <TabsTrigger value="overview" className="rounded-xl">
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="details" className="rounded-xl">
                  التفاصيل
                </TabsTrigger>
                <TabsTrigger value="approval" className="rounded-xl">
                  الموافقات
                </TabsTrigger>
                <TabsTrigger value="handover" className="rounded-xl">
                  التسليم
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Employee Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" />
                      معلومات الموظف
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">الاسم</p>
                        <p className="font-medium">{transfer.employeeNameAr || transfer.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">رقم الموظف</p>
                        <p className="font-medium">{transfer.employeeNumber || 'غير محدد'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transfer Direction */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-emerald-500" />
                      تفاصيل النقل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      {/* From */}
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">من</p>
                        <div className="space-y-2">
                          {transfer.fromBranch && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <p className="text-sm font-medium">{transfer.fromBranch}</p>
                            </div>
                          )}
                          {transfer.fromDepartmentName && (
                            <p className="text-sm">{transfer.fromDepartmentName}</p>
                          )}
                          {transfer.fromDesignation && (
                            <p className="text-sm text-slate-600">{transfer.fromDesignation}</p>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ArrowRight className="w-8 h-8 text-emerald-500" />
                      </div>

                      {/* To */}
                      <div className="bg-emerald-50 p-4 rounded-xl">
                        <p className="text-xs text-emerald-600 mb-2">إلى</p>
                        <div className="space-y-2">
                          {transfer.toBranch && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-emerald-600" />
                              <p className="text-sm font-medium">{transfer.toBranch}</p>
                            </div>
                          )}
                          {transfer.toDepartmentName && (
                            <p className="text-sm">{transfer.toDepartmentName}</p>
                          )}
                          {transfer.toDesignation && (
                            <p className="text-sm text-emerald-700">{transfer.toDesignation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                      التواريخ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">تاريخ النقل</p>
                        <p className="font-medium">{formatDate(transfer.transferDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">تاريخ السريان</p>
                        <p className="font-medium">{formatDate(transfer.effectiveDate)}</p>
                      </div>
                      {transfer.endDate && (
                        <div>
                          <p className="text-xs text-slate-500">تاريخ الانتهاء</p>
                          <p className="font-medium">{formatDate(transfer.endDate)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reason */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      سبب النقل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{transfer.reasonAr || transfer.reason}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle>تفاصيل التغييرات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transfer.transferDetails && transfer.transferDetails.length > 0 ? (
                        transfer.transferDetails.map((detail, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">
                                {TRANSFER_PROPERTY_LABELS[detail.property]?.ar}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">{detail.currentValue}</span>
                                <ArrowRight className="w-3 h-3 text-emerald-500" />
                                <span className="text-xs text-emerald-600 font-medium">{detail.newValue}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">لا توجد تفاصيل تغييرات</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {transfer.newCompany && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader>
                      <CardTitle>الشركة الجديدة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{transfer.newCompany}</p>
                      {transfer.createNewEmployeeId && (
                        <p className="text-sm text-slate-500 mt-2">سيتم إنشاء رقم موظف جديد</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="approval" className="space-y-6 mt-6">
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      سير الموافقات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transfer.approvalWorkflow && transfer.approvalWorkflow.length > 0 ? (
                        transfer.approvalWorkflow.map((step, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-xl ${
                              step.status === 'approved'
                                ? 'bg-emerald-50'
                                : step.status === 'rejected'
                                  ? 'bg-red-50'
                                  : 'bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.status === 'approved'
                                    ? 'bg-emerald-500'
                                    : step.status === 'rejected'
                                      ? 'bg-red-500'
                                      : 'bg-slate-300'
                                }`}
                              >
                                <span className="text-white text-sm">{step.order}</span>
                              </div>
                              <div>
                                <p className="font-medium">{step.approverName}</p>
                                <p className="text-xs text-slate-500">{step.approverRole}</p>
                              </div>
                            </div>
                            <Badge
                              className={
                                step.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : step.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-slate-100 text-slate-700'
                              }
                            >
                              {step.status === 'approved'
                                ? 'موافق'
                                : step.status === 'rejected'
                                  ? 'مرفوض'
                                  : 'قيد الانتظار'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">لا توجد خطوات موافقة</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="handover" className="space-y-6 mt-6">
                {transfer.handoverRequired ? (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCheck className="w-5 h-5 text-emerald-500" />
                        قائمة التسليم
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transfer.handoverChecklist && transfer.handoverChecklist.length > 0 ? (
                          transfer.handoverChecklist.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={(checked) =>
                                  handleHandoverToggle(index, checked as boolean)
                                }
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.itemAr || item.item}</p>
                                {item.completedAt && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    تم في: {formatDate(item.completedAt)}
                                  </p>
                                )}
                              </div>
                              {item.completed && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">لا توجد عناصر تسليم</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="mt-4 text-slate-500">لا يتطلب هذا النقل تسليم</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HRSidebar />
          </div>
        </div>
      </Main>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>الموافقة على طلب النقل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ملاحظات (اختياري)</label>
              <Textarea
                value={approveComments}
                onChange={(e) => setApproveComments(e.target.value)}
                placeholder="أدخل ملاحظاتك هنا..."
                className="mt-2 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ms-1 animate-spin" />
                  جاري الموافقة...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 ms-1" />
                  موافقة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>رفض طلب النقل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">سبب الرفض *</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="أدخل سبب الرفض..."
                className="mt-2 rounded-xl"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              className="rounded-xl"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ms-1 animate-spin" />
                  جاري الرفض...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 ms-1" />
                  رفض
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
