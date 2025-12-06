import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useLeaveRequests, useLeaveStats, useDeleteLeaveRequest } from '@/hooks/useLeave'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search, Bell, AlertCircle, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2,
    Edit3, SortAsc, X, Calendar, FileText, CheckCircle, Clock, XCircle,
    Users, Palmtree, Stethoscope, Heart, GraduationCap, Baby, Plane
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { LeaveType, LeaveStatus, LEAVE_TYPE_LABELS } from '@/services/leaveService'

const LEAVE_TYPES: { value: LeaveType; label: string; icon: typeof Palmtree }[] = [
    { value: 'annual', label: 'إجازة سنوية', icon: Palmtree },
    { value: 'sick', label: 'إجازة مرضية', icon: Stethoscope },
    { value: 'hajj', label: 'إجازة حج', icon: Plane },
    { value: 'marriage', label: 'إجازة زواج', icon: Heart },
    { value: 'birth', label: 'إجازة ولادة', icon: Baby },
    { value: 'death', label: 'إجازة وفاة', icon: Heart },
    { value: 'maternity', label: 'إجازة وضع', icon: Baby },
    { value: 'paternity', label: 'إجازة أبوة', icon: Baby },
    { value: 'exam', label: 'إجازة امتحان', icon: GraduationCap },
    { value: 'unpaid', label: 'إجازة بدون راتب', icon: Calendar },
]

