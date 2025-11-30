import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    Users, UserPlus, Building2, Award, Briefcase, ArrowRight
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HRSidebar } from '../components/hr-sidebar'
import { useEmployees, useBulkDeleteEmployees, useEmployeeStats } from '@/hooks/useHR'
import { Employee } from '@/types/hr'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

const routeApi = getRouteApi('/_authenticated/dashboard/hr/employees')

// Stats cards for the hero section
function EmployeeStats({ stats }: { stats: { total: number; active: number; onLeave: number; newThisMonth: number } }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-xs text-white/60">إجمالي الموظفين</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.active}</p>
                        <p className="text-xs text-white/60">موظف نشط</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.onLeave}</p>
                        <p className="text-xs text-white/60">في إجازة</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
                        <p className="text-xs text-white/60">جديد هذا الشهر</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Employee card component
function EmployeeCard({
    employee,
    isSelected,
    onToggleSelect,
    isSelectionMode
}: {
    employee: Employee
    isSelected: boolean
    onToggleSelect: () => void
    isSelectionMode: boolean
}) {
    const statusConfig = {
        active: { label: 'نشط', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        inactive: { label: 'غير نشط', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        on_leave: { label: 'في إجازة', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
        terminated: { label: 'منتهي', color: 'bg-red-500/10 text-red-600 border-red-200' },
        probation: { label: 'تحت التجربة', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    }

    const config = statusConfig[employee.status] || statusConfig.active

    return (
        <Link to={`/dashboard/hr/employees/${employee.id}`}>
            <div className={cn(
                "group bg-white rounded-2xl border border-slate-200/60 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/5 hover:border-emerald-200",
                isSelected && "ring-2 ring-emerald-500 border-emerald-300"
            )}>
                <div className="flex items-start gap-4">
                    {isSelectionMode && (
                        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect(); }}>
                            <Checkbox
                                checked={isSelected}
                                className="mt-1"
                            />
                        </div>
                    )}

                    <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
                        <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-lg">
                            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                                    {employee.firstName} {employee.lastName}
                                </h3>
                                <p className="text-sm text-slate-500">{employee.position}</p>
                            </div>
                            <Badge variant="outline" className={cn("font-medium shrink-0", config.color)}>
                                {config.label}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4" />
                                {employee.department}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                {employee.employeeId}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// Loading skeleton
function EmployeeListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-start gap-4">
                        <Skeleton className="w-14 h-14 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function EmployeesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())

    const { data: employees = [], isLoading, error } = useEmployees()
    const { data: stats } = useEmployeeStats()
    const bulkDeleteMutation = useBulkDeleteEmployees()

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
            const matchesSearch = !searchQuery || fullName.includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [employees, searchQuery, statusFilter])

    const handleToggleSelect = (employeeId: string) => {
        const newSelected = new Set(selectedEmployees)
        if (newSelected.has(employeeId)) {
            newSelected.delete(employeeId)
        } else {
            newSelected.add(employeeId)
        }
        setSelectedEmployees(newSelected)
    }

    const handleDeleteSelected = async () => {
        if (selectedEmployees.size === 0) return

        try {
            await bulkDeleteMutation.mutateAsync(Array.from(selectedEmployees))
            toast({
                title: 'تم الحذف',
                description: `تم حذف ${selectedEmployees.size} موظف بنجاح`,
            })
            setSelectedEmployees(new Set())
            setIsSelectionMode(false)
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في حذف الموظفين',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الموارد البشرية', href: '/dashboard/hr/employees', isActive: true },
    ]

    const defaultStats = {
        total: employees.length,
        active: employees.filter(e => e.status === 'active').length,
        onLeave: employees.filter(e => e.status === 'on_leave').length,
        newThisMonth: 0,
    }

    return (
        <>
            <Header>
                <TopNav links={topLinks} />
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <DynamicIsland>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-600">إدارة الموظفين</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Bell className="w-4 h-4" />
                        <span>{employees.length} موظف</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {/* Hero Card */}
                    <ProductivityHero
                        badge="الموارد البشرية"
                        title="الموظفين"
                        type="hr"
                        hideButtons={true}
                        stats={[
                            {
                                label: "إجمالي الموظفين",
                                value: stats?.total || defaultStats.total,
                                icon: <Users className="w-4 h-4 text-emerald-400" />,
                                status: 'normal'
                            },
                            {
                                label: "موظف نشط",
                                value: stats?.active || defaultStats.active,
                                icon: <Briefcase className="w-4 h-4 text-blue-400" />,
                                status: 'normal'
                            },
                            {
                                label: "في إجازة",
                                value: stats?.onLeave || defaultStats.onLeave,
                                icon: <Building2 className="w-4 h-4 text-amber-400" />,
                                status: 'normal'
                            },
                            {
                                label: "جديد هذا الشهر",
                                value: stats?.newThisMonth || defaultStats.newThisMonth,
                                icon: <UserPlus className="w-4 h-4 text-purple-400" />,
                                status: 'normal'
                            }
                        ]}
                    >
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="البحث عن موظف..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    {['all', 'active', 'inactive', 'on_leave', 'probation'].map((status) => (
                                        <Button
                                            key={status}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setStatusFilter(status)}
                                            className={cn(
                                                "rounded-xl text-white/70 hover:text-white hover:bg-white/10",
                                                statusFilter === status && "bg-white/20 text-white"
                                            )}
                                        >
                                            {status === 'all' && 'الكل'}
                                            {status === 'active' && 'نشط'}
                                            {status === 'inactive' && 'غير نشط'}
                                            {status === 'on_leave' && 'إجازة'}
                                            {status === 'probation' && 'تجربة'}
                                        </Button>
                                    ))}
                                </div>

                                <Link to="/dashboard/hr/employees/new">
                                    <Button className="bg-white text-emerald-900 hover:bg-white/90 rounded-xl gap-2 font-medium">
                                        <Plus className="w-4 h-4" />
                                        إضافة موظف
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </ProductivityHero>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        {/* Employee list - 2/3 width */}
                        <div className="lg:col-span-2 space-y-4">
                            {isLoading ? (
                                <EmployeeListSkeleton />
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                                    <p className="text-red-600 mt-1">حدث خطأ أثناء تحميل قائمة الموظفين</p>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">لا يوجد موظفين</h3>
                                    <p className="text-slate-500 mt-1 mb-4">لم يتم العثور على موظفين</p>
                                    <Link to="/dashboard/hr/employees/new">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
                                            <Plus className="w-4 h-4" />
                                            إضافة موظف جديد
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredEmployees.map((employee) => (
                                        <EmployeeCard
                                            key={employee.id}
                                            employee={employee}
                                            isSelected={selectedEmployees.has(employee.id)}
                                            onToggleSelect={() => handleToggleSelect(employee.id)}
                                            isSelectionMode={isSelectionMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - 1/3 width */}
                        <div className="lg:col-span-1">
                            <HRSidebar
                                context="employees"
                                isSelectionMode={isSelectionMode}
                                onToggleSelectionMode={() => {
                                    setIsSelectionMode(!isSelectionMode)
                                    if (isSelectionMode) setSelectedEmployees(new Set())
                                }}
                                selectedCount={selectedEmployees.size}
                                onDeleteSelected={handleDeleteSelected}
                            />
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
