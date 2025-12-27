import { HRSidebar } from './hr-sidebar'
import { useState, useMemo, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useEmployees, useEmployeeStats, useBulkDeleteEmployees, useDeleteEmployee } from '@/hooks/useHR'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, Users, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, Edit3, SortAsc, Filter, X, Building2, Phone, Mail, MapPin, Briefcase, Calendar, UserCog } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
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
import type { Employee, EmploymentStatus, EmploymentType } from '@/services/hrService'
import { VirtualList } from '@/components/virtual-list'

export function EmployeesListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [nationalityFilter, setNationalityFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('hireDate')

    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

    // Mutations
    const deleteEmployeeMutation = useDeleteEmployee()
    const { mutate: bulkDeleteEmployees } = useBulkDeleteEmployees()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Status filter
        if (statusFilter !== 'all') {
            f.status = statusFilter
        }

        // Employment type filter
        if (typeFilter !== 'all') {
            f.employmentType = typeFilter
        }

        // Nationality filter
        if (nationalityFilter === 'saudi') {
            f.isSaudi = true
        } else if (nationalityFilter === 'non_saudi') {
            f.isSaudi = false
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        // Sort
        if (sortBy === 'hireDate') {
            f.sortBy = 'employment.hireDate'
            f.sortOrder = 'desc'
        } else if (sortBy === 'name') {
            f.sortBy = 'personalInfo.fullNameArabic'
            f.sortOrder = 'asc'
        } else if (sortBy === 'salary') {
            f.sortBy = 'compensation.basicSalary'
            f.sortOrder = 'desc'
        }

        return f
    }, [statusFilter, typeFilter, nationalityFilter, searchQuery, sortBy])

    // Check if any filter is active
    const hasActiveFilters = useMemo(() =>
        searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || nationalityFilter !== 'all',
        [searchQuery, statusFilter, typeFilter, nationalityFilter]
    )

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('')
        setStatusFilter('all')
        setTypeFilter('all')
        setNationalityFilter('all')
    }, [])

    // Fetch employees
    const { data: employeesData, isLoading, isError, error, refetch } = useEmployees(filters)
    const { data: stats } = useEmployeeStats()

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Transform API data
    const employees = useMemo(() => {
        if (!employeesData?.employees) return []

        return employeesData.employees.map((employee: Employee) => ({
            id: employee._id,
            employeeId: employee.employeeId,
            employeeNumber: employee.employeeNumber,
            fullName: employee.personalInfo?.fullNameArabic || 'غير محدد',
            fullNameEnglish: employee.personalInfo?.fullNameEnglish || '',
            jobTitle: employee.employment?.jobTitle || 'غير محدد',
            jobTitleArabic: employee.employment?.jobTitleArabic || employee.employment?.jobTitle || 'غير محدد',
            department: employee.employment?.departmentName || 'غير محدد',
            status: employee.employment?.employmentStatus || 'active',
            employmentType: employee.employment?.employmentType || 'full_time',
            hireDate: employee.employment?.hireDate,
            hireDateFormatted: formatDualDate(employee.employment?.hireDate),
            nationality: employee.personalInfo?.nationality || 'غير محدد',
            isSaudi: employee.personalInfo?.isSaudi || false,
            mobile: employee.personalInfo?.mobile || '',
            email: employee.personalInfo?.email || '',
            basicSalary: employee.compensation?.basicSalary || 0,
            avatar: employee.avatar,
            _id: employee._id,
        }))
    }, [employeesData])

    // Selection Handlers
    const handleToggleSelectionMode = useCallback(() => {
        setIsSelectionMode(prev => !prev)
        setSelectedIds([])
    }, [])

    const handleSelectEmployee = useCallback((employeeId: string) => {
        setSelectedIds(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        )
    }, [])

    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} موظف؟`)) {
            bulkDeleteEmployees(selectedIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedIds([])
                }
            })
        }
    }, [selectedIds, bulkDeleteEmployees])

    // Single employee actions
    const handleViewEmployee = useCallback((employeeId: string) => {
        navigate({ to: ROUTES.dashboard.hr.employees.detail(employeeId) })
    }, [navigate])

    const handleEditEmployee = useCallback((employeeId: string) => {
        navigate({ to: ROUTES.dashboard.hr.employees.new, search: { editId: employeeId } })
    }, [navigate])

    const handleDeleteEmployee = useCallback((employeeId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            deleteEmployeeMutation.mutate(employeeId)
        }
    }, [deleteEmployeeMutation])

    // Status badge styling
    const getStatusBadge = (status: EmploymentStatus) => {
        const styles: Record<EmploymentStatus, string> = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            on_leave: 'bg-amber-100 text-amber-700 border-amber-200',
            suspended: 'bg-red-100 text-red-700 border-red-200',
            terminated: 'bg-slate-100 text-slate-700 border-slate-200',
        }
        const labels: Record<EmploymentStatus, string> = {
            active: 'نشط',
            on_leave: 'في إجازة',
            suspended: 'موقوف',
            terminated: 'منتهي',
        }
        return <Badge className={`${styles[status]} border-0 rounded-md px-2`}>{labels[status]}</Badge>
    }

    // Employment type badge
    const getTypeBadge = (type: EmploymentType) => {
        const labels: Record<EmploymentType, string> = {
            full_time: 'دوام كامل',
            part_time: 'دوام جزئي',
            contract: 'عقد',
            temporary: 'مؤقت',
        }
        return <Badge variant="outline" className="text-xs">{labels[type]}</Badge>
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!stats) return undefined
        return [
            { label: 'إجمالي الموظفين', value: stats.total || 0, icon: Users, status: 'normal' as const },
            { label: 'نشطين', value: stats.active || 0, icon: UserCog, status: 'normal' as const },
            { label: 'في إجازة', value: stats.onLeave || 0, icon: Calendar, status: stats.onLeave > 0 ? 'attention' as const : 'zero' as const },
            { label: 'نسبة السعودة', value: `${stats.saudizationRate || 0}%`, icon: Building2, status: 'normal' as const },
        ]
    }, [stats])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: true },
        { title: 'الرواتب', href: '/dashboard/hr/salaries', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="الموارد البشرية" title="الموظفين" type="employees" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو الرقم الوظيفي..." aria-label="بحث بالاسم أو الرقم الوظيفي"
                                            defaultValue={searchQuery}
                                            onChange={(e) => debouncedSetSearch(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="active">نشط</SelectItem>
                                            <SelectItem value="on_leave">في إجازة</SelectItem>
                                            <SelectItem value="suspended">موقوف</SelectItem>
                                            <SelectItem value="terminated">منتهي</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Employment Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="نوع العمل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأنواع</SelectItem>
                                            <SelectItem value="full_time">دوام كامل</SelectItem>
                                            <SelectItem value="part_time">دوام جزئي</SelectItem>
                                            <SelectItem value="contract">عقد</SelectItem>
                                            <SelectItem value="temporary">مؤقت</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Nationality Filter */}
                                    <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الجنسية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="saudi">سعودي</SelectItem>
                                            <SelectItem value="non_saudi">غير سعودي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Sort and clear */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hireDate">تاريخ التعيين</SelectItem>
                                            <SelectItem value="name">الاسم</SelectItem>
                                            <SelectItem value="salary">الراتب</SelectItem>
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
                                            <X className="h-4 w-4 ms-2" aria-hidden="true" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN EMPLOYEES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة الموظفين</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {employees.length} موظف
                                </Badge>
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
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الموظفين</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && employees.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Users className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد موظفين</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة موظف جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to={ROUTES.dashboard.hr.employees.new}>
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة موظف
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Employees List with Virtualization */}
                                {!isLoading && !isError && employees.length > 0 && (
                                    <VirtualList
                                        items={employees}
                                        itemHeight={200}
                                        height={Math.min(employees.length * 200 + (employees.length - 1) * 16, 800)}
                                        renderItem={(employee, index, style) => (
                                            <div key={employee.id} style={{ ...style, paddingBottom: '16px' }}>
                                                <div className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(employee.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex gap-4 items-center">
                                                            {isSelectionMode && (
                                                                <Checkbox
                                                                    checked={selectedIds.includes(employee.id)}
                                                                    onCheckedChange={() => handleSelectEmployee(employee.id)}
                                                                    className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                                />
                                                            )}
                                                            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                                                                {employee.avatar ? (
                                                                    <img src={employee.avatar} alt={`${employee.fullName} avatar`} className="w-full h-full rounded-xl object-cover" loading="lazy" width="56" height="56" />
                                                                ) : (
                                                                    employee.fullName.charAt(0)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-navy text-lg">{employee.fullName}</h4>
                                                                    {getStatusBadge(employee.status)}
                                                                </div>
                                                                <p className="text-slate-500 text-sm">{employee.jobTitleArabic} • {employee.employeeNumber}</p>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                                    <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => handleViewEmployee(employee.id)}>
                                                                    <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                                    عرض التفاصيل
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEditEmployee(employee.id)}>
                                                                    <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                                    تعديل البيانات
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteEmployee(employee.id)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                                    حذف الموظف
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                        <div className="flex items-center gap-6">
                                                            {/* Contact Info */}
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                {employee.mobile && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="h-4 w-4" aria-hidden="true" />
                                                                        {employee.mobile}
                                                                    </span>
                                                                )}
                                                                {employee.email && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="h-4 w-4" aria-hidden="true" />
                                                                        {employee.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Employment Info */}
                                                            <div className="flex items-center gap-3">
                                                                {getTypeBadge(employee.employmentType)}
                                                                <div className="text-center">
                                                                    <div className="text-xs text-slate-600">تاريخ التعيين</div>
                                                                    <div className="font-medium text-navy text-sm">{employee.hireDateFormatted.arabic}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Link to={ROUTES.dashboard.hr.employees.detail(employee.id)}>
                                                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                                عرض الملف
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        getItemKey={(index, data) => data[index].id}
                                    />
                                )}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع الموظفين
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar
                        context="employees"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
