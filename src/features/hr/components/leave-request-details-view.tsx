import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
    useLeaveRequest,
    useApproveLeaveRequest,
    useRejectLeaveRequest,
    useCancelLeaveRequest,
    useConfirmReturn,
    useCompleteHandover,
} from '@/hooks/useLeave'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Search, Bell, ArrowRight, AlertCircle, Calendar, User, Clock,
    FileText, CheckCircle, XCircle, MoreHorizontal, Ban, Send, Download,
    Palmtree, Stethoscope, Plane, Heart, Baby, GraduationCap, Phone, Mail,
    AlertTriangle, UserCheck, Building, Briefcase, RefreshCw
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { LeaveStatus, LeaveType } from '@/services/leaveService'
import { LEAVE_TYPE_LABELS } from '@/services/leaveService'
import { useTranslation } from 'react-i18next'

// Leave type icons
const LEAVE_TYPE_ICONS: Record<LeaveType, typeof Palmtree> = {
    annual: Palmtree,
    sick: Stethoscope,
    hajj: Plane,
    marriage: Heart,
    birth: Baby,
    death: Heart,
    eid: Calendar,
    maternity: Baby,
    paternity: Baby,
    exam: GraduationCap,
    unpaid: Calendar,
}

// Leave type colors
const LEAVE_TYPE_COLORS: Record<LeaveType, { bg: string; text: string; border: string }> = {
    annual: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500' },
    sick: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
    hajj: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' },
    marriage: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-500' },
    birth: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
    death: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-500' },
    eid: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500' },
    maternity: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-500' },
    paternity: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-500' },
    exam: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500' },
    unpaid: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
}

