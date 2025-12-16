import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useLeavePeriods, useDeleteLeavePeriod, useActivateLeavePeriod, useDeactivateLeavePeriod } from '@/hooks/useLeavePeriod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search, Bell, Plus, MoreHorizontal, Eye, Edit, Trash2,
  AlertCircle, Loader2, Calendar, CheckCircle, XCircle,
  BarChart3, Users, CalendarDays, TrendingUp
} from 'lucide-react'
import { LeavePeriodDialog } from '@/components/hr/leave/LeavePeriodDialog'
import type { LeavePeriod } from '@/services/leavePeriodService'
import { toast } from 'sonner'

export function LeavePeriodsListView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<LeavePeriod | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [periodToDelete, setPeriodToDelete] = useState<LeavePeriod | null>(null)

  const { data: periodsData, isLoading, error } = useLeavePeriods({
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    year: yearFilter === 'all' ? undefined : parseInt(yearFilter),
  })

  const deleteMutation = useDeleteLeavePeriod()
  const activateMutation = useActivateLeavePeriod()
  const deactivateMutation = useDeactivateLeavePeriod()

  const periods = periodsData?.data || []

  // Filter periods by search query
  const filteredPeriods = periods.filter(period => {
    const matchesSearch = searchQuery === '' ||
      period.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      period.nameAr.includes(searchQuery)
    return matchesSearch
  })

  // Get unique years from periods
  const years = Array.from(new Set(periods.map(p => new Date(p.fromDate).getFullYear()))).sort((a, b) => b - a)

  const handleEdit = (period: LeavePeriod) => {
    setSelectedPeriod(period)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedPeriod(null)
    setDialogOpen(true)
  }

  const handleDelete = (period: LeavePeriod) => {
    setPeriodToDelete(period)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (periodToDelete) {
      deleteMutation.mutate(periodToDelete._id, {
        onSuccess: () => {
          toast.success('تم حذف الفترة بنجاح')
          setDeleteDialogOpen(false)
          setPeriodToDelete(null)
        },
        onError: (error: any) => {
          toast.error(error?.message || 'حدث خطأ في حذف الفترة')
        },
      })
    }
  }

  const handleToggleStatus = (period: LeavePeriod) => {
    const mutation = period.isActive ? deactivateMutation : activateMutation
    mutation.mutate(period._id, {
      onSuccess: () => {
        toast.success(period.isActive ? 'تم تعطيل الفترة بنجاح' : 'تم تفعيل الفترة بنجاح')
      },
      onError: (error: any) => {
        toast.error(error?.message || 'حدث خطأ في تغيير حالة الفترة')
      },
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Calculate statistics
  const stats = {
    total: periods.length,
    active: periods.filter(p => p.isActive).length,
    inactive: periods.filter(p => !p.isActive).length,
    totalEmployeesAllocated: periods.reduce((sum, p) => sum + (p.totalEmployeesAllocated || 0), 0),
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'فترات الإجازات', href: '/dashboard/hr/leave/periods', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title="فترات الإجازات"
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي الفترات</p>
                      <p className="text-xl font-bold text-navy">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">الفترات النشطة</p>
                      <p className="text-xl font-bold text-navy">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <XCircle className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">الفترات غير النشطة</p>
                      <p className="text-xl font-bold text-navy">{stats.inactive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">الموظفون المخصصون</p>
                      <p className="text-xl font-bold text-navy">{stats.totalEmployeesAllocated}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن فترة..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل السنوات</SelectItem>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="active">نشطة</SelectItem>
                        <SelectItem value="inactive">غير نشطة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleCreate}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    فترة جديدة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Periods List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل الفترات...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : filteredPeriods.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد فترات إجازات</p>
                  <Button
                    onClick={handleCreate}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إضافة فترة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPeriods.map((period) => (
                  <Card key={period._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-navy text-lg">
                              {period.nameAr || period.name}
                            </h3>
                            <Badge className={period.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                              {period.isActive ? 'نشطة' : 'غير نشطة'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            {period.periodId}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(period)}>
                              <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(period)}>
                              {period.isActive ? (
                                <>
                                  <XCircle className="w-4 h-4 ms-2" aria-hidden="true" />
                                  تعطيل
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 ms-2" aria-hidden="true" />
                                  تفعيل
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(period)}>
                              <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">تاريخ البداية</p>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{formatDate(period.fromDate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">تاريخ النهاية</p>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{formatDate(period.toDate)}</span>
                          </div>
                        </div>
                        {period.totalEmployeesAllocated !== undefined && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">الموظفون المخصصون</p>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{period.totalEmployeesAllocated}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                        {period.autoAllocateLeaves && (
                          <Badge className="bg-blue-50 text-blue-700">
                            تخصيص تلقائي
                          </Badge>
                        )}
                        {period.company && (
                          <span>الشركة: {period.company}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>

      {/* Create/Edit Dialog */}
      <LeavePeriodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        period={selectedPeriod}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف فترة الإجازات "{periodToDelete?.nameAr || periodToDelete?.name}"؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ms-1 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