export function LeaveRequestsListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('requestedOn')

    // Mutations
    const deleteRequestMutation = useDeleteLeaveRequest()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        if (statusFilter !== 'all') {
            f.status = statusFilter
        }

        if (typeFilter !== 'all') {
            f.leaveType = typeFilter
        }

        return f
    }, [statusFilter, typeFilter])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all'

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setTypeFilter('all')
    }

    // Fetch leave requests
    const { data: requestsData, isLoading, isError, error, refetch } = useLeaveRequests(filters)
    const { data: stats } = useLeaveStats()

    // Transform API data with search filter
    const leaveRequests = useMemo(() => {
        if (!requestsData?.data) return []
        let requests = requestsData.data

        // Apply client-side search filter
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase()
            requests = requests.filter(req =>
                req.employeeName.toLowerCase().includes(query) ||
                req.employeeNameAr?.toLowerCase().includes(query) ||
                req.requestNumber.toLowerCase().includes(query) ||
                req.requestId.toLowerCase().includes(query)
            )
        }

        return requests
    }, [requestsData, searchQuery])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectRequest = (requestId: string) => {
        if (selectedIds.includes(requestId)) {
            setSelectedIds(selectedIds.filter(id => id !== requestId))
        } else {
            setSelectedIds([...selectedIds, requestId])
        }
    }

    // Single request actions
    const handleViewRequest = (requestId: string) => {
        navigate({ to: '/dashboard/hr/leave/$requestId', params: { requestId } })
    }

    const handleEditRequest = (requestId: string) => {
        navigate({ to: '/dashboard/hr/leave/new', search: { editId: requestId } })
    }

    const handleDeleteRequest = (requestId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
            deleteRequestMutation.mutate(requestId)
        }
    }

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
            draft: 'مسودة',
            submitted: 'مقدم',
            pending_approval: 'بانتظار الموافقة',
            approved: 'موافق عليه',
            rejected: 'مرفوض',
            cancelled: 'ملغي',
            completed: 'مكتمل',
        }
        const icons: Record<LeaveStatus, React.ReactNode> = {
            draft: <FileText className="w-3 h-3" />,
            submitted: <Clock className="w-3 h-3" />,
            pending_approval: <Clock className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            rejected: <XCircle className="w-3 h-3" />,
            cancelled: <XCircle className="w-3 h-3" />,
            completed: <CheckCircle className="w-3 h-3" />,
        }
        return (
            <Badge className={`${styles[status]} border-0 rounded-md px-2 flex items-center gap-1`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        )
    }

    // Leave type badge styling
    const getLeaveTypeBadge = (leaveType: LeaveType) => {
        const styles: Record<LeaveType, string> = {
            annual: 'bg-emerald-100 text-emerald-700',
            sick: 'bg-red-100 text-red-700',
            hajj: 'bg-purple-100 text-purple-700',
            marriage: 'bg-pink-100 text-pink-700',
            birth: 'bg-blue-100 text-blue-700',
            death: 'bg-slate-100 text-slate-700',
            eid: 'bg-amber-100 text-amber-700',
            maternity: 'bg-rose-100 text-rose-700',
            paternity: 'bg-sky-100 text-sky-700',
            exam: 'bg-indigo-100 text-indigo-700',
            unpaid: 'bg-orange-100 text-orange-700',
        }
        const labels: Record<LeaveType, string> = {
            annual: 'سنوية',
            sick: 'مرضية',
            hajj: 'حج',
            marriage: 'زواج',
            birth: 'ولادة',
            death: 'وفاة',
            eid: 'عيد',
            maternity: 'وضع',
            paternity: 'أبوة',
            exam: 'امتحان',
            unpaid: 'بدون راتب',
        }
        return (
            <Badge className={`${styles[leaveType]} border-0 rounded-md px-2`}>
                {labels[leaveType]}
            </Badge>
        )
    }

    // Get leave type icon
    const getLeaveTypeIcon = (leaveType: LeaveType) => {
        const icons: Record<LeaveType, typeof Palmtree> = {
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
        const Icon = icons[leaveType] || Calendar
        return <Icon className="w-6 h-6 text-emerald-600" />
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!stats) return undefined
        return [
            { label: 'إجمالي الطلبات', value: stats.totalRequests || 0, icon: FileText, status: 'normal' as const },
            { label: 'بانتظار الموافقة', value: stats.pendingApproval || 0, icon: Clock, status: stats.pendingApproval > 0 ? 'attention' as const : 'zero' as const },
            { label: 'في إجازة اليوم', value: stats.onLeaveToday || 0, icon: Users, status: 'normal' as const },
            { label: 'متوسط أيام الإجازة', value: stats.averageLeaveDays?.toFixed(1) || 0, icon: Calendar, status: 'normal' as const },
        ]
    }, [stats])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leave', isActive: true },
    ]

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

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="الموارد البشرية" title="إدارة الإجازات" type="leave" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and type filter */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو الرقم..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Leave Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <Palmtree className="h-4 w-4 ml-2 text-slate-400" />
                                            <SelectValue placeholder="نوع الإجازة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأنواع</SelectItem>
                                            {LEAVE_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Status and sort */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="draft">مسودة</SelectItem>
                                            <SelectItem value="submitted">مقدم</SelectItem>
                                            <SelectItem value="pending_approval">بانتظار الموافقة</SelectItem>
                                            <SelectItem value="approved">موافق عليه</SelectItem>
                                            <SelectItem value="rejected">مرفوض</SelectItem>
                                            <SelectItem value="cancelled">ملغي</SelectItem>
                                            <SelectItem value="completed">مكتمل</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ml-2 text-slate-400" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="requestedOn">تاريخ الطلب</SelectItem>
                                            <SelectItem value="startDate">تاريخ البدء</SelectItem>
                                            <SelectItem value="employee">الموظف</SelectItem>
                                            <SelectItem value="days">عدد الأيام</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ml-2" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN LEAVE REQUESTS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">طلبات الإجازات</h3>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                        {leaveRequests.length} طلب
                                    </Badge>
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                                        <Link to="/dashboard/hr/leave/new">
                                            <Plus className="w-4 h-4 ml-2" />
                                            طلب إجازة
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الطلبات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && leaveRequests.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Palmtree className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد طلبات إجازة</h3>
                                        <p className="text-slate-500 mb-4">قدم طلب إجازة جديد للبدء</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/hr/leave/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                طلب إجازة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Leave Requests List */}
                                {!isLoading && !isError && leaveRequests.map((request) => (
                                    <div key={request._id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(request._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(request._id)}
                                                        onCheckedChange={() => handleSelectRequest(request._id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                    {getLeaveTypeIcon(request.leaveType)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{request.employeeNameAr || request.employeeName}</h4>
                                                        {getStatusBadge(request.status)}
                                                        {getLeaveTypeBadge(request.leaveType)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">
                                                        {request.requestNumber} • {request.jobTitle || request.department}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewRequest(request._id)}>
                                                        <Eye className="h-4 w-4 ml-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    {request.status === 'draft' && (
                                                        <DropdownMenuItem onClick={() => handleEditRequest(request._id)}>
                                                            <Edit3 className="h-4 w-4 ml-2 text-blue-500" />
                                                            تعديل
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {request.status === 'draft' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteRequest(request._id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200/50">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">تاريخ البدء</div>
                                                <div className="font-medium text-navy text-sm">
                                                    {new Date(request.dates.startDate).toLocaleDateString('ar-SA')}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">تاريخ الانتهاء</div>
                                                <div className="font-medium text-navy text-sm">
                                                    {new Date(request.dates.endDate).toLocaleDateString('ar-SA')}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">عدد الأيام</div>
                                                <div className="font-bold text-emerald-600 text-lg">
                                                    {request.dates.totalDays}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الرصيد المتبقي</div>
                                                <div className="font-medium text-navy text-sm">
                                                    {request.balanceAfter} يوم
                                                </div>
                                            </div>
                                        </div>

                                        {request.reason && (
                                            <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    <span className="font-medium">السبب:</span> {request.reason}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-end mt-4">
                                            <Link to={`/dashboard/hr/leave/${request._id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض الطلب
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع الطلبات
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar
                        context="leave"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                    />
                </div>
            </Main>
        </>
    )
}