export function LeaveRequestDetailsView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { requestId } = useParams({ from: '/_authenticated/dashboard/hr/leave/$requestId' })

    // Fetch leave request
    const { data: request, isLoading, isError, error } = useLeaveRequest(requestId)

    // Mutations
    const approveMutation = useApproveLeaveRequest()
    const rejectMutation = useRejectLeaveRequest()
    const cancelMutation = useCancelLeaveRequest()
    const confirmReturnMutation = useConfirmReturn()
    const completeHandoverMutation = useCompleteHandover()

    // Dialog states
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showReturnDialog, setShowReturnDialog] = useState(false)
    const [approveComments, setApproveComments] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [cancelReason, setCancelReason] = useState('')
    const [returnDate, setReturnDate] = useState('')

    // Status badge styling
    const getStatusBadge = (status: LeaveStatus) => {
        const styles: Record<LeaveStatus, string> = {
            draft: 'bg-slate-100 text-slate-700',
            submitted: 'bg-blue-100 text-blue-700',
            pending_approval: 'bg-amber-100 text-amber-700',
            approved: 'bg-emerald-100 text-emerald-700',
            rejected: 'bg-red-100 text-red-700',
            cancelled: 'bg-slate-100 text-slate-500',
            completed: 'bg-green-100 text-green-700',
        }
        const labels: Record<LeaveStatus, string> = {
            draft: t('hr.leaveStatus.draft'),
            submitted: t('hr.leaveStatus.submitted'),
            pending_approval: t('hr.leaveStatus.pendingApproval'),
            approved: t('hr.leaveStatus.approved'),
            rejected: t('hr.leaveStatus.rejected'),
            cancelled: t('hr.leaveStatus.cancelled'),
            completed: t('hr.leaveStatus.completed'),
        }
        const icons: Record<LeaveStatus, React.ReactNode> = {
            draft: <FileText className="w-3 h-3" />,
            submitted: <Send className="w-3 h-3" />,
            pending_approval: <Clock className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            rejected: <XCircle className="w-3 h-3" />,
            cancelled: <Ban className="w-3 h-3" />,
            completed: <CheckCircle className="w-3 h-3" />,
        }
        return (
            <Badge className={`${styles[status]} border-0 rounded-lg px-3 py-1 flex items-center gap-1 text-sm`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        )
    }

    // Get leave type badge
    const getLeaveTypeBadge = (type: LeaveType) => {
        const colors = LEAVE_TYPE_COLORS[type]
        const Icon = LEAVE_TYPE_ICONS[type]
        const label = LEAVE_TYPE_LABELS[type]
        return (
            <Badge className={`${colors.bg} ${colors.text} border-0 rounded-lg px-3 py-1 flex items-center gap-1.5 text-sm`}>
                <Icon className="w-3.5 h-3.5" />
                {label.ar}
            </Badge>
        )
    }

    // Action handlers
    const handleApprove = () => {
        approveMutation.mutate({ requestId, comments: approveComments }, {
            onSuccess: () => {
                setShowApproveDialog(false)
                setApproveComments('')
            }
        })
    }

    const handleReject = () => {
        rejectMutation.mutate({ requestId, reason: rejectReason }, {
            onSuccess: () => {
                setShowRejectDialog(false)
                setRejectReason('')
            }
        })
    }

    const handleCancel = () => {
        cancelMutation.mutate({ requestId, reason: cancelReason }, {
            onSuccess: () => {
                setShowCancelDialog(false)
                setCancelReason('')
            }
        })
    }

    const handleConfirmReturn = () => {
        confirmReturnMutation.mutate({ requestId, returnDate }, {
            onSuccess: () => {
                setShowReturnDialog(false)
                setReturnDate('')
            }
        })
    }

    const handleCompleteHandover = () => {
        completeHandoverMutation.mutate(requestId)
    }

    const topNav = [
        { title: t('common.overview'), href: '/dashboard/overview', isActive: false },
        { title: t('hr.employees.title'), href: '/dashboard/hr/employees', isActive: false },
        { title: t('hr.leave.title'), href: '/dashboard/hr/leave', isActive: true },
    ]

    // Loading state
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-32 rounded-2xl" />
                            ))}
                        </div>
                        <Skeleton className="h-96 rounded-2xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error state
    if (isError || !request) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('hr.leave.requestNotFound')}</h2>
                        <p className="text-slate-500 mb-4">{error?.message || t('common.errorLoading')}</p>
                        <Button onClick={() => navigate({ to: '/dashboard/hr/leave' })} className="bg-emerald-500 hover:bg-emerald-600">
                            {t('common.backToList')}
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    const leaveTypeColors = LEAVE_TYPE_COLORS[request.leaveType]
    const LeaveTypeIcon = LEAVE_TYPE_ICONS[request.leaveType]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder={t('common.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-white"
                            onClick={() => navigate({ to: '/dashboard/hr/leave' })}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-navy">{t('hr.leave.leaveRequest')}</h1>
                                {getStatusBadge(request.status)}
                                {getLeaveTypeBadge(request.leaveType)}
                            </div>
                            <p className="text-slate-500">
                                {request.requestNumber} • {request.employeeNameAr || request.employeeName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Action buttons based on status */}
                        {(request.status === 'submitted' || request.status === 'pending_approval') && (
                            <>
                                <Button
                                    onClick={() => setShowRejectDialog(true)}
                                    variant="outline"
                                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 ml-2" />
                                    {t('common.reject')}
                                </Button>
                                <Button
                                    onClick={() => setShowApproveDialog(true)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                >
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    {t('common.approve')}
                                </Button>
                            </>
                        )}
                        {request.status === 'approved' && !request.returnFromLeave?.returned && (
                            <Button
                                onClick={() => setShowReturnDialog(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                            >
                                <UserCheck className="w-4 h-4 ml-2" />
                                {t('hr.leave.confirmReturn')}
                            </Button>
                        )}

                        {/* More actions dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-xl">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Download className="h-4 w-4 ml-2" />
                                    {t('common.downloadPDF')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Send className="h-4 w-4 ml-2" />
                                    {t('hr.leave.sendToEmployee')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {request.status !== 'cancelled' && request.status !== 'completed' && (
                                    <DropdownMenuItem
                                        onClick={() => setShowCancelDialog(true)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Ban className="h-4 w-4 ml-2" />
                                        {t('hr.leave.cancelRequest')}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className={`border-none shadow-sm rounded-2xl ${leaveTypeColors.bg}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center`}>
                                    <LeaveTypeIcon className={`w-6 h-6 ${leaveTypeColors.text}`} />
                                </div>
                                <div>
                                    <p className={`text-sm ${leaveTypeColors.text}`}>نوع الإجازة</p>
                                    <p className={`text-lg font-bold ${leaveTypeColors.text}`}>{LEAVE_TYPE_LABELS[request.leaveType].ar}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">عدد الأيام</p>
                                    <p className="text-2xl font-bold text-navy">{request.dates.totalDays}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">تاريخ البدء</p>
                                    <p className="text-lg font-bold text-navy">{new Date(request.dates.startDate).toLocaleDateString('ar-SA')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">تاريخ العودة</p>
                                    <p className="text-lg font-bold text-navy">{new Date(request.dates.returnDate).toLocaleDateString('ar-SA')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                        <TabsTrigger value="overview" className="rounded-lg">{t('common.overview')}</TabsTrigger>
                        <TabsTrigger value="details" className="rounded-lg">{t('common.details')}</TabsTrigger>
                        <TabsTrigger value="approval" className="rounded-lg">{t('hr.leave.approvals')}</TabsTrigger>
                        {request.documents && request.documents.length > 0 && (
                            <TabsTrigger value="documents" className="rounded-lg">{t('hr.employees.documents')}</TabsTrigger>
                        )}
                        {request.workHandover && (
                            <TabsTrigger value="handover" className="rounded-lg">{t('hr.leave.workHandover')}</TabsTrigger>
                        )}
                        <TabsTrigger value="notes" className="rounded-lg">{t('common.notes')}</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Employee Info */}
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <User className="w-4 h-4 text-emerald-600" />
                                        معلومات الموظف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">الاسم</span>
                                        <span className="font-medium text-navy">{request.employeeNameAr || request.employeeName}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">رقم الموظف</span>
                                        <span className="font-medium text-navy">{request.employeeNumber}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">رقم الهوية</span>
                                        <span className="font-medium text-navy">{request.nationalId}</span>
                                    </div>
                                    {request.department && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">القسم</span>
                                            <span className="font-medium text-navy">{request.department}</span>
                                        </div>
                                    )}
                                    {request.jobTitle && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-500">المسمى الوظيفي</span>
                                            <span className="font-medium text-navy">{request.jobTitle}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Leave Dates */}
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        تواريخ الإجازة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">تاريخ البدء</span>
                                        <span className="font-medium text-navy">{new Date(request.dates.startDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">تاريخ الانتهاء</span>
                                        <span className="font-medium text-navy">{new Date(request.dates.endDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">إجمالي الأيام</span>
                                        <span className="font-bold text-emerald-600">{request.dates.totalDays} يوم</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">أيام العمل</span>
                                        <span className="font-medium text-navy">{request.dates.workingDays} يوم</span>
                                    </div>
                                    {request.dates.halfDay && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">نصف يوم</span>
                                            <Badge className="bg-amber-100 text-amber-700 border-0">
                                                {request.dates.halfDayPeriod === 'first_half' ? 'النصف الأول' : 'النصف الثاني'}
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-500">تاريخ العودة</span>
                                        <span className="font-medium text-emerald-600">{new Date(request.dates.returnDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reason */}
                            <Card className="border-none shadow-sm bg-white rounded-2xl md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                        سبب الإجازة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 whitespace-pre-wrap">{request.reasonAr || request.reason}</p>
                                    {request.leaveDetails?.isEmergency && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                                <span className="font-bold text-red-700">إجازة طارئة</span>
                                            </div>
                                            {request.leaveDetails.emergencyReason && (
                                                <p className="text-sm text-red-600">{request.leaveDetails.emergencyReason}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Balance Impact */}
                            {request.balanceImpact && (
                                <Card className="border-none shadow-sm bg-white rounded-2xl md:col-span-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-emerald-600" />
                                            تأثير الرصيد
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                                <div className="text-sm text-slate-500 mb-1">الرصيد قبل</div>
                                                <div className="text-2xl font-bold text-navy">{request.balanceImpact.balanceBefore.annualLeave}</div>
                                                <div className="text-xs text-slate-400">يوم</div>
                                            </div>
                                            <div className="p-4 bg-red-50 rounded-xl text-center">
                                                <div className="text-sm text-red-500 mb-1">المخصوم</div>
                                                <div className="text-2xl font-bold text-red-600">-{request.balanceImpact.deducted.annualLeave || request.dates.totalDays}</div>
                                                <div className="text-xs text-red-400">يوم</div>
                                            </div>
                                            <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                                <div className="text-sm text-emerald-500 mb-1">الرصيد بعد</div>
                                                <div className="text-2xl font-bold text-emerald-600">{request.balanceImpact.balanceAfter.annualLeave}</div>
                                                <div className="text-xs text-emerald-400">يوم</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        {/* Leave Type Specific Details */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                    <LeaveTypeIcon className={`w-4 h-4 ${leaveTypeColors.text}`} />
                                    تفاصيل {LEAVE_TYPE_LABELS[request.leaveType].ar}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Legal entitlement info */}
                                <div className={`p-4 ${leaveTypeColors.bg} rounded-xl mb-4`}>
                                    <p className={`text-sm ${leaveTypeColors.text}`}>
                                        <strong>{LEAVE_TYPE_LABELS[request.leaveType].article}:</strong>{' '}
                                        {request.leaveType === 'annual' && 'يستحق العامل إجازة سنوية لا تقل عن 21 يوماً، وتزيد إلى 30 يوماً بعد 5 سنوات من الخدمة.'}
                                        {request.leaveType === 'sick' && 'يستحق العامل إجازة مرضية بأجر كامل لأول 30 يوماً، ثم 75% للـ 60 يوماً التالية، ثم بدون أجر لآخر 30 يوماً.'}
                                        {request.leaveType === 'hajj' && 'يستحق العامل إجازة حج لمدة 10-15 يوماً بأجر كامل لمرة واحدة طوال فترة خدمته.'}
                                        {request.leaveType === 'marriage' && 'يستحق العامل إجازة 3 أيام بأجر كامل عند الزواج.'}
                                        {request.leaveType === 'birth' && 'يستحق العامل إجازة يوم واحد بأجر كامل عند ولادة مولود.'}
                                        {request.leaveType === 'death' && 'يستحق العامل إجازة 3 أيام بأجر كامل عند وفاة أحد أقاربه.'}
                                        {request.leaveType === 'maternity' && 'تستحق المرأة العاملة إجازة وضع لمدة 10 أسابيع.'}
                                        {request.leaveType === 'exam' && 'يحق للعامل الحصول على إجازة بأجر كامل لأداء الامتحانات.'}
                                        {request.leaveType === 'unpaid' && 'الإجازة بدون راتب تؤثر على الراتب والتأمينات وحساب مكافأة نهاية الخدمة.'}
                                    </p>
                                </div>

                                {/* Type-specific details */}
                                {request.leaveDetails?.sickLeave && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">نوع الإجازة المرضية</span>
                                            <Badge className={`border-0 ${
                                                request.leaveDetails.sickLeave.sickLeaveType === 'full_pay' ? 'bg-emerald-100 text-emerald-700' :
                                                request.leaveDetails.sickLeave.sickLeaveType === 'partial_pay' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {request.leaveDetails.sickLeave.sickLeaveType === 'full_pay' ? 'أجر كامل' :
                                                 request.leaveDetails.sickLeave.sickLeaveType === 'partial_pay' ? 'أجر جزئي (75%)' :
                                                 'بدون أجر'}
                                            </Badge>
                                        </div>
                                        {request.leaveDetails.sickLeave.hospitalized && (
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-slate-500">المستشفى</span>
                                                <span className="font-medium text-navy">{request.leaveDetails.sickLeave.hospitalName}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {request.leaveDetails?.hajjLeave && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">مؤهل للحج</span>
                                            <Badge className={`border-0 ${request.leaveDetails.hajjLeave.eligibility.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {request.leaveDetails.hajjLeave.eligibility.eligible ? 'مؤهل' : 'غير مؤهل'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">سنوات الخدمة</span>
                                            <span className="font-medium text-navy">{request.leaveDetails.hajjLeave.eligibility.serviceYears} سنة</span>
                                        </div>
                                    </div>
                                )}

                                {request.leaveDetails?.maternityLeave && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">تاريخ الولادة المتوقع</span>
                                            <span className="font-medium text-navy">{new Date(request.leaveDetails.maternityLeave.expectedDeliveryDate).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">إجمالي المدة</span>
                                            <span className="font-medium text-navy">{request.leaveDetails.maternityLeave.totalDuration} يوم</span>
                                        </div>
                                    </div>
                                )}

                                {request.leaveDetails?.deathLeave && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">اسم المتوفى</span>
                                            <span className="font-medium text-navy">{request.leaveDetails.deathLeave.deceasedName}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">صلة القرابة</span>
                                            <span className="font-medium text-navy">
                                                {request.leaveDetails.deathLeave.relationship === 'spouse' ? 'الزوج/الزوجة' :
                                                 request.leaveDetails.deathLeave.relationship === 'parent' ? 'الوالد/الوالدة' :
                                                 request.leaveDetails.deathLeave.relationship === 'child' ? 'الابن/الابنة' :
                                                 request.leaveDetails.deathLeave.relationship === 'sibling' ? 'الأخ/الأخت' :
                                                 request.leaveDetails.deathLeave.relationship === 'grandparent' ? 'الجد/الجدة' : 'آخر'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-500">تاريخ الوفاة</span>
                                            <span className="font-medium text-navy">{new Date(request.leaveDetails.deathLeave.dateOfDeath).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    </div>
                                )}

                                {request.leaveDetails?.examLeave && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">نوع الامتحان</span>
                                            <span className="font-medium text-navy">{request.leaveDetails.examLeave.examType}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">المؤسسة التعليمية</span>
                                            <span className="font-medium text-navy">{request.leaveDetails.examLeave.institution}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-500">تاريخ الامتحان</span>
                                            <span className="font-medium text-navy">{new Date(request.leaveDetails.examLeave.examDate).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    </div>
                                )}

                                {request.leaveDetails?.unpaidLeave && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500">تصنيف السبب</span>
                                            <Badge className="bg-slate-100 text-slate-700 border-0">
                                                {request.leaveDetails.unpaidLeave.reasonCategory === 'personal' ? 'شخصي' :
                                                 request.leaveDetails.unpaidLeave.reasonCategory === 'family' ? 'عائلي' :
                                                 request.leaveDetails.unpaidLeave.reasonCategory === 'health' ? 'صحي' :
                                                 request.leaveDetails.unpaidLeave.reasonCategory === 'education' ? 'تعليمي' : 'آخر'}
                                            </Badge>
                                        </div>
                                        <div className="py-2">
                                            <span className="text-slate-500 block mb-2">التفاصيل</span>
                                            <p className="text-navy">{request.leaveDetails.unpaidLeave.detailedReason}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact During Leave */}
                        {request.leaveDetails?.contactDuringLeave && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-emerald-600" />
                                        التواصل أثناء الإجازة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">متاح للتواصل</span>
                                        <Badge className={`border-0 ${request.leaveDetails.contactDuringLeave.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {request.leaveDetails.contactDuringLeave.available ? 'نعم' : 'لا'}
                                        </Badge>
                                    </div>
                                    {request.leaveDetails.contactDuringLeave.contactNumber && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500 flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                رقم الهاتف
                                            </span>
                                            <span className="font-medium text-navy" dir="ltr">{request.leaveDetails.contactDuringLeave.contactNumber}</span>
                                        </div>
                                    )}
                                    {request.leaveDetails.contactDuringLeave.email && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-slate-500 flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                البريد الإلكتروني
                                            </span>
                                            <span className="font-medium text-navy" dir="ltr">{request.leaveDetails.contactDuringLeave.email}</span>
                                        </div>
                                    )}
                                    {request.leaveDetails.contactDuringLeave.emergencyContact && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-slate-700 mb-3">جهة اتصال للطوارئ</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">الاسم</span>
                                                    <span className="font-medium text-navy">{request.leaveDetails.contactDuringLeave.emergencyContact.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">صلة القرابة</span>
                                                    <span className="font-medium text-navy">{request.leaveDetails.contactDuringLeave.emergencyContact.relationship}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">الهاتف</span>
                                                    <span className="font-medium text-navy" dir="ltr">{request.leaveDetails.contactDuringLeave.emergencyContact.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Approval Tab */}
                    <TabsContent value="approval" className="space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    سير الموافقات
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Timeline */}
                                <div className="space-y-4">
                                    {/* Request Submitted */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Send className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-navy">تم تقديم الطلب</span>
                                                <span className="text-sm text-slate-500">{new Date(request.requestedOn).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                            <p className="text-sm text-slate-500">بواسطة {request.employeeNameAr || request.employeeName}</p>
                                        </div>
                                    </div>

                                    {/* Approval Workflow Steps */}
                                    {request.approvalWorkflow?.steps.map((step, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                step.status === 'approved' ? 'bg-emerald-100' :
                                                step.status === 'rejected' ? 'bg-red-100' :
                                                step.status === 'pending' ? 'bg-amber-100' :
                                                'bg-slate-100'
                                            }`}>
                                                {step.status === 'approved' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                                                 step.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-600" /> :
                                                 step.status === 'pending' ? <Clock className="w-5 h-5 text-amber-600" /> :
                                                 <RefreshCw className="w-5 h-5 text-slate-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-navy">{step.stepNameAr || step.stepName}</span>
                                                    {step.actionDate && (
                                                        <span className="text-sm text-slate-500">{new Date(step.actionDate).toLocaleDateString('ar-SA')}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    {step.approverName || step.approverRole}
                                                    {step.status === 'approved' && ' - تمت الموافقة'}
                                                    {step.status === 'rejected' && ' - تم الرفض'}
                                                    {step.status === 'pending' && ' - في الانتظار'}
                                                </p>
                                                {step.comments && (
                                                    <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{step.comments}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Final Approval/Rejection */}
                                    {request.status === 'approved' && request.approvedBy && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-emerald-700">تمت الموافقة النهائية</span>
                                                    {request.approvedOn && (
                                                        <span className="text-sm text-slate-500">{new Date(request.approvedOn).toLocaleDateString('ar-SA')}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">بواسطة {request.approverName || request.approvedBy}</p>
                                                {request.approvalComments && (
                                                    <p className="text-sm text-slate-600 mt-1 bg-emerald-50 p-2 rounded">{request.approvalComments}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {request.status === 'rejected' && request.rejectedBy && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-red-700">تم رفض الطلب</span>
                                                    {request.rejectedOn && (
                                                        <span className="text-sm text-slate-500">{new Date(request.rejectedOn).toLocaleDateString('ar-SA')}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">بواسطة {request.rejectorName || request.rejectedBy}</p>
                                                {request.rejectionReason && (
                                                    <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">{request.rejectionReason}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conflicts */}
                        {request.conflicts?.hasConflicts && (
                            <Card className="border-none shadow-sm bg-amber-50 rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                        تعارضات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {request.conflicts.overlappingLeaves?.map((conflict, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-lg mb-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-amber-800">{conflict.conflictType}</span>
                                                <Badge className={`border-0 ${
                                                    conflict.severity === 'high' || conflict.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                    conflict.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {conflict.severity === 'critical' ? 'حرج' :
                                                     conflict.severity === 'high' ? 'عالي' :
                                                     conflict.severity === 'medium' ? 'متوسط' : 'منخفض'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-amber-700 mt-1">{conflict.conflictDetails}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Documents Tab */}
                    {request.documents && request.documents.length > 0 && (
                        <TabsContent value="documents" className="space-y-6">
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                        المستندات المرفقة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {request.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-navy">{doc.documentNameAr || doc.documentName}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {doc.fileName} • {new Date(doc.uploadedOn).toLocaleDateString('ar-SA')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.verified ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                            <CheckCircle className="w-3 h-3 ml-1" />
                                                            تم التحقق
                                                        </Badge>
                                                    ) : doc.required ? (
                                                        <Badge className="bg-amber-100 text-amber-700 border-0">
                                                            بانتظار التحقق
                                                        </Badge>
                                                    ) : null}
                                                    <Button variant="ghost" size="sm" className="rounded-lg">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Handover Tab */}
                    {request.workHandover && (
                        <TabsContent value="handover" className="space-y-6">
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                            <Building className="w-4 h-4 text-emerald-600" />
                                            تسليم العمل
                                        </CardTitle>
                                        {!request.workHandover.handoverCompleted && request.status === 'approved' && (
                                            <Button
                                                onClick={handleCompleteHandover}
                                                size="sm"
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                                                disabled={completeHandoverMutation.isPending}
                                            >
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                {completeHandoverMutation.isPending ? 'جاري...' : 'إتمام التسليم'}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Delegate Info */}
                                    {request.workHandover.delegateTo && (
                                        <div className="p-4 bg-blue-50 rounded-xl mb-4">
                                            <p className="text-sm text-blue-600 mb-2">تفويض العمل إلى:</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-navy">{request.workHandover.delegateTo.employeeName}</p>
                                                    <p className="text-sm text-slate-500">{request.workHandover.delegateTo.jobTitle}</p>
                                                </div>
                                                <Badge className={`mr-auto border-0 ${request.workHandover.delegateTo.accepted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {request.workHandover.delegateTo.accepted ? 'مقبول' : 'في الانتظار'}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tasks */}
                                    {request.workHandover.tasks.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-3">المهام للتسليم</p>
                                            <div className="space-y-2">
                                                {request.workHandover.tasks.map((task, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-navy">{task.taskName}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`border-0 ${
                                                                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                    task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {task.priority === 'urgent' ? 'عاجل' :
                                                                     task.priority === 'high' ? 'مرتفع' :
                                                                     task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                                                </Badge>
                                                                {task.handedOver && (
                                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                                        <CheckCircle className="w-3 h-3 ml-1" />
                                                                        تم التسليم
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{task.taskDescription}</p>
                                                        {task.dueDate && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                تاريخ الاستحقاق: {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Handover Status */}
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">حالة التسليم</span>
                                            <Badge className={`border-0 ${request.workHandover.handoverCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {request.workHandover.handoverCompleted ? 'مكتمل' : 'غير مكتمل'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    الملاحظات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {request.notes?.employeeNotes && (
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <p className="text-sm font-medium text-blue-700 mb-2">ملاحظات الموظف</p>
                                        <p className="text-slate-700">{request.notes.employeeNotes}</p>
                                    </div>
                                )}
                                {request.notes?.managerNotes && (
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <p className="text-sm font-medium text-purple-700 mb-2">ملاحظات المدير</p>
                                        <p className="text-slate-700">{request.notes.managerNotes}</p>
                                    </div>
                                )}
                                {request.notes?.hrNotes && (
                                    <div className="p-4 bg-emerald-50 rounded-xl">
                                        <p className="text-sm font-medium text-emerald-700 mb-2">ملاحظات الموارد البشرية</p>
                                        <p className="text-slate-700">{request.notes.hrNotes}</p>
                                    </div>
                                )}
                                {!request.notes?.employeeNotes && !request.notes?.managerNotes && !request.notes?.hrNotes && (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500">لا توجد ملاحظات</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Main>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('hr.leave.approveRequest')}</DialogTitle>
                        <DialogDescription>
                            {t('hr.leave.approveRequestDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-emerald-50 rounded-xl">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-emerald-600">الموظف:</span>
                                    <span className="font-bold text-emerald-800 mr-2">{request.employeeNameAr || request.employeeName}</span>
                                </div>
                                <div>
                                    <span className="text-emerald-600">عدد الأيام:</span>
                                    <span className="font-bold text-emerald-800 mr-2">{request.dates.totalDays} يوم</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="approveComments">{t('common.commentsOptional')}</Label>
                            <Textarea
                                id="approveComments"
                                value={approveComments}
                                onChange={(e) => setApproveComments(e.target.value)}
                                placeholder={t('hr.leave.approveCommentsPlaceholder')}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="rounded-xl">
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleApprove}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                            disabled={approveMutation.isPending}
                        >
                            {approveMutation.isPending ? t('common.approving') : t('common.approve')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('hr.leave.rejectRequest')}</DialogTitle>
                        <DialogDescription>
                            {t('hr.leave.rejectRequestDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason">{t('hr.leave.rejectReason')} *</Label>
                            <Textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t('hr.leave.rejectReasonPlaceholder')}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="rounded-xl">
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleReject}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                            disabled={!rejectReason.trim() || rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? t('common.rejecting') : t('common.rejectRequest')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('hr.leave.cancelRequest')}</DialogTitle>
                        <DialogDescription>
                            {t('hr.leave.cancelRequestDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancelReason">{t('hr.leave.cancelReason')} *</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder={t('hr.leave.cancelReasonPlaceholder')}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl">
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                            disabled={!cancelReason.trim() || cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? t('common.cancelling') : t('hr.leave.cancelRequest')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Return Dialog */}
            <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('hr.leave.confirmReturn')}</DialogTitle>
                        <DialogDescription>
                            {t('hr.leave.confirmReturnDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="returnDate">{t('hr.leave.actualReturnDate')} *</Label>
                            <Input
                                id="returnDate"
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReturnDialog(false)} className="rounded-xl">
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleConfirmReturn}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                            disabled={!returnDate || confirmReturnMutation.isPending}
                        >
                            {confirmReturnMutation.isPending ? t('common.confirming') : t('hr.leave.confirmReturn')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
