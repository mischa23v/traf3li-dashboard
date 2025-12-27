import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import {
  useLeavePolicies,
  useLeavePolicyStats,
  useDeleteLeavePolicy,
  useSetDefaultLeavePolicy,
  useToggleLeavePolicyStatus,
  useDuplicateLeavePolicy,
} from '@/hooks/useLeavePolicy'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Search,
  Bell,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit3,
  X,
  FileText,
  CheckCircle,
  Shield,
  Copy,
  Star,
  Users,
  Calendar,
  Settings,
  Power,
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
import type { LeavePolicy, ApplicabilityType } from '@/services/leavePolicyService'

export function LeavePoliciesListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | undefined>()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [applicabilityFilter, setApplicabilityFilter] = useState<string>('all')
  const [complianceFilter, setComplianceFilter] = useState<string>('all')

  // Mutations
  const deletePolicy = useDeleteLeavePolicy()
  const setDefaultPolicy = useSetDefaultLeavePolicy()
  const toggleStatus = useToggleLeavePolicyStatus()
  const duplicatePolicy = useDuplicateLeavePolicy()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}

    if (statusFilter === 'active') f.isActive = true
    if (statusFilter === 'inactive') f.isActive = false
    if (applicabilityFilter !== 'all') f.applicableFor = applicabilityFilter
    if (complianceFilter === 'compliant') f.saudiLaborLawCompliant = true
    if (complianceFilter === 'non_compliant') f.saudiLaborLawCompliant = false

    return f
  }, [statusFilter, applicabilityFilter, complianceFilter])

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || applicabilityFilter !== 'all' || complianceFilter !== 'all'

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setApplicabilityFilter('all')
    setComplianceFilter('all')
  }

  // Fetch policies
  const { data: policiesData, isLoading, isError, error, refetch } = useLeavePolicies(filters)
  const { data: stats } = useLeavePolicyStats()

  // Transform API data with search filter
  const policies = useMemo(() => {
    if (!policiesData?.data) return []
    let policyList = policiesData.data

    // Apply client-side search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      policyList = policyList.filter(
        (policy) =>
          policy.name.toLowerCase().includes(query) ||
          policy.nameAr.toLowerCase().includes(query) ||
          policy.policyId.toLowerCase().includes(query) ||
          policy.description?.toLowerCase().includes(query)
      )
    }

    return policyList
  }, [policiesData, searchQuery])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectPolicy = (policyId: string) => {
    if (selectedIds.includes(policyId)) {
      setSelectedIds(selectedIds.filter((id) => id !== policyId))
    } else {
      setSelectedIds([...selectedIds, policyId])
    }
  }

  // Single policy actions
  const handleViewPolicy = (policyId: string) => {
    navigate({ to: `/dashboard/hr/leave-policies/${policyId}` as any })
  }

  const handleEditPolicy = (policy: LeavePolicy) => {
    setEditingPolicy(policy)
    setIsCreateDialogOpen(true)
  }

  const handleDeletePolicy = (policyId: string, policyName: string) => {
    if (confirm(`هل أنت متأكد من حذف السياسة "${policyName}"؟`)) {
      deletePolicy.mutate(policyId)
    }
  }

  const handleSetDefault = (policyId: string, policyName: string) => {
    if (confirm(`هل تريد جعل "${policyName}" السياسة الافتراضية؟`)) {
      setDefaultPolicy.mutate(policyId)
    }
  }

  const handleToggleStatus = (policyId: string, currentStatus: boolean, policyName: string) => {
    const action = currentStatus ? 'تعطيل' : 'تفعيل'
    if (confirm(`هل تريد ${action} السياسة "${policyName}"؟`)) {
      toggleStatus.mutate({ policyId, isActive: !currentStatus })
    }
  }

  const handleDuplicate = (policyId: string, policyName: string, policyNameAr: string) => {
    const newName = prompt('أدخل اسم السياسة الجديدة (EN):', `${policyName} - Copy`)
    const newNameAr = prompt('أدخل اسم السياسة الجديدة (AR):', `${policyNameAr} - نسخة`)

    if (newName && newNameAr) {
      duplicatePolicy.mutate({ policyId, newName, newNameAr })
    }
  }

  // Applicability badge
  const getApplicabilityBadge = (applicableFor: ApplicabilityType) => {
    const styles: Record<ApplicabilityType, string> = {
      all: 'bg-purple-100 text-purple-700',
      department: 'bg-blue-100 text-blue-700',
      designation: 'bg-emerald-100 text-emerald-700',
      grade: 'bg-amber-100 text-amber-700',
      employee_type: 'bg-pink-100 text-pink-700',
    }
    const labels: Record<ApplicabilityType, string> = {
      all: 'جميع الموظفين',
      department: 'حسب القسم',
      designation: 'حسب المسمى',
      grade: 'حسب الدرجة',
      employee_type: 'حسب نوع الموظف',
    }
    return (
      <Badge className={`${styles[applicableFor]} border-0 rounded-md px-2`}>
        {labels[applicableFor]}
      </Badge>
    )
  }

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!stats) return undefined
    return [
      {
        label: 'إجمالي السياسات',
        value: stats.totalPolicies || 0,
        icon: FileText,
        status: 'normal' as const,
      },
      {
        label: 'السياسات النشطة',
        value: stats.activePolicies || 0,
        icon: CheckCircle,
        status: 'normal' as const,
      },
      {
        label: 'الموظفون المسندة',
        value: stats.totalAssignments || 0,
        icon: Users,
        status: 'normal' as const,
      },
      {
        label: 'بدون سياسة',
        value: stats.employeesWithoutPolicy || 0,
        icon: AlertCircle,
        status: stats.employeesWithoutPolicy > 0 ? ('attention' as const) : ('zero' as const),
      },
    ]
  }, [stats])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الإجازات', href: ROUTES.dashboard.hr.leave.list, isActive: false },
    { title: 'سياسات الإجازات', href: ROUTES.dashboard.hr.leave.policies, isActive: true },
  ]

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
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge="الموارد البشرية"
          title="سياسات الإجازات"
          type="leave"
          stats={heroStats}
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search
                      className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    />
                    <Input
                      type="text"
                      placeholder="بحث بالاسم أو الرقم..."
                      aria-label="بحث بالاسم أو الرقم"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Applicability Filter */}
                  <Select value={applicabilityFilter} onValueChange={setApplicabilityFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
                      <Users className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="قابلية التطبيق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الأنواع</SelectItem>
                      <SelectItem value="all">جميع الموظفين</SelectItem>
                      <SelectItem value="department">حسب القسم</SelectItem>
                      <SelectItem value="designation">حسب المسمى</SelectItem>
                      <SelectItem value="grade">حسب الدرجة</SelectItem>
                      <SelectItem value="employee_type">حسب نوع الموظف</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Compliance Filter */}
                  <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
                      <Shield className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="الامتثال" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="compliant">متوافق مع نظام العمل</SelectItem>
                      <SelectItem value="non_compliant">غير متوافق</SelectItem>
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

            {/* MAIN POLICIES LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">سياسات الإجازات</h3>
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                    {policies.length} سياسة
                  </Badge>
                  <Button
                    onClick={() => {
                      setEditingPolicy(undefined)
                      setIsCreateDialogOpen(true)
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    إضافة سياسة
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100"
                      >
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      حدث خطأ أثناء تحميل السياسات
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {error?.message || 'تعذر الاتصال بالخادم'}
                    </p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && policies.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سياسات إجازة</h3>
                    <p className="text-slate-500 mb-4">أضف سياسة إجازة جديدة للبدء</p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                      إضافة سياسة
                    </Button>
                  </div>
                )}

                {/* Success State - Policies List */}
                {!isLoading &&
                  !isError &&
                  policies.map((policy) => (
                    <div
                      key={policy._id}
                      className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${
                        selectedIds.includes(policy._id)
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                          {isSelectionMode && (
                            <Checkbox
                              checked={selectedIds.includes(policy._id)}
                              onCheckedChange={() => handleSelectPolicy(policy._id)}
                              className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                          )}
                          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <Settings className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-navy text-lg">
                                {policy.nameAr || policy.name}
                              </h4>
                              {policy.isDefault && (
                                <Badge className="bg-amber-100 text-amber-700 border-0 rounded-md px-2 flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  افتراضي
                                </Badge>
                              )}
                              {policy.isActive ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-md px-2 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  نشط
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 text-slate-500 border-0 rounded-md px-2">
                                  غير نشط
                                </Badge>
                              )}
                              {policy.saudiLaborLawCompliant && (
                                <Badge className="bg-blue-100 text-blue-700 border-0 rounded-md px-2 flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  متوافق
                                </Badge>
                              )}
                              {getApplicabilityBadge(policy.applicableFor)}
                            </div>
                            <p className="text-slate-500 text-sm">
                              {policy.policyId} •{' '}
                              {policy.leavePolicyDetails.length} نوع إجازة
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-500 hover:text-navy"
                              aria-label="خيارات"
                            >
                              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewPolicy(policy._id)}>
                              <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPolicy(policy)}>
                              <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDuplicate(policy._id, policy.name, policy.nameAr)
                              }
                            >
                              <Copy className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                              نسخ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!policy.isDefault && (
                              <DropdownMenuItem
                                onClick={() => handleSetDefault(policy._id, policy.nameAr)}
                              >
                                <Star className="h-4 w-4 ms-2 text-amber-500" aria-hidden="true" />
                                جعلها افتراضية
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(policy._id, policy.isActive, policy.nameAr)
                              }
                            >
                              <Power
                                className="h-4 w-4 ms-2 text-blue-500"
                                aria-hidden="true"
                              />
                              {policy.isActive ? 'تعطيل' : 'تفعيل'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePolicy(policy._id, policy.nameAr)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {policy.description && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {policy.descriptionAr || policy.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200/50">
                        {policy.leavePolicyDetails.slice(0, 4).map((detail) => (
                          <div key={detail.leaveType} className="text-center">
                            <div className="text-xs text-slate-600 mb-1">
                              {detail.leaveTypeNameAr}
                            </div>
                            <div className="font-bold text-emerald-600 text-lg">
                              {detail.annualAllocation} يوم
                            </div>
                          </div>
                        ))}
                      </div>

                      {policy.leavePolicyDetails.length > 4 && (
                        <div className="mt-2 text-center">
                          <Badge className="bg-slate-100 text-slate-600 border-0 rounded-md px-3 py-1">
                            +{policy.leavePolicyDetails.length - 4} أنواع أخرى
                          </Badge>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/50">
                        <div className="text-xs text-slate-500">
                          آخر تحديث: {new Date(policy.updatedAt).toLocaleDateString('ar-SA')}
                        </div>
                        <Button
                          onClick={() => handleViewPolicy(policy._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="leave-policies"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedIds.length}
          />
        </div>
      </Main>

      {/* TODO: Add LeavePolicyActionDialog component when created */}
      {/* <LeavePolicyActionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        currentRow={editingPolicy}
      /> */}
    </>
  )
}
